import { describe, expect, it } from 'vitest'
import { Base64Decode } from '@/utilities/Base64Decode'

describe('Base64Encode', () => {
    it('should decode to string', () => {
        const input: string = 'Rm9vYmFy'

        const expectedOutput = 'Foobar'

        expect(Base64Decode(input)).toEqual(expectedOutput)
    })

    it('can handle empty string', function () {
        const input: string = ''

        expect(Base64Decode(input)).toEqual('')
    })
})