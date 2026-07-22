type CSVRow = Record<string, unknown>

function isCSVRow(value: unknown): value is CSVRow {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function escapeCSVValue(value: unknown): string {
    const text = value === null || value === undefined
        ? ''
        : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value)

    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function JSONtoCSV(json: string): string {
    let parsed: unknown
    try {
        parsed = JSON.parse(json)
    } catch {
        return ''
    }

    const rows = Array.isArray(parsed) ? parsed : [parsed]
    if (rows.length === 0 || !rows.every(isCSVRow)) return ''

    const headers = Object.keys(rows[0] ?? {})
    if (headers.length === 0) return ''

    return [
        headers.map(escapeCSVValue).join(','),
        ...rows.map(row => headers.map(header => escapeCSVValue(row[header])).join(',')),
    ].join('\n')
}
