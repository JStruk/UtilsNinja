import { describe, it, expect } from 'vitest'
import { unixEpochToDate } from '@/utilities/UnixEpochToDate';

describe('Unix Epoch to Date', () => {
    const testCases = [
        ['iso', '2023-01-24T21:30:01.793Z'],
        ['locale', 'Tue Jan 24 2023 16:30:01 GMT-05:00'],
        ['human', 'Tuesday January 24th 2023 at 04:30:01 PM'],
    ]

    it.each(testCases)('can covert a unix timestamp to a %s date', (dateFormat, dateString) => {
        const timestamp = 1674595801793;
        const result = unixEpochToDate(timestamp);

        expect(result).toBeInstanceOf(Object);
        expect(result).toEqual(expect.objectContaining({
            [dateFormat]: dateString
        }))
    })
})