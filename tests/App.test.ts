// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import App from '@/App.vue'
import { mount } from '@vue/test-utils';
import { router } from './helpers/testRouter';

const renderComponent = () => {
    return mount(App, {
        global: {
            plugins: [router]
        }
    })
}

describe('App', () => {
    it('renders the component', () => {
        const wrapper = renderComponent();

        expect(wrapper.exists()).toBeTruthy();
    })

    it('renders a navbar', () => {
        const wrapper = renderComponent();

        expect(wrapper.find('nav').exists()).toBeTruthy();
    })
})