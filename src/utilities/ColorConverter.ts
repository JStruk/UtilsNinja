import { ColorTranslator } from 'colortranslator'

export function ColorConverter(colorCode: string) {
    const translator: ColorTranslator = new ColorTranslator(colorCode)

    return {
        rgb: translator.RGB,
        hex: translator.HEX,
        hsl: translator.HSL,
        cmyk: translator.CMYK,
    }
}