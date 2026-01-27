/**
 * Analytics helper utilities for tracking custom events
 * 
 * Usage examples:
 * - trackEvent('tool_used', { tool_name: 'JSON Formatter' })
 * - trackEvent('copy_result', { tool_name: 'Base64 Encoder' })
 * - trackEvent('download', { file_type: 'csv' })
 */

declare global {
    interface Window {
        gtag?: (...args: any[]) => void
    }
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - The name of the event (e.g., 'tool_used', 'copy_result', 'download')
 * @param params - Optional parameters to send with the event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params)
    }
}

/**
 * Track when a user uses a specific tool
 * @param toolName - The name of the tool being used
 */
export const trackToolUsage = (toolName: string) => {
    trackEvent('tool_used', {
        tool_name: toolName,
        event_category: 'Tool Usage'
    })
}

/**
 * Track when a user copies output from a tool
 * @param toolName - The name of the tool
 */
export const trackCopy = (toolName: string) => {
    trackEvent('copy_result', {
        tool_name: toolName,
        event_category: 'User Action'
    })
}

/**
 * Track when a user downloads output from a tool
 * @param toolName - The name of the tool
 * @param fileType - The type of file downloaded (e.g., 'csv', 'json', 'txt')
 */
export const trackDownload = (toolName: string, fileType: string) => {
    trackEvent('download', {
        tool_name: toolName,
        file_type: fileType,
        event_category: 'User Action'
    })
}

/**
 * Track when a user clears/resets a tool
 * @param toolName - The name of the tool
 */
export const trackClear = (toolName: string) => {
    trackEvent('clear_tool', {
        tool_name: toolName,
        event_category: 'User Action'
    })
}
