import { createRouter, createWebHistory, RouterView } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoremIpsumGenerator from '@/views/LoremIpsumGenerator.vue'
import CsvToJson from '@/views/CSVToJSON.vue'
import FormatJSON from '@/views/FormatJSON.vue'
import JsonToCSV from '@/views/JSONToCSV.vue'
import StringInspector from '@/views/StringInspector.vue'
import Dates from '@/views/UnixEpochToDate.vue'
import PHPArrayToJson from '@/views/PHPArrayToJSON.vue'
import JSONToPHPArray from '@/views/JSONToPHPArray.vue'
import Base64Encode from '@/views/Base64Encode.vue'
import Base64Decode from '@/views/Base64Decode.vue'
import LineSort from '@/views/LineSort.vue'
import ColorConverter from '@/views/ColorConverter.vue'
import QRCodeGenerator from '@/views/QRCodeGenerator.vue'
import CurlToFetch from '@/views/CurlToFetch.vue'
import HttpStatusCodes from '@/views/HttpStatusCodes.vue'
import RandomDataGenerator from '@/views/RandomDataGenerator.vue'

export const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            analytics: {
                pageTitle: 'Home - UtilsNinja',
                category: 'Navigation'
            }
        }
    },
    {
        path: '/tools',
        name: 'tools',
        component: RouterView,
        children: [
            {
                path: 'json-formatter',
                name: 'FormatJSON',
                component: FormatJSON,
                meta: {
                    analytics: {
                        pageTitle: 'JSON Formatter',
                        category: 'JSON Tools'
                    }
                }
            },
            {
                path: 'lig',
                name: 'LoremIpsumGenerator',
                component: LoremIpsumGenerator,
                meta: {
                    tabDisplayName: 'Lorem Ipsum'
                }
            },
            {
                path: 'json-to-csv',
                name: 'JSONToCSV',
                component: JsonToCSV,
                meta: {
                    analytics: {
                        pageTitle: 'JSON to CSV Converter',
                        category: 'Converter Tools'
                    }
                }
            },
            {
                path: 'csv-to-json',
                name: 'CSVToJSON',
                component: CsvToJson,
                meta: {
                    analytics: {
                        pageTitle: 'CSV to JSON Converter',
                        category: 'Converter Tools'
                    }
                }
            },
            {
                path: 'php-to-json',
                name: 'PHPToJSON',
                component: PHPArrayToJson,
                meta: {
                    analytics: {
                        pageTitle: 'PHP Array to JSON Converter',
                        category: 'Converter Tools'
                    }
                }
            },
            {
                path: 'json-to-php',
                name: 'JSONToPHP',
                component: JSONToPHPArray,
                meta: {
                    analytics: {
                        pageTitle: 'JSON to PHP Array Converter',
                        category: 'Converter Tools'
                    }
                }
            },
            {
                path: 'inspector',
                name: 'Inspector',
                component: StringInspector,
                meta: {
                    analytics: {
                        pageTitle: 'String Inspector',
                        category: 'Text Tools'
                    }
                }
            },
            {
                path: 'dates',
                name: 'Dates',
                component: Dates,
                meta: {
                    analytics: {
                        pageTitle: 'Unix Epoch to Date Converter',
                        category: 'Converter Tools'
                    }
                }
            },
            {
                path: 'base-64-encode',
                name: 'Base64Encode',
                component: Base64Encode,
                meta: {
                    analytics: {
                        pageTitle: 'Base64 Encoder',
                        category: 'Encoding Tools'
                    }
                }
            },
            {
                path: 'base-64-decode',
                name: 'Base64Decode',
                component: Base64Decode,
                meta: {
                    analytics: {
                        pageTitle: 'Base64 Decoder',
                        category: 'Encoding Tools'
                    }
                }
            },
            {
                path: 'line-sort',
                name: 'LineSort',
                component: LineSort,
                meta: {
                    analytics: {
                        pageTitle: 'Line Sorter',
                        category: 'Text Tools'
                    }
                }
            },
            {
                path: 'color-converter',
                name: 'ColorConverter',
                component: ColorConverter,
                meta: {
                    analytics: {
                        pageTitle: 'Color Converter',
                        category: 'Converter Tools'
                    }
                }
            },
            {
                path: 'qr-generator',
                name: 'QRCodeGenerator',
                component: QRCodeGenerator,
                meta: {
                    analytics: {
                        pageTitle: 'QR Code Generator',
                        category: 'Generator Tools'
                    }
                }
            },
            {
                path: 'curl-to-fetch',
                name: 'CurlToFetch',
                component: CurlToFetch,
                meta: {
                    analytics: {
                        pageTitle: 'cURL to Fetch Converter',
                        category: 'Developer Tools'
                    }
                }
            },
            {
                path: 'http-status-codes',
                name: 'HttpStatusCodes',
                component: HttpStatusCodes,
                meta: {
                    analytics: {
                        pageTitle: 'HTTP Status Codes Reference',
                        category: 'Developer Tools'
                    }
                }
            },
            {
                path: 'random-data',
                name: 'RandomDataGenerator',
                component: RandomDataGenerator,
                meta: {
                    analytics: {
                        pageTitle: 'Random Data Generator',
                        category: 'Generator Tools'
                    }
                }
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 })
})

export default router
