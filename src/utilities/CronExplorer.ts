import { CronExpressionParser } from 'cron-parser'

export const CRON_EXPRESSION_MAX_LENGTH = 200
export const DEFAULT_EXECUTION_COUNT = 8
export const MAX_EXECUTION_COUNT = 20

export const COMMON_TIME_ZONES = [
    'UTC',
    'America/Toronto',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Vancouver',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Warsaw',
    'Africa/Johannesburg',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
] as const

export type CronFieldName = 'second' | 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'
export type CronDayMatchMode = 'every-day' | 'day-of-month' | 'day-of-week' | 'either'
export type CronExplorerErrorCode =
    | 'empty-expression'
    | 'expression-too-long'
    | 'field-count'
    | 'invalid-expression'
    | 'invalid-timezone'
    | 'invalid-current-date'
    | 'invalid-count'

export interface CronFieldExplanation {
    name: CronFieldName
    label: string
    value: string
    allowed: string
    description: string
    implicit: boolean
}

export interface CronDaySemantics {
    mode: CronDayMatchMode
    title: string
    description: string
    warning: boolean
}

export interface CronExecution {
    position: number
    date: Date
    iso: string
    unixMilliseconds: number
}

export interface CronExploration {
    expression: string
    fieldCount: 5 | 6
    hasSeconds: boolean
    timeZone: string
    evaluatedFrom: Date
    summary: string
    fields: CronFieldExplanation[]
    daySemantics: CronDaySemantics
    nextExecutions: CronExecution[]
}

export interface CronExploreOptions {
    timeZone?: string
    currentDate?: Date
    executionCount?: number
}

export class CronExplorerError extends Error {
    readonly code: CronExplorerErrorCode

    constructor(code: CronExplorerErrorCode, message: string) {
        super(message)
        this.name = 'CronExplorerError'
        this.code = code
    }
}

interface FieldDefinition {
    name: CronFieldName
    label: string
    allowed: string
    unit: string
    pluralUnit: string
}

const FIELD_DEFINITIONS: ReadonlyArray<FieldDefinition> = [
    { name: 'second', label: 'Second', allowed: '0–59', unit: 'second', pluralUnit: 'seconds' },
    { name: 'minute', label: 'Minute', allowed: '0–59', unit: 'minute', pluralUnit: 'minutes' },
    { name: 'hour', label: 'Hour', allowed: '0–23', unit: 'hour', pluralUnit: 'hours' },
    { name: 'dayOfMonth', label: 'Day of month', allowed: '1–31 or L', unit: 'day', pluralUnit: 'days' },
    { name: 'month', label: 'Month', allowed: '1–12 or JAN–DEC', unit: 'month', pluralUnit: 'months' },
    { name: 'dayOfWeek', label: 'Day of week', allowed: '0–7 or SUN–SAT', unit: 'weekday', pluralUnit: 'weekdays' },
]

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const

