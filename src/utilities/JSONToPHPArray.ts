export function JSONToPHPArray(json: string): {} {
    return json
        .replace(/\{/g, '[')
        .replace(/}/g, ']')
        .replace(/:/g, '=>')
}