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
import '@/assets/file_list.scss'
import VueCookies from 'vue-cookies'
import CategoryInfo from '@/js/CategoryInfo';

//自定义组件
import Dialog from './components/Dialog.vue';
import Verify from './utills/Verify';
import Avatar from './components/Avatar.vue';
import Table from './components/Table.vue'; 
import Icon from './components/Icon.vue';
import Message from './utills/Message';
import Request from './utills/Request';
import Confirm from './utills/Confirm';
import Utils from './utills/Utils';
import NoData from './components/NoData.vue';
import Navigation from './components/Navigation.vue';
import FolderSelect from './components/FolderSelect.vue';

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.component("Dialog", Dialog);
app.component("Avatar", Avatar);
app.component("Table", Table);
app.component("Icon", Icon);
app.component("NoData", NoData);
app.component("Navigation", Navigation);
app.component("FolderSelect", FolderSelect);
//配置全局组件
app.config.globalProperties.Verify = Verify;
app.config.globalProperties.Message = Message;
app.config.globalProperties.Request = Request;
app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.Confirm = Confirm;
app.config.globalProperties.Utils = Utils;
app.config.globalProperties.globalInfo = {
    avatarUrl: "/api/getAvatar/",
    imageUrl: "/api/file/getImage/"
}
//注意大小写
app.mount('#app')