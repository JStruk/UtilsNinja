import { parseAllDocuments, stringify } from 'yaml'

export type JSONYAMLDirection = 'json-to-yaml' | 'yaml-to-json'

export interface JSONYAMLConversionOptions {
    indent?: number
    arrayAsDocuments?: boolean
    maxAliasCount?: number
    maxInputCharacters?: number
    maxNodes?: number
    maxDepth?: number
}

export interface JSONYAMLConversionResult {
    output: string
    direction: JSONYAMLDirection
    inputDocumentCount: number
    outputDocumentCount: number
    warnings: string[]
}

export class JSONYAMLConversionError extends Error {
    readonly format: 'JSON' | 'YAML'

    constructor(format: 'JSON' | 'YAML', message: string) {
        super(message)
        this.name = 'JSONYAMLConversionError'
        this.format = format
    }
}

const DEFAULT_INDENT = 2
const DEFAULT_MAX_ALIAS_COUNT = 50
export const DEFAULT_MAX_INPUT_CHARACTERS = 1_000_000
export const DEFAULT_MAX_NODES = 100_000
export const DEFAULT_MAX_DEPTH = 100

const ABSOLUTE_MAX_INPUT_CHARACTERS = 5_000_000
const ABSOLUTE_MAX_NODES = 250_000
const ABSOLUTE_MAX_DEPTH = 256
const MIN_SAFE_BIGINT = BigInt(Number.MIN_SAFE_INTEGER)
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

interface ConversionLimits {
    maxInputCharacters: number
    maxNodes: number
    maxDepth: number
}

interface TraversalState {
    format: 'JSON' | 'YAML'
    limits: ConversionLimits
    nodes: number
}

function normalizeIndent(indent = DEFAULT_INDENT): number {
    if (!Number.isInteger(indent) || indent < 1 || indent > 8) {
        throw new JSONYAMLConversionError('JSON', 'Indentation must be a whole number between 1 and 8.')
    }

    return indent
}

function normalizeAliasLimit(maxAliasCount = DEFAULT_MAX_ALIAS_COUNT): number {
    if (!Number.isInteger(maxAliasCount) || maxAliasCount < 0 || maxAliasCount > 1_000) {
        throw new JSONYAMLConversionError('YAML', 'The YAML alias limit must be between 0 and 1,000.')
    }

    return maxAliasCount
}

function normalizeResourceLimit(
    value: number | undefined,
    fallback: number,
    maximum: number,
    label: string,
    format: 'JSON' | 'YAML',
): number {
    const normalized = value ?? fallback
    if (!Number.isInteger(normalized) || normalized < 1 || normalized > maximum) {
        throw new JSONYAMLConversionError(
            format,
            `${label} must be a whole number between 1 and ${maximum.toLocaleString('en-US')}.`,
        )
    }

    return normalized
}

function normalizeLimits(
    options: JSONYAMLConversionOptions,
    format: 'JSON' | 'YAML',
): ConversionLimits {
    return {
        maxInputCharacters: normalizeResourceLimit(
            options.maxInputCharacters,
            DEFAULT_MAX_INPUT_CHARACTERS,
            ABSOLUTE_MAX_INPUT_CHARACTERS,
            'Maximum input characters',
            format,
        ),
        maxNodes: normalizeResourceLimit(
            options.maxNodes,
            DEFAULT_MAX_NODES,
            ABSOLUTE_MAX_NODES,
            'Maximum value nodes',
            format,
        ),
        maxDepth: normalizeResourceLimit(
            options.maxDepth,
            DEFAULT_MAX_DEPTH,
            ABSOLUTE_MAX_DEPTH,
            'Maximum nesting depth',
            format,
        ),
    }
}

function assertInputLength(input: string, format: 'JSON' | 'YAML', limits: ConversionLimits): void {
    if (input.length > limits.maxInputCharacters) {
        throw new JSONYAMLConversionError(
            format,
            `${format} input exceeds the ${limits.maxInputCharacters.toLocaleString('en-US')}-character safety limit.`,
        )
    }
}

function jsonErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) return 'JSON input is not valid.'

    const lineAndColumn = error.message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
    if (lineAndColumn) {
        return `JSON input is not valid at line ${lineAndColumn[1]}, column ${lineAndColumn[2]}.`
    }

    const position = error.message.match(/position\s+(\d+)/i)
    if (position) return `JSON input is not valid near character ${position[1]}.`

    return 'JSON input is not valid. Check commas, quotes, and brackets.'
}

function yamlLocation(problem: { linePos?: Array<{ line: number; col: number }> }): string {
    const start = problem.linePos?.[0]
    return start ? ` at line ${start.line}, column ${start.col}` : ''
}

function isAliasLimitError(error: unknown): boolean {
    return error instanceof Error && /alias|resource exhaustion/i.test(error.message)
}

