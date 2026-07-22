import {
    validateJSONSchema,
    type SchemaValidationWorkerRequest,
    type SchemaValidationWorkerResponse,
} from '@/utilities/JSONSchemaValidator'

interface WorkerScope {
    onmessage: ((event: MessageEvent<SchemaValidationWorkerRequest>) => void) | null
    postMessage(message: SchemaValidationWorkerResponse): void
}

const workerScope = self as unknown as WorkerScope

workerScope.onmessage = (event: MessageEvent<SchemaValidationWorkerRequest>) => {
    const { requestId, options } = event.data

    try {
        workerScope.postMessage({
            requestId,
            ok: true,
            result: validateJSONSchema(options),
        })
    } catch (error) {
        workerScope.postMessage({
            requestId,
            ok: false,
            error: error instanceof Error ? error.message : 'Validation could not be completed.',
        })
    }
}
