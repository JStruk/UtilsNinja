import { parseAllDocuments, stringify } from 'yaml'

export type JSONYAMLDirection = 'json-to-yaml' | 'yaml-to-json'

export interface JSONYAMLConversionOptions {
    indent?: number
    arrayAsDocuments?: boolean
    maxAliasCount?: number
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

function assertJSONCompatible(value: unknown, ancestors = new WeakSet<object>()): void {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new JSONYAMLConversionError('YAML', 'YAML contains a non-finite number that JSON cannot represent.')
        }
        return
    }

    if (typeof value !== 'object') {
        throw new JSONYAMLConversionError('YAML', 'YAML contains a value that JSON cannot represent safely.')
    }

    if (ancestors.has(value)) {
        throw new JSONYAMLConversionError('YAML', 'YAML contains a circular alias that JSON cannot represent.')
    }

    ancestors.add(value)

    if (Array.isArray(value)) {
        value.forEach(item => assertJSONCompatible(item, ancestors))
    } else {
        Object.values(value).forEach(item => assertJSONCompatible(item, ancestors))
    }

    ancestors.delete(value)
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
    if (!input.trim()) throw new JSONYAMLConversionError('JSON', 'Enter JSON to convert.')

    let value: unknown
    try {
        value = JSON.parse(input)
    } catch (error) {
        throw new JSONYAMLConversionError('JSON', jsonErrorMessage(error))
    }

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
    if (!input.trim()) throw new JSONYAMLConversionError('YAML', 'Enter YAML to convert.')

    let documents
    try {
        documents = parseAllDocuments(input, {
            merge: false,
            prettyErrors: false,
            schema: 'core',
            strict: true,
            uniqueKeys: true,
        })
    } catch {
        throw new JSONYAMLConversionError('YAML', 'YAML input could not be parsed safely.')
    }

    const warnings: string[] = []
    const values: unknown[] = []

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
            const value = document.toJS({ maxAliasCount, mapAsMap: false })
            assertJSONCompatible(value)
            values.push(value)
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
