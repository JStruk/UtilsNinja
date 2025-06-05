export function CSVToJSON(csv: string): string {
    const all_data = csv.split('\n')
    const headers = all_data[0].split(',')

    const json = all_data.slice(1).map(line => {
        const fields = line.split(',')
        return Object.fromEntries(headers.map((h, i) => [h, fields[i]]))
    })

    return JSON.parse(JSON.stringify(json, null, '\t'))
}