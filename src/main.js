import Vue from 'vue'
import App from './App.vue'

import { Select, Option, Message, Dialog, Button, Form, FormItem, Input, Upload } from 'element-ui';
Vue.use(Select)
Vue.use(Option)
Vue.use(Dialog)
Vue.use(Button)
Vue.use(Form)
Vue.use(Input)
Vue.use(FormItem)
Vue.use(Upload)

// 在调用 Vue.use 前，给 Message 添加 install 方法
Message.install = (Vue, options) => {
  Vue.prototype.$message = Message
}
Vue.use(Message)


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
