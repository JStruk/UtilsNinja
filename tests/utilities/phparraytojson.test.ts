import { describe, it, expect } from 'vitest'
import { PHParrayTojson } from '@/utilities/phparraytojson';


describe('PHParrayTojson', () => {
    it('returns an empty json object from empty associative array', () => {
        const array = '[]';
        const result = {}

        expect(PHParrayTojson(array)).toEqual(result)
    })

    it('should tacos', function () {
        const phpObject = '["foo" => "bar"]';
        const expectedJSONObject = { 'foo': 'bar' }

        expect(PHParrayTojson(phpObject)).toEqual(expectedJSONObject)
    });

    it('should nested tacos', function () {
        const phpObject = '["foo" => ["bar" => "baz"]]';
        const expectedJSONObject = { 'foo': { 'bar': 'baz' } }

        expect(PHParrayTojson(phpObject)).toEqual(expectedJSONObject)
    });
})