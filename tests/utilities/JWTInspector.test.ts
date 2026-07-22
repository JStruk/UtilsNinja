import { describe, expect, it } from 'vitest'
import {
    decodeBase64Url,
    inspectJWT,
    JWTInspectionError,
} from '@/utilities/JWTInspector'

function encodeText(value: string): string {
    const bytes = new TextEncoder().encode(value)
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

function encodeSegment(value: unknown): string {
    return encodeText(JSON.stringify(value))
}

function createToken(
    payload: Record<string, unknown>,
    header: Record<string, unknown> = { alg: 'HS256', typ: 'JWT' },
    signature = 'test-signature',
): string {
    return `${encodeSegment(header)}.${encodeSegment(payload)}.${signature}`
}

describe('JWTInspector', () => {
    it('decodes Base64URL JSON as UTF-8', () => {
        const token = createToken({
            sub: 'user-123',
            name: 'José 🚀',
            roles: ['developer', 'admin'],
        })

        const result = inspectJWT(token, Date.UTC(2026, 0, 1))

        expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' })
        expect(result.payload).toEqual({
            sub: 'user-123',
            name: 'José 🚀',
            roles: ['developer', 'admin'],
        })
        expect(result.algorithm).toBe('HS256')
        expect(result.tokenType).toBe('JWT')
    })

    it('reports active time claims and never claims signature verification', () => {
        const now = Date.UTC(2026, 0, 1, 0, 0, 0)
        const nowSeconds = now / 1000
        const token = createToken({
            iat: nowSeconds - 60,
            nbf: nowSeconds - 30,
            exp: nowSeconds + 300,
        })

        const result = inspectJWT(token, now)

        expect(result.time.status).toBe('active')
        expect(result.time.issuedAt?.iso).toBe('2025-12-31T23:59:00.000Z')
        expect(result.time.notBefore?.iso).toBe('2025-12-31T23:59:30.000Z')
        expect(result.time.expiresAt?.iso).toBe('2026-01-01T00:05:00.000Z')
        expect(result.time.secondsUntilExpiry).toBe(300)
        expect(result.signature).toEqual({
            present: true,
            verified: false,
            message: 'Signature data is present, but it has not been verified.',
        })
    })

    it('reports a token as expired at its exact expiration time', () => {
        const now = Date.UTC(2026, 0, 1, 0, 0, 0)
        const token = createToken({ exp: now / 1000 })

        expect(inspectJWT(token, now).time.status).toBe('expired')
    })

    it('reports a token whose not-before claim is still in the future', () => {
        const now = Date.UTC(2026, 0, 1, 0, 0, 0)
        const token = createToken({
            nbf: now / 1000 + 60,
            exp: now / 1000 + 3600,
        })

        expect(inspectJWT(token, now).time.status).toBe('not-yet-valid')
    })

    it('prioritizes expiration and warns when exp does not follow nbf', () => {
        const now = Date.UTC(2026, 0, 1, 0, 0, 0)
        const token = createToken({
            nbf: now / 1000 + 60,
            exp: now / 1000 - 60,
        })

        const result = inspectJWT(token, now)

        expect(result.time.status).toBe('expired')
        expect(result.warnings).toContain(
            'Claim "exp" is earlier than or equal to "nbf", so the token has no valid time window.',
        )
    })

    it('warns about an empty validity window when exp equals nbf', () => {
        const now = Date.UTC(2026, 0, 1, 0, 0, 0)
        const boundary = now / 1000 + 60
        const result = inspectJWT(createToken({ nbf: boundary, exp: boundary }), now)

        expect(result.time.status).toBe('not-yet-valid')
        expect(result.warnings).toContain(
            'Claim "exp" is earlier than or equal to "nbf", so the token has no valid time window.',
        )
    })

    it('handles missing signatures and expiration claims without implying validity', () => {
        const token = createToken({ sub: 'user-123' }, { alg: 'none', typ: 'JWT' }, '')

        const result = inspectJWT(token, Date.UTC(2026, 0, 1))

        expect(result.time.status).toBe('no-expiration')
        expect(result.signature.present).toBe(false)
        expect(result.signature.verified).toBe(false)
        expect(result.signature.message).toContain('No signature data is present')
    })

    it('ignores malformed NumericDate claims and returns a warning', () => {
        const token = createToken({ exp: 'tomorrow' })

        const result = inspectJWT(token, Date.UTC(2026, 0, 1))

        expect(result.time.status).toBe('no-expiration')
        expect(result.time.expiresAt).toBeNull()
        expect(result.warnings).toEqual([
            'Claim "exp" is not a valid NumericDate and was not used for time status.',
        ])
    })

    it('rejects malformed compact tokens and invalid JSON objects', () => {
        expect(() => inspectJWT('only.two')).toThrowError(
            'A JWT must contain exactly three dot-separated segments.',
        )
        expect(() => inspectJWT(`${encodeText('not JSON')}.${encodeSegment({ sub: '1' })}.sig`))
            .toThrowError('JWT header is not valid JSON.')
        expect(() => inspectJWT(`${encodeSegment([])}.${encodeSegment({ sub: '1' })}.sig`))
            .toThrowError('JWT header must be a JSON object.')
    })

    it('rejects invalid Base64URL and invalid UTF-8 data', () => {
        expect(() => decodeBase64Url('abc+def')).toThrow(JWTInspectionError)
        expect(() => decodeBase64Url('_w')).toThrowError('JWT segment is not valid UTF-8 text.')
    })
})
