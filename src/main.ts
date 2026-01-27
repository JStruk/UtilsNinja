import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import 'vue3-toastify/dist/index.css'
import { createGtag } from 'vue-gtag'
import { vueDebounce } from 'vue-debounce'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

const app = createApp(App)

app.use(router)

// Configure Google Analytics with router integration for automatic page view tracking
app.use(createGtag({
    tagId: 'G-BYHW9QDH5C',
    pageTracker: { router }
}))

app.use(Vue3Toastify, {
    autoClose: 3000,
} as ToastContainerOptions)

app.directive('debounce', vueDebounce({ lock: true }))

app.mount('#app')
