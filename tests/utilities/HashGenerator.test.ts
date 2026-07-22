import { webcrypto } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'
import {
    bytesToBase64,
    bytesToHex,
    encodeHashOutput,
    generateFileHash,
    generateFileHmac,
    generateHash,
    generateHmac,
} from '@/utilities/HashGenerator'
import type { HashAlgorithm } from '@/utilities/HashGenerator'

beforeAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: webcrypto,
    })
})

describe('HashGenerator encoding helpers', () => {
    const bytes = new Uint8Array([0, 15, 16, 255])

    it('encodes bytes as lowercase hexadecimal', () => {
        expect(bytesToHex(bytes)).toBe('000f10ff')
    })

    it('encodes bytes as Base64', () => {
        expect(bytesToBase64(bytes)).toBe('AA8Q/w==')
    })

    it('respects an ArrayBufferView byte offset and length', () => {
        const source = new Uint8Array([99, 1, 2, 3, 99])
        const view = new Uint8Array(source.buffer, 1, 3)

        expect(encodeHashOutput(view, 'hex')).toBe('010203')
    })
})

describe('generateHash', () => {
    const vectors: ReadonlyArray<[HashAlgorithm, string]> = [
        ['SHA-256', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
        ['SHA-384', 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'],
        ['SHA-512', 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'],
    ]

    it.each(vectors)('generates the known %s digest for text', async (algorithm, expected) => {
        await expect(generateHash('abc', algorithm)).resolves.toBe(expected)
    })

    it('supports empty text input', async () => {
        await expect(generateHash('')).resolves.toBe(
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        )
    })

    it('returns Base64 output when requested', async () => {
        await expect(generateHash('abc', 'SHA-256', 'base64')).resolves.toBe(
            'ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=',
        )
    })

    it('hashes a local Blob without changing its bytes', async () => {
        const file = new Blob(['abc'])

        await expect(generateFileHash(file)).resolves.toBe(
            'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
        )
    })
})

describe('generateHmac', () => {
    it('generates a known HMAC-SHA-256 signature', async () => {
        await expect(
            generateHmac('The quick brown fox jumps over the lazy dog', 'key'),
        ).resolves.toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8')
    })

    it('supports binary input and Base64 output', async () => {
        const input = new TextEncoder().encode('The quick brown fox jumps over the lazy dog')

        await expect(generateHmac(input, 'key', 'SHA-256', 'base64')).resolves.toBe(
            '97yD9DBThCSxMpjmqm+xQ+9NWaFJRhdZl0edvC0aPNg=',
        )
    })

    it('signs a local Blob with the same bytes as text input', async () => {
        const file = new Blob(['The quick brown fox jumps over the lazy dog'])

        await expect(generateFileHmac(file, 'key')).resolves.toBe(
            'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
        )
    })

    it('rejects an empty secret', async () => {
        await expect(generateHmac('message', '')).rejects.toThrow('An HMAC secret key is required.')
    })
})
