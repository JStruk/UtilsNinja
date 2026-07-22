import { describe, expect, it } from 'vitest'
import {
    DEFAULT_EXECUTION_COUNT,
    CronExplorerError,
    exploreCron,
    isValidTimeZone,
} from '@/utilities/CronExplorer'

const UTC_START = new Date('2026-01-01T00:07:00.000Z')

describe('exploreCron parsing and explanations', () => {
    it('normalizes and explains a standard five-field expression', () => {
        const result = exploreCron('  */15   9-17  * * 1-5  ', {
            timeZone: 'UTC',
            currentDate: UTC_START,
        })

        expect(result.expression).toBe('*/15 9-17 * * 1-5')
        expect(result.fieldCount).toBe(5)
        expect(result.hasSeconds).toBe(false)
        expect(result.fields).toHaveLength(6)
        expect(result.fields[0]).toMatchObject({
            name: 'second',
            value: '0',
            implicit: true,
            description: 'At second 0',
        })
        expect(result.fields[1]?.description).toBe('Every 15 minutes')
        expect(result.fields[2]?.description).toBe('From 09:00 through 17:00')
        expect(result.fields[5]?.description).toBe('From Monday through Friday')
    })

    it('supports six fields with explicit seconds', () => {
        const result = exploreCron('*/10 * * * * *', {
            timeZone: 'UTC',
            currentDate: new Date('2026-01-01T00:00:05.000Z'),
        })

        expect(result.fieldCount).toBe(6)
        expect(result.hasSeconds).toBe(true)
        expect(result.fields[0]).toMatchObject({ value: '*/10', implicit: false })
        expect(result.nextExecutions.slice(0, 3).map(run => run.iso)).toEqual([
            '2026-01-01T00:00:10.000Z',
            '2026-01-01T00:00:20.000Z',
            '2026-01-01T00:00:30.000Z',
        ])
    })

    it('describes every-minute and every-second schedules', () => {
        const options = { timeZone: 'UTC', currentDate: UTC_START, executionCount: 1 }

        expect(exploreCron('* * * * *', options).summary).toBe('Runs every minute at second 0.')
        expect(exploreCron('* * * * * *', options).summary).toBe('Runs every second.')
    })

    it('describes a fixed daily time', () => {
        const result = exploreCron('0 9 * * *', {
            timeZone: 'UTC',
            currentDate: UTC_START,
            executionCount: 1,
        })

        expect(result.summary).toBe('Runs at 09:00 every day.')
    })

    it('explains last-day and nth-weekday extensions', () => {
        const lastDay = exploreCron('0 0 L * *', {
            timeZone: 'UTC',
            currentDate: UTC_START,
            executionCount: 1,
        })
        const secondMonday = exploreCron('0 0 * * MON#2', {
            timeZone: 'UTC',
            currentDate: UTC_START,
            executionCount: 1,
        })

        expect(lastDay.fields[3]?.description).toBe('On the last day of the month')
        expect(secondMonday.fields[5]?.description).toBe('On the 2nd Monday of the month')
    })

    it('rejects empty, macro, short, and long field counts', () => {
        for (const expression of ['', '@daily', '* * * *', '* * * * * * *']) {
            expect(() => exploreCron(expression, { timeZone: 'UTC' })).toThrow(CronExplorerError)
        }
    })

    it('wraps parser range errors in a typed expression error', () => {
        expect(() => exploreCron('60 * * * *', { timeZone: 'UTC' })).toThrowError(
            expect.objectContaining({ code: 'invalid-expression' }),
        )
    })
})

describe('day-of-month and day-of-week semantics', () => {
    const options = { timeZone: 'UTC', currentDate: UTC_START, executionCount: 1 }

    it.each([
        ['* * * * *', 'every-day', false],
        ['0 0 13 * *', 'day-of-month', false],
        ['0 0 * * 1', 'day-of-week', false],
        ['0 0 13 * 1', 'either', true],
    ] as const)('classifies %s as %s', (expression, mode, warning) => {
        expect(exploreCron(expression, options).daySemantics).toMatchObject({ mode, warning })
    })

    it('uses traditional OR behavior when both day fields are restricted', () => {
        const result = exploreCron('0 0 13 * 1', {
            timeZone: 'UTC',
            currentDate: new Date('2026-01-01T00:00:00.000Z'),
            executionCount: 3,
        })

        expect(result.nextExecutions.map(run => run.iso)).toEqual([
            '2026-01-05T00:00:00.000Z',
            '2026-01-12T00:00:00.000Z',
            '2026-01-13T00:00:00.000Z',
        ])
        expect(result.daySemantics.description).toContain('either day of month')
        expect(result.daySemantics.description).toContain('not only when both match')
    })
})

describe('future execution calculation', () => {
    it('returns eight executions by default', () => {
        const result = exploreCron('*/15 * * * *', {
            timeZone: 'UTC',
            currentDate: UTC_START,
        })

        expect(result.nextExecutions).toHaveLength(DEFAULT_EXECUTION_COUNT)
        expect(result.nextExecutions.map(run => run.iso)).toEqual([
            '2026-01-01T00:15:00.000Z',
            '2026-01-01T00:30:00.000Z',
            '2026-01-01T00:45:00.000Z',
            '2026-01-01T01:00:00.000Z',
            '2026-01-01T01:15:00.000Z',
            '2026-01-01T01:30:00.000Z',
            '2026-01-01T01:45:00.000Z',
            '2026-01-01T02:00:00.000Z',
        ])
        expect(result.nextExecutions[0]).toMatchObject({
            position: 1,
            unixMilliseconds: Date.parse('2026-01-01T00:15:00.000Z'),
        })
    })

    it('applies the selected IANA timezone', () => {
        const result = exploreCron('0 9 * * *', {
            timeZone: 'America/Toronto',
            currentDate: new Date('2026-01-15T13:00:00.000Z'),
            executionCount: 2,
        })

        expect(result.nextExecutions.map(run => run.iso)).toEqual([
            '2026-01-15T14:00:00.000Z',
            '2026-01-16T14:00:00.000Z',
        ])
    })

    it('returns repeatable hashed schedules by seeding from the expression', () => {
        const options = {
            timeZone: 'UTC',
            currentDate: UTC_START,
            executionCount: 3,
        }

        const first = exploreCron('H * * * *', options)
        const second = exploreCron('H * * * *', options)

        expect(first.nextExecutions.map(run => run.iso)).toEqual(second.nextExecutions.map(run => run.iso))
    })
})

describe('timezone and option validation', () => {
    it('validates common IANA timezone identifiers', () => {
        expect(isValidTimeZone('UTC')).toBe(true)
        expect(isValidTimeZone('America/Toronto')).toBe(true)
        expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false)
        expect(isValidTimeZone('')).toBe(false)
    })

    it('rejects an invalid timezone with a typed error', () => {
        expect(() => exploreCron('* * * * *', { timeZone: 'Mars/Olympus_Mons' })).toThrowError(
            expect.objectContaining({ code: 'invalid-timezone' }),
        )
    })

    it('rejects invalid current dates and execution counts', () => {
        expect(() => exploreCron('* * * * *', {
            timeZone: 'UTC',
            currentDate: new Date('invalid'),
        })).toThrowError(expect.objectContaining({ code: 'invalid-current-date' }))

        expect(() => exploreCron('* * * * *', {
            timeZone: 'UTC',
            executionCount: 0,
        })).toThrowError(expect.objectContaining({ code: 'invalid-count' }))
    })
})
