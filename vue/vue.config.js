const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
    transpileDependencies: true,

    devServer: {
        port: 8080
    },

    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src') // 关键一行！
            }
        }
    },

    chainWebpack: config => {
        config.plugin('html')
            .tap(args => {
                args[0].title = "管理系统";
                return args;
            })
    },
})
