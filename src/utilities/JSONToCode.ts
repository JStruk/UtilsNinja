export const JSON_TO_CODE_LIMITS = {
    maxInputLength: 500_000,
    maxDepth: 30,
    maxProperties: 2_000,
} as const

export type CodeLanguage = 'typescript' | 'csharp' | 'go'

export interface JSONToCodeOptions {
    language?: CodeLanguage
    rootName?: string
}

export interface GeneratedCode {
    code: string
    language: CodeLanguage
    rootName: string
    definitionCount: number
}

type PrimitiveKind = 'boolean' | 'integer' | 'null' | 'number' | 'string' | 'unknown'

interface PrimitiveSchema {
    kind: PrimitiveKind
}

interface ArraySchema {
    kind: 'array'
    item: Schema
}

interface ObjectProperty {
    jsonName: string
    optional: boolean
    schema: Schema
}

interface ObjectSchema {
    kind: 'object'
    properties: ObjectProperty[]
}

interface UnionSchema {
    kind: 'union'
    variants: Schema[]
}

type Schema = PrimitiveSchema | ArraySchema | ObjectSchema | UnionSchema

interface InferenceContext {
    propertyCount: number
}

interface DefinitionContext {
    definitions: string[]
    names: Set<string>
    objectNames: WeakMap<ObjectSchema, string>
}

export class JSONToCodeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'JSONToCodeError'
    }
}

function toPascalCase(value: string): string {
    const words = value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .match(/[A-Za-z0-9]+/g) ?? []
    const name = words
        .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join('')

    if (!name) return 'Value'
    return /^\d/.test(name) ? `Model${name}` : name
}

function normalizeRootName(value = 'Root'): string {
    return toPascalCase(value.trim() || 'Root')
}

function singularize(value: string): string {
    if (/ies$/i.test(value)) return value.replace(/ies$/i, 'y')
    if (/sses$/i.test(value)) return value.slice(0, -2)
    if (/s$/i.test(value) && !/ss$/i.test(value)) return value.slice(0, -1)
    return value
}

function inferSchema(value: unknown, context: InferenceContext, depth = 0): Schema {
    if (depth > JSON_TO_CODE_LIMITS.maxDepth) {
        throw new JSONToCodeError(`JSON nesting exceeds the ${JSON_TO_CODE_LIMITS.maxDepth}-level safety limit.`)
    }

    if (value === null) return { kind: 'null' }
    if (typeof value === 'string') return { kind: 'string' }
    if (typeof value === 'boolean') return { kind: 'boolean' }
    if (typeof value === 'number') return { kind: Number.isInteger(value) ? 'integer' : 'number' }

    if (Array.isArray(value)) {
        if (value.length === 0) return { kind: 'array', item: { kind: 'unknown' } }

        return {
            kind: 'array',
            item: value
                .map(item => inferSchema(item, context, depth + 1))
                .reduce(mergeSchemas),
        }
    }

    if (typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>)
        context.propertyCount += entries.length

        if (context.propertyCount > JSON_TO_CODE_LIMITS.maxProperties) {
            throw new JSONToCodeError(
                `JSON contains more than ${JSON_TO_CODE_LIMITS.maxProperties.toLocaleString()} properties. Reduce the sample before generating code.`,
            )
        }

        return {
            kind: 'object',
            properties: entries.map(([jsonName, propertyValue]) => ({
                jsonName,
                optional: false,
                schema: inferSchema(propertyValue, context, depth + 1),
            })),
        }
    }

    return { kind: 'unknown' }
}

function mergeObjects(left: ObjectSchema, right: ObjectSchema): ObjectSchema {
    const leftProperties = new Map(left.properties.map(property => [property.jsonName, property]))
    const rightProperties = new Map(right.properties.map(property => [property.jsonName, property]))
    const keys = [...new Set([...leftProperties.keys(), ...rightProperties.keys()])]

    return {
        kind: 'object',
        properties: keys.map((jsonName) => {
            const leftProperty = leftProperties.get(jsonName)
            const rightProperty = rightProperties.get(jsonName)

            if (leftProperty && rightProperty) {
                return {
                    jsonName,
                    optional: leftProperty.optional || rightProperty.optional,
                    schema: mergeSchemas(leftProperty.schema, rightProperty.schema),
                }
            }

            const property = leftProperty ?? rightProperty!
            return { ...property, optional: true }
        }),
    }
}

