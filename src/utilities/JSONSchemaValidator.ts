import Ajv2020, { type AnySchema, type ErrorObject } from 'ajv/dist/2020'
import addFormats from 'ajv-formats'

export const DEFAULT_SCHEMA_VALIDATOR_LIMITS = Object.freeze({
    maxSchemaCharacters: 250_000,
    maxDataCharacters: 1_000_000,
    maxSchemaDepth: 100,
    maxDataDepth: 200,
    maxSchemaNodes: 25_000,
    maxDataNodes: 100_000,
    maxErrors: 200,
})

export interface SchemaValidatorLimits {
    maxSchemaCharacters: number
    maxDataCharacters: number
    maxSchemaDepth: number
    maxDataDepth: number
    maxSchemaNodes: number
    maxDataNodes: number
    maxErrors: number
}

export interface SchemaValidationOptions {
    schemaText: string
    dataText: string
    allErrors?: boolean
    strictDiagnostics?: boolean
    limits?: Partial<SchemaValidatorLimits>
}

export type SchemaDiagnosticSource = 'schema' | 'data'
export type SchemaDiagnosticKind = 'parse' | 'limit' | 'reference' | 'schema' | 'strict' | 'validation'
export type SchemaDiagnosticSeverity = 'error' | 'warning'

export interface SchemaDiagnostic {
    source: SchemaDiagnosticSource
    kind: SchemaDiagnosticKind
    severity: SchemaDiagnosticSeverity
    keyword: string
    message: string
    instancePath: string
    displayPath: string
    schemaPath: string
    params: Record<string, unknown>
    line?: number
    column?: number
    offset?: number
}

export interface SchemaValidationResult {
    valid: boolean
    schemaValid: boolean
    dataValid: boolean | null
    diagnostics: SchemaDiagnostic[]
    errorCount: number
    warningCount: number
    errorsTruncated: boolean
}

export interface SchemaValidationWorkerRequest {
    requestId: number
    options: SchemaValidationOptions
}

export type SchemaValidationWorkerResponse =
    | { requestId: number; ok: true; result: SchemaValidationResult }
    | { requestId: number; ok: false; error: string }

interface ParseSuccess {
    ok: true
    value: unknown
}

interface ParseFailure {
    ok: false
    diagnostic: SchemaDiagnostic
}

type ParseResult = ParseSuccess | ParseFailure

interface StructureEntry {
    value: unknown
    depth: number
    path: string
    annotationData: boolean
}

interface RemoteReference {
    path: string
    keyword: '$ref' | '$dynamicRef' | '$recursiveRef'
    value: string
}

const ANNOTATION_DATA_KEYWORDS = new Set(['const', 'default', 'enum', 'examples'])

function resolveLimits(overrides: Partial<SchemaValidatorLimits> = {}): SchemaValidatorLimits {
    const resolved = { ...DEFAULT_SCHEMA_VALIDATOR_LIMITS, ...overrides }

    for (const [name, value] of Object.entries(resolved)) {
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new Error(`${name} must be a positive whole number.`)
        }
    }

    return resolved
}

