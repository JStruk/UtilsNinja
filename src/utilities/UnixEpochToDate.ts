

const localeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'longOffset'
}

const humanOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
}

// Handle user input seconds vs milliseconds?
export function unixEpochToDate(timestamp: number)
{
    const date = new Date(timestamp)

    const getOrdinal = (num: string): string => {
        if(['11', '12', '13'].includes(num)) return 'th'

        switch (num[num.length - 1]) {
            case '1':
                return 'st'
            case '2':
                return 'nd'
            case '3':
                return 'rd'
            default:
                return 'th'
        }
    }

    const ordinal = (humanString: string): string => {
        const blocks = humanString.split(' ')
        blocks[2] = blocks[2] + getOrdinal(blocks[2])
        return blocks.join(' ')
    }

    return {
        iso: date.toISOString(),
        locale: date.toLocaleString('en-US', localeOptions).replace(/,/g, ''),
        human: ordinal(date.toLocaleString('en-US', humanOptions).replace(/,/g, '')),
    }
}