function flattenVariants(schema: Schema): Schema[] {
    return schema.kind === 'union' ? schema.variants.flatMap(flattenVariants) : [schema]
}

function schemaKey(schema: Schema): string {
    if (schema.kind === 'array') return `array:${schemaKey(schema.item)}`
    if (schema.kind === 'object') return 'object'
    if (schema.kind === 'union') return schema.variants.map(schemaKey).sort().join('|')
    return schema.kind
}

function createUnion(schemas: Schema[]): Schema {
    const variants: Schema[] = []

    for (const candidate of schemas.flatMap(flattenVariants)) {
        const existingObjectIndex = candidate.kind === 'object'
            ? variants.findIndex(variant => variant.kind === 'object')
            : -1
        const existingArrayIndex = candidate.kind === 'array'
            ? variants.findIndex(variant => variant.kind === 'array')
            : -1

        if (existingObjectIndex >= 0) {
            variants[existingObjectIndex] = mergeObjects(
                variants[existingObjectIndex] as ObjectSchema,
                candidate as ObjectSchema,
            )
            continue
        }

        if (existingArrayIndex >= 0) {
            const existing = variants[existingArrayIndex] as ArraySchema
            variants[existingArrayIndex] = {
                kind: 'array',
                item: mergeSchemas(existing.item, (candidate as ArraySchema).item),
            }
            continue
        }

        if (!variants.some(variant => schemaKey(variant) === schemaKey(candidate))) {
            variants.push(candidate)
        }
    }

    const integerIndex = variants.findIndex(variant => variant.kind === 'integer')
    const numberIndex = variants.findIndex(variant => variant.kind === 'number')
    if (integerIndex >= 0 && numberIndex >= 0) variants.splice(integerIndex, 1)

    return variants.length === 1 ? variants[0]! : { kind: 'union', variants }
}

function mergeSchemas(left: Schema, right: Schema): Schema {
    if (left.kind === 'object' && right.kind === 'object') return mergeObjects(left, right)
    if (left.kind === 'array' && right.kind === 'array') {
        return { kind: 'array', item: mergeSchemas(left.item, right.item) }
    }
    if (left.kind === right.kind && schemaKey(left) === schemaKey(right)) return left
    if ((left.kind === 'integer' && right.kind === 'number') || (left.kind === 'number' && right.kind === 'integer')) {
        return { kind: 'number' }
    }
    return createUnion([left, right])
}

function createDefinitionContext(): DefinitionContext {
    return {
        definitions: [],
        names: new Set<string>(),
        objectNames: new WeakMap<ObjectSchema, string>(),
    }
}

function allocateName(hint: string, context: DefinitionContext): string {
    const base = toPascalCase(hint)
    let name = base
    let suffix = 2

    while (context.names.has(name)) {
        name = `${base}${suffix}`
        suffix += 1
    }

    context.names.add(name)
    return name
}

function nullableParts(schema: Schema): { schema: Schema; nullable: boolean } {
    if (schema.kind !== 'union') return { schema, nullable: schema.kind === 'null' }

    const nonNull = schema.variants.filter(variant => variant.kind !== 'null')
    if (nonNull.length === schema.variants.length) return { schema, nullable: false }
    if (nonNull.length === 0) return { schema: { kind: 'unknown' }, nullable: true }

    return {
        schema: nonNull.length === 1 ? nonNull[0]! : { kind: 'union', variants: nonNull },
        nullable: true,
    }
}

function typeScriptPropertyName(name: string): string {
    return /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name)
}