function isObjectValue(value: unknown): value is object {
    return value !== null && typeof value === 'object'
}

function childDepth(value: unknown, containerDepth: number): number {
    return isObjectValue(value) ? containerDepth + 1 : containerDepth
}

function visitValue(state: TraversalState, depth: number): void {
    state.nodes += 1
    if (state.nodes > state.limits.maxNodes) {
        throw new JSONYAMLConversionError(
            state.format,
            `${state.format} input exceeds the ${state.limits.maxNodes.toLocaleString('en-US')}-node safety limit.`,
        )
    }

    if (depth > state.limits.maxDepth) {
        throw new JSONYAMLConversionError(
            state.format,
            `${state.format} input exceeds the nesting-depth safety limit of ${state.limits.maxDepth}.`,
        )
    }
}

function unsafeIntegerError(format: 'JSON' | 'YAML'): JSONYAMLConversionError {
    return new JSONYAMLConversionError(
        format,
        `${format} contains an integer outside JavaScript's safe range. Quote it as a string to preserve every digit.`,
    )
}

function assertJSONCompatible(
    value: unknown,
    limits: ConversionLimits,
    state: TraversalState = { format: 'JSON', limits, nodes: 0 },
    depth = isObjectValue(value) ? 1 : 0,
    ancestors = new WeakSet<object>(),
): void {
    visitValue(state, depth)

    if (value === null || typeof value === 'string' || typeof value === 'boolean') return

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new JSONYAMLConversionError(state.format, `${state.format} contains a non-finite number that cannot be converted safely.`)
        }
        if (Number.isInteger(value) && !Number.isSafeInteger(value)) throw unsafeIntegerError(state.format)
        return
    }

    if (typeof value !== 'object') {
        throw new JSONYAMLConversionError(state.format, `${state.format} contains a value that cannot be converted safely.`)
    }

    if (ancestors.has(value)) {
        throw new JSONYAMLConversionError(state.format, `${state.format} contains a circular value that cannot be converted safely.`)
    }

    ancestors.add(value)

    if (Array.isArray(value)) {
        value.forEach(item => assertJSONCompatible(item, limits, state, childDepth(item, depth), ancestors))
    } else {
        Object.values(value).forEach(item => assertJSONCompatible(item, limits, state, childDepth(item, depth), ancestors))
    }

    ancestors.delete(value)
}

function mappingKeyAfterCoercion(value: unknown): string | null {
    if (value === null) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') return String(value)
    return null
}

function normalizeYAMLValue(
    value: unknown,
    limits: ConversionLimits,
    state: TraversalState = { format: 'YAML', limits, nodes: 0 },
    depth = isObjectValue(value) ? 1 : 0,
    ancestors = new WeakSet<object>(),
): unknown {
    visitValue(state, depth)

    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value

    if (typeof value === 'bigint') {
        if (value < MIN_SAFE_BIGINT || value > MAX_SAFE_BIGINT) throw unsafeIntegerError('YAML')
        return Number(value)
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new JSONYAMLConversionError('YAML', 'YAML contains a non-finite number that JSON cannot represent.')
        }
        if (Number.isInteger(value) && !Number.isSafeInteger(value)) throw unsafeIntegerError('YAML')
        return value
    }

    if (!isObjectValue(value)) {
        throw new JSONYAMLConversionError('YAML', 'YAML contains a value that JSON cannot represent safely.')
    }

    if (ancestors.has(value)) {
        throw new JSONYAMLConversionError('YAML', 'YAML contains a circular alias that JSON cannot represent.')
    }

    ancestors.add(value)

    let normalized: unknown
    if (Array.isArray(value)) {
        normalized = value.map(item => normalizeYAMLValue(
            item,
            limits,
            state,
            childDepth(item, depth),
            ancestors,
        ))
    } else if (value instanceof Map) {
        const entries = [...value.entries()]
        const coercedKeys = new Set<string>()

        for (const [key] of entries) {
            const coercedKey = mappingKeyAfterCoercion(key)
            if (coercedKey !== null && coercedKeys.has(coercedKey)) {
                throw new JSONYAMLConversionError(
                    'YAML',
                    'YAML contains mapping keys that become duplicates when converted to JSON strings.',
                )
            }
            if (coercedKey !== null) coercedKeys.add(coercedKey)
        }

        const objectValue: Record<string, unknown> = Object.create(null) as Record<string, unknown>
        for (const [key, item] of entries) {
            if (typeof key !== 'string') {
                throw new JSONYAMLConversionError(
                    'YAML',
                    'YAML mapping keys must be strings to convert safely to JSON.',
                )
            }

            objectValue[key] = normalizeYAMLValue(
                item,
                limits,
                state,
                childDepth(item, depth),
                ancestors,
            )
        }
        normalized = objectValue
    } else {
        // Safe core-schema scalar objects (for example, known timestamp tags)
        // retain the yaml package's existing JSON.stringify behavior.
        normalized = value
    }

    ancestors.delete(value)
    return normalized
}

