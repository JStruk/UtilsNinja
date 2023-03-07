import { describe, it, expect } from 'vitest'
import { PHPArrayToJson } from '@/utilities/PHPArrayToJson';


describe('PHPArrayToJson', () => {
    it('returns an empty json object from empty associative array', () => {
        const array = '[]';
        const result = {}

        expect(PHPArrayToJson(array)).toEqual(result)
    })

    it('should convert php array to json object', function () {
        const phpObject = '["foo" => "bar"]';
        const expectedJSONObject = { 'foo': 'bar' }

        expect(PHPArrayToJson(phpObject)).toEqual(expectedJSONObject)
    });

    it('should convert nested php array to json object', function () {
        const phpObject = '["foo" => ["bar" => "baz"]]';
        const expectedJSONObject = { 'foo': { 'bar': 'baz' } }

        expect(PHPArrayToJson(phpObject)).toEqual(expectedJSONObject)
    });
})