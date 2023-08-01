export function Base64Encode(text: string): string {
    return Buffer.from(text).toString('base64')
}