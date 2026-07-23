import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyToClipboard } from '@/helpers/CopyToClipboard'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

function setClipboard(writeText?: (text: string) => Promise<void>): void {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: writeText ? { writeText } : undefined,
    })
}

function setExecCommand(copy: (() => boolean) | undefined): void {
    Object.defineProperty(document, 'execCommand', {
        configurable: true,
        value: copy,
    })
}

describe('copyToClipboard', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        setClipboard()
        setExecCommand(undefined)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''

        if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
        else Reflect.deleteProperty(navigator, 'clipboard')

        if (originalExecCommand) Object.defineProperty(document, 'execCommand', originalExecCommand)
        else Reflect.deleteProperty(document, 'execCommand')
    })

    it('confirms a successful Clipboard API write', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined)
        setClipboard(writeText)

        const result = await copyToClipboard('UtilsNinja')

        expect(writeText).toHaveBeenCalledWith('UtilsNinja')
        expect(result).toEqual({ success: true, method: 'clipboard' })
    })

    it('falls back after the Clipboard API rejects and restores focus', async () => {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()
        setClipboard(vi.fn().mockRejectedValue(new Error('Permission denied')))
        const execCommand = vi.fn().mockReturnValue(true)
        setExecCommand(execCommand)

        const result = await copyToClipboard('fallback text')

        expect(execCommand).toHaveBeenCalledWith('copy')
        expect(result).toEqual({ success: true, method: 'fallback' })
        expect(document.querySelector('textarea')).toBeNull()
        expect(document.activeElement).toBe(input)
    })

    it('uses the fallback when the Clipboard API is unavailable', async () => {
        const execCommand = vi.fn().mockReturnValue(true)
        setExecCommand(execCommand)

        const result = await copyToClipboard('legacy browser')

        expect(result).toEqual({ success: true, method: 'fallback' })
    })

    it('returns a failure result when every copy method fails', async () => {
        setClipboard(vi.fn().mockRejectedValue(new Error('Clipboard permission denied')))
        setExecCommand(vi.fn().mockReturnValue(false))

        const result = await copyToClipboard('not copied')

        expect(result).toEqual({
            success: false,
            method: 'none',
            error: 'Clipboard permission denied',
        })
        expect(document.querySelector('textarea')).toBeNull()
    })

    it('returns an unavailable result when no browser copy mechanism exists', async () => {
        const result = await copyToClipboard('not copied')

        expect(result).toEqual({
            success: false,
            method: 'none',
            error: 'Clipboard access is unavailable in this browser.',
        })
    })
})
