export function convertJSONtoCSV(json: any): string {
    const objectArray = JSON.parse(json)
    let str = '';

    str += Object.keys(objectArray?.[0]).join(',') + '\n'

    for (let i = 0; i < objectArray.length; i++) {
        let line = '';
        for (const index in objectArray[i]) {
            if (line != '') line += ','

            line += objectArray[i][index];
        }

        str += line + '\n';
    }

    return str.trimEnd();
}