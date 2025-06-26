export function PHPArrayToJSON(php: string): {} {
    // First, identify and protect regular arrays
    const protectedArrays = new Map<string, string>();
    let arrayCounter = 0;
    
    // Replace regular arrays with placeholders
    const withProtectedArrays = php.replace(/\[([^=>\]]*)\]/g, (match, content) => {
        const placeholder = `__ARRAY_${arrayCounter}__`;
        protectedArrays.set(placeholder, match);
        arrayCounter++;
        return placeholder;
    });

    // Convert associative arrays to objects
    const converted = withProtectedArrays
        .replace(/\[/g, '{')
        .replace(/]/g, '}')
        .replace(/=>/g, ':')
        .replace(/'/g, '"');

    // Restore regular arrays
    let result = converted;
    protectedArrays.forEach((original, placeholder) => {
        result = result.replace(placeholder, original);
    });

    // Remove trailing commas before closing brackets/braces
    result = result.replace(/,\s*([\]}])/g, '$1');

    return JSON.parse(result);
}