<template>
  <el-container style=" height: 100%;">
    <!-- 侧边栏 -->
    <el-aside :width="menuActive ? '200px' : '65px'">
        <div style="height:60px;color:#fff;">
          <span style="font-size:40px;">KK</span>
          <span style="font-size:20px;" v-show="menuActive">后台管理平台</span>
        </div>
        <el-menu
            :default-active="activePath"
            class="el-menu-vertical-demo"
            background-color="#545c64"
            text-color="#fff"
            :collapse="!menuActive" 
            unique-opened
            router
            active-text-color="#ffd04b">
            <!-- 父级菜单 -->
            <el-submenu :index="index + ''" v-for="(parentMenu, index) in menus" :key="index">
              <template slot="title">
                <e-icon :icon-name="parentMenu.icon"/>
                <span>{{ parentMenu.title }}</span>
              </template>
              <el-menu-item :index="childrenMenu.path" v-for="(childrenMenu, i) in parentMenu.children" :key="i" @click="savePath(childrenMenu.path)">
                <template slot="title">
                  <e-icon :icon-name="childrenMenu.icon"/>
                  <span>{{ childrenMenu.title }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
    <el-container>
      <!-- 头部 -->
      <el-header>
        <!-- 伸缩按钮 -->
        <div class="shenshuoBtn" @click="menuActive = !menuActive">
          <i class="el-icon-s-fold"></i>
        </div>
        <!-- 面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right" style="margin:20px 0">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in $router.currentRoute.matched" :key="index">{{ item.meta.title }}</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 用户信息 -->
        <el-dropdown @command="handleCommand" style="right: 0;position: absolute;margin-right:25px;">
          <span class="el-dropdown-link">
            {{name}}
            <el-avatar :size="50" :src="avatar"/>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="personal">个人信息</el-dropdown-item>
            <el-dropdown-item command="connect">联系管理员</el-dropdown-item>
            <el-dropdown-item command="logout">退出登陆</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <!-- 主体 -->
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {mapState} from 'vuex';

export default {
  name: "Home",
  //计算属性
  computed: {
    ...mapState(['menus', 'avatar', 'name', 'roles'])
  },
  data() {
    return{
      menuActive:true,
      activePath: sessionStorage.getItem('savePath'),
    }
  },
  created() {
  },
  methods:{
    savePath(path) {
        sessionStorage.setItem('savePath', path);
        this.activePath = path;
    },
    handleCommand(command) {
        if (command === 'personal'){
            this.$message('个人中心');
        } else if (command === 'connect') {
             this.$message('联系管理员');
        } else {
            this.logout();
        }
    },
    logout() {
      this.$confirm("您的操作将退出此系统, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$ajax.get("/user/logout").then((res) => {
            this.$message.success(res.data.message);
            //清空本地缓存
            sessionStorage.clear();
            //跳转页面
            this.$router.replace({ path: "/login" });
            this.$message.success(res.data.message);
          });
        })
        .catch(() => {
          this.$message.info("操作已取消!");
        });
    },
  },
  
};
</script>

<style scoped>
.el-header {
  background-color: #fff;
  color: #333;
  text-align: center;
  line-height: 60px;
  display: flex;
}

.el-aside {
  background-color: #545c64;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
}

.el-submenu .el-menu-item{
  padding: 0;
}

.shenshuoBtn{
  font-size: 20px;
  background-color: #fff;
  color: #000;
  width: 30px;
  margin-right: 20px;
}

.el-dropdown-link {
    cursor: pointer;
    color: #000000;
    align-items: center;
    display: flex;
  }

  .el-icon-arrow-down {
    font-size: 12px;
  }

.el-avatar{
  margin: 0 15px;
}
</style>