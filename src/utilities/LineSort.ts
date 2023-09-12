export function lineSort(input: string) {
    return input
        .split('\n')
        .sort()
        .join('\n')
}