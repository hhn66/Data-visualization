import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
//引入全局的样式文件
import './assets/css/global.less'
//引入字体文件
import './assets/font/iconfont.css'
import WebSocketService from '../src/utils/scoket_service'
//对服务端进行websocket的连接
WebSocketService.Instance.connect()


//请求基准路径配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api'
//将axios挂载到Vue的原型对象上
//在别的组件中  this.$http
Vue.prototype.$http = axios

//其他组件 this.$socket
Vue.prototype.$socket = WebSocketService.Instance

//将全局的echarts对象挂载到Vue的原型对象上
//别的组件中  this.$echarts
Vue.prototype.$echarts = window.echarts


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
