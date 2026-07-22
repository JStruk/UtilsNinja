import { describe, expect, it } from 'vitest'
import {
    calculateCIDR,
    CIDRCalculationError,
    normalizeIPv4,
    splitCIDR,
    subnetMaskToPrefix,
} from '@/utilities/CIDRCalculator'

describe('CIDRCalculator', () => {
    it('calculates a conventional IPv4 subnet from CIDR notation', () => {
        const result = calculateCIDR('192.168.10.42/24')

        expect(result).toMatchObject({
            inputAddress: '192.168.10.42',
            cidr: '192.168.10.42/24',
            networkCIDR: '192.168.10.0/24',
            prefixLength: 24,
            subnetMask: '255.255.255.0',
            wildcardMask: '0.0.0.255',
            networkAddress: '192.168.10.0',
            broadcastAddress: '192.168.10.255',
            firstUsableAddress: '192.168.10.1',
            lastUsableAddress: '192.168.10.254',
            totalAddressCount: 256,
            usableHostCount: 254,
            mode: 'subnet',
            addressRole: 'usable-host',
        })
    })

    it('accepts contiguous dotted masks inline or separately', () => {
        const separateMask = calculateCIDR('10.20.30.40', '255.255.252.0')
        const inlineMask = calculateCIDR('10.20.30.40/255.255.252.0')

        expect(separateMask.prefixLength).toBe(22)
        expect(separateMask.networkAddress).toBe('10.20.28.0')
        expect(inlineMask).toEqual(separateMask)
        expect(subnetMaskToPrefix('0.0.0.0')).toBe(0)
        expect(subnetMaskToPrefix('255.255.255.128')).toBe(25)
        expect(subnetMaskToPrefix('255.255.255.255')).toBe(32)
    })

    it('returns dotted binary representations', () => {
        const result = calculateCIDR('192.168.1.130/25')

        expect(result.binary.address).toBe('11000000.10101000.00000001.10000010')
        expect(result.binary.subnetMask).toBe('11111111.11111111.11111111.10000000')
        expect(result.binary.wildcardMask).toBe('00000000.00000000.00000000.01111111')
        expect(result.binary.network).toBe('11000000.10101000.00000001.10000000')
        expect(result.binary.broadcast).toBe('11000000.10101000.00000001.11111111')
    })

    it('uses both addresses in a /31 point-to-point network', () => {
        const first = calculateCIDR('198.51.100.10/31')
        const second = calculateCIDR('198.51.100.11/31')

        expect(first).toMatchObject({
            networkAddress: '198.51.100.10',
            broadcastAddress: '198.51.100.11',
            firstUsableAddress: '198.51.100.10',
            lastUsableAddress: '198.51.100.11',
            totalAddressCount: 2,
            usableHostCount: 2,
            mode: 'point-to-point',
            addressRole: 'point-to-point-endpoint',
        })
        expect(second.networkCIDR).toBe(first.networkCIDR)
        expect(second.addressRole).toBe('point-to-point-endpoint')
    })

    it('treats a /32 as one usable host', () => {
        const result = calculateCIDR('203.0.113.7/32')

        expect(result).toMatchObject({
            networkAddress: '203.0.113.7',
            broadcastAddress: '203.0.113.7',
            firstUsableAddress: '203.0.113.7',
            lastUsableAddress: '203.0.113.7',
            totalAddressCount: 1,
            usableHostCount: 1,
            mode: 'single-host',
            addressRole: 'single-host',
        })
    })

    it('handles the full IPv4 /0 range without signed integer overflow', () => {
        const result = calculateCIDR('192.0.2.1/0')

        expect(result.networkAddress).toBe('0.0.0.0')
        expect(result.broadcastAddress).toBe('255.255.255.255')
        expect(result.firstUsableAddress).toBe('0.0.0.1')
        expect(result.lastUsableAddress).toBe('255.255.255.254')
        expect(result.totalAddressCount).toBe(4_294_967_296)
        expect(result.usableHostCount).toBe(4_294_967_294)
    })

    it('rejects malformed addresses, prefixes, and non-contiguous masks', () => {
        expect(() => calculateCIDR('192.168.1/24')).toThrow(CIDRCalculationError)
        expect(() => calculateCIDR('192.168.1.256/24')).toThrowError(
            'IPv4 address octets must be between 0 and 255.',
        )
        expect(() => calculateCIDR('192.168.1.1/33')).toThrowError(
            'CIDR prefix length must be between 0 and 32.',
        )
        expect(() => calculateCIDR('192.168.1.1', '255.0.255.0')).toThrowError(
            'Subnet mask must contain contiguous one bits followed by zero bits.',
        )
        expect(() => calculateCIDR('192.168.1.1/24', '24')).toThrowError(
            'Provide the prefix either after the slash or as a separate mask, not both.',
        )
    })

    it('normalizes decimal octets and identifies network and broadcast inputs', () => {
        expect(normalizeIPv4('010.001.000.255')).toBe('10.1.0.255')
        expect(calculateCIDR('10.0.0.0/24').addressRole).toBe('network')
        expect(calculateCIDR('10.0.0.255/24').addressRole).toBe('broadcast')
    })

    it('splits a subnet into smaller networks', () => {
        const result = splitCIDR('192.168.20.99/24', 26)

        expect(result.sourceCIDR).toBe('192.168.20.0/24')
        expect(result.totalSubnets).toBe(4)
        expect(result.truncated).toBe(false)
        expect(result.subnets).toEqual([
            expect.objectContaining({ cidr: '192.168.20.0/26', broadcastAddress: '192.168.20.63', usableHostCount: 62 }),
            expect.objectContaining({ cidr: '192.168.20.64/26', broadcastAddress: '192.168.20.127', usableHostCount: 62 }),
            expect.objectContaining({ cidr: '192.168.20.128/26', broadcastAddress: '192.168.20.191', usableHostCount: 62 }),
            expect.objectContaining({ cidr: '192.168.20.192/26', broadcastAddress: '192.168.20.255', usableHostCount: 62 }),
        ])
    })

    it('limits large split previews and validates the requested prefix', () => {
        const result = splitCIDR('10.0.0.0/8', 24, 3)

        expect(result.totalSubnets).toBe(65_536)
        expect(result.subnets).toHaveLength(3)
        expect(result.truncated).toBe(true)
        expect(() => splitCIDR('10.0.0.0/24', 23)).toThrowError(
            'New prefix must be a whole number between 24 and 32.',
        )
    })
})
