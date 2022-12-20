import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import ToolsView from '@/views/ToolsView.vue';
import LoremIpsumGenerator from '@/views/LoremIpsumGenerator.vue';
import CsvToJson from '@/views/CsvToJson.vue';
import FormatJSON from '@/views/FormatJSON.vue';

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
                path: 'csvtojson',
                name: 'CsvToJson',
                component: CsvToJson,

            },
            {
                path: 'formatjson',
                name: 'FormatJson',
                component: FormatJSON,

            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
