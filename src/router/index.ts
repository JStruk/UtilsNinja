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
                path: 'lig',
                name: 'LoremIpsumGenerator',
                component: LoremIpsumGenerator,
                meta: {
                    tabDisplayName: 'Lorem Ipsum'
                }
            },
            {
                path: 'csv-to-json',
                name: 'CSVToJSON',
                component: CsvToJson,
            },
            {
                path: 'json-to-csv',
                name: 'JSONToCSV',
                component: JsonToCSV,
            },
            {
                path: 'json-formatter',
                name: 'FormatJSON',
                component: FormatJSON,
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
                path: 'php-to-json',
                name: 'PHPToJSON',
                component: PHPArrayToJson,
            },
            {
                path: 'json-to-php',
                name: 'JSONToPHP',
                component: JSONToPHPArray,
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
