import { ColorConverter } from '@/utilities/ColorConverter'
import { describe, expect, it } from 'vitest'

describe('ColorConverter', () => {
    it('converts RGB color codes', () => {
        const RGB: string = 'rgb(255, 255, 255)'

        const converted = ColorConverter(RGB)

        expect(converted.hex).toBe('#FFFFFF')
        expect(converted.hsl).toBe('hsl(0, 0%, 100%)')
        expect(converted.cmyk).toBe('device-cmyk(0%, 0%, 0%, 0%)')
    })

    it('converts HEX color codes', () => {
        const HEX: string = '#FFFFFF'

        const converted = ColorConverter(HEX)

        expect(converted.rgb).toBe('rgb(255 255 255)')
        expect(converted.hsl).toBe('hsl(0 0% 100%)')
        expect(converted.cmyk).toBe('device-cmyk(0% 0% 0% 0%)')
    })

    it('converts HSL color codes', () => {
        const HSL= 'hsl(288, 8%, 55%)'

        const converted = ColorConverter(HSL)

        expect(converted.rgb).toBe('rgb(145.758, 131.07, 149.43)')
        expect(converted.hex).toBe('#928395')
        expect(converted.cmyk).toBe('device-cmyk(2.457338%, 12.286689%, 0%, 41.4%)')
    })

    it('converts CMYK color codes', () => {
        const CMYK= 'cmyk(100%, 26%, 0%, 0%)'

        const converted = ColorConverter(CMYK)

        expect(converted.rgb).toBe('rgb(0, 188.7, 255)')
        expect(converted.hex).toBe('#00BDFF')
        expect(converted.hsl).toBe('hsl(195.6, 100%, 50%)')
    })
})