function escapePointerSegment(segment: string): string {
    return segment.replace(/~/g, '~0').replace(/\//g, '~1')
}

function decodePointerSegment(segment: string): string {
    return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function appendPointer(path: string, segment: string): string {
    return `${path}/${escapePointerSegment(segment)}`
}

function appendDisplaySegment(path: string, segment: string): string {
    if (/^(0|[1-9]\d*)$/.test(segment)) return `${path}[${segment}]`
    if (/^[A-Za-z_$][\w$]*$/.test(segment)) return `${path}.${segment}`
    return `${path}[${JSON.stringify(segment)}]`
}

export function formatJSONPointer(pointer: string, root = '$'): string {
    if (!pointer) return root

    return pointer
        .split('/')
        .slice(1)
        .map(decodePointerSegment)
        .reduce(appendDisplaySegment, root)
}

function parseLocation(message: string, text: string): {
    offset?: number
    line?: number
    column?: number
} {
    const offsetMatch = message.match(/(?:position|at)\s+(\d+)/i)
    const explicitLineMatch = message.match(/line\s+(\d+)/i)
    const explicitColumnMatch = message.match(/column\s+(\d+)/i)
    const offset = offsetMatch ? Number(offsetMatch[1]) : undefined

    if (offset !== undefined && Number.isFinite(offset)) {
        const beforeError = text.slice(0, offset)
        const lines = beforeError.split('\n')
        return {
            offset,
            line: lines.length,
            column: (lines[lines.length - 1]?.length ?? 0) + 1,
        }
    }

    return {
        line: explicitLineMatch ? Number(explicitLineMatch[1]) : undefined,
        column: explicitColumnMatch ? Number(explicitColumnMatch[1]) : undefined,
    }
}

function parseJSON(text: string, source: SchemaDiagnosticSource, characterLimit: number): ParseResult {
    if (text.length > characterLimit) {
        return {
            ok: false,
            diagnostic: {
                source,
                kind: 'limit',
                severity: 'error',
                keyword: 'maxCharacters',
                message: `${source === 'schema' ? 'Schema' : 'Data'} JSON exceeds the ${characterLimit.toLocaleString()} character limit.`,
                instancePath: '',
                displayPath: source === 'schema' ? '$schema' : '$',
                schemaPath: '',
                params: { limit: characterLimit, actual: text.length },
            },
        }
    }

    try {
        return { ok: true, value: JSON.parse(text) }
    } catch (error) {
        const rawMessage = error instanceof Error ? error.message : 'Invalid JSON.'
        const location = parseLocation(rawMessage, text)
        const locationSuffix = location.line && location.column
            ? ` at line ${location.line}, column ${location.column}`
            : ''

        return {
            ok: false,
            diagnostic: {
                source,
                kind: 'parse',
                severity: 'error',
                keyword: 'parse',
                message: `Invalid ${source} JSON${locationSuffix}: ${rawMessage}`,
                instancePath: '',
                displayPath: source === 'schema' ? '$schema' : '$',
                schemaPath: '',
                params: {},
                ...location,
            },
        }
    }
}

function inspectStructure(
    root: unknown,
    source: SchemaDiagnosticSource,
    maxDepth: number,
    maxNodes: number,
): SchemaDiagnostic | null {
    const stack: StructureEntry[] = [{ value: root, depth: 0, path: '', annotationData: false }]
    let nodes = 0

    while (stack.length > 0) {
        const entry = stack.pop()
        if (!entry) break

        nodes++
        if (nodes > maxNodes) {
            return {
                source,
                kind: 'limit',
                severity: 'error',
                keyword: 'maxNodes',
                message: `${source === 'schema' ? 'Schema' : 'Data'} JSON exceeds the ${maxNodes.toLocaleString()} node limit.`,
                instancePath: entry.path,
                displayPath: formatJSONPointer(entry.path, source === 'schema' ? '$schema' : '$'),
                schemaPath: '',
                params: { limit: maxNodes },
            }
        }

        if (entry.depth > maxDepth) {
            return {
                source,
                kind: 'limit',
                severity: 'error',
                keyword: 'maxDepth',
                message: `${source === 'schema' ? 'Schema' : 'Data'} JSON exceeds the maximum nesting depth of ${maxDepth}.`,
                instancePath: entry.path,
                displayPath: formatJSONPointer(entry.path, source === 'schema' ? '$schema' : '$'),
                schemaPath: '',
                params: { limit: maxDepth },
            }
        }

        if (Array.isArray(entry.value)) {
            for (let index = entry.value.length - 1; index >= 0; index--) {
                stack.push({
                    value: entry.value[index],
                    depth: entry.depth + 1,
                    path: appendPointer(entry.path, String(index)),
                    annotationData: entry.annotationData,
                })
            }
        } else if (entry.value !== null && typeof entry.value === 'object') {
            const object = entry.value as Record<string, unknown>
            const keys = Object.keys(object)

            for (let index = keys.length - 1; index >= 0; index--) {
                const key = keys[index]
                if (key === undefined) continue

                stack.push({
                    value: object[key],
                    depth: entry.depth + 1,
                    path: appendPointer(entry.path, key),
                    annotationData: entry.annotationData || (source === 'schema' && ANNOTATION_DATA_KEYWORDS.has(key)),
                })
            }
        }
    }

    return null
}

function findRemoteReferences(schema: unknown, maximum: number): RemoteReference[] {
    const references: RemoteReference[] = []
    const stack: StructureEntry[] = [{ value: schema, depth: 0, path: '', annotationData: false }]

    while (stack.length > 0 && references.length < maximum) {
        const entry = stack.pop()
        if (!entry || entry.annotationData || entry.value === null || typeof entry.value !== 'object') continue

        if (Array.isArray(entry.value)) {
            for (let index = entry.value.length - 1; index >= 0; index--) {
                stack.push({
                    value: entry.value[index],
                    depth: entry.depth + 1,
                    path: appendPointer(entry.path, String(index)),
                    annotationData: false,
                })
            }
            continue
        }

        const object = entry.value as Record<string, unknown>

        for (const keyword of ['$ref', '$dynamicRef', '$recursiveRef'] as const) {
            const value = object[keyword]
            if (typeof value === 'string' && value !== '' && !value.startsWith('#')) {
                references.push({
                    keyword,
                    value,
                    path: appendPointer(entry.path, keyword),
                })
            }
        }

        const keys = Object.keys(object)
        for (let index = keys.length - 1; index >= 0; index--) {
            const key = keys[index]
            if (key === undefined || ANNOTATION_DATA_KEYWORDS.has(key)) continue

            stack.push({
                value: object[key],
                depth: entry.depth + 1,
                path: appendPointer(entry.path, key),
                annotationData: false,
            })
        }
    }

    return references
}

function propertyFromError(error: ErrorObject): string | null {
    const params = error.params as Record<string, unknown>

    for (const key of ['missingProperty', 'additionalProperty', 'propertyName']) {
        if (typeof params[key] === 'string') return params[key]
    }

    return null
}

function enrichedInstancePath(error: ErrorObject): string {
    const property = propertyFromError(error)
    return property ? appendPointer(error.instancePath, property) : error.instancePath
}

function mapAjvError(
    error: ErrorObject,
    source: SchemaDiagnosticSource,
    kind: 'schema' | 'validation',
): SchemaDiagnostic {
    const instancePath = enrichedInstancePath(error)
    const root = source === 'schema' ? '$schema' : '$'

    return {
        source,
        kind,
        severity: 'error',
        keyword: error.keyword,
        message: error.message ?? 'Validation failed.',
        instancePath,
        displayPath: formatJSONPointer(instancePath, root),
        schemaPath: error.schemaPath,
        params: error.params as Record<string, unknown>,
    }
}

function strictDiagnostic(message: string): SchemaDiagnostic {
    const schemaPathMatch = message.match(/ at "([^"]+)"/)
    const schemaPath = schemaPathMatch?.[1] ?? '#'

    return {
        source: 'schema',
        kind: 'strict',
        severity: 'warning',
        keyword: 'strict',
        message: message.replace(/^strict mode:\s*/i, ''),
        instancePath: '',
        displayPath: '$schema',
        schemaPath,
        params: {},
    }
}

function createResult(
    schemaValid: boolean,
    dataValid: boolean | null,
    diagnostics: SchemaDiagnostic[],
    errorsTruncated = false,
): SchemaValidationResult {
    const errorCount = diagnostics.filter(diagnostic => diagnostic.severity === 'error').length
    const warningCount = diagnostics.length - errorCount

    return {
        valid: schemaValid && dataValid === true && errorCount === 0,
        schemaValid,
        dataValid,
        diagnostics,
        errorCount,
        warningCount,
        errorsTruncated,
    }
}

/**
 * Parse and validate JSON against a draft 2020-12 schema. Only local fragment
 * references are accepted; Ajv is intentionally configured without a schema
 * loader, so this function never performs network requests.
 */
export function validateJSONSchema(options: SchemaValidationOptions): SchemaValidationResult {
    const limits = resolveLimits(options.limits)
    const schemaParse = parseJSON(options.schemaText, 'schema', limits.maxSchemaCharacters)
    if (!schemaParse.ok) return createResult(false, null, [schemaParse.diagnostic])

    const schemaStructureError = inspectStructure(
        schemaParse.value,
        'schema',
        limits.maxSchemaDepth,
        limits.maxSchemaNodes,
    )
    if (schemaStructureError) return createResult(false, null, [schemaStructureError])

    const remoteReferences = findRemoteReferences(schemaParse.value, limits.maxErrors)
    if (remoteReferences.length > 0) {
        const diagnostics = remoteReferences.map<SchemaDiagnostic>(reference => ({
            source: 'schema',
            kind: 'reference',
            severity: 'error',
            keyword: reference.keyword,
            message: `External reference "${reference.value}" is blocked. Only local fragment references beginning with # are supported.`,
            instancePath: reference.path,
            displayPath: formatJSONPointer(reference.path, '$schema'),
            schemaPath: reference.path,
            params: { reference: reference.value },
        }))

        return createResult(false, null, diagnostics, remoteReferences.length >= limits.maxErrors)
    }

    const strictMessages = new Set<string>()
    const logger = {
        log: () => undefined,
        warn: (message: unknown) => strictMessages.add(String(message)),
        error: (message: unknown) => strictMessages.add(String(message)),
    }
    const ajv = new Ajv2020({
        allErrors: options.allErrors ?? true,
        strict: options.strictDiagnostics === false ? false : 'log',
        logger,
        validateFormats: true,
        messages: true,
        verbose: false,
        ownProperties: true,
        coerceTypes: false,
        removeAdditional: false,
        useDefaults: false,
        unicodeRegExp: true,
    })

    addFormats(ajv)

    let schemaIsValid: boolean
    try {
        const schemaValidation = ajv.validateSchema(schemaParse.value as AnySchema)
        if (schemaValidation instanceof Promise) {
            throw new Error('Asynchronous schemas are not supported.')
        }
        schemaIsValid = schemaValidation
    } catch (error) {
        return createResult(false, null, [{
            source: 'schema',
            kind: 'schema',
            severity: 'error',
            keyword: 'schema',
            message: error instanceof Error ? error.message : 'Unable to validate this schema.',
            instancePath: '',
            displayPath: '$schema',
            schemaPath: '',
            params: {},
        }])
    }

    if (!schemaIsValid) {
        const schemaErrors = (ajv.errors ?? [])
            .slice(0, limits.maxErrors)
            .map(error => mapAjvError(error, 'schema', 'schema'))
        return createResult(false, null, schemaErrors, (ajv.errors?.length ?? 0) > limits.maxErrors)
    }

    let validate: ReturnType<typeof ajv.compile>
    try {
        validate = ajv.compile(schemaParse.value as AnySchema)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to compile this schema.'
        const referenceError = /reference|resolve|ref\b/i.test(message)

        return createResult(false, null, [{
            source: 'schema',
            kind: referenceError ? 'reference' : 'schema',
            severity: 'error',
            keyword: referenceError ? '$ref' : 'compile',
            message: referenceError
                ? `${message} Remote schemas are never fetched.`
                : message,
            instancePath: '',
            displayPath: '$schema',
            schemaPath: '',
            params: {},
        }])
    }

    const strictWarnings = options.strictDiagnostics === false
        ? []
        : Array.from(strictMessages, strictDiagnostic)
    const dataParse = parseJSON(options.dataText, 'data', limits.maxDataCharacters)
    if (!dataParse.ok) return createResult(true, null, [dataParse.diagnostic, ...strictWarnings])

    const dataStructureError = inspectStructure(
        dataParse.value,
        'data',
        limits.maxDataDepth,
        limits.maxDataNodes,
    )
    if (dataStructureError) return createResult(true, null, [dataStructureError, ...strictWarnings])

    const dataValidation = validate(dataParse.value)
    if (dataValidation instanceof Promise) {
        return createResult(false, null, [{
            source: 'schema',
            kind: 'schema',
            severity: 'error',
            keyword: '$async',
            message: 'Asynchronous schemas are not supported.',
            instancePath: '',
            displayPath: '$schema',
            schemaPath: '',
            params: {},
        }])
    }
    const dataIsValid = dataValidation
    const validationErrors = validate.errors ?? []
    const errorsTruncated = validationErrors.length > limits.maxErrors
    const diagnostics = validationErrors
        .slice(0, limits.maxErrors)
        .map(error => mapAjvError(error, 'data', 'validation'))

    diagnostics.push(...strictWarnings)

    return createResult(true, dataIsValid, diagnostics, errorsTruncated)
}
