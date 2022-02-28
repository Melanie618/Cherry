import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import './styles/cherry-markdown.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// import { mockXHR } from '../mock'
// if (process.env.NODE_ENV === 'development') {
//   mockXHR()
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })

Vue.config.productionTip = false
// console.log(window.vue_Notification = ElementUI.Notification)
// window.Vue = Vue
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
