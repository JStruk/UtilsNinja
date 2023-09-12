import { describe, it, expect } from 'vitest'
import { lineSort } from '@/utilities/LineSort'

describe('LineSort', () => {
    it('should sort a line alphabetically', () => {
        const input:string = 'c\nb\na'
        const sorted: string = 'a\nb\nc'

        expect(lineSort(input)).toEqual(sorted)
    })

    it('should remove duplicates', () => {
        const input:string = 'c\n' +
            'b\n' +
            'b\n' +
            'b\n' +
            'a\n' +
            'a'

        const sorted: string = 'a\nb\nc'

        expect(lineSort(input, true)).toEqual(sorted)
    })

    it('should not remove duplicates if false provided', () => {
        const input:string = 'c\n' +
            'b\n' +
            'b\n' +
            'b\n' +
            'a\n' +
            'a'

        const sorted: string = 'a\na\nb\nb\nb\nc'

        expect(lineSort(input, false)).toEqual(sorted)
    })

    it('handles extra newline at end of input', () => {
        const input:string = 'c\nb\na\n'
        const sorted: string = 'a\nb\nc'

        expect(lineSort(input)).toEqual(sorted)
    })
})