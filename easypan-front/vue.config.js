module.exports = {
    // 配置 webpack
    configureWebpack: {
        module: {
            rules: [
                // 添加自定义的 loader 或者修改现有的 loader
                {
                    test: /transmuxer-worker\.ts$/,
                    use: {
                        loader: 'worker-loader'
                    }
                }
            ]
        }
    }
};