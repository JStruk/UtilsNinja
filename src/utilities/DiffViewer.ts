export const DIFF_LIMITS = {
    maxCharactersPerInput: 250_000,
    maxLinesPerInput: 3_000,
    maxMatrixCells: 2_000_000,
} as const

export type DiffMode = 'text' | 'json'
export type DiffRowType = 'unchanged' | 'added' | 'removed'
export type SideBySideRowType = DiffRowType | 'modified'
export type DiffInputSide = 'left' | 'right'
export type DiffErrorCode = 'input-too-large' | 'too-many-lines' | 'comparison-too-large' | 'invalid-json'

export interface DiffOptions {
    mode?: DiffMode
    ignoreWhitespace?: boolean
    ignoreCase?: boolean
}

export interface UnifiedDiffRow {
    type: DiffRowType
    leftLineNumber: number | null
    rightLineNumber: number | null
    leftText: string | null
    rightText: string | null
}

export interface SideBySideCell {
    type: DiffRowType
    lineNumber: number
    text: string
}

export interface SideBySideDiffRow {
    type: SideBySideRowType
    left: SideBySideCell | null
    right: SideBySideCell | null
}

export interface DiffSummary {
    added: number
    removed: number
    unchanged: number
    modified: number
    changeBlocks: number
    leftLines: number
    rightLines: number
    hasChanges: boolean
}

export interface DiffResult {
    mode: DiffMode
    normalizedLeft: string
    normalizedRight: string
    unifiedRows: UnifiedDiffRow[]
    sideBySideRows: SideBySideDiffRow[]
    summary: DiffSummary
}

export class DiffViewerError extends Error {
    readonly code: DiffErrorCode
    readonly side: DiffInputSide | null

    constructor(code: DiffErrorCode, message: string, side: DiffInputSide | null = null) {
        super(message)
        this.name = 'DiffViewerError'
        this.code = code
        this.side = side
    }
}

function canonicalizeJson(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(canonicalizeJson)
    }

    if (value !== null && typeof value === 'object') {
        const object = value as Record<string, unknown>
        return Object.keys(object)
            .sort((left, right) => left.localeCompare(right))
            .reduce<Record<string, unknown>>((normalized, key) => {
                normalized[key] = canonicalizeJson(object[key])
                return normalized
            }, {})
    }

    return value
}

export function normalizeJson(input: string): string {
    const parsed: unknown = JSON.parse(input)
    return JSON.stringify(canonicalizeJson(parsed), null, 2)
}

function sideLabel(side: DiffInputSide): string {
    return side === 'left' ? 'original' : 'changed'
}

function assertCharacterLimit(input: string, side: DiffInputSide) {
    if (input.length <= DIFF_LIMITS.maxCharactersPerInput) return

    throw new DiffViewerError(
        'input-too-large',
        `The ${sideLabel(side)} input exceeds the ${DIFF_LIMITS.maxCharactersPerInput.toLocaleString()} character limit.`,
        side,
    )
}

function splitLines(input: string): string[] {
    if (input === '') return []
    return input.split(/\r\n|\n|\r/)
}

function prepareInput(input: string, side: DiffInputSide, mode: DiffMode): string[] {
    assertCharacterLimit(input, side)

    let prepared = input
    if (mode === 'json') {
        try {
            prepared = normalizeJson(input)
        } catch (error: unknown) {
            const reason = error instanceof Error ? error.message : 'Unknown JSON parsing error.'
            throw new DiffViewerError(
                'invalid-json',
                `Invalid JSON in the ${sideLabel(side)} input: ${reason}`,
                side,
            )
        }
        assertCharacterLimit(prepared, side)
    }

    const lines = splitLines(prepared)
    if (lines.length > DIFF_LIMITS.maxLinesPerInput) {
        throw new DiffViewerError(
            'too-many-lines',
            `The ${sideLabel(side)} input exceeds the ${DIFF_LIMITS.maxLinesPerInput.toLocaleString()} line limit.`,
            side,
        )
    }

    return lines
}

function comparisonKey(line: string, options: Required<DiffOptions>): string {
    let comparable = line

    if (options.ignoreWhitespace) {
        comparable = comparable.replace(/\s+/g, ' ').trim()
    }

    if (options.ignoreCase) {
        comparable = comparable.toLowerCase()
    }

    return comparable
}

function createLcsMatrix(left: string[], right: string[]): { matrix: Uint32Array; width: number } {
    const width = right.length + 1
    const cellCount = (left.length + 1) * width

    if (cellCount > DIFF_LIMITS.maxMatrixCells) {
        throw new DiffViewerError(
            'comparison-too-large',
            `This comparison needs ${cellCount.toLocaleString()} analysis cells, above the ${DIFF_LIMITS.maxMatrixCells.toLocaleString()} safety limit. Reduce one input or compare smaller sections.`,
        )
    }

    const matrix = new Uint32Array(cellCount)

    for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
        for (let rightIndex = right.length - 1; rightIndex >= 0; rightIndex -= 1) {
            const index = leftIndex * width + rightIndex
            const diagonal = matrix[(leftIndex + 1) * width + rightIndex + 1] ?? 0
            const below = matrix[(leftIndex + 1) * width + rightIndex] ?? 0
            const next = matrix[leftIndex * width + rightIndex + 1] ?? 0
            matrix[index] = left[leftIndex] === right[rightIndex]
                ? diagonal + 1
                : Math.max(below, next)
        }
    }

    return { matrix, width }
}

