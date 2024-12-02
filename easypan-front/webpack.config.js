const path = require('path');

module.exports = {
    entry: './src/main.js', // 入口文件
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            // 使用 Babel 处理 JS 文件
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            // 处理 TypeScript 文件
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            // 处理 Web Worker 文件
            {
                test: /transmuxer-worker\.ts$/,
                use: 'worker-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue']
    }
};