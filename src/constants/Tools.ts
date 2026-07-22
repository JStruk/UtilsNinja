import type { Component } from 'vue'

import base64Icon from '@/assets/icons/base64-encode.png'
import curlIcon from '@/assets/icons/curl-to-fetch.png'
import httpIcon from '@/assets/icons/http-status-codes.png'
import jsonIcon from '@/assets/icons/json-formatter.png'
import qrIcon from '@/assets/icons/qr-generator.png'
import randomIcon from '@/assets/icons/random-data.png'
import timeIcon from '@/assets/icons/timestamp-converter.png'

export const toolCategories = [
    'Data & Formats',
    'Encoding & Security',
    'Text & Diff',
    'Web & Network',
    'Date & Time',
    'Generators',
    'Color & Design',
] as const

export type ToolCategory = (typeof toolCategories)[number]

export type ToolIconName =
    | 'braces'
    | 'calendar'
    | 'clock'
    | 'code'
    | 'data'
    | 'diff'
    | 'file-code'
    | 'hash'
    | 'key'
    | 'link'
    | 'list'
    | 'lock'
    | 'network'
    | 'palette'
    | 'qr'
    | 'regex'
    | 'search'
    | 'shield'
    | 'sort'
    | 'terminal'
    | 'text'
    | 'unlock'
    | 'users'
    | 'validation'

export interface ToolDefinition {
    id: string
    routeName: string
    path: string
    label: string
    description: string
    category: ToolCategory
    tags: string[]
    icon: ToolIconName
    component: () => Promise<{ default: Component }>
    analyticsCategory?: string
    featuredImage?: string
}

export const tools: ToolDefinition[] = [
    {
        id: 'json-formatter',
        routeName: 'FormatJSON',
        path: 'json-formatter',
        label: 'JSON Formatter',
        description: 'Format, inspect, and validate JSON data.',
        category: 'Data & Formats',
        tags: ['json', 'pretty print', 'validate', 'format'],
        icon: 'braces',
        component: () => import('@/views/FormatJSON.vue'),
        analyticsCategory: 'JSON Tools',
        featuredImage: jsonIcon,
    },
    {
        id: 'json-to-csv',
        routeName: 'JSONToCSV',
        path: 'json-to-csv',
        label: 'JSON to CSV',
        description: 'Convert JSON objects and arrays into CSV data.',
        category: 'Data & Formats',
        tags: ['json', 'csv', 'convert', 'spreadsheet'],
        icon: 'data',
        component: () => import('@/views/JSONToCSV.vue'),
        analyticsCategory: 'Converter Tools',
    },
    {
        id: 'csv-to-json',
        routeName: 'CSVToJSON',
        path: 'csv-to-json',
        label: 'CSV to JSON',
        description: 'Transform comma-separated values into JSON.',
        category: 'Data & Formats',
        tags: ['csv', 'json', 'convert', 'spreadsheet'],
        icon: 'data',
        component: () => import('@/views/CSVToJSON.vue'),
        analyticsCategory: 'Converter Tools',
    },
    {
        id: 'php-to-json',
        routeName: 'PHPToJSON',
        path: 'php-to-json',
        label: 'PHP to JSON',
        description: 'Convert PHP array syntax into JSON.',
        category: 'Data & Formats',
        tags: ['php', 'json', 'array', 'convert'],
        icon: 'code',
        component: () => import('@/views/PHPArrayToJSON.vue'),
        analyticsCategory: 'Converter Tools',
    },
    {
        id: 'json-to-php',
        routeName: 'JSONToPHP',
        path: 'json-to-php',
        label: 'JSON to PHP',
        description: 'Convert JSON into PHP array syntax.',
        category: 'Data & Formats',
        tags: ['json', 'php', 'array', 'convert'],
        icon: 'code',
        component: () => import('@/views/JSONToPHPArray.vue'),
        analyticsCategory: 'Converter Tools',
    },
    {
        id: 'base64-encode',
        routeName: 'Base64Encode',
        path: 'base-64-encode',
        label: 'Base64 Encode',
        description: 'Encode text into Base64 representation.',
        category: 'Encoding & Security',
        tags: ['base64', 'encode', 'text'],
        icon: 'lock',
        component: () => import('@/views/Base64Encode.vue'),
        analyticsCategory: 'Encoding Tools',
        featuredImage: base64Icon,
    },
    {
        id: 'base64-decode',
        routeName: 'Base64Decode',
        path: 'base-64-decode',
        label: 'Base64 Decode',
        description: 'Decode Base64 data back into text.',
        category: 'Encoding & Security',
        tags: ['base64', 'decode', 'text'],
        icon: 'unlock',
        component: () => import('@/views/Base64Decode.vue'),
        analyticsCategory: 'Encoding Tools',
    },
    {
        id: 'jwt-inspector',
        routeName: 'JWTInspector',
        path: 'jwt-inspector',
        label: 'JWT Inspector',
        description: 'Decode JWT headers, payloads, and time-based claims locally.',
        category: 'Encoding & Security',
        tags: ['jwt', 'token', 'base64url', 'claims', 'authentication', 'decode'],
        icon: 'shield',
        component: () => import('@/views/JWTInspector.vue'),
        analyticsCategory: 'Security Tools',
    },
    {
        id: 'string-inspector',
        routeName: 'Inspector',
        path: 'inspector',
        label: 'String Inspector',
        description: 'Inspect character, word, line, and frequency statistics.',
        category: 'Text & Diff',
        tags: ['string', 'text', 'count', 'inspect'],
        icon: 'search',
        component: () => import('@/views/StringInspector.vue'),
        analyticsCategory: 'Text Tools',
    },
    {
        id: 'line-sort',
        routeName: 'LineSort',
        path: 'line-sort',
        label: 'Line Sorter',
        description: 'Sort and optionally deduplicate lines of text.',
        category: 'Text & Diff',
        tags: ['sort', 'deduplicate', 'lines', 'text'],
        icon: 'sort',
        component: () => import('@/views/LineSort.vue'),
        analyticsCategory: 'Text Tools',
    },
    {
        id: 'curl-to-fetch',
        routeName: 'CurlToFetch',
        path: 'curl-to-fetch',
        label: 'cURL to Fetch',
        description: 'Convert cURL commands into JavaScript Fetch calls.',
        category: 'Web & Network',
        tags: ['curl', 'fetch', 'http', 'api', 'javascript'],
        icon: 'terminal',
        component: () => import('@/views/CurlToFetch.vue'),
        analyticsCategory: 'Developer Tools',
        featuredImage: curlIcon,
    },
    {
        id: 'http-status-codes',
        routeName: 'HttpStatusCodes',
        path: 'http-status-codes',
        label: 'HTTP Status Codes',
        description: 'Browse common HTTP response status codes.',
        category: 'Web & Network',
        tags: ['http', 'status', 'response', 'api', 'reference'],
        icon: 'list',
        component: () => import('@/views/HttpStatusCodes.vue'),
        analyticsCategory: 'Developer Tools',
        featuredImage: httpIcon,
    },
    {
        id: 'timestamp-converter',
        routeName: 'Dates',
        path: 'dates',
        label: 'Timestamp Converter',
        description: 'Convert Unix timestamps into readable dates.',
        category: 'Date & Time',
        tags: ['unix', 'epoch', 'timestamp', 'date', 'time'],
        icon: 'clock',
        component: () => import('@/views/UnixEpochToDate.vue'),
        analyticsCategory: 'Converter Tools',
        featuredImage: timeIcon,
    },
    {
        id: 'lorem-ipsum',
        routeName: 'LoremIpsumGenerator',
        path: 'lig',
        label: 'Lorem Ipsum',
        description: 'Generate placeholder words, sentences, or paragraphs.',
        category: 'Generators',
        tags: ['lorem', 'ipsum', 'placeholder', 'text', 'generate'],
        icon: 'text',
        component: () => import('@/views/LoremIpsumGenerator.vue'),
        analyticsCategory: 'Generator Tools',
    },
    {
        id: 'qr-code-generator',
        routeName: 'QRCodeGenerator',
        path: 'qr-generator',
        label: 'QR Code Generator',
        description: 'Create customizable QR codes for URLs and text.',
        category: 'Generators',
        tags: ['qr', 'code', 'url', 'generate', 'download'],
        icon: 'qr',
        component: () => import('@/views/QRCodeGenerator.vue'),
        analyticsCategory: 'Generator Tools',
        featuredImage: qrIcon,
    },
    {
        id: 'random-data',
        routeName: 'RandomDataGenerator',
        path: 'random-data',
        label: 'Random Data',
        description: 'Generate mock names, addresses, identifiers, and more.',
        category: 'Generators',
        tags: ['mock', 'fake', 'random', 'test', 'uuid', 'generate'],
        icon: 'users',
        component: () => import('@/views/RandomDataGenerator.vue'),
        analyticsCategory: 'Generator Tools',
        featuredImage: randomIcon,
    },
    {
        id: 'color-converter',
        routeName: 'ColorConverter',
        path: 'color-converter',
        label: 'Color Converter',
        description: 'Convert colors between HEX, RGB, HSL, and CMYK.',
        category: 'Color & Design',
        tags: ['color', 'hex', 'rgb', 'hsl', 'cmyk', 'design'],
        icon: 'palette',
        component: () => import('@/views/ColorConverter.vue'),
        analyticsCategory: 'Converter Tools',
    },
]

export function findToolByRouteName(routeName: string | symbol | null | undefined) {
    return tools.find((tool) => tool.routeName === routeName)
}
