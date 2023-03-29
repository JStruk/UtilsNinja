import { describe, it, expect } from 'vitest'
import { JSONToPHPArray } from '@/utilities/JSONToPHPArray'

describe('JSONToPHPArray', () => {
    it('returns an empty php array from empty json object', () => {
        const json = '{}'
        const result = '[]'

        expect(JSONToPHPArray(json)).toEqual(result)
    })

    it('returns an php array from json object', function () {
        const json = '{"foo":"bar"}'
        const result = '["foo"=>"bar"]'

        expect(JSONToPHPArray(json)).toEqual(result)
    })

    it('should convert nested php array to json object', function () {
        const json = '{"baz":{"foo":"bar"}}'
        const result = '["baz"=>["foo"=>"bar"]]'

        expect(JSONToPHPArray(json)).toEqual(result)
    })
})