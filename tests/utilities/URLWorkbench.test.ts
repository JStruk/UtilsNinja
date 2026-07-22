import { describe, expect, it } from 'vitest'
import {
    buildURL,
    decodeURL,
    encodeURL,
    parseURL,
    type URLParts,
} from '@/utilities/URLWorkbench'

describe('URLWorkbench', () => {
    it('parses editable URL parts while preserving duplicate query parameters', () => {
        const result = parseURL(
            'https://ninja:p%40ss@example.com:8443/api/users%20list?role=admin&role=editor&empty=#results%20panel',
        )

        expect(result).toEqual({
            protocol: 'https',
            username: 'ninja',
            password: 'p@ss',
            hostname: 'example.com',
            port: '8443',
            pathname: '/api/users list',
            hash: 'results panel',
            queryParameters: [
                { key: 'role', value: 'admin' },
                { key: 'role', value: 'editor' },
                { key: 'empty', value: '' },
            ],
        })
    })

    it('builds a normalized URL and encodes editable values', () => {
        const parts: URLParts = {
            protocol: 'HTTPS:',
            username: 'ninja',
            password: 'p@ss',
            hostname: 'example.com',
            port: '8443',
            pathname: 'api/users list',
            hash: '#results panel',
            queryParameters: [
                { key: 'role', value: 'admin' },
                { key: 'role', value: 'editor' },
                { key: 'search', value: 'red shoes' },
            ],
        }

        expect(buildURL(parts)).toBe(
            'https://ninja:p%40ss@example.com:8443/api/users%20list?role=admin&role=editor&search=red+shoes#results%20panel',
        )
    })

    it('rejects incomplete URLs and invalid ports', () => {
        expect(() => parseURL('example.com/path')).toThrow('valid absolute URL')

        expect(() => buildURL({
            protocol: 'https',
            username: '',
            password: '',
            hostname: 'example.com',
            port: '70000',
            pathname: '/',
            hash: '',
            queryParameters: [],
        })).toThrow('between 1 and 65535')
    })

    it('encodes and decodes complete URLs without escaping URL separators', () => {
        const source = 'https://example.com/a path?q=hello world&tag=a/b#intro'
        const encoded = 'https://example.com/a%20path?q=hello%20world&tag=a/b#intro'

        expect(encodeURL(source, 'full')).toBe(encoded)
        expect(decodeURL(encoded, 'full')).toBe(source)
    })

    it('encodes and decodes individual URL components', () => {
        const source = 'filter=red shoes&sort=price/high'
        const encoded = 'filter%3Dred%20shoes%26sort%3Dprice%2Fhigh'

        expect(encodeURL(source, 'component')).toBe(encoded)
        expect(decodeURL(encoded, 'component')).toBe(source)
    })

    it('reports malformed percent-encoding instead of silently changing it', () => {
        expect(() => decodeURL('%E0%A4%A', 'component')).toThrow(URIError)
    })
})
