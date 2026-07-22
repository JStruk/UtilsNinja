import {
    analyzeRegex,
    serializeRegexError,
    type RegexWorkerRequest,
    type RegexWorkerResponse,
} from '@/utilities/RegexTester'

interface WorkerScope {
    onmessage: ((event: MessageEvent<RegexWorkerRequest>) => void) | null
    postMessage(message: RegexWorkerResponse): void
}

const workerScope = self as unknown as WorkerScope

workerScope.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
    const { requestId, options } = event.data

    try {
        workerScope.postMessage({
            requestId,
            ok: true,
            result: analyzeRegex(options),
        })
    } catch (error) {
        workerScope.postMessage({
            requestId,
            ok: false,
            error: serializeRegexError(error),
        })
    }
}
