import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/router'

export const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})