const MONTH_ALIASES: Record<string, string> = {
    JAN: 'January',
    FEB: 'February',
    MAR: 'March',
    APR: 'April',
    MAY: 'May',
    JUN: 'June',
    JUL: 'July',
    AUG: 'August',
    SEP: 'September',
    OCT: 'October',
    NOV: 'November',
    DEC: 'December',
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const WEEKDAY_ALIASES: Record<string, string> = {
    SUN: 'Sunday',
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
}

function ordinal(value: number): string {
    const remainder100 = value % 100
    if (remainder100 >= 11 && remainder100 <= 13) return `${value}th`

    if (value % 10 === 1) return `${value}st`
    if (value % 10 === 2) return `${value}nd`
    if (value % 10 === 3) return `${value}rd`
    return `${value}th`
}

function joinHumanList(values: string[]): string {
    if (values.length <= 1) return values[0] ?? ''
    if (values.length === 2) return `${values[0]} and ${values[1]}`
    return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`
}

function formatFieldValue(value: string, definition: FieldDefinition): string {
    const upperValue = value.toUpperCase()
    const numericValue = Number(value)

    if (definition.name === 'month') {
        if (MONTH_ALIASES[upperValue]) return MONTH_ALIASES[upperValue]
        if (Number.isInteger(numericValue) && numericValue >= 1 && numericValue <= 12) {
            return MONTH_NAMES[numericValue - 1] ?? value
        }
    }

    if (definition.name === 'dayOfWeek') {
        if (WEEKDAY_ALIASES[upperValue]) return WEEKDAY_ALIASES[upperValue]
        if (Number.isInteger(numericValue) && numericValue >= 0 && numericValue <= 7) {
            return WEEKDAY_NAMES[numericValue % 7] ?? value
        }
    }

    if (definition.name === 'dayOfMonth' && Number.isInteger(numericValue)) {
        return ordinal(numericValue)
    }

    if (definition.name === 'hour' && Number.isInteger(numericValue)) {
        return `${numericValue.toString().padStart(2, '0')}:00`
    }

    return value
}

function describeExactValue(value: string, definition: FieldDefinition): string {
    const formatted = formatFieldValue(value, definition)

    if (definition.name === 'second') return `At second ${formatted}`
    if (definition.name === 'minute') return `At minute ${formatted}`
    if (definition.name === 'hour') return `At ${formatted}`
    if (definition.name === 'dayOfMonth') return `On the ${formatted} day of the month`
    if (definition.name === 'month') return `In ${formatted}`
    return `On ${formatted}`
}

function describeWildcard(definition: FieldDefinition): string {
    if (definition.name === 'dayOfMonth') return 'Every day of the month'
    if (definition.name === 'dayOfWeek') return 'Every day of the week'
    return `Every ${definition.unit}`
}

function describeSegment(segment: string, definition: FieldDefinition): string {
    const normalized = segment.toUpperCase()

    if (normalized === '*' || normalized === '?') {
        return describeWildcard(definition)
    }

    if (definition.name === 'dayOfMonth' && normalized === 'L') {
        return 'On the last day of the month'
    }

    const lastWeekdayMatch = definition.name === 'dayOfWeek'
        ? normalized.match(/^([0-7]|SUN|MON|TUE|WED|THU|FRI|SAT)L$/)
        : null
    if (lastWeekdayMatch?.[1]) {
        return `On the last ${formatFieldValue(lastWeekdayMatch[1], definition)} of the month`
    }

    const nthWeekdayMatch = definition.name === 'dayOfWeek'
        ? normalized.match(/^([0-7]|SUN|MON|TUE|WED|THU|FRI|SAT)#([1-5])$/)
        : null
    if (nthWeekdayMatch?.[1] && nthWeekdayMatch[2]) {
        return `On the ${ordinal(Number(nthWeekdayMatch[2]))} ${formatFieldValue(nthWeekdayMatch[1], definition)} of the month`
    }

    if (normalized.startsWith('H')) {
        return `At a stable hashed ${definition.unit} (${segment})`
    }

    const stepMatch = segment.match(/^(.+)\/(\d+)$/)
    if (stepMatch?.[1] && stepMatch[2]) {
        const base = stepMatch[1]
        const step = Number(stepMatch[2])
        if (base === '*' || base === '?') {
            return `Every ${step} ${step === 1 ? definition.unit : definition.pluralUnit}`
        }

        const range = base.split('-')
        if (range.length === 2 && range[0] && range[1]) {
            return `Every ${step} ${definition.pluralUnit} from ${formatFieldValue(range[0], definition)} through ${formatFieldValue(range[1], definition)}`
        }

        return `Every ${step} ${definition.pluralUnit} starting at ${formatFieldValue(base, definition)}`
    }

    const range = segment.split('-')
    if (range.length === 2 && range[0] && range[1]) {
        return `From ${formatFieldValue(range[0], definition)} through ${formatFieldValue(range[1], definition)}`
    }

    return describeExactValue(segment, definition)
}

function describeField(value: string, definition: FieldDefinition): string {
    const segments = value.split(',')
    if (segments.length === 1) return describeSegment(value, definition)
    return `Any of: ${joinHumanList(segments.map(segment => describeSegment(segment, definition).toLowerCase()))}`
}

function isWildcard(value: string): boolean {
    return value === '*' || value === '?'
}

function explainDaySemantics(dayOfMonth: string, dayOfWeek: string): CronDaySemantics {
    const dayOfMonthWildcard = isWildcard(dayOfMonth)
    const dayOfWeekWildcard = isWildcard(dayOfWeek)

    if (dayOfMonthWildcard && dayOfWeekWildcard) {
        return {
            mode: 'every-day',
            title: 'Every calendar day can match',
            description: 'Both day fields are wildcards, so the time and month fields determine each run.',
            warning: false,
        }
    }

    if (!dayOfMonthWildcard && dayOfWeekWildcard) {
        return {
            mode: 'day-of-month',
            title: 'Day of month controls the date',
            description: `A date must match the day-of-month field (${dayOfMonth}); day of week is unrestricted.`,
            warning: false,
        }
    }

    if (dayOfMonthWildcard && !dayOfWeekWildcard) {
        return {
            mode: 'day-of-week',
            title: 'Day of week controls the date',
            description: `A date must match the day-of-week field (${dayOfWeek}); day of month is unrestricted.`,
            warning: false,
        }
    }

    return {
        mode: 'either',
        title: 'Day fields use OR semantics',
        description: `Both day fields are restricted. Following traditional cron behavior, a run occurs when either day of month (${dayOfMonth}) or day of week (${dayOfWeek}) matches—not only when both match.`,
        warning: true,
    }
}

function lowerFirst(value: string): string {
    return value ? value.charAt(0).toLowerCase() + value.slice(1) : value
}

function buildSummary(values: Record<CronFieldName, string>, hasSeconds: boolean): string {
    const calendarFieldsAreWildcards = isWildcard(values.dayOfMonth)
        && isWildcard(values.month)
        && isWildcard(values.dayOfWeek)

    if (
        hasSeconds
        && isWildcard(values.second)
        && isWildcard(values.minute)
        && isWildcard(values.hour)
        && calendarFieldsAreWildcards
    ) {
        return 'Runs every second.'
    }

    if (
        !hasSeconds
        && isWildcard(values.minute)
        && isWildcard(values.hour)
        && calendarFieldsAreWildcards
    ) {
        return 'Runs every minute at second 0.'
    }

    const minuteStep = values.minute.match(/^\*\/(\d+)$/)
    if (
        minuteStep?.[1]
        && values.second === '0'
        && isWildcard(values.hour)
        && calendarFieldsAreWildcards
    ) {
        const interval = Number(minuteStep[1])
        return `Runs every ${interval} ${interval === 1 ? 'minute' : 'minutes'}.`
    }

    const secondIsFixed = /^\d+$/.test(values.second)
    const minuteIsFixed = /^\d+$/.test(values.minute)
    const hourIsFixed = /^\d+$/.test(values.hour)

    if (secondIsFixed && minuteIsFixed && hourIsFixed) {
        const time = `${values.hour.padStart(2, '0')}:${values.minute.padStart(2, '0')}${hasSeconds ? `:${values.second.padStart(2, '0')}` : ''}`
        const daySemantics = explainDaySemantics(values.dayOfMonth, values.dayOfWeek)
        let calendarDescription = 'every day'

        if (daySemantics.mode === 'day-of-month') {
            calendarDescription = lowerFirst(describeField(values.dayOfMonth, FIELD_DEFINITIONS[3] as FieldDefinition))
        } else if (daySemantics.mode === 'day-of-week') {
            calendarDescription = lowerFirst(describeField(values.dayOfWeek, FIELD_DEFINITIONS[5] as FieldDefinition))
        } else if (daySemantics.mode === 'either') {
            calendarDescription = `when either day-of-month ${values.dayOfMonth} or day-of-week ${values.dayOfWeek} matches`
        }

        if (!isWildcard(values.month)) {
            calendarDescription += `, ${lowerFirst(describeField(values.month, FIELD_DEFINITIONS[4] as FieldDefinition))}`
        }

        return `Runs at ${time} ${calendarDescription}.`
    }

    return 'Runs when all time and calendar fields shown below match, using the day-field rule called out separately.'
}

function normalizeExpression(expression: string): { expression: string; parts: string[]; fieldCount: 5 | 6 } {
    const normalized = expression.trim().replace(/\s+/g, ' ')

    if (!normalized) {
        throw new CronExplorerError('empty-expression', 'Enter a cron expression with five or six fields.')
    }

    if (normalized.length > CRON_EXPRESSION_MAX_LENGTH) {
        throw new CronExplorerError(
            'expression-too-long',
            `Cron expressions are limited to ${CRON_EXPRESSION_MAX_LENGTH} characters.`,
        )
    }

    const parts = normalized.split(' ')
    if (parts.length !== 5 && parts.length !== 6) {
        throw new CronExplorerError(
            'field-count',
            `Expected five fields (minute through day of week) or six fields with seconds; received ${parts.length}.`,
        )
    }

    return {
        expression: normalized,
        parts,
        fieldCount: parts.length as 5 | 6,
    }
}

export function isValidTimeZone(timeZone: string): boolean {
    if (!timeZone.trim()) return false

    try {
        new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0))
        return true
    } catch {
        return false
    }
}

export function getBrowserTimeZone(): string {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    return detected && isValidTimeZone(detected) ? detected : 'UTC'
}

export function exploreCron(expression: string, options: CronExploreOptions = {}): CronExploration {
    const normalized = normalizeExpression(expression)
    const timeZone = options.timeZone?.trim() || 'UTC'
    const currentDate = options.currentDate ? new Date(options.currentDate) : new Date()
    const executionCount = options.executionCount ?? DEFAULT_EXECUTION_COUNT

    if (!isValidTimeZone(timeZone)) {
        throw new CronExplorerError('invalid-timezone', `“${timeZone}” is not a valid IANA timezone.`)
    }

    if (Number.isNaN(currentDate.getTime())) {
        throw new CronExplorerError('invalid-current-date', 'The schedule start date is invalid.')
    }

    if (!Number.isInteger(executionCount) || executionCount < 1 || executionCount > MAX_EXECUTION_COUNT) {
        throw new CronExplorerError(
            'invalid-count',
            `Execution count must be a whole number from 1 through ${MAX_EXECUTION_COUNT}.`,
        )
    }

    const hasSeconds = normalized.fieldCount === 6
    const allValues = hasSeconds ? normalized.parts : ['0', ...normalized.parts]
    const values = FIELD_DEFINITIONS.reduce<Record<CronFieldName, string>>((fields, definition, index) => {
        fields[definition.name] = allValues[index] ?? '*'
        return fields
    }, {
        second: '0',
        minute: '*',
        hour: '*',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
    })

    let interval: ReturnType<typeof CronExpressionParser.parse>
    try {
        interval = CronExpressionParser.parse(normalized.expression, {
            currentDate,
            tz: timeZone,
            hashSeed: normalized.expression,
            strict: false,
        })
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : 'Unknown parser error.'
        throw new CronExplorerError('invalid-expression', `Invalid cron expression: ${reason}`)
    }

    const nextExecutions: CronExecution[] = []
    try {
        for (let index = 0; index < executionCount; index += 1) {
            const date = interval.next().toDate()
            nextExecutions.push({
                position: index + 1,
                date,
                iso: date.toISOString(),
                unixMilliseconds: date.getTime(),
            })
        }
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : 'Unable to find the next matching date.'
        throw new CronExplorerError('invalid-expression', `Unable to calculate future executions: ${reason}`)
    }

    return {
        expression: normalized.expression,
        fieldCount: normalized.fieldCount,
        hasSeconds,
        timeZone,
        evaluatedFrom: currentDate,
        summary: buildSummary(values, hasSeconds),
        fields: FIELD_DEFINITIONS.map((definition, index) => ({
            name: definition.name,
            label: definition.label,
            value: allValues[index] ?? '*',
            allowed: definition.allowed,
            description: describeField(allValues[index] ?? '*', definition),
            implicit: !hasSeconds && definition.name === 'second',
        })),
        daySemantics: explainDaySemantics(values.dayOfMonth, values.dayOfWeek),
        nextExecutions,
    }
}
