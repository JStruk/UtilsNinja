import { describe, expect, it } from 'vitest'
import {
    generateCodeFromJSON,
    JSON_TO_CODE_LIMITS,
    JSONToCodeError,
} from '@/utilities/JSONToCode'

const SAMPLE = JSON.stringify({
    id: 7,
    display_name: 'Ninja',
    active: true,
    profile: {
        website: 'https://utils.ninja',
    },
    roles: ['admin', 'developer'],
})

describe('generateCodeFromJSON', () => {
    it('generates nested TypeScript interfaces', () => {
        const result = generateCodeFromJSON(SAMPLE, {
            language: 'typescript',
            rootName: 'user response',
        })

        expect(result.rootName).toBe('UserResponse')
        expect(result.code).toContain('export interface UserResponse')
        expect(result.code).toContain('display_name: string;')
        expect(result.code).toContain('profile: Profile;')
        expect(result.code).toContain('roles: string[];')
        expect(result.definitionCount).toBe(2)
    })

    it('merges object samples and marks missing fields as optional', () => {
        const input = JSON.stringify([
            { id: 1, name: 'Ninja' },
            { id: 2, email: 'ninja@example.com' },
        ])
        const result = generateCodeFromJSON(input, { rootName: 'users' })

        expect(result.code).toContain('export type Users = User[];')
        expect(result.code).toContain('name?: string;')
        expect(result.code).toContain('email?: string;')
    })

    it('preserves nullable and heterogeneous TypeScript values as unions', () => {
        const result = generateCodeFromJSON('[{"value":1},{"value":null},{"value":"one"}]')

        expect(result.code).toMatch(/value: (?:number \| null \| string|number \| string \| null);/)
    })

    it('preserves nullable array elements in C# and Go models', () => {
        const input = '{"values":["one",null]}'

        expect(generateCodeFromJSON(input, { language: 'csharp' }).code)
            .toContain('public List<string?> Values')
        expect(generateCodeFromJSON(input, { language: 'go' }).code)
            .toContain('Values []*string `json:"values"`')
    })

    it('uses floating-point types for numbers outside the safe integral range', () => {
        const input = '{"safe":9007199254740991,"huge":1e100}'
        const csharp = generateCodeFromJSON(input, { language: 'csharp' }).code
        const go = generateCodeFromJSON(input, { language: 'go' }).code

        expect(csharp).toContain('public long Safe')
        expect(csharp).toContain('public double Huge')
        expect(go).toContain('Safe int64 `json:"safe"`')
        expect(go).toContain('Huge float64 `json:"huge"`')
    })

    it('quotes property names that are not TypeScript identifiers', () => {
        const result = generateCodeFromJSON('{"content-type":"json","123":"value"}')

        expect(result.code).toContain('"content-type": string;')
        expect(result.code).toContain('"123": string;')
    })

    it('generates System.Text.Json C# models', () => {
        const result = generateCodeFromJSON(SAMPLE, {
            language: 'csharp',
            rootName: 'user response',
        })

        expect(result.code).toContain('using System.Text.Json.Serialization;')
        expect(result.code).toContain('public sealed class UserResponse')
        expect(result.code).toContain('[JsonPropertyName("display_name")]')
        expect(result.code).toContain('public string DisplayName { get; init; } = string.Empty;')
        expect(result.code).toContain('public List<string> Roles { get; init; } = new();')
    })

    it('generates Go structs with exact JSON field tags', () => {
        const result = generateCodeFromJSON(SAMPLE, {
            language: 'go',
            rootName: 'user response',
        })

        expect(result.code).toContain('package models')
        expect(result.code).toContain('type UserResponse struct')
        expect(result.code).toContain('DisplayName string `json:"display_name"`')
        expect(result.code).toContain('Roles []string `json:"roles"`')
    })

    it('uses pointers and omitempty for optional Go fields', () => {
        const result = generateCodeFromJSON('[{"id":1},{"id":2,"label":"two"}]', {
            language: 'go',
            rootName: 'items',
        })

        expect(result.code).toContain('Label *string `json:"label,omitempty"`')
    })

    it('supports primitive and empty-array roots', () => {
        expect(generateCodeFromJSON('true').code).toBe('export type Root = boolean;')
        expect(generateCodeFromJSON('[]').code).toBe('export type Root = unknown[];')
    })

    it('returns stable validation errors without repeating input', () => {
        const secret = '{"apiToken":"do-not-repeat",}'

        expect(() => generateCodeFromJSON(secret)).toThrow(JSONToCodeError)
        try {
            generateCodeFromJSON(secret)
        } catch (error) {
            expect((error as Error).message).toBe('JSON input is not valid. Check commas, quotes, and brackets.')
            expect((error as Error).message).not.toContain('do-not-repeat')
        }
    })

    it('guards input size and nesting depth', () => {
        expect(() => generateCodeFromJSON('x'.repeat(JSON_TO_CODE_LIMITS.maxInputLength + 1)))
            .toThrow(/character limit/)

        let nested: unknown = 'value'
        for (let index = 0; index < JSON_TO_CODE_LIMITS.maxDepth + 2; index += 1) {
            nested = { nested }
        }

        expect(() => generateCodeFromJSON(JSON.stringify(nested))).toThrow(/nesting exceeds/)
    })
})
