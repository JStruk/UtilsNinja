export function lineSort(input: string, removeDuplicates: boolean = true) {
    const cleanInput = input.replace(/\n$/g, '')
    const lines: string[] = removeDuplicates
        ? [...new Set(cleanInput.split('\n'))]
        : cleanInput.split('\n')

    return lines
        .sort()
        .join('\n')
}