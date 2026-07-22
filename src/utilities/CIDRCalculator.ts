export type CIDRMode = 'subnet' | 'point-to-point' | 'single-host'
export type AddressRole = 'network' | 'broadcast' | 'usable-host' | 'point-to-point-endpoint' | 'single-host'

export interface CIDRCalculation {
    inputAddress: string
    cidr: string
    networkCIDR: string
    prefixLength: number
    subnetMask: string
    wildcardMask: string
    networkAddress: string
    broadcastAddress: string
    firstUsableAddress: string
    lastUsableAddress: string
    totalAddressCount: number
    usableHostCount: number
    mode: CIDRMode
    addressRole: AddressRole
    binary: {
        address: string
        subnetMask: string
        wildcardMask: string
        network: string
        broadcast: string
    }
}

export interface SplitSubnet {
    cidr: string
    networkAddress: string
    broadcastAddress: string
    firstUsableAddress: string
    lastUsableAddress: string
    totalAddressCount: number
    usableHostCount: number
}

export interface CIDRSplitResult {
    sourceCIDR: string
    newPrefixLength: number
    totalSubnets: number
    subnets: SplitSubnet[]
    truncated: boolean
}

export class CIDRCalculationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CIDRCalculationError'
    }
}

const MAX_IPV4_INTEGER = 0xFFFFFFFF

function parseIPv4Integer(input: string, label: string): number {
    const value = input.trim()
    const octets = value.split('.')

    if (octets.length !== 4 || octets.some(octet => !/^\d{1,3}$/.test(octet))) {
        throw new CIDRCalculationError(`${label} must contain four decimal octets.`)
    }

    const parsedOctets = octets.map(Number)
    if (parsedOctets.some(octet => octet < 0 || octet > 255)) {
        throw new CIDRCalculationError(`${label} octets must be between 0 and 255.`)
    }

    return parsedOctets.reduce((address, octet) => address * 256 + octet, 0) >>> 0
}

export function normalizeIPv4(input: string): string {
    return integerToIPv4(parseIPv4Integer(input, 'IPv4 address'))
}

export function integerToIPv4(value: number): string {
    if (!Number.isInteger(value) || value < 0 || value > MAX_IPV4_INTEGER) {
        throw new CIDRCalculationError('IPv4 integer must be between 0 and 4,294,967,295.')
    }

    return [
        (value >>> 24) & 255,
        (value >>> 16) & 255,
        (value >>> 8) & 255,
        value & 255,
    ].join('.')
}

function prefixToMaskInteger(prefixLength: number): number {
    return prefixLength === 0
        ? 0
        : (MAX_IPV4_INTEGER << (32 - prefixLength)) >>> 0
}

export function subnetMaskToPrefix(mask: string): number {
    const maskInteger = parseIPv4Integer(mask, 'Subnet mask')
    const bits = maskInteger.toString(2).padStart(32, '0')

    if (!/^1*0*$/.test(bits)) {
        throw new CIDRCalculationError('Subnet mask must contain contiguous one bits followed by zero bits.')
    }

    return bits.indexOf('0') === -1 ? 32 : bits.indexOf('0')
}

function parsePrefix(prefixOrMask: string | number): number {
    if (typeof prefixOrMask === 'number') {
        if (!Number.isInteger(prefixOrMask) || prefixOrMask < 0 || prefixOrMask > 32) {
            throw new CIDRCalculationError('CIDR prefix length must be a whole number between 0 and 32.')
        }
        return prefixOrMask
    }

    const value = prefixOrMask.trim()
    if (value.includes('.')) return subnetMaskToPrefix(value)

    if (!/^\d{1,2}$/.test(value)) {
        throw new CIDRCalculationError('Use a CIDR prefix from 0 to 32 or a dotted subnet mask.')
    }

    const prefix = Number(value)
    if (prefix > 32) {
        throw new CIDRCalculationError('CIDR prefix length must be between 0 and 32.')
    }

    return prefix
}

function parseInput(input: string, prefixOrMask?: string | number): { address: string; prefixLength: number } {
    const value = input.trim()
    if (!value) throw new CIDRCalculationError('Enter an IPv4 address.')

    const parts = value.split('/')
    if (parts.length > 2) {
        throw new CIDRCalculationError('IPv4 CIDR input may contain only one slash.')
    }

    const [address = '', inlinePrefix] = parts
    if (inlinePrefix !== undefined && prefixOrMask !== undefined && String(prefixOrMask).trim() !== '') {
        throw new CIDRCalculationError('Provide the prefix either after the slash or as a separate mask, not both.')
    }

    const suppliedPrefix = inlinePrefix ?? prefixOrMask
    if (suppliedPrefix === undefined || String(suppliedPrefix).trim() === '') {
        throw new CIDRCalculationError('Enter a CIDR prefix or dotted subnet mask.')
    }

    return {
        address: normalizeIPv4(address),
        prefixLength: parsePrefix(suppliedPrefix),
    }
}

