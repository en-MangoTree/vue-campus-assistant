import Vue from 'vue';
import Store from '@/store';

/**
 * 自定义角色指令
 * directive 自定义指令方法（参数为：指令，实现方法）
 */
Vue.directive('hasRole', {
    inserted(el, binding) {
        // 获取绑定标签传过来的数据
        const { value } = binding;
        // 获取vuex中的角色信息
        const role = Store.state.role;
        // 超级管理员可以查看全部
        const admin = 'BOSS';
        // 判断绑定标签穿传值
        if(value && value instanceof Array && value.length > 0){
            /**
             * some 用于检测数组中元素是否满足条件，不会改变原来数组 返回true/false
             */
            // const hasRole = role.some(item => {
                /**
                 * includes 判断字符串是否包含子字符串
                 */
            //     return item.code === admin || value.includes(item.code);
            // });

            const hasRole = role.code === admin || value.includes(role.code);
            if(!hasRole){
                el.parentNode.removeChild(el);
            }
        } else {
            throw new Error (`请设置${value}角色标签`);
        }
    }
});

/**
 * 
 */
Vue.directive('hasPermission', {
    inserted(el, binding) {
        const { value } = binding;
        const role = Store.state.role;
        const permissons = Store.state.permissions;
        const admin = 'BOSS';
        if(value && value instanceof Array && value.length > 0){
             const hasPermission = permissons.some(item => {
                return value.includes(item.code);
            });
            // const hasRole = role.some(item => {
            //     return item.code === admin;
            // });
            const hasRole = role.code === admin || value.includes(role.code);
            if(!hasPermission && !hasRole){
                el.parentNode.removeChild(el);
            }
        } else {
            throw new Error (`请设置${value}权限标签`);
        }
    }
});