function createUnifiedRows(
    leftLines: string[],
    rightLines: string[],
    leftKeys: string[],
    rightKeys: string[],
): UnifiedDiffRow[] {
    const { matrix, width } = createLcsMatrix(leftKeys, rightKeys)
    const rows: UnifiedDiffRow[] = []
    let leftIndex = 0
    let rightIndex = 0

    while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
        if (
            leftIndex < leftLines.length
            && rightIndex < rightLines.length
            && leftKeys[leftIndex] === rightKeys[rightIndex]
        ) {
            rows.push({
                type: 'unchanged',
                leftLineNumber: leftIndex + 1,
                rightLineNumber: rightIndex + 1,
                leftText: leftLines[leftIndex] ?? '',
                rightText: rightLines[rightIndex] ?? '',
            })
            leftIndex += 1
            rightIndex += 1
            continue
        }

        const removeScore = leftIndex < leftLines.length
            ? matrix[(leftIndex + 1) * width + rightIndex] ?? 0
            : -1
        const addScore = rightIndex < rightLines.length
            ? matrix[leftIndex * width + rightIndex + 1] ?? 0
            : -1

        if (leftIndex < leftLines.length && removeScore >= addScore) {
            rows.push({
                type: 'removed',
                leftLineNumber: leftIndex + 1,
                rightLineNumber: null,
                leftText: leftLines[leftIndex] ?? '',
                rightText: null,
            })
            leftIndex += 1
        } else if (rightIndex < rightLines.length) {
            rows.push({
                type: 'added',
                leftLineNumber: null,
                rightLineNumber: rightIndex + 1,
                leftText: null,
                rightText: rightLines[rightIndex] ?? '',
            })
            rightIndex += 1
        }
    }

    return rows
}

function toCell(row: UnifiedDiffRow, side: DiffInputSide): SideBySideCell | null {
    const isLeft = side === 'left'
    const lineNumber = isLeft ? row.leftLineNumber : row.rightLineNumber
    const text = isLeft ? row.leftText : row.rightText

    if (lineNumber === null || text === null) return null

    return {
        type: row.type,
        lineNumber,
        text,
    }
}

function createSideBySideRows(rows: UnifiedDiffRow[]): SideBySideDiffRow[] {
    const aligned: SideBySideDiffRow[] = []
    let rowIndex = 0

    while (rowIndex < rows.length) {
        const row = rows[rowIndex]
        if (!row) break

        if (row.type === 'unchanged') {
            aligned.push({
                type: 'unchanged',
                left: toCell(row, 'left'),
                right: toCell(row, 'right'),
            })
            rowIndex += 1
            continue
        }

        const removed: UnifiedDiffRow[] = []
        const added: UnifiedDiffRow[] = []

        while (rowIndex < rows.length && rows[rowIndex]?.type !== 'unchanged') {
            const changedRow = rows[rowIndex]
            if (changedRow?.type === 'removed') removed.push(changedRow)
            if (changedRow?.type === 'added') added.push(changedRow)
            rowIndex += 1
        }

        const changeRowCount = Math.max(removed.length, added.length)
        for (let changeIndex = 0; changeIndex < changeRowCount; changeIndex += 1) {
            const removedRow = removed[changeIndex]
            const addedRow = added[changeIndex]
            aligned.push({
                type: removedRow && addedRow ? 'modified' : removedRow ? 'removed' : 'added',
                left: removedRow ? toCell(removedRow, 'left') : null,
                right: addedRow ? toCell(addedRow, 'right') : null,
            })
        }
    }

    return aligned
}

function createSummary(
    unifiedRows: UnifiedDiffRow[],
    sideBySideRows: SideBySideDiffRow[],
    leftLineCount: number,
    rightLineCount: number,
): DiffSummary {
    let added = 0
    let removed = 0
    let unchanged = 0
    let changeBlocks = 0
    let previousWasChanged = false

    for (const row of unifiedRows) {
        if (row.type === 'added') added += 1
        if (row.type === 'removed') removed += 1
        if (row.type === 'unchanged') unchanged += 1

        const isChanged = row.type !== 'unchanged'
        if (isChanged && !previousWasChanged) changeBlocks += 1
        previousWasChanged = isChanged
    }

    return {
        added,
        removed,
        unchanged,
        modified: sideBySideRows.filter(row => row.type === 'modified').length,
        changeBlocks,
        leftLines: leftLineCount,
        rightLines: rightLineCount,
        hasChanges: added > 0 || removed > 0,
    }
}

export function compareInputs(leftInput: string, rightInput: string, options: DiffOptions = {}): DiffResult {
    const resolvedOptions: Required<DiffOptions> = {
        mode: options.mode ?? 'text',
        ignoreWhitespace: options.ignoreWhitespace ?? false,
        ignoreCase: options.ignoreCase ?? false,
    }
    const leftLines = prepareInput(leftInput, 'left', resolvedOptions.mode)
    const rightLines = prepareInput(rightInput, 'right', resolvedOptions.mode)
    const leftKeys = leftLines.map(line => comparisonKey(line, resolvedOptions))
    const rightKeys = rightLines.map(line => comparisonKey(line, resolvedOptions))
    const unifiedRows = createUnifiedRows(leftLines, rightLines, leftKeys, rightKeys)
    const sideBySideRows = createSideBySideRows(unifiedRows)

    return {
        mode: resolvedOptions.mode,
        normalizedLeft: leftLines.join('\n'),
        normalizedRight: rightLines.join('\n'),
        unifiedRows,
        sideBySideRows,
        summary: createSummary(unifiedRows, sideBySideRows, leftLines.length, rightLines.length),
    }
}

export function formatUnifiedDiff(result: DiffResult): string {
    return result.unifiedRows
        .map(row => {
            if (row.type === 'added') return `+ ${row.rightText ?? ''}`
            if (row.type === 'removed') return `- ${row.leftText ?? ''}`
            return `  ${row.leftText ?? ''}`
        })
        .join('\n')
}
