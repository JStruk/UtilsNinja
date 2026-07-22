export const DEFAULT_REGEX_LIMITS = Object.freeze({
    maxInputLength: 100_000,
    maxPatternLength: 2_000,
    maxReplacementLength: 10_000,
    maxMatches: 1_000,
    maxOutputLength: 200_000,
})

export interface RegexLimits {
    maxInputLength: number
    maxPatternLength: number
    maxReplacementLength: number
    maxMatches: number
    maxOutputLength: number
}

export interface RegexAnalysisOptions {
    pattern: string
    flags: string
    input: string
    replacement?: string
    limits?: Partial<RegexLimits>
}

export interface CaptureGroup {
    group: number
    value: string | null
    start: number | null
    end: number | null
}

export interface NamedCaptureGroup {
    name: string
    value: string | null
    start: number | null
    end: number | null
}

export interface RegexMatch {
    number: number
    value: string
    start: number
    end: number
    captures: CaptureGroup[]
    namedCaptures: NamedCaptureGroup[]
}

export interface HighlightSegment {
    kind: 'text' | 'match'
    text: string
    start: number
    end: number
    matchNumber: number | null
    zeroLength: boolean
}

export interface RegexAnalysisResult {
    matches: RegexMatch[]
    segments: HighlightSegment[]
    replacementPreview: string | null
    replacementPreviewTruncated: boolean
    matchesTruncated: boolean
    warnings: string[]
}

export type RegexTesterErrorCode =
    | 'INVALID_PATTERN'
    | 'INVALID_FLAGS'
    | 'INVALID_LIMIT'
    | 'INPUT_TOO_LARGE'
    | 'PATTERN_TOO_LARGE'
    | 'REPLACEMENT_TOO_LARGE'

export interface SerializedRegexError {
    code: RegexTesterErrorCode | 'UNKNOWN'
    message: string
}

export interface RegexWorkerRequest {
    requestId: number
    options: RegexAnalysisOptions
}

export type RegexWorkerResponse =
    | { requestId: number; ok: true; result: RegexAnalysisResult }
    | { requestId: number; ok: false; error: SerializedRegexError }

export class RegexTesterError extends Error {
    readonly code: RegexTesterErrorCode

    constructor(code: RegexTesterErrorCode, message: string) {
        super(message)
        this.name = 'RegexTesterError'
        this.code = code
    }
}

type MatchIndices = Array<[number, number] | undefined> & {
    groups?: Record<string, [number, number] | undefined>
}

type MatchWithIndices = RegExpExecArray & {
    indices?: MatchIndices
}

const VALID_FLAGS = new Set(['d', 'g', 'i', 'm', 's', 'u', 'v', 'y'])
const SUPPORTS_MATCH_INDICES = (() => {
    try {
        const expression = new RegExp('', 'd') as RegExp & { hasIndices?: boolean }
        return expression.hasIndices === true
    } catch {
        return false
    }
})()

function resolveLimits(overrides: Partial<RegexLimits> = {}): RegexLimits {
    const resolved = { ...DEFAULT_REGEX_LIMITS, ...overrides }

    for (const [name, value] of Object.entries(resolved)) {
        if (!Number.isSafeInteger(value) || value <= 0) {
            throw new RegexTesterError('INVALID_LIMIT', `${name} must be a positive whole number.`)
        }
    }

    return resolved
}

function validateFlags(flags: string): void {
    const seen = new Set<string>()

    for (const flag of flags) {
        if (!VALID_FLAGS.has(flag)) {
            throw new RegexTesterError(
                'INVALID_FLAGS',
                `Unsupported regular expression flag "${flag}". Use flags from dgimsuvy.`,
            )
        }

        if (seen.has(flag)) {
            throw new RegexTesterError('INVALID_FLAGS', `Regular expression flag "${flag}" is duplicated.`)
        }

        seen.add(flag)
    }

    if (seen.has('u') && seen.has('v')) {
        throw new RegexTesterError('INVALID_FLAGS', 'The u and v Unicode flags cannot be used together.')
    }
}

function explainSyntaxError(error: unknown): string {
    const rawMessage = error instanceof Error ? error.message : String(error)
    const finalSeparator = rawMessage.lastIndexOf(': ')
    const detail = finalSeparator >= 0 ? rawMessage.slice(finalSeparator + 2) : rawMessage

    return `Invalid regular expression: ${detail}`
}

function createRegExp(pattern: string, flags: string): RegExp {
    validateFlags(flags)

    const executionFlags = SUPPORTS_MATCH_INDICES && !flags.includes('d') ? `${flags}d` : flags

    try {
        return new RegExp(pattern, executionFlags)
    } catch (error) {
        const message = error instanceof Error ? error.message : ''
        const code: RegexTesterErrorCode = message.toLowerCase().includes('flag')
            ? 'INVALID_FLAGS'
            : 'INVALID_PATTERN'

        throw new RegexTesterError(code, explainSyntaxError(error))
    }
}

function advanceStringIndex(input: string, index: number, unicode: boolean): number {
    if (!unicode || index + 1 >= input.length) return index + 1

    const first = input.charCodeAt(index)
    const second = input.charCodeAt(index + 1)
    const isSurrogatePair = first >= 0xD800
        && first <= 0xDBFF
        && second >= 0xDC00
        && second <= 0xDFFF

    return index + (isSurrogatePair ? 2 : 1)
}

function fallbackRange(match: RegExpExecArray, value: string | undefined): [number, number] | null {
    if (value === undefined) return null

    const relativeStart = match[0].indexOf(value)
    if (relativeStart < 0) return null

    const start = match.index + relativeStart
    return [start, start + value.length]
}

function toCaptureGroup(match: MatchWithIndices, group: number): CaptureGroup {
    const value = match[group]
    const range = match.indices?.[group] ?? fallbackRange(match, value)

    return {
        group,
        value: value ?? null,
        start: range?.[0] ?? null,
        end: range?.[1] ?? null,
    }
}

function toNamedCaptureGroup(match: MatchWithIndices, name: string, value: string | undefined): NamedCaptureGroup {
    const range = match.indices?.groups?.[name] ?? fallbackRange(match, value)

    return {
        name,
        value: value ?? null,
        start: range?.[0] ?? null,
        end: range?.[1] ?? null,
    }
}

function toRegexMatch(match: MatchWithIndices, number: number): RegexMatch {
    return {
        number,
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
        captures: match.slice(1).map((_, index) => toCaptureGroup(match, index + 1)),
        namedCaptures: Object.entries(match.groups ?? {}).map(([name, value]) => (
            toNamedCaptureGroup(match, name, value)
        )),
    }
}

function collectMatches(regex: RegExp, input: string, maxMatches: number): {
    matches: RegexMatch[]
    truncated: boolean
} {
    const matches: RegexMatch[] = []
    const unicode = regex.flags.includes('u') || regex.flags.includes('v')
    let truncated = false

    while (true) {
        const match = regex.exec(input) as MatchWithIndices | null
        if (!match) break

        if (matches.length >= maxMatches) {
            truncated = true
            break
        }

        matches.push(toRegexMatch(match, matches.length + 1))

        if (!regex.global) break

        if (match[0].length === 0) {
            regex.lastIndex = advanceStringIndex(input, regex.lastIndex, unicode)
        }
    }

    return { matches, truncated }
}

function buildHighlightSegments(input: string, matches: RegexMatch[]): HighlightSegment[] {
    const segments: HighlightSegment[] = []
    let cursor = 0

    for (const match of matches) {
        if (match.start > cursor) {
            segments.push({
                kind: 'text',
                text: input.slice(cursor, match.start),
                start: cursor,
                end: match.start,
                matchNumber: null,
                zeroLength: false,
            })
        }

        segments.push({
            kind: 'match',
            text: match.value,
            start: match.start,
            end: match.end,
            matchNumber: match.number,
            zeroLength: match.start === match.end,
        })

        cursor = Math.max(cursor, match.end)
    }

    if (cursor < input.length || segments.length === 0) {
        segments.push({
            kind: 'text',
            text: input.slice(cursor),
            start: cursor,
            end: input.length,
            matchNumber: null,
            zeroLength: false,
        })
    }

    return segments
}

function numericReplacement(token: string, match: RegexMatch): string {
    const groupNumber = Number(token)

    if (groupNumber > 0 && groupNumber <= match.captures.length) {
        return match.captures[groupNumber - 1]?.value ?? ''
    }

    if (token.length === 2) {
        const firstDigit = Number(token[0])

        if (firstDigit > 0 && firstDigit <= match.captures.length) {
            return `${match.captures[firstDigit - 1]?.value ?? ''}${token[1]}`
        }
    }

    return `$${token}`
}

function expandReplacement(replacement: string, match: RegexMatch, input: string): string {
    return replacement.replace(/\$(\$|&|`|'|<[^>]*>|\d{1,2})/g, (whole, token: string) => {
        if (token === '$') return '$'
        if (token === '&') return match.value
        if (token === '`') return input.slice(0, match.start)
        if (token === "'") return input.slice(match.end)

        if (token.startsWith('<') && token.endsWith('>')) {
            if (match.namedCaptures.length === 0) return whole

            const name = token.slice(1, -1)
            return match.namedCaptures.find(capture => capture.name === name)?.value ?? ''
        }

        return numericReplacement(token, match)
    })
}

function buildReplacementPreview(
    input: string,
    replacement: string,
    matches: RegexMatch[],
    maxOutputLength: number,
): { preview: string; truncated: boolean } {
    let preview = ''
    let cursor = 0
    let truncated = false

    const append = (value: string): boolean => {
        const remaining = maxOutputLength - preview.length

        if (value.length <= remaining) {
            preview += value
            return true
        }

        preview += value.slice(0, Math.max(remaining - 1, 0))
        if (remaining > 0) preview += '…'
        truncated = true
        return false
    }

    for (const match of matches) {
        if (!append(input.slice(cursor, match.start))) break
        if (!append(expandReplacement(replacement, match, input))) break
        cursor = match.end
    }

    if (!truncated) append(input.slice(cursor))

    return { preview, truncated }
}

export function serializeRegexError(error: unknown): SerializedRegexError {
    if (error instanceof RegexTesterError) {
        return { code: error.code, message: error.message }
    }

    return {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unable to evaluate this regular expression.',
    }
}

/**
 * Evaluate a JavaScript regular expression with bounded input, output, and
 * match counts. Browser callers should still run this function in a Worker so
 * a pathological expression can be terminated by the caller.
 */
export function analyzeRegex(options: RegexAnalysisOptions): RegexAnalysisResult {
    const limits = resolveLimits(options.limits)
    const replacement = options.replacement ?? ''

    if (options.pattern.length > limits.maxPatternLength) {
        throw new RegexTesterError(
            'PATTERN_TOO_LARGE',
            `Pattern is too long. The limit is ${limits.maxPatternLength.toLocaleString()} characters.`,
        )
    }

    if (options.input.length > limits.maxInputLength) {
        throw new RegexTesterError(
            'INPUT_TOO_LARGE',
            `Test input is too long. The limit is ${limits.maxInputLength.toLocaleString()} characters.`,
        )
    }

    if (replacement.length > limits.maxReplacementLength) {
        throw new RegexTesterError(
            'REPLACEMENT_TOO_LARGE',
            `Replacement is too long. The limit is ${limits.maxReplacementLength.toLocaleString()} characters.`,
        )
    }

    const regex = createRegExp(options.pattern, options.flags)
    const { matches, truncated } = collectMatches(regex, options.input, limits.maxMatches)
    const warnings: string[] = []

    if (truncated) {
        warnings.push(`Stopped after ${limits.maxMatches.toLocaleString()} matches to keep the result responsive.`)
    }

    if (matches.some(match => match.start === match.end)) {
        warnings.push('Zero-length matches are shown as insertion markers.')
    }

    if (!SUPPORTS_MATCH_INDICES && matches.some(match => match.captures.length > 0)) {
        warnings.push('This browser does not support exact capture indices; displayed capture ranges are approximate.')
    }

    let replacementPreview: string | null = null
    let replacementPreviewTruncated = false

    if (!truncated) {
        const previewResult = buildReplacementPreview(
            options.input,
            replacement,
            matches,
            limits.maxOutputLength,
        )
        replacementPreview = previewResult.preview
        replacementPreviewTruncated = previewResult.truncated

        if (previewResult.truncated) {
            warnings.push(`Replacement preview was limited to ${limits.maxOutputLength.toLocaleString()} characters.`)
        }
    } else {
        warnings.push('Replacement preview is unavailable because the match result was truncated.')
    }

    return {
        matches,
        segments: buildHighlightSegments(options.input, matches),
        replacementPreview,
        replacementPreviewTruncated,
        matchesTruncated: truncated,
        warnings,
    }
}
