import * as _Dimens from './Dimens.js';
import Fonts from './Fonts.js';
import polyfillStyle from './PolyfillStyle.js';
import _WeexAPI from './WeexAPI.js';
import _Util from './util/Util';
import _I18n from './I18n';
import * as _Storage from './Storage';

/*
* 判断JS运行环境
* 约定生产模式中bundleUrl中含有/prod/, 测试模式bundleUrl含有/test/, 开发模式两者都不含
*/
function getNodeEnv() {
    if (weex.config.bundleUrl.includes('/prod/')) {
        return 'production';
    } else if (weex.config.bundleUrl.includes('/test/')) {
        return 'test';
    } else {
        return 'development';
    }
}

/*
* 全局对象global, 实现同页面简单的数据互通
*/
export const global = {
    $langObj: {},
    $lang: '',
    $viewportSize: { width: 0, height: 0 },
    NODE_ENV: getNodeEnv(),
    isWeb: weex.config.env.platform === 'Web',
    isIOS: weex.config.env.platform === 'iOS',
    isAndroid: weex.config.env.platform === 'android'
};

/*
* 工具集
*/
export const Util = _Util;

/*
* 各类API: 封装的WeexAPI以及方法的工具集
*/
export const WeexAPI = _WeexAPI;

/*
* 尺寸变换集
*/
export const Dimens = _Dimens;

/*
* 多语言实现
*/
export const I18n = _I18n;

/*
* 持久化实现
*/
export const Storage = _Storage;

/*
* langObj(可选): 语言文件Object
* getLang(可选): 获取语言种类接口, 一个无参数的Promise, 返回String
* lang(可选): 语言种类, lang和getLang同时定义时, getLang会覆盖lang
*/
export default function({ langObj, getLang, lang } = {}) {
    return {
        data() {
            return {
                global
            };
        },

        computed: {
            // 注入尺寸常量
            ..._Dimens.constants,

            // 注入字体常量
            ...Fonts,

            // 注入util工具
            util: () => _Util,

            /*
            * i18n实现, 调用前需要先调用this.setLang函数
            * 提供动态变化更改
            * 返回一个函数供调用, 参数为key以及options
            * key为对应的lang文件的key
            * option为填入的模板参数, 例如options: { len: 3 } 将替换 'xxx{len}x'
            */
            $t() {
                return _I18n.translate(this.global.$lang, this.global.$langObj);
            },

            /*
            * 样式转换
            * vue文件中使用:style="styles.xxx"来绑定样式, 在computed中写styleSheet, 返回一个样式表object
            * 处理styleSheet, 转为styles, 期间完成样式的polyfill以及计算.
            */
            styles() {
                let result = {};
                // CamelCase转为KebabCase
                let covertStyle = name =>
                    name
                        .split(/(?=[A-Z])/)
                        .join('-')
                        .toLowerCase();
                if (!this.styleSheet) {
                    console.warn('styleSheet Object cannot be found');
                    return {};
                }
                // 遍历StyleSheet变量, 获取所有style的名称
                Object.keys(this.styleSheet).forEach(styleName => {
                    let style = this.styleSheet[styleName];
                    // '_'或'$'开头的变量名为内部字段, 不进行样式处理
                    if (!style || /^(_|\$)/.test(styleName)) return;
                    // style可直接为一个Object或者Function, Function则执行后再处理
                    if (typeof style !== 'function') {
                        // 初始化结果时, 放入_origin字段, 保存原数据, 方便样式传递
                        result[styleName] = { _origin: style };
                        // 遍历style, 拿到style的属性名, 然后对属性值进行polyfill处理, 然后遍历保存结果
                        Object.keys(style).forEach(prop => polyfillStyle(prop, style[prop]).forEach(({ name, value }) => (result[styleName][covertStyle(name)] = value)));
                    } else {
                        result[styleName] = args => {
                            let resStyle = style(args);
                            let res = { _origin: resStyle };
                            Object.keys(resStyle).forEach(prop => polyfillStyle(prop, resStyle[prop]).forEach(({ name, value }) => (res[covertStyle(name)] = value)));
                            return res;
                        };
                    }
                });
                return {
                    ...result,

                    /*
                    * 支持字面量式样式声明
                    * 使用示例: style="styles.$of{ fontSize: '12dp' }"
                    */
                    $of(style) {
                        if (!style) return null;
                        return {
                            _origin: style,
                            ...Object.keys(style).reduce((sum, prop) => {
                                polyfillStyle(prop, style[prop]).forEach(({ name, value }) => (sum[covertStyle(name)] = value));
                                return sum;
                            }, {})
                        };
                    },

                    /*
                    * 样式合并
                    * 参数args为style的object
                    */
                    $merge(...args) {
                        if (args.length === 0) {
                            return null;
                        }
                        let style = args.map(i => i._origin).reduce((sum, i) => {
                            Object.keys(i).forEach(key => {
                                sum[key] = i[key];
                            });
                            return sum;
                        }, {});
                        return {
                            _origin: style,
                            ...Object.keys(style).reduce((sum, prop) => {
                                polyfillStyle(prop, style[prop]).forEach(({ name, value }) => (sum[covertStyle(name)] = value));
                                return sum;
                            }, {})
                        };
                    }
                };
            }
        },

        methods: {
            // 注入尺寸方法
            ..._Dimens.methods,

            // 注入封装weex的方法
            ..._WeexAPI,

            // 持久化实现
            ..._Storage.methods,

            /*
            * 获取url中的参数
            */
            getUrlParams(url) {
                let params = {};
                url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                    params[key] = value;
                });
                return params;
            },

            /*
            * 设置i18n语言, lang为langFile中对应的语言名称, langObj为langFile
            */
            setLang(lang, langObj = this.global.$langObj) {
                if (langObj.$map) {
                    // 将对应语言查询map
                    this.global.$lang = langObj.$map[lang] || langObj.$default;
                } else {
                    this.global.$lang = lang;
                }
                this.global.$langObj = langObj;
            },

            /*
            * 初始化语言方法配置, 私有方法
            */
            async _initLang() {
                // 判断语言是否已经初始化, 若是, 则避免重复初始化
                if (!this.global.$lang && Object.keys(this.global.$langObj).length === 0) {
                    if (langObj && (lang || getLang)) {
                        this.setLang(getLang ? await getLang() : lang, langObj);
                    }
                }
            },

            /*
            * 初始化ViewportSize, 私有方法
            */
            _initViewportSize() {
                if (this.global.$viewportSize.height === 0 && this.global.$viewportSize.width === 0) {
                    this.global.$viewportSize = this.getViewportSize().then(size => {
                        this.global.$viewportSize = size;
                    });
                }
            }
        },

        created() {
            this._initViewportSize();
            this._initLang();
        }
    };
}
