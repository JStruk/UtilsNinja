export function convertJSONtoCSV(json: any): string {
    const parsed = JSON.parse(json)

    const objectArray = Array.isArray(parsed) ? parsed : [parsed]

    let csvData = '';

    csvData += Object.keys(objectArray?.[0]).join(',') + '\n'

    for (let i = 0; i < objectArray.length; i++) {
        let line = '';
        for (const index in objectArray[i]) {
            if (line != '') line += ','

            line += objectArray[i][index];
        }

        csvData += line + '\n';
    }

    return csvData.trimEnd();
}