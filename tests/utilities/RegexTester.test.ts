import { describe, expect, it } from 'vitest'
import { analyzeRegex, RegexTesterError } from '@/utilities/RegexTester'

describe('RegexTester', () => {
    it('finds all matches and creates highlight segments', () => {
        const result = analyzeRegex({
            pattern: '\\bcat\\b',
            flags: 'gi',
            input: 'Cat, dog, catfish, cat.',
            replacement: 'fox',
        })

        expect(result.matches.map(match => ({
            value: match.value,
            start: match.start,
            end: match.end,
        }))).toEqual([
            { value: 'Cat', start: 0, end: 3 },
            { value: 'cat', start: 19, end: 22 },
        ])
        expect(result.segments.filter(segment => segment.kind === 'match')).toHaveLength(2)
        expect(result.replacementPreview).toBe('fox, dog, catfish, fox.')
    })

    it('reports numbered and named capture groups with exact indices', () => {
        const result = analyzeRegex({
            pattern: '(?<year>\\d{4})-(\\d{2})-(\\d{2})',
            flags: 'g',
            input: 'Released 2026-07-22.',
        })
        const match = result.matches[0]

        expect(match?.captures).toEqual([
            { group: 1, value: '2026', start: 9, end: 13 },
            { group: 2, value: '07', start: 14, end: 16 },
            { group: 3, value: '22', start: 17, end: 19 },
        ])
        expect(match?.namedCaptures).toEqual([
            { name: 'year', value: '2026', start: 9, end: 13 },
        ])
    })

    it('expands JavaScript numbered, named, and full-match replacement tokens', () => {
        const result = analyzeRegex({
            pattern: '(?<first>\\w+),\\s*(\\w+)',
            flags: 'g',
            input: 'Ninja, Utils',
            replacement: '$2 $<first> [$&] $$',
        })

        expect(result.replacementPreview).toBe('Utils Ninja [Ninja, Utils] $')
    })

    it('advances safely through zero-length global matches', () => {
        const result = analyzeRegex({
            pattern: '(?=a)|$',
            flags: 'g',
            input: 'aa',
            replacement: '|',
        })

        expect(result.matches.map(match => match.start)).toEqual([0, 1, 2])
        expect(result.matches.every(match => match.value === '')).toBe(true)
        expect(result.replacementPreview).toBe('|a|a|')
        expect(result.warnings).toContain('Zero-length matches are shown as insertion markers.')
    })

    it('bounds match collection and withholds an incomplete replacement preview', () => {
        const result = analyzeRegex({
            pattern: '.',
            flags: 'g',
            input: 'abcdef',
            replacement: 'x',
            limits: { maxMatches: 3 },
        })

        expect(result.matches).toHaveLength(3)
        expect(result.matchesTruncated).toBe(true)
        expect(result.replacementPreview).toBeNull()
        expect(result.warnings).toContain('Replacement preview is unavailable because the match result was truncated.')
    })

    it('returns useful errors for invalid patterns and flags', () => {
        expect(() => analyzeRegex({
            pattern: '(',
            flags: 'g',
            input: '',
        })).toThrow(/Invalid regular expression:.*group|Invalid regular expression:.*parenthes/i)

        expect(() => analyzeRegex({
            pattern: '.',
            flags: 'gg',
            input: '',
        })).toThrow('flag "g" is duplicated')
    })

    it('rejects oversized input before evaluating the expression', () => {
        expect(() => analyzeRegex({
            pattern: '(a+)+$',
            flags: '',
            input: 'a'.repeat(11),
            limits: { maxInputLength: 10 },
        })).toThrowError(expect.objectContaining<Partial<RegexTesterError>>({
            code: 'INPUT_TOO_LARGE',
        }))
    })

    it('honors non-global matching semantics', () => {
        const result = analyzeRegex({
            pattern: 'a',
            flags: '',
            input: 'banana',
            replacement: 'A',
        })

        expect(result.matches).toHaveLength(1)
        expect(result.replacementPreview).toBe('bAnana')
    })
})
