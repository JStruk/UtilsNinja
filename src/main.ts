import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import VueGtag from 'vue-gtag'

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
app.mount('#app')
