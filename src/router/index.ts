import { createRouter, createWebHistory, RouterView, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
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

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: {
            title: 'Developer Utilities',
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
        redirect: { name: tools[0]?.routeName ?? 'home' },
        children: toolRoutes,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFoundView,
        meta: {
            title: 'Page Not Found',
        },
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
    const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Developer Utilities'
    document.title = `${pageTitle} | UtilsNinja`
})

export default router