function typeScriptType(schema: Schema, hint: string, context: DefinitionContext): string {
    switch (schema.kind) {
        case 'string': return 'string'
        case 'integer':
        case 'number': return 'number'
        case 'boolean': return 'boolean'
        case 'null': return 'null'
        case 'unknown': return 'unknown'
        case 'array': {
            const itemType = typeScriptType(schema.item, singularize(hint), context)
            return schema.item.kind === 'union' ? `Array<${itemType}>` : `${itemType}[]`
        }
        case 'union':
            return schema.variants.map(variant => typeScriptType(variant, hint, context)).join(' | ')
        case 'object': {
            const existingName = context.objectNames.get(schema)
            if (existingName) return existingName

            const name = allocateName(hint, context)
            context.objectNames.set(schema, name)
            const definitionIndex = context.definitions.length
            context.definitions.push('')
            const properties = schema.properties.map((property) => {
                const type = typeScriptType(property.schema, property.jsonName, context)
                return `  ${typeScriptPropertyName(property.jsonName)}${property.optional ? '?' : ''}: ${type};`
            })
            context.definitions[definitionIndex] = `export interface ${name} {\n${properties.join('\n')}\n}`
            return name
        }
    }
}

function renderTypeScript(schema: Schema, rootName: string): { code: string; count: number } {
    const context = createDefinitionContext()
    const rootType = typeScriptType(schema, rootName, context)
    const alias = schema.kind === 'object' ? '' : `export type ${rootName} = ${rootType};\n\n`

    return {
        code: `${alias}${context.definitions.join('\n\n')}`.trim(),
        count: context.definitions.length + (alias ? 1 : 0),
    }
}

function withoutNullUnion(schema: Schema): Schema {
    return nullableParts(schema).schema
}

function csharpType(schema: Schema, hint: string, context: DefinitionContext): string {
    const { schema: concrete, nullable } = nullableParts(schema)
    let type: string

    switch (concrete.kind) {
        case 'string': type = 'string'; break
        case 'integer': type = 'long'; break
        case 'number': type = 'double'; break
        case 'boolean': type = 'bool'; break
        case 'array': type = `List<${csharpType(withoutNullUnion(concrete.item), singularize(hint), context).replace(/\?$/, '')}>`; break
        case 'object': type = csharpObject(concrete, hint, context); break
        case 'union': type = 'object'; break
        default: type = 'object'; break
    }

    return nullable ? `${type}?` : type
}

function csharpObject(schema: ObjectSchema, hint: string, context: DefinitionContext): string {
    const existingName = context.objectNames.get(schema)
    if (existingName) return existingName

    const name = allocateName(hint, context)
    context.objectNames.set(schema, name)
    const definitionIndex = context.definitions.length
    context.definitions.push('')
    const usedPropertyNames = new Set<string>()
    const properties = schema.properties.map((property) => {
        const baseName = toPascalCase(property.jsonName)
        let propertyName = baseName
        let suffix = 2
        while (usedPropertyNames.has(propertyName)) propertyName = `${baseName}${suffix++}`
        usedPropertyNames.add(propertyName)

        const parts = nullableParts(property.schema)
        const shouldBeNullable = property.optional || parts.nullable
        let type = csharpType(parts.schema, property.jsonName, context).replace(/\?$/, '')
        if (shouldBeNullable) type += '?'

        let initializer = ''
        if (!shouldBeNullable && type === 'string') initializer = ' = string.Empty;'
        else if (!shouldBeNullable && (type.startsWith('List<') || /^[A-Z]\w*$/.test(type))) initializer = ' = new();'

        return `    [JsonPropertyName(${JSON.stringify(property.jsonName)})]\n    public ${type} ${propertyName} { get; init; }${initializer}`
    })
    context.definitions[definitionIndex] = `public sealed class ${name}\n{\n${properties.join('\n\n')}\n}`
    return name
}

