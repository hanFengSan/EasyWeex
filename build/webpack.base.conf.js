const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = {
    entry: {
        index: resolve('src/index.js')
    },
    output: {
        path: resolve('dist'),
        filename: '[name].js',
        library: 'EasyWeex',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src')]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            src: resolve('src')
        }
    },
    plugins: [
        new CleanWebpackPlugin(['dist/*.*'], {
            root: resolve('')
        })
    ]
};
