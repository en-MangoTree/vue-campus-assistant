import Home from '@/views/Home'

/**
 * 格式化菜单，将菜单转换为组件
 * @param {Array} menus
 */
export const formatMenu = (menus) => {
  /**
   * 迭代菜单，将菜单进行改造并返回
   * filter 创建一个新数组，新数组中元素通过指定数组符合的条件进行返回
   */
  const route = menus.filter(item =>{
    item.component = (item.component === 'home') ? Home :loadVeiw(item.component);
    item.meta = {
      title: item.title
    };
    if(item.children && item.children.length > 0){
      formatMenu(item.children);
    }
    return true;
  });
  // 将格式化的菜单返回
  return route;
}

/**
 * 路由懒加载
 * @param {string} view 组件路径
 * @returns 返回组件
 */
const loadVeiw = (view) => {
  return (resolve) => require([`@/views/${view}.vue`], resolve);
}