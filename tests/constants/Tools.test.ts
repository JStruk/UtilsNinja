import { describe, expect, it } from 'vitest'
import { toolCategories, tools } from '@/constants/Tools'

describe('tool catalog', () => {
    it('uses unique identifiers, route names, and paths', () => {
        expect(new Set(tools.map((tool) => tool.id)).size).toBe(tools.length)
        expect(new Set(tools.map((tool) => tool.routeName)).size).toBe(tools.length)
        expect(new Set(tools.map((tool) => tool.path)).size).toBe(tools.length)
    })

    it('only references registered categories', () => {
        const categories = new Set(toolCategories)

        expect(tools.every((tool) => categories.has(tool.category))).toBe(true)
    })

    it('provides searchable metadata for every utility', () => {
        for (const tool of tools) {
            expect(tool.label.length).toBeGreaterThan(0)
            expect(tool.description.length).toBeGreaterThan(0)
            expect(tool.tags.length).toBeGreaterThan(0)
        }
    })
})
