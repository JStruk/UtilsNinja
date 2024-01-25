export function JSONtoCSV(json: any): string {
    let parsed = ''
    try {
        parsed = JSON.parse(json)
    } catch (e) {
        return ''
    }

    const objectArray: any[] = Array.isArray(parsed) ? parsed : [parsed]
    let csvData: string = Object.keys(objectArray?.[0]).join(',') + '\n'

    for (let i = 0; i < objectArray.length; i++) {
        let line = ''
        for (const index in objectArray[i]) {
            if (line != '') line += ','

            line += objectArray[i][index]
        }

        csvData += line + '\n'
    }

    return csvData.trimEnd()
}