import {
    createApp
} from 'vue'
import {
    createPinia
} from 'pinia'

import App from './App.vue'
import router from './router'
import locale from "element-plus/es/locale/lang/zh-cn";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
import VueCookies from 'vue-cookies'

//自定义组件
import Dialog from './components/Dialog.vue';
import Verify from './utills/Verify';
import Avatar from './components/Avatar.vue';

import Message from './utills/Message';
import Request from './utills/Request';
import Confirm from './utills/Confirm';

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.component("Dialog", Dialog);
app.component("Avatar", Avatar);
//配置全局组件
app.config.globalProperties.Verify = Verify;
app.config.globalProperties.Message = Message;
app.config.globalProperties.Request = Request;
app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.Confirm = Confirm;
app.config.globalProperties.globalInfo = {
    avatarUrl: "/api/getAvatar/"
}
//注意大小写
app.mount('#app')