import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: ()=> import("@/views/Login.vue")
    },
    {
      path: '/',
      name: 'Framework',
      component: () => import("@/views/Framework.vue"),
      children: [
        {
          path: '/',
          redirect:"/main/all"
        },
        {
          path: '/main/:category',
          name: '首页',
          meta: {
            needLogin: true,
            menuCode: "main"
          },
          component: () => import("@/views/main/Main.vue")
        },
        {
          path: '/myshare',
          name: '我的分享',
          meta: {
            needLogin: true,
            menuCode: "share"
          },
          component: () => import("@/views/share/Myshare.vue")
        },
        {
          path: '/recycle',
          name: '回收站',
          meta: { 
            needLogin: true,
            menuCode: "recycle"
          },
          component: () => import("@/views/recycle/Recycle.vue")
        },
        {
          path: '/settings/sysSetting',
          name: '系统设置',
          meta: {
            needLogin: true,
            menuCode: "settings"
          },
          component: () => import("@/views/admin/SysSetting.vue")
        },
        {
          path: '/settings/userList',
          name: '用户管理',
          meta: {
            needLogin: true,
            menuCode: "settings"
          },
          component: () => import("@/views/admin/UserList.vue")
        },
        {
          path:'/settings/fileList',
          name: '文件管理',
          meta: {
            needLogin: true,
            menuCode: "settings"
          },
          component: () => import("@/views/admin/FileList.vue")
        },
      ]
    },
    {
      path: '/shareCheck/:shareId',
      name: '分享验证',
      component: () => import("@/views/webShare/ShareCheck.vue")
    },
    {
      path: '/share/:shareId',
      name: '分享',
      component: () => import("@/views/webShare/Share.vue") 
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userInfo = VueCookies.get("userInfo");
  if (to.meta.needLogin != null && to.meta.needLogin && userInfo == null) {
    router.push("/login");
  }
  next();
})

export default router
