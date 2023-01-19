export function convertJSONtoCSV(json: any): string {
    // moving forward:
    //     - investigate npm package to do this for us
    //     - how hard will this be to fully implement? i.e JSON array vs object needs to be handled separately
    const parsed = JSON.parse(json)

    const objectArray = Array.isArray(parsed) ? parsed : [parsed]

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