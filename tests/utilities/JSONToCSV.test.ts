import { describe, it, expect } from 'vitest'
import { convertJSONtoCSV } from '@/utilities/JSONToCSV';

describe('CSVToJSON', () => {
    it('should convert valid JSON to valid CSV', () => {
        const JSONinput = JSON.stringify([
            {
                Name: 'Joe',
                Age: '25',
                Height: "5'10"
            },
            {
                Name: 'Mike',
                Age: '30',
                Height: "6'0"
            }
        ])


        const CSVresult = "Name,Age,Height\nJoe,25,5'10\nMike,30,6'0"

        expect(convertJSONtoCSV(JSONinput)).toEqual(CSVresult)
    })

    it('should wrap object in array', () => {
        const JSONinput = JSON.stringify(
            {
                Name: 'Joe',
                Age: '25',
                Height: "5'10"
            })

        const CSVresult = "Name,Age,Height\nJoe,25,5'10"

        expect(convertJSONtoCSV(JSONinput)).toEqual(CSVresult)
    })
})