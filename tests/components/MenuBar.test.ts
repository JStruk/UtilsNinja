// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import { router } from "../helpers/testRouter";
import { mount } from "@vue/test-utils";
import MenuBar from '../../src/components/MenuBar.vue'

const renderComponent = () => {
    return mount(MenuBar, {
        global: {
            plugins: [router]
        }
    })
}

describe('MenuBar', function () {
    it('renders', () => {
        const wrapper = renderComponent();

        expect(wrapper.exists()).toBeTruthy();
    })

    it('renders a nav section', () => {
        const wrapper = renderComponent();

        expect(wrapper.find('nav').exists()).toBeTruthy();
    })

    it.each(['Home', 'Tools', 'Contact', 'Contribute'])('renders %s link', (tabName) => {
        const wrapper = renderComponent();

        const tab = wrapper.findAll('a').filter(n => n.text().match(tabName)).at(0);

        expect(tab?.exists()).toBeTruthy()
        expect.assertions(1)
    })
});