import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/Login";
import Home from "@/views/Home";
import ajax from '@/utils/ajax';
import store from '@/store';
import { formatMenu } from '@/utils/initMenus';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
];

const router = new VueRouter({
  routes,
});

/**
 * 路由导航
 * to：将要去哪个页面
 * from：从哪个页面过来
 * next：放行到哪个页面
 */
router.beforeEach((to, from, next) => {
  // 判断用户是否登陆
  const token = sessionStorage.getItem('token');
  if(!token){
    if(to.path === '/login'){
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`);
    }
  } else {
    // 向后端发送请求，获取用户基本信息
    ajax.get('/user/getInfo').then((res) => {
      const user = res.data.data;
      store.commit('setName', user.nickName);
      store.commit('setAvatar', user.avatar);
      if(null !== user.role){
        // 添加角色、菜单权限等信息
        store.commit('setRole', user.role);
        // 格式化菜单
        const menulist = formatMenu(user.menus);
        router.addRoutes(menulist);
        store.commit('setMenus', menulist);
        store.commit('setPermissions', user.permissions);
      }
    });
    // 已经登陆
    if(to.path === '/login'){
      next('/');
    } else {
      next();
    }
  }

});


export default router;
