export const HASH_ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512'] as const

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]
export type HashOutputEncoding = 'hex' | 'base64'
export type HashInput = string | ArrayBuffer | ArrayBufferView

function getSubtleCrypto(): SubtleCrypto {
    const subtle = globalThis.crypto?.subtle

    if (!subtle) {
        throw new Error('Web Crypto is not available in this browser.')
    }

    return subtle
}

function isArrayBuffer(input: unknown): input is ArrayBuffer {
    return input instanceof ArrayBuffer
        || Object.prototype.toString.call(input) === '[object ArrayBuffer]'
}

function toArrayBuffer(input: HashInput): ArrayBuffer {
    if (typeof input === 'string') {
        return new TextEncoder().encode(input).buffer
    }

    if (isArrayBuffer(input)) {
        const copy = new Uint8Array(input.byteLength)
        copy.set(new Uint8Array(input))
        return copy.buffer
    }

    const copy = new Uint8Array(input.byteLength)
    copy.set(new Uint8Array(input.buffer, input.byteOffset, input.byteLength))
    return copy.buffer
}

function toUint8Array(input: ArrayBuffer | ArrayBufferView): Uint8Array {
    if (ArrayBuffer.isView(input)) {
        return new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
    }

    return new Uint8Array(input)
}

async function readBlob(file: Blob): Promise<ArrayBuffer> {
    if (typeof file.arrayBuffer === 'function') {
        return file.arrayBuffer()
    }

    if (typeof FileReader === 'undefined') {
        throw new Error('This browser cannot read the selected file.')
    }

    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()

        reader.addEventListener('load', () => {
            if (isArrayBuffer(reader.result)) {
                resolve(reader.result)
            } else {
                reject(new Error('The selected file could not be read as binary data.'))
            }
        })
        reader.addEventListener('error', () => {
            reject(reader.error ?? new Error('The selected file could not be read.'))
        })
        reader.addEventListener('abort', () => {
            reject(new Error('Reading the selected file was cancelled.'))
        })
        reader.readAsArrayBuffer(file)
    })
}

export function bytesToHex(input: ArrayBuffer | ArrayBufferView): string {
    return Array.from(toUint8Array(input), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function bytesToBase64(input: ArrayBuffer | ArrayBufferView): string {
    const bytes = toUint8Array(input)
    const chunkSize = 0x8000
    let binary = ''

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
    }

    return btoa(binary)
}

export function encodeHashOutput(
    input: ArrayBuffer | ArrayBufferView,
    encoding: HashOutputEncoding,
): string {
    return encoding === 'hex' ? bytesToHex(input) : bytesToBase64(input)
}

export async function generateHash(
    input: HashInput,
    algorithm: HashAlgorithm = 'SHA-256',
    encoding: HashOutputEncoding = 'hex',
): Promise<string> {
    const digest = await getSubtleCrypto().digest(algorithm, toArrayBuffer(input))
    return encodeHashOutput(digest, encoding)
}

export async function generateHmac(
    input: HashInput,
    secret: string,
    algorithm: HashAlgorithm = 'SHA-256',
    encoding: HashOutputEncoding = 'hex',
): Promise<string> {
    if (!secret) {
        throw new Error('An HMAC secret key is required.')
    }

    const subtle = getSubtleCrypto()
    const key = await subtle.importKey(
        'raw',
        toArrayBuffer(secret),
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign'],
    )
    const signature = await subtle.sign('HMAC', key, toArrayBuffer(input))

    return encodeHashOutput(signature, encoding)
}

export async function generateFileHash(
    file: Blob,
    algorithm: HashAlgorithm = 'SHA-256',
    encoding: HashOutputEncoding = 'hex',
): Promise<string> {
    return generateHash(await readBlob(file), algorithm, encoding)
}

export async function generateFileHmac(
    file: Blob,
    secret: string,
    algorithm: HashAlgorithm = 'SHA-256',
    encoding: HashOutputEncoding = 'hex',
): Promise<string> {
    return generateHmac(await readBlob(file), secret, algorithm, encoding)
}
