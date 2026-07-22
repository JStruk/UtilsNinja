import { createRouter, createWebHistory, RouterView, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { tools } from '@/constants/Tools'

const toolRoutes: RouteRecordRaw[] = tools.map((tool) => ({
    path: tool.path,
    name: tool.routeName,
    component: tool.component,
    meta: {
        title: tool.label,
        analytics: {
            pageTitle: `${tool.label} - UtilsNinja`,
            category: tool.analyticsCategory ?? tool.category,
        },
    },
}))

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
        children: toolRoutes,
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 })
})

export default router
