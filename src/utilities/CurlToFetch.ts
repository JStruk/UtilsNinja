export interface FetchOptions {
    method: string;
    headers: Record<string, string>;
    body?: string;
}

export function curlToFetch(curlCommand: string): string {
    const cleanCommand = curlCommand.trim().replace(/^curl\s+/, '').replace(/\\\n/g, ' ');

    // Use a simple regex-based parser or a more sophisticated one?
    // Let's go with a state-machine or regex to pick out flags.

    const options: FetchOptions = {
        method: 'GET',
        headers: {},
    };

    let url = '';

    // Basic tokenization
    const tokens: string[] = [];
    let currentToken = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < cleanCommand.length; i++) {
        const char = cleanCommand[i];
        if ((char === '"' || char === "'") && (i === 0 || cleanCommand[i - 1] !== '\\')) {
            if (!inQuote) {
                inQuote = true;
                quoteChar = char;
            } else if (char === quoteChar) {
                inQuote = false;
            } else {
                currentToken += char;
            }
        } else if (char === ' ' && !inQuote) {
            if (currentToken) {
                tokens.push(currentToken);
                currentToken = '';
            }
        } else {
            currentToken += char;
        }
    }
    if (currentToken) tokens.push(currentToken);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token) continue;

        if (token === '-X' || token === '--request') {
            const nextToken = tokens[++i];
            options.method = nextToken ? nextToken.toUpperCase() : 'GET';
        } else if (token === '-H' || token === '--header') {
            const header = tokens[++i];
            if (header) {
                const [key, ...valueParts] = header.split(':');
                if (key && valueParts.length) {
                    options.headers[key.trim()] = valueParts.join(':').trim();
                }
            }
        } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
            const body = tokens[++i];
            if (body) {
                options.body = body;
                if (options.method === 'GET') options.method = 'POST';
            }
        } else if (token === '-u' || token === '--user') {
            const auth = tokens[++i];
            if (auth) {
                options.headers['Authorization'] = 'Basic ' + btoa(auth);
            }
        } else if (token.startsWith('http://') || token.startsWith('https://') || (!token.startsWith('-') && !url)) {
            url = token;
        }
    }

    if (!url) return '// Could not find URL in curl command';

    let code = `fetch(${JSON.stringify(url)}, {\n`;
    code += `  method: ${JSON.stringify(options.method)},\n`;

    if (Object.keys(options.headers).length > 0) {
        code += '  headers: {\n';
        for (const [key, value] of Object.entries(options.headers)) {
            code += `    ${JSON.stringify(key)}: ${JSON.stringify(value)},\n`;
        }
        code += '  },\n';
    }

    if (options.body) {
        code += `  body: JSON.stringify(${options.body}),\n`;
    }

    code += "})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));";

    return code;
}