function renderCSharp(schema: Schema, rootName: string): { code: string; count: number } {
    const context = createDefinitionContext()
    const rootType = schema.kind === 'object'
        ? csharpObject(schema, rootName, context)
        : csharpType(schema, rootName, context)
    const wrapper = schema.kind === 'object'
        ? ''
        : `public sealed class ${rootName}\n{\n    [JsonPropertyName("value")]\n    public ${rootType} Value { get; init; }${rootType === 'string' ? ' = string.Empty;' : ''}\n}`
    const definitions = [...context.definitions]
    if (wrapper) definitions.unshift(wrapper)

    return {
        code: `using System.Collections.Generic;\nusing System.Text.Json.Serialization;\n\n${definitions.join('\n\n')}`,
        count: definitions.length,
    }
}

function goTag(jsonName: string, optional: boolean): string {
    const value = `${jsonName}${optional ? ',omitempty' : ''}`
    return value.includes('`')
        ? JSON.stringify(`json:${JSON.stringify(value)}`)
        : `\`json:${JSON.stringify(value)}\``
}

function goType(schema: Schema, hint: string, context: DefinitionContext, optional = false): string {
    const { schema: concrete, nullable } = nullableParts(schema)
    let type: string

    switch (concrete.kind) {
        case 'string': type = 'string'; break
        case 'integer': type = 'int64'; break
        case 'number': type = 'float64'; break
        case 'boolean': type = 'bool'; break
        case 'array': type = `[]${goType(withoutNullUnion(concrete.item), singularize(hint), context)}`; break
        case 'object': type = goObject(concrete, hint, context); break
        default: type = 'any'; break
    }

    const canPoint = !type.startsWith('[]') && type !== 'any'
    return (nullable || optional) && canPoint ? `*${type}` : type
}

function goObject(schema: ObjectSchema, hint: string, context: DefinitionContext): string {
    const existingName = context.objectNames.get(schema)
    if (existingName) return existingName

    const name = allocateName(hint, context)
    context.objectNames.set(schema, name)
    const definitionIndex = context.definitions.length
    context.definitions.push('')
    const usedPropertyNames = new Set<string>()
    const properties = schema.properties.map((property) => {
        const baseName = toPascalCase(property.jsonName)
        let propertyName = baseName
        let suffix = 2
        while (usedPropertyNames.has(propertyName)) propertyName = `${baseName}${suffix++}`
        usedPropertyNames.add(propertyName)

        return `\t${propertyName} ${goType(property.schema, property.jsonName, context, property.optional)} ${goTag(property.jsonName, property.optional)}`
    })
    context.definitions[definitionIndex] = `type ${name} struct {\n${properties.join('\n')}\n}`
    return name
}

function renderGo(schema: Schema, rootName: string): { code: string; count: number } {
    const context = createDefinitionContext()
    const rootType = schema.kind === 'object'
        ? goObject(schema, rootName, context)
        : goType(schema, rootName, context)
    if (schema.kind !== 'object') context.definitions.unshift(`type ${rootName} ${rootType}`)

    return {
        code: `package models\n\n${context.definitions.join('\n\n')}`,
        count: context.definitions.length,
    }
}

export function generateCodeFromJSON(input: string, options: JSONToCodeOptions = {}): GeneratedCode {
    if (!input.trim()) throw new JSONToCodeError('Enter JSON to generate code.')
    if (input.length > JSON_TO_CODE_LIMITS.maxInputLength) {
        throw new JSONToCodeError(
            `JSON input exceeds the ${JSON_TO_CODE_LIMITS.maxInputLength.toLocaleString()} character limit.`,
        )
    }

    let value: unknown
    try {
        value = JSON.parse(input)
    } catch {
        throw new JSONToCodeError('JSON input is not valid. Check commas, quotes, and brackets.')
    }

    const language = options.language ?? 'typescript'
    const rootName = normalizeRootName(options.rootName)
    const schema = inferSchema(value, { propertyCount: 0 })
    const rendered = language === 'csharp'
        ? renderCSharp(schema, rootName)
        : language === 'go'
            ? renderGo(schema, rootName)
            : renderTypeScript(schema, rootName)

    return {
        code: rendered.code,
        language,
        rootName,
        definitionCount: rendered.count,
    }
}
