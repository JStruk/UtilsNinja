
export function copyToClipboard(str: string): void {
    navigator.clipboard.writeText(str).then(
        function () {
            console.log('Text copied to clipboard')
        },
        function (err) {
            console.error('Could not copy text to user\'s clipboard: ', err)
        }
    )
}