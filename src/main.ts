import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import VueGtag from 'vue-gtag'
import { vue3Debounce } from 'vue-debounce'

const app = createApp(App)

app.use(router)
app.use(VueGtag,
    {
        appName: 'UtilsNinja',
        pageTrackerScreenviewEnabled: true,
        config: { id: import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID }
    },
    router
)
app.directive('debounce', vue3Debounce({ lock: true }))
app.mount('#app')
