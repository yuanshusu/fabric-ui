const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    host: 'localhost',    //打开的主机地址
    open: true,           //自动打开浏览器
    port: 8080            //端口号
  },
  lintOnSave: false,       // 关闭eslint
  assetsDir: 'static',     //  outputDir的静态资源(js、css、img、fonts)目录
  publicPath: './',   // 静态资源路径（默认/，如果不改打包后会白屏）
  productionSourceMap: false, //不输出map文件
}
