import { describe, expect, it } from 'vitest'
import {
    convertJSONToYAML,
    convertJSONYAML,
    convertYAMLToJSON,
    JSONYAMLConversionError,
} from '@/utilities/JSONYAMLConverter'

describe('JSONYAMLConverter', () => {
    it('converts nested JSON to YAML with configurable indentation', () => {
        const result = convertJSONToYAML(JSON.stringify({
            service: 'utils-ninja',
            config: {
                enabled: true,
                ports: [4173, 8080],
            },
        }), { indent: 4 })

        expect(result.direction).toBe('json-to-yaml')
        expect(result.inputDocumentCount).toBe(1)
        expect(result.outputDocumentCount).toBe(1)
        expect(result.output).toContain('service: utils-ninja')
        expect(result.output).toContain('    enabled: true')
        expect(result.output).toContain('    ports:')
    })

    it('converts one YAML document to formatted JSON', () => {
        const result = convertYAMLToJSON(`
service: utils-ninja
enabled: true
ports:
  - 4173
  - 8080
`, { indent: 4 })

        expect(JSON.parse(result.output)).toEqual({
            service: 'utils-ninja',
            enabled: true,
            ports: [4173, 8080],
        })
        expect(result.output).toContain('    "service"')
        expect(result.inputDocumentCount).toBe(1)
        expect(result.outputDocumentCount).toBe(1)
    })

    it('represents multiple YAML documents as a JSON array', () => {
        const result = convertYAMLToJSON(`---
name: api
replicas: 2
---
name: worker
replicas: 4`)

        expect(JSON.parse(result.output)).toEqual([
            { name: 'api', replicas: 2 },
            { name: 'worker', replicas: 4 },
        ])
        expect(result.inputDocumentCount).toBe(2)
        expect(result.outputDocumentCount).toBe(1)
    })

    it('can emit top-level JSON array items as separate YAML documents', () => {
        const input = JSON.stringify([
            { name: 'api', replicas: 2 },
            { name: 'worker', replicas: 4 },
        ])

        const yaml = convertJSONToYAML(input, { arrayAsDocuments: true })
        const roundTrip = convertYAMLToJSON(yaml.output)

        expect(yaml.output).toMatch(/^---\n/)
        expect(yaml.output.match(/^---$/gm)).toHaveLength(2)
        expect(yaml.outputDocumentCount).toBe(2)
        expect(JSON.parse(roundTrip.output)).toEqual(JSON.parse(input))
    })

    it('keeps a top-level array as one YAML sequence by default', () => {
        const result = convertJSONToYAML('[{"id":1},{"id":2}]')

        expect(result.output).toMatch(/^- id: 1/m)
        expect(result.output).not.toMatch(/^---$/m)
        expect(result.outputDocumentCount).toBe(1)
    })

    it('returns stable, input-safe validation messages', () => {
        expect(() => convertJSONToYAML('{"secret":"do-not-repeat",}')).toThrow(JSONYAMLConversionError)

        try {
            convertJSONToYAML('{"secret":"do-not-repeat",}')
        } catch (error) {
            expect(error).toBeInstanceOf(JSONYAMLConversionError)
            expect((error as Error).message).toContain('JSON input is not valid')
            expect((error as Error).message).not.toContain('do-not-repeat')
        }

        expect(() => convertYAMLToJSON('items: [one, two')).toThrowError(
            /YAML input is not valid(?: at line \d+, column \d+)?\./,
        )
    })

    it('rejects duplicate keys, custom tags, and non-finite YAML numbers', () => {
        expect(() => convertYAMLToJSON('name: one\nname: two')).toThrowError(/YAML input is not valid/)
        expect(() => convertYAMLToJSON('secret: !env API_TOKEN')).toThrowError(
            /Custom or unresolved YAML tags are not supported/,
        )
        expect(() => convertYAMLToJSON('value: .nan')).toThrowError(
            'YAML contains a non-finite number that JSON cannot represent.',
        )
    })

    it('rejects integers that would be rounded in either conversion direction', () => {
        expect(() => convertJSONToYAML('{"id":9007199254740993}')).toThrowError(
            /integer outside JavaScript's safe range/,
        )
        expect(() => convertYAMLToJSON('id: 9007199254740993')).toThrowError(
            /integer outside JavaScript's safe range/,
        )

        const safeJSON = `{"id":${Number.MAX_SAFE_INTEGER}}`
        expect(convertJSONToYAML(safeJSON).output).toContain(`id: ${Number.MAX_SAFE_INTEGER}`)
        expect(JSON.parse(convertYAMLToJSON(`id: ${Number.MAX_SAFE_INTEGER}`).output)).toEqual({
            id: Number.MAX_SAFE_INTEGER,
        })
    })

    it('rejects non-string YAML mapping keys and keys that collide after coercion', () => {
        expect(() => convertYAMLToJSON('1: numeric key')).toThrowError(
            'YAML mapping keys must be strings to convert safely to JSON.',
        )
        expect(() => convertYAMLToJSON('1: numeric\n"1": string')).toThrowError(
            'YAML contains mapping keys that become duplicates when converted to JSON strings.',
        )
        expect(() => convertYAMLToJSON('null: empty\n"": string')).toThrowError(
            'YAML contains mapping keys that become duplicates when converted to JSON strings.',
        )
    })

    it('limits aliases and rejects circular aliases', () => {
        const aliased = `
defaults: &defaults
  enabled: true
first: *defaults
second: *defaults`

        expect(() => convertYAMLToJSON(aliased, { maxAliasCount: 0 })).toThrowError(
            'YAML aliases exceed the safe expansion limit.',
        )
        expect(() => convertYAMLToJSON('loop: &loop [*loop]')).toThrowError(
            'YAML contains a circular alias that JSON cannot represent.',
        )
    })

    it('dispatches both directions and validates safety options', () => {
        expect(convertJSONYAML('{"enabled":true}', 'json-to-yaml').output).toBe('enabled: true')
        expect(JSON.parse(convertJSONYAML('enabled: true', 'yaml-to-json').output)).toEqual({ enabled: true })
        expect(() => convertJSONToYAML('{}', { indent: 0 })).toThrowError(
            'Indentation must be a whole number between 1 and 8.',
        )
        expect(() => convertYAMLToJSON('enabled: true', { maxAliasCount: 1_001 })).toThrowError(
            'The YAML alias limit must be between 0 and 1,000.',
        )
    })

    it('enforces configurable character, node, and nesting-depth limits', () => {
        expect(() => convertJSONToYAML('{"enabled":true}', { maxInputCharacters: 8 })).toThrowError(
            'JSON input exceeds the 8-character safety limit.',
        )
        expect(() => convertYAMLToJSON('enabled: true', { maxInputCharacters: 8 })).toThrowError(
            'YAML input exceeds the 8-character safety limit.',
        )

        expect(() => convertJSONToYAML('[1,2,3]', { maxNodes: 3 })).toThrowError(
            'JSON input exceeds the 3-node safety limit.',
        )
        expect(() => convertYAMLToJSON('items: [one, two]', { maxNodes: 3 })).toThrowError(
            'YAML input exceeds the 3-node safety limit.',
        )

        expect(() => convertJSONToYAML('{"one":{"two":{"value":true}}}', { maxDepth: 2 })).toThrowError(
            'JSON input exceeds the nesting-depth safety limit of 2.',
        )
        expect(() => convertYAMLToJSON('one:\n  two:\n    value: true', { maxDepth: 2 })).toThrowError(
            'YAML input exceeds the nesting-depth safety limit of 2.',
        )
    })

    it('validates configurable resource limits', () => {
        expect(() => convertJSONToYAML('{}', { maxInputCharacters: 0 })).toThrowError(
            /Maximum input characters must be a whole number/,
        )
        expect(() => convertYAMLToJSON('{}', { maxNodes: 0 })).toThrowError(
            /Maximum value nodes must be a whole number/,
        )
        expect(() => convertYAMLToJSON('{}', { maxDepth: 257 })).toThrowError(
            /Maximum nesting depth must be a whole number/,
        )
    })
})
