import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import 'vue3-toastify/dist/index.css'
import { configure } from 'vue-gtag'
import { vue3Debounce } from 'vue-debounce'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

const app = createApp(App)


configure({
    tagId: 'G-BYHW9QDH5C'
})

app.use(router)

app.use(Vue3Toastify, {
    autoClose: 3000,
} as ToastContainerOptions)

app.directive('debounce', vue3Debounce({ lock: true }))

app.mount('#app')
