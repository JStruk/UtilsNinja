import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ToolsView from '@/views/ToolsView.vue'
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

export const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
    },
    {
        path: '/tools',
        name: 'tools',
        component: ToolsView,
        children: [
            {
                path: 'json-formatter',
                name: 'FormatJSON',
                component: FormatJSON,
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
            },
            {
                path: 'csv-to-json',
                name: 'CSVToJSON',
                component: CsvToJson,
            },
            {
                path: 'php-to-json',
                name: 'PHPToJSON',
                component: PHPArrayToJson,
            },
            {
                path: 'json-to-php',
                name: 'JSONToPHP',
                component: JSONToPHPArray,
            },
            {
                path: 'inspector',
                name: 'Inspector',
                component: StringInspector,
            },
            {
                path: 'dates',
                name: 'Dates',
                component: Dates,

            },
            {
                path: 'base-64-encode',
                name: 'Base64Encode',
                component: Base64Encode,
            },
            {
                path: 'base-64-decode',
                name: 'Base64Decode',
                component: Base64Decode,
            },
            {
                path: 'line-sort',
                name: 'LineSort',
                component: LineSort,
            },
            {
                path: 'color-converter',
                name: 'ColorConverter',
                component: ColorConverter,
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
