import { describe, it, expect } from 'vitest'
import { lineSort } from '@/utilities/LineSort'

describe('LineSort', () => {
    it('should sort a line alphabetically', () => {
        const input:string = 'c\nb\na'
        const sorted: string = 'a\nb\nc'

        expect(lineSort(input)).toEqual(sorted)
    })
})