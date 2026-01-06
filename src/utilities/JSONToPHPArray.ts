export function JSONToPHPArray(json: string): string {
    return json
        .replace(/\{/g, '[')
        .replace(/}/g, ']')
        .replace(/"\s*:\s*/g, '" => ')
}