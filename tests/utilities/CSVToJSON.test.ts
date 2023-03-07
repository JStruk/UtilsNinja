import { describe, it, expect } from 'vitest'
import { convertCSVToJSON } from '@/utilities/CSVToJSON';

describe('CSVToJSON', () => {
    it('should convert valid CSV to valid JSON string', () => {
        const CSVData = "Name,Age,Height\nJoe,25,5'10\nMike,30,6'0"

        const expectedJSON = [
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
        ]

        expect(convertCSVToJSON(CSVData)).toEqual(JSON.stringify(expectedJSON, null, '\t'))
    })
})