import * as Dimens from './Dimens.js';
import Fonts from './Fonts.js';
import polyfillStyle from './PolyfillStyle.js';
import WeexAPI from './WeexAPI.js';
import Time from './util/Time.js';

const global = {};

export default {
    data() {
        return {
            global
        };
    },
    computed: {
        // 注入尺寸常量
        ...Dimens.constants,
        // 注入字体常量
        ...Fonts,
        // 处理styleSheet, 转为styles, 期间完成样式的polyfill以及计算.
        styles() {
            let result = {};
            let covertStyle = name =>
                name
                    .split(/(?=[A-Z])/)
                    .join('-')
                    .toLowerCase();
            Object.keys(this.styleSheet).forEach(styleName => {
                let style = this.styleSheet[styleName];
                if (!style || /^_/.test(styleName)) return;
                if (typeof style !== 'function') {
                    result[styleName] = { _origin: style };
                    Object.keys(style).forEach(prop =>
                        polyfillStyle(prop, style[prop]).forEach(
                            ({ name, value }) => (result[styleName][covertStyle(name)] = value)
                        )
                    );
                } else {
                    result[styleName] = args => {
                        let resStyle = style(args);
                        let res = { _origin: resStyle };
                        Object.keys(resStyle).forEach(prop =>
                            polyfillStyle(prop, resStyle[prop]).forEach(
                                ({ name, value }) => (res[covertStyle(name)] = value)
                            )
                        );
                        return res;
                    };
                }
            });
            return {
                ...result,
                // 用于处理字面量式
                _of(style) {
                    if (!style) return null;
                    return {
                        _origin: style,
                        ...Object.keys(style).reduce((sum, prop) => {
                            polyfillStyle(prop, style[prop]).forEach(
                                ({ name, value }) => (sum[covertStyle(name)] = value)
                            );
                            return sum;
                        }, {})
                    };
                }
            };
        }
    },
    methods: {
        // 注入尺寸方法
        ...Dimens.methods,
        // 注入封装weex的方法
        ...WeexAPI,
        // 网页预览的rem尺寸不带单位数值, 转为weex-layout中采用的font-size=20px的iphone6尺寸,用于debug
        webRemToWeexLayoutRem(rem) {
            return (rem * 150) / 40;
        },
        getUrlParams(url) {
            let params = {};
            url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                params[key] = value;
            });
            return params;
        },
        timeout: Time.timeout
    }
};
