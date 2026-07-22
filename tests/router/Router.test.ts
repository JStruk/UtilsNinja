import { describe, expect, it } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from '@/router'
import { tools } from '@/constants/Tools'

describe('application routes', () => {
    it('registers every catalog utility below /tools', () => {
        const toolsRoute = routes.find((route) => route.path === '/tools')

        expect(toolsRoute?.children).toHaveLength(tools.length)
        expect(toolsRoute?.children?.map((route) => route.name)).toEqual(
            tools.map((tool) => tool.routeName),
        )
    })

    it('redirects the tools root and provides a catch-all page', () => {
        const toolsRoute = routes.find((route) => route.path === '/tools')
        const notFoundRoute = routes.find((route) => route.name === 'not-found')

        expect(toolsRoute?.redirect).toEqual({ name: tools[0]?.routeName })
        expect(notFoundRoute?.path).toBe('/:pathMatch(.*)*')
    })

    it('gives every routable page a title', () => {
        const childRoutes = routes.flatMap((route) => route.children ?? [])
        const pages: RouteRecordRaw[] = [...routes.filter((route) => route.name !== 'tools'), ...childRoutes]

        expect(pages.every((route) => typeof route.meta?.title === 'string')).toBe(true)
    })
})
