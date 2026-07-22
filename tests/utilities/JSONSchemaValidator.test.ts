import { describe, expect, it } from 'vitest'
import { formatJSONPointer, validateJSONSchema } from '@/utilities/JSONSchemaValidator'

const objectSchema = JSON.stringify({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 2 },
        age: { type: 'integer', minimum: 18 },
    },
    required: ['name', 'age'],
    additionalProperties: false,
})

describe('JSONSchemaValidator', () => {
    it('validates data with a draft 2020-12 schema', () => {
        const result = validateJSONSchema({
            schemaText: JSON.stringify({
                type: 'array',
                prefixItems: [{ type: 'string' }, { type: 'number' }],
                items: false,
            }),
            dataText: JSON.stringify(['release', 2026]),
        })

        expect(result.valid).toBe(true)
        expect(result.schemaValid).toBe(true)
        expect(result.dataValid).toBe(true)
        expect(result.errorCount).toBe(0)
    })

    it('returns all validation errors with property-level paths', () => {
        const result = validateJSONSchema({
            schemaText: objectSchema,
            dataText: JSON.stringify({ name: 'N', debug: true }),
            allErrors: true,
        })

        expect(result.valid).toBe(false)
        expect(result.schemaValid).toBe(true)
        expect(result.dataValid).toBe(false)
        expect(result.diagnostics.filter(diagnostic => diagnostic.kind === 'validation')).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ keyword: 'required', instancePath: '/age', displayPath: '$.age' }),
                expect.objectContaining({ keyword: 'additionalProperties', instancePath: '/debug', displayPath: '$.debug' }),
                expect.objectContaining({ keyword: 'minLength', instancePath: '/name', displayPath: '$.name' }),
            ]),
        )
    })

    it('honors first-error mode', () => {
        const result = validateJSONSchema({
            schemaText: objectSchema,
            dataText: '{}',
            allErrors: false,
        })

        expect(result.diagnostics.filter(diagnostic => diagnostic.kind === 'validation')).toHaveLength(1)
    })

    it('supports common string formats', () => {
        const result = validateJSONSchema({
            schemaText: JSON.stringify({
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    createdAt: { type: 'string', format: 'date-time' },
                    id: { type: 'string', format: 'uuid' },
                },
                required: ['email', 'createdAt', 'id'],
            }),
            dataText: JSON.stringify({
                email: 'not-an-email',
                createdAt: 'tomorrow',
                id: '1234',
            }),
        })

        expect(result.diagnostics.filter(diagnostic => diagnostic.keyword === 'format')).toHaveLength(3)
    })

    it('supports local $defs references', () => {
        const result = validateJSONSchema({
            schemaText: JSON.stringify({
                $defs: { identifier: { type: 'integer', minimum: 1 } },
                type: 'object',
                properties: { id: { $ref: '#/$defs/identifier' } },
                required: ['id'],
            }),
            dataText: JSON.stringify({ id: 7 }),
        })

        expect(result.valid).toBe(true)
    })

    it('blocks remote and relative schema references without fetching', () => {
        const result = validateJSONSchema({
            schemaText: JSON.stringify({ $ref: 'https://schemas.example.com/user.json' }),
            dataText: '{}',
        })

        expect(result.schemaValid).toBe(false)
        expect(result.diagnostics[0]).toEqual(expect.objectContaining({
            kind: 'reference',
            keyword: '$ref',
            displayPath: '$schema.$ref',
        }))
    })

    it('reports malformed JSON with line and column details', () => {
        const result = validateJSONSchema({
            schemaText: objectSchema,
            dataText: '{\n  "name": "Ninja",\n  bad\n}',
        })

        expect(result.dataValid).toBeNull()
        expect(result.diagnostics[0]).toEqual(expect.objectContaining({
            source: 'data',
            kind: 'parse',
            line: 3,
        }))
    })

    it('reports invalid schemas and strict diagnostics', () => {
        const invalidSchema = validateJSONSchema({
            schemaText: JSON.stringify({ type: 'not-a-json-type' }),
            dataText: '{}',
        })
        expect(invalidSchema.schemaValid).toBe(false)
        expect(invalidSchema.diagnostics[0]?.kind).toBe('schema')

        const strictResult = validateJSONSchema({
            schemaText: JSON.stringify({ type: 'object', propertiez: { id: { type: 'number' } } }),
            dataText: '{}',
            strictDiagnostics: true,
        })
        expect(strictResult.valid).toBe(true)
        expect(strictResult.diagnostics).toEqual(expect.arrayContaining([
            expect.objectContaining({ kind: 'strict', severity: 'warning' }),
        ]))
    })

    it('guards input size before parsing or validation', () => {
        const result = validateJSONSchema({
            schemaText: '{}',
            dataText: '"123456"',
            limits: { maxDataCharacters: 5 },
        })

        expect(result.dataValid).toBeNull()
        expect(result.diagnostics[0]).toEqual(expect.objectContaining({
            source: 'data',
            kind: 'limit',
            keyword: 'maxCharacters',
        }))
    })

    it('formats escaped JSON Pointer paths for people', () => {
        expect(formatJSONPointer('/users/0/display~1name/~0meta')).toBe('$.users[0]["display/name"]["~meta"]')
    })
})