function integerToBinary(value: number): string {
    return value
        .toString(2)
        .padStart(32, '0')
        .match(/.{8}/g)!
        .join('.')
}

function addressRole(
    addressInteger: number,
    networkInteger: number,
    broadcastInteger: number,
    prefixLength: number,
): AddressRole {
    if (prefixLength === 32) return 'single-host'
    if (prefixLength === 31) return 'point-to-point-endpoint'
    if (addressInteger === networkInteger) return 'network'
    if (addressInteger === broadcastInteger) return 'broadcast'
    return 'usable-host'
}

export function calculateCIDR(input: string, prefixOrMask?: string | number): CIDRCalculation {
    const parsed = parseInput(input, prefixOrMask)
    const addressInteger = parseIPv4Integer(parsed.address, 'IPv4 address')
    const maskInteger = prefixToMaskInteger(parsed.prefixLength)
    const wildcardInteger = (~maskInteger) >>> 0
    const networkInteger = (addressInteger & maskInteger) >>> 0
    const broadcastInteger = (networkInteger | wildcardInteger) >>> 0
    const totalAddressCount = 2 ** (32 - parsed.prefixLength)

    let firstUsableInteger: number
    let lastUsableInteger: number
    let usableHostCount: number
    let mode: CIDRMode

    if (parsed.prefixLength === 32) {
        firstUsableInteger = networkInteger
        lastUsableInteger = networkInteger
        usableHostCount = 1
        mode = 'single-host'
    } else if (parsed.prefixLength === 31) {
        firstUsableInteger = networkInteger
        lastUsableInteger = broadcastInteger
        usableHostCount = 2
        mode = 'point-to-point'
    } else {
        firstUsableInteger = networkInteger + 1
        lastUsableInteger = broadcastInteger - 1
        usableHostCount = totalAddressCount - 2
        mode = 'subnet'
    }

    const networkAddress = integerToIPv4(networkInteger)
    const broadcastAddress = integerToIPv4(broadcastInteger)
    const subnetMask = integerToIPv4(maskInteger)
    const wildcardMask = integerToIPv4(wildcardInteger)

    return {
        inputAddress: parsed.address,
        cidr: `${parsed.address}/${parsed.prefixLength}`,
        networkCIDR: `${networkAddress}/${parsed.prefixLength}`,
        prefixLength: parsed.prefixLength,
        subnetMask,
        wildcardMask,
        networkAddress,
        broadcastAddress,
        firstUsableAddress: integerToIPv4(firstUsableInteger),
        lastUsableAddress: integerToIPv4(lastUsableInteger),
        totalAddressCount,
        usableHostCount,
        mode,
        addressRole: addressRole(addressInteger, networkInteger, broadcastInteger, parsed.prefixLength),
        binary: {
            address: integerToBinary(addressInteger),
            subnetMask: integerToBinary(maskInteger),
            wildcardMask: integerToBinary(wildcardInteger),
            network: integerToBinary(networkInteger),
            broadcast: integerToBinary(broadcastInteger),
        },
    }
}

export function splitCIDR(
    input: string,
    newPrefixLength: number,
    limit = 64,
): CIDRSplitResult {
    const source = calculateCIDR(input)

    if (!Number.isInteger(newPrefixLength) || newPrefixLength < source.prefixLength || newPrefixLength > 32) {
        throw new CIDRCalculationError(
            `New prefix must be a whole number between ${source.prefixLength} and 32.`,
        )
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 1_024) {
        throw new CIDRCalculationError('Subnet display limit must be between 1 and 1,024.')
    }

    const totalSubnets = 2 ** (newPrefixLength - source.prefixLength)
    const displayedCount = Math.min(totalSubnets, limit)
    const blockSize = 2 ** (32 - newPrefixLength)
    const sourceNetworkInteger = parseIPv4Integer(source.networkAddress, 'Network address')
    const subnets: SplitSubnet[] = []

    for (let index = 0; index < displayedCount; index++) {
        const subnetNetwork = sourceNetworkInteger + index * blockSize
        const calculation = calculateCIDR(`${integerToIPv4(subnetNetwork)}/${newPrefixLength}`)
        subnets.push({
            cidr: calculation.networkCIDR,
            networkAddress: calculation.networkAddress,
            broadcastAddress: calculation.broadcastAddress,
            firstUsableAddress: calculation.firstUsableAddress,
            lastUsableAddress: calculation.lastUsableAddress,
            totalAddressCount: calculation.totalAddressCount,
            usableHostCount: calculation.usableHostCount,
        })
    }

    return {
        sourceCIDR: source.networkCIDR,
        newPrefixLength,
        totalSubnets,
        subnets,
        truncated: displayedCount < totalSubnets,
    }
}
