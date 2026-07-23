export type ClipboardCopyResult =
    | { success: true; method: 'clipboard' | 'fallback' }
    | { success: false; method: 'none'; error: string }

interface FallbackResult {
    success: boolean
    error?: unknown
}

function errorMessage(error: unknown): string {
    return error instanceof Error && error.message
        ? error.message
        : 'Clipboard access is unavailable in this browser.'
}

function copyWithFallback(text: string): FallbackResult {
    if (
        typeof document === 'undefined'
        || !document.body
        || typeof document.execCommand !== 'function'
    ) {
        return { success: false }
    }

    const activeElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const selection = document.getSelection()
    const selectedRanges: Range[] = []

    if (selection) {
        for (let index = 0; index < selection.rangeCount; index++) {
            selectedRanges.push(selection.getRangeAt(index).cloneRange())
        }
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.setAttribute('aria-hidden', 'true')
    textarea.style.position = 'fixed'
    textarea.style.inset = '0 auto auto -9999px'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    document.body.appendChild(textarea)

    try {
        textarea.focus({ preventScroll: true })
        textarea.select()
        textarea.setSelectionRange(0, textarea.value.length)
        return { success: document.execCommand('copy') }
    } catch (error) {
        return { success: false, error }
    } finally {
        textarea.remove()

        if (selection) {
            try {
                selection.removeAllRanges()
                selectedRanges.forEach(range => selection.addRange(range))
            } catch {
                // Selection restoration is best-effort and must not change the copy result.
            }
        }

        try {
            activeElement?.focus({ preventScroll: true })
        } catch {
            // Focus restoration is best-effort and must not change the copy result.
        }
    }
}

/** Copy text without throwing, using the legacy DOM API as a safe fallback. */
export async function copyToClipboard(text: string): Promise<ClipboardCopyResult> {
    let clipboardError: unknown

    try {
        if (
            typeof navigator !== 'undefined'
            && typeof navigator.clipboard?.writeText === 'function'
        ) {
            await navigator.clipboard.writeText(text)
            return { success: true, method: 'clipboard' }
        }
    } catch (error) {
        clipboardError = error
    }

    let fallback: FallbackResult
    try {
        fallback = copyWithFallback(text)
    } catch (error) {
        fallback = { success: false, error }
    }
    if (fallback.success) return { success: true, method: 'fallback' }

    return {
        success: false,
        method: 'none',
        error: errorMessage(clipboardError ?? fallback.error),
    }
}