function stringifyJSON(value: unknown, indent: number): string {
    try {
        const output = JSON.stringify(value, null, indent)
        if (output === undefined) {
            throw new JSONYAMLConversionError('YAML', 'YAML contains a value that JSON cannot represent safely.')
        }
        return output
    } catch (error) {
        if (error instanceof JSONYAMLConversionError) throw error
        throw new JSONYAMLConversionError('YAML', 'YAML could not be represented safely as JSON.')
    }
}

function stringifyYAML(value: unknown, indent: number): string {
    return stringify(value, {
        aliasDuplicateObjects: false,
        indent,
        lineWidth: 0,
        schema: 'core',
    }).trimEnd()
}

export function convertJSONToYAML(
    input: string,
    options: JSONYAMLConversionOptions = {},
): JSONYAMLConversionResult {
    const indent = normalizeIndent(options.indent)
    const limits = normalizeLimits(options, 'JSON')
    assertInputLength(input, 'JSON', limits)
    if (!input.trim()) throw new JSONYAMLConversionError('JSON', 'Enter JSON to convert.')

    let value: unknown
    try {
        value = JSON.parse(input)
    } catch (error) {
        throw new JSONYAMLConversionError('JSON', jsonErrorMessage(error))
    }

    assertJSONCompatible(value, limits)

    const useMultipleDocuments = options.arrayAsDocuments === true && Array.isArray(value) && value.length > 0
    const values: unknown[] = useMultipleDocuments ? value as unknown[] : [value]
    const output = useMultipleDocuments
        ? values.map(document => `---\n${stringifyYAML(document, indent)}`).join('\n')
        : stringifyYAML(value, indent)

    return {
        output,
        direction: 'json-to-yaml',
        inputDocumentCount: 1,
        outputDocumentCount: values.length,
        warnings: options.arrayAsDocuments && !Array.isArray(value)
            ? ['Multi-document output only applies when the top-level JSON value is an array.']
            : [],
    }
}

export function convertYAMLToJSON(
    input: string,
    options: JSONYAMLConversionOptions = {},
): JSONYAMLConversionResult {
    const indent = normalizeIndent(options.indent)
    const maxAliasCount = normalizeAliasLimit(options.maxAliasCount)
    const limits = normalizeLimits(options, 'YAML')
    assertInputLength(input, 'YAML', limits)
    if (!input.trim()) throw new JSONYAMLConversionError('YAML', 'Enter YAML to convert.')

    let documents
    try {
        documents = parseAllDocuments(input, {
            merge: false,
            prettyErrors: false,
            schema: 'core',
            strict: true,
            uniqueKeys: true,
            intAsBigInt: true,
        })
    } catch {
        throw new JSONYAMLConversionError('YAML', 'YAML input could not be parsed safely.')
    }

    const warnings: string[] = []
    const values: unknown[] = []
    const traversalState: TraversalState = { format: 'YAML', limits, nodes: 0 }

    for (const document of documents) {
        const parseError = document.errors[0]
        if (parseError) {
            throw new JSONYAMLConversionError('YAML', `YAML input is not valid${yamlLocation(parseError)}.`)
        }

        const unsupportedTag = document.warnings.find(warning => warning.code === 'TAG_RESOLVE_FAILED')
        if (unsupportedTag) {
            throw new JSONYAMLConversionError(
                'YAML',
                `Custom or unresolved YAML tags are not supported${yamlLocation(unsupportedTag)}.`,
            )
        }

        document.warnings.forEach(warning => {
            warnings.push(`YAML contains a parser warning${yamlLocation(warning)}.`)
        })

        try {
            const value = document.toJS({ maxAliasCount, mapAsMap: true })
            values.push(normalizeYAMLValue(value, limits, traversalState))
        } catch (error) {
            if (error instanceof JSONYAMLConversionError) throw error
            if (isAliasLimitError(error)) {
                throw new JSONYAMLConversionError('YAML', 'YAML aliases exceed the safe expansion limit.')
            }
            throw new JSONYAMLConversionError('YAML', 'YAML input could not be converted safely.')
        }
    }

    const outputValue = values.length === 1 ? values[0] : values

    return {
        output: stringifyJSON(outputValue, indent),
        direction: 'yaml-to-json',
        inputDocumentCount: values.length,
        outputDocumentCount: 1,
        warnings,
    }
}

export function convertJSONYAML(
    input: string,
    direction: JSONYAMLDirection,
    options: JSONYAMLConversionOptions = {},
): JSONYAMLConversionResult {
    return direction === 'json-to-yaml'
        ? convertJSONToYAML(input, options)
        : convertYAMLToJSON(input, options)
}
