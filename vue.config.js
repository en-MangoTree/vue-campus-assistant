const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8801,
    // 启动时打开浏览器
    // open: true,
    // 设置代理
    proxy: {
      '/':{
        ws: false,
        target: 'http://localhost:8800',
        // 是否开启跟路径转换
        changeOrigin: true,
        // 代理路径更改
        pathReWrite: {
          '^/' : '/'
        },
      }
    }
  }
});
