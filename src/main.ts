import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import 'vue3-toastify/dist/index.css';
import VueGtag from 'vue-gtag'
import { vue3Debounce } from 'vue-debounce'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';

const app = createApp(App)

app.use(router)
app.use(VueGtag,
    {
        appName: 'UtilsNinja',
        pageTrackerScreenviewEnabled: true,
        pageTrackerTemplate: (to: any) => to.path,
        config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID }
    },
    router
)

app.use(Vue3Toastify, {
    autoClose: 3000,
} as ToastContainerOptions)

app.directive('debounce', vue3Debounce({ lock: true }))

app.mount('#app')
