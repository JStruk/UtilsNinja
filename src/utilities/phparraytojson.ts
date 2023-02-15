export function PHParrayTojson(php: string): {} {
    return JSON.parse(php
        .replace(/\[/g, '{')
        .replace(/]/g, '}')
        .replace(/=>/g, ':'))
}