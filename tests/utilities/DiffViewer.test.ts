import { describe, expect, it } from 'vitest'
import {
    DIFF_LIMITS,
    DiffViewerError,
    compareInputs,
    formatUnifiedDiff,
    normalizeJson,
} from '@/utilities/DiffViewer'

describe('compareInputs', () => {
    it('returns unchanged rows for matching text', () => {
        const result = compareInputs('alpha\nbeta', 'alpha\nbeta')

        expect(result.unifiedRows.map(row => row.type)).toEqual(['unchanged', 'unchanged'])
        expect(result.summary).toMatchObject({
            added: 0,
            removed: 0,
            unchanged: 2,
            hasChanges: false,
            leftLines: 2,
            rightLines: 2,
        })
    })

    it('tracks additions, removals, line numbers, and unchanged rows', () => {
        const result = compareInputs(
            'alpha\nbeta\ngamma',
            'alpha\nBETA\ngamma\ndelta',
        )

        expect(result.unifiedRows.map(row => row.type)).toEqual([
            'unchanged',
            'removed',
            'added',
            'unchanged',
            'added',
        ])
        expect(result.unifiedRows[1]).toMatchObject({
            leftLineNumber: 2,
            rightLineNumber: null,
            leftText: 'beta',
        })
        expect(result.unifiedRows[2]).toMatchObject({
            leftLineNumber: null,
            rightLineNumber: 2,
            rightText: 'BETA',
        })
        expect(result.summary).toMatchObject({
            added: 2,
            removed: 1,
            unchanged: 2,
            modified: 1,
            changeBlocks: 2,
            hasChanges: true,
        })
    })

    it('aligns replacement pairs for side-by-side presentation', () => {
        const result = compareInputs('one\ntwo\nthree', 'one\nTWO\nthree')

        expect(result.sideBySideRows).toHaveLength(3)
        expect(result.sideBySideRows[1]).toMatchObject({
            type: 'modified',
            left: { type: 'removed', lineNumber: 2, text: 'two' },
            right: { type: 'added', lineNumber: 2, text: 'TWO' },
        })
    })

    it('keeps unmatched additions and removals in separate side-by-side cells', () => {
        const result = compareInputs('one\ntwo', 'zero\none')

        expect(result.sideBySideRows[0]).toMatchObject({
            type: 'added',
            left: null,
            right: { type: 'added', lineNumber: 1, text: 'zero' },
        })
        expect(result.sideBySideRows[result.sideBySideRows.length - 1]).toMatchObject({
            type: 'removed',
            left: { type: 'removed', lineNumber: 2, text: 'two' },
            right: null,
        })
    })

    it('can ignore repeated whitespace while preserving displayed source text', () => {
        const result = compareInputs('alpha   beta\n  value', 'alpha beta\nvalue', {
            ignoreWhitespace: true,
        })

        expect(result.summary.hasChanges).toBe(false)
        expect(result.unifiedRows[0]).toMatchObject({
            type: 'unchanged',
            leftText: 'alpha   beta',
            rightText: 'alpha beta',
        })
    })

    it('can ignore letter case', () => {
        const result = compareInputs('UtilsNinja\nACTIVE', 'utilsninja\nactive', {
            ignoreCase: true,
        })

        expect(result.summary).toMatchObject({ added: 0, removed: 0, unchanged: 2 })
    })

    it('treats case differences as changes by default', () => {
        const result = compareInputs('ACTIVE', 'active')

        expect(result.summary).toMatchObject({ added: 1, removed: 1, unchanged: 0 })
    })

    it('normalizes CRLF, LF, and CR line endings', () => {
        const result = compareInputs('one\r\ntwo\rthree', 'one\ntwo\nthree')

        expect(result.summary).toMatchObject({ added: 0, removed: 0, unchanged: 3 })
        expect(result.normalizedLeft).toBe('one\ntwo\nthree')
    })

    it('reports independent contiguous change blocks', () => {
        const result = compareInputs('a\nx\nb\ny\nc', 'a\nX\nb\nY\nc')

        expect(result.summary.changeBlocks).toBe(2)
    })

    it('handles two empty inputs without creating a phantom line', () => {
        const result = compareInputs('', '')

        expect(result.unifiedRows).toEqual([])
        expect(result.sideBySideRows).toEqual([])
        expect(result.summary).toMatchObject({
            leftLines: 0,
            rightLines: 0,
            unchanged: 0,
            hasChanges: false,
        })
    })
})

describe('normalized JSON mode', () => {
    it('sorts nested object keys and formats with two-space indentation', () => {
        expect(normalizeJson('{"b":2,"a":{"y":2,"x":1}}')).toBe(
            '{\n  "a": {\n    "x": 1,\n    "y": 2\n  },\n  "b": 2\n}',
        )
    })

    it('treats formatting and object-key order as equivalent', () => {
        const result = compareInputs(
            '{"b":2,"a":{"y":2,"x":1}}',
            '{\n  "a": { "x": 1, "y": 2 },\n  "b": 2\n}',
            { mode: 'json' },
        )

        expect(result.mode).toBe('json')
        expect(result.summary.hasChanges).toBe(false)
        expect(result.normalizedLeft).toBe(result.normalizedRight)
    })

    it('preserves array order as a meaningful difference', () => {
        const result = compareInputs('{"items":[1,2]}', '{"items":[2,1]}', { mode: 'json' })

        expect(result.summary.hasChanges).toBe(true)
    })

    it.each([
        ['left', '{broken', '{}'],
        ['right', '{}', '{broken'],
    ] as const)('identifies invalid JSON in the %s input', (side, left, right) => {
        try {
            compareInputs(left, right, { mode: 'json' })
            throw new Error('Expected comparison to fail.')
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(DiffViewerError)
            expect(error).toMatchObject({ code: 'invalid-json', side })
            expect((error as Error).message).toContain(side === 'left' ? 'original input' : 'changed input')
        }
    })
})

describe('size safeguards', () => {
    it('rejects an input above the character limit', () => {
        const oversized = 'a'.repeat(DIFF_LIMITS.maxCharactersPerInput + 1)

        expect(() => compareInputs(oversized, '')).toThrowError(
            expect.objectContaining({ code: 'input-too-large', side: 'left' }),
        )
    })

    it('rejects an input above the line limit', () => {
        const oversized = Array.from(
            { length: DIFF_LIMITS.maxLinesPerInput + 1 },
            () => 'line',
        ).join('\n')

        expect(() => compareInputs('', oversized)).toThrowError(
            expect.objectContaining({ code: 'too-many-lines', side: 'right' }),
        )
    })

    it('rejects a comparison matrix above the memory safety limit', () => {
        const left = Array.from({ length: 1_500 }, (_, index) => `left-${index}`).join('\n')
        const right = Array.from({ length: 1_500 }, (_, index) => `right-${index}`).join('\n')

        expect(() => compareInputs(left, right)).toThrowError(
            expect.objectContaining({ code: 'comparison-too-large', side: null }),
        )
    })
})

describe('formatUnifiedDiff', () => {
    it('formats unchanged, removed, and added lines with visible markers', () => {
        const result = compareInputs('alpha\nbeta', 'alpha\nBETA\ngamma')

        expect(formatUnifiedDiff(result)).toBe(
            '  alpha\n- beta\n+ BETA\n+ gamma',
        )
    })
})
