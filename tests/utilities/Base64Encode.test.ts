import { describe, it, expect } from 'vitest'
import { Base64Encode } from '@/utilities/Base64Encode'

describe('Base64Encode', () => {
    it('should encode string to Base64', () => {
        const input: string = 'Foobar'

        const expectedBase64 = 'Rm9vYmFy'

        expect(Base64Encode(input)).toEqual(expectedBase64)
    })

    it('can handle string with invalid characters', () => {
        const input: string ='🔥🔥'

        expect(() => Base64Encode(input)).not.toThrowError()
    })

    it('can handle empty string', function () {
        const input: string = ''

        expect(Base64Encode(input)).toEqual('')
    })
})