export type URLCodecMode = 'full' | 'component'

export interface QueryParameter {
    key: string
    value: string
}

/**
 * Editable parts of a hierarchical URL.
 *
 * `protocol` does not include the trailing colon and `hash` does not include
 * the leading hash character. Query parameters remain an array so duplicate
 * keys and their order are preserved.
 */
export interface URLParts {
    protocol: string
    username: string
    password: string
    hostname: string
    port: string
    pathname: string
    hash: string
    queryParameters: QueryParameter[]
}

const PROTOCOL_PATTERN = /^[a-z][a-z\d+.-]*$/i
const PORT_PATTERN = /^\d+$/

function decodeSafely(value: string, decoder: (input: string) => string): string {
    try {
        return decoder(value)
    } catch {
        return value
    }
}

function normalizeProtocol(protocol: string): string {
    return protocol.trim().replace(/:$/, '').toLowerCase()
}

function normalizeHostname(hostname: string): string {
    const normalized = hostname.trim()

    if (normalized.includes(':') && !normalized.startsWith('[')) {
        const colonCount = normalized.split(':').length - 1

        if (colonCount > 1) {
            return `[${normalized}]`
        }
    }

    return normalized
}

/** Parse an absolute, hierarchical URL into fields suitable for editing. */
export function parseURL(input: string): URLParts {
    const source = input.trim()

    if (!source) {
        throw new Error('Enter an absolute URL to parse.')
    }

    let parsed: URL

    try {
        parsed = new URL(source)
    } catch {
        throw new Error('Enter a valid absolute URL, including its protocol.')
    }

    if (!parsed.protocol || !parsed.hostname) {
        throw new Error('Enter a hierarchical URL with a protocol and hostname.')
    }

    return {
        protocol: parsed.protocol.replace(/:$/, ''),
        username: decodeSafely(parsed.username, decodeURIComponent),
        password: decodeSafely(parsed.password, decodeURIComponent),
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: decodeSafely(parsed.pathname, decodeURI),
        hash: decodeSafely(parsed.hash.replace(/^#/, ''), decodeURIComponent),
        queryParameters: Array.from(parsed.searchParams.entries(), ([key, value]) => ({
            key,
            value,
        })),
    }
}

/** Build and normalize an absolute URL from editable URL parts. */
export function buildURL(parts: URLParts): string {
    const protocol = normalizeProtocol(parts.protocol)
    const hostname = normalizeHostname(parts.hostname)

    if (!PROTOCOL_PATTERN.test(protocol)) {
        throw new Error('Protocol must be a valid URL scheme, such as https.')
    }

    if (!hostname) {
        throw new Error('Hostname is required.')
    }

    if (/[/\s?#@]/.test(hostname)) {
        throw new Error('Hostname must not contain a path, query, credentials, or spaces.')
    }

    const port = parts.port.trim()

    if (port) {
        const numericPort = Number(port)

        if (!PORT_PATTERN.test(port) || !Number.isInteger(numericPort) || numericPort < 0 || numericPort > 65535) {
            throw new Error('Port must be a whole number between 0 and 65535.')
        }
    }

    let built: URL

    try {
        built = new URL(`${protocol}://${hostname}`)
    } catch {
        throw new Error('Protocol and hostname do not form a valid URL.')
    }

    built.username = parts.username
    built.password = parts.password
    built.port = port

    const pathname = parts.pathname || '/'
    built.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`

    built.search = ''
    for (const parameter of parts.queryParameters) {
        built.searchParams.append(parameter.key, parameter.value)
    }

    const hash = parts.hash.replace(/^#/, '')
    built.hash = hash ? `#${hash}` : ''

    return built.toString()
}

/** Encode either a complete URL or a single URL component. */
export function encodeURL(value: string, mode: URLCodecMode = 'full'): string {
    return mode === 'component' ? encodeURIComponent(value) : encodeURI(value)
}

/** Decode either a complete URL or a single URL component. */
export function decodeURL(value: string, mode: URLCodecMode = 'full'): string {
    return mode === 'component' ? decodeURIComponent(value) : decodeURI(value)
}
