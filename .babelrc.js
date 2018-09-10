module.exports = {
    presets: [[
        'es2015'
    ]],
    plugins: [[
        "@babel/transform-runtime"
    ], 'babel-plugin-async-to-promises', '@babel/plugin-proposal-object-rest-spread']
};