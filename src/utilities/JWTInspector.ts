export type JSONObject = Record<string, unknown>

export type JWTTemporalStatus = 'active' | 'expired' | 'not-yet-valid' | 'no-expiration'

export interface JWTNumericDate {
    seconds: number
    iso: string | null
}

export interface JWTInspectionResult {
    header: JSONObject
    payload: JSONObject
    encoded: {
        header: string
        payload: string
        signature: string
    }
    algorithm: string | null
    tokenType: string | null
    time: {
        status: JWTTemporalStatus
        evaluatedAt: JWTNumericDate
        issuedAt: JWTNumericDate | null
        notBefore: JWTNumericDate | null
        expiresAt: JWTNumericDate | null
        secondsUntilExpiry: number | null
    }
    signature: {
        present: boolean
        verified: false
        message: string
    }
    warnings: string[]
}

export class JWTInspectionError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'JWTInspectionError'
    }
}

function isBase64Url(segment: string): boolean {
    const withoutPadding = segment.replace(/=+$/, '')
    return /^[A-Za-z0-9_-]+={0,2}$/.test(segment) && withoutPadding.length % 4 !== 1
}

/**
 * Decodes one Base64URL segment as UTF-8 text.
 * This only decodes bytes; it does not authenticate their source.
 */
export function decodeBase64Url(segment: string): string {
    if (!segment) {
        throw new JWTInspectionError('JWT header and payload segments cannot be empty.')
    }

    if (!isBase64Url(segment)) throw new JWTInspectionError('JWT contains an invalid Base64URL segment.')

    const withoutPadding = segment.replace(/=+$/, '')
    const base64 = withoutPadding
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(withoutPadding.length / 4) * 4, '=')

    let binary: string
    try {
        binary = globalThis.atob(base64)
    } catch {
        throw new JWTInspectionError('JWT contains an invalid Base64URL segment.')
    }

    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))

    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
        throw new JWTInspectionError('JWT segment is not valid UTF-8 text.')
    }
}

function parseObject(segment: string, label: 'header' | 'payload'): JSONObject {
    let parsed: unknown

    try {
        parsed = JSON.parse(decodeBase64Url(segment))
    } catch (error) {
        if (error instanceof JWTInspectionError) throw error
        throw new JWTInspectionError(`JWT ${label} is not valid JSON.`)
    }

    if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new JWTInspectionError(`JWT ${label} must be a JSON object.`)
    }

    return parsed as JSONObject
}

function numericDate(
    payload: JSONObject,
    claim: 'iat' | 'nbf' | 'exp',
    warnings: string[],
): JWTNumericDate | null {
    const value = payload[claim]
    if (value === undefined) return null

    if (typeof value !== 'number' || !Number.isFinite(value)) {
        warnings.push(`Claim "${claim}" is not a valid NumericDate and was not used for time status.`)
        return null
    }

    const date = new Date(value * 1000)
    if (Number.isNaN(date.getTime())) {
        warnings.push(`Claim "${claim}" is outside the supported date range.`)
    }

    return {
        seconds: value,
        iso: Number.isNaN(date.getTime()) ? null : date.toISOString(),
    }
}

function optionalString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null
}

/**
 * Parses and decodes a compact JWT for inspection.
 *
 * Important: decoding is not signature verification. This function deliberately
 * makes no trust or authenticity claim about the decoded data.
 */
export function inspectJWT(token: string, now: Date | number = new Date()): JWTInspectionResult {
    const trimmedToken = token.trim()
    if (!trimmedToken) {
        throw new JWTInspectionError('Enter a JWT to inspect.')
    }

    const segments = trimmedToken.split('.')
    if (segments.length !== 3) {
        throw new JWTInspectionError('A JWT must contain exactly three dot-separated segments.')
    }

    const [encodedHeader = '', encodedPayload = '', encodedSignature = ''] = segments
    const header = parseObject(encodedHeader, 'header')
    const payload = parseObject(encodedPayload, 'payload')
    const warnings: string[] = []

    if (encodedSignature && !isBase64Url(encodedSignature)) {
        throw new JWTInspectionError('JWT signature is not valid Base64URL data.')
    }

    const nowMilliseconds = now instanceof Date ? now.getTime() : now
    const evaluationDate = new Date(nowMilliseconds)
    if (!Number.isFinite(nowMilliseconds) || Number.isNaN(evaluationDate.getTime())) {
        throw new JWTInspectionError('Inspection time must be a valid date or millisecond timestamp.')
    }

    const nowSeconds = nowMilliseconds / 1000
    const issuedAt = numericDate(payload, 'iat', warnings)
    const notBefore = numericDate(payload, 'nbf', warnings)
    const expiresAt = numericDate(payload, 'exp', warnings)
    const algorithm = optionalString(header.alg)

    if (algorithm?.toLowerCase() === 'none') {
        warnings.push('The token declares the unsecured "none" algorithm.')
    }

    let status: JWTTemporalStatus
    if (notBefore && nowSeconds < notBefore.seconds) {
        status = 'not-yet-valid'
    } else if (expiresAt && nowSeconds >= expiresAt.seconds) {
        status = 'expired'
    } else if (!expiresAt) {
        status = 'no-expiration'
    } else {
        status = 'active'
    }

    const signaturePresent = encodedSignature.length > 0

    return {
        header,
        payload,
        encoded: {
            header: encodedHeader,
            payload: encodedPayload,
            signature: encodedSignature,
        },
        algorithm,
        tokenType: optionalString(header.typ),
        time: {
            status,
            evaluatedAt: {
                seconds: nowSeconds,
                iso: evaluationDate.toISOString(),
            },
            issuedAt,
            notBefore,
            expiresAt,
            secondsUntilExpiry: expiresAt ? expiresAt.seconds - nowSeconds : null,
        },
        signature: {
            present: signaturePresent,
            verified: false,
            message: signaturePresent
                ? 'Signature data is present, but it has not been verified.'
                : 'No signature data is present. This token has not been verified.',
        },
        warnings,
    }
}
