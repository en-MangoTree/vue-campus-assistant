<template>
  <div class="main-container">
    <!-- <div class="left-container">
       <img src="../assets/loginPic.jpg" style="height: 100%;width: 100%;border-radius: 10px;"/>
    </div> -->
    <div class="login-container">
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <h3 class="title">KnockKnock后台管理平台</h3>
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            placeholder="账号"
            prefix-icon="el-icon-user-solid"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="el-icon-s-help"
            placeholder="密码"
          >
          </el-input>
        </el-form-item>
        <el-form-item style="width: 100%">
          <el-button
            :loading="loading"
            size="medium"
            style="width: 100%;background-color: #5839ac;color: #ffffff;"
            @click.native.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
        </el-form-item>
        <el-form-item label="管理员:" style="margin-top: -10px">
          <el-tag effect="dark" type="success"> admin</el-tag>
          <el-tag effect="dark" style="margin-left: 20px">123456</el-tag>
        </el-form-item>

      </el-form>
    </div>
  </div>
</template>

<script>

export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "boss",
        password: "123321",
      },
      loginRules: {
        username: [
          {required: true, trigger: "blur", message: "请输入您的账号"},
        ],
        password: [
          {required: true, trigger: "blur", message: "请输入您的密码"},
        ],
      },
      loading: false,
    };
  },
  methods: {
    handleLogin() {
      this.loading = true;
      //表单验证
      this.$refs.loginForm.validate((valid) => {
        if (!valid) return this.$message.error('数据校验失败');
        // 调用get请求
        this.$ajax.post('/user/login', this.loginForm).then((res) => {
          const tokenBody = res.data.data;
          let tokenHead = tokenBody.tokenHead;
          let token = tokenBody.token;
          this.$store.commit('setToken', tokenHead + token);
          this.$router.push('/');
        }).catch(() => {
          this.loading = false;
        });
      });
    },
  },
};
</script>

<style scoped>
.main-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #5839ac;
}

.login-container {
  z-index: 1;
  position: absolute;
  right: 0;
  height: 95%;
  width: 30%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  box-shadow: -2px 3px 5px #38144b;
  opacity: 0.9;
  margin: 20px 15px;
}

.login-form {
  z-index: 1;
  width: 85%;
}

.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
  font-size: 26px;
}

/* .left-container{
  position: absolute;
  height: 95%;
  width: 67%;
  left: 0;
  margin: 20px 15px;
  box-shadow: -2px 3px 5px #38144b;
  font-size: 50px;
} */

</style>