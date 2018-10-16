import Util from './util/Util';
import WeexAPI from './WeexAPI';

let lastLang = null;
let lastLangObj = null;

class I18n {
    /*
    * 翻译, 返回一个翻译函数
    * lang: String, 语言种类
    * langObj: Object, 符合规范的多语言文件Object
    * key: String, 翻译项名称
    * options: Object, 模板替换, 替换模板上对应的{key}为value
    */
    translate(lang, langObj) {
        lastLang = lang;
        lastLangObj = langObj;
        return (key, options) => {
            if (!langObj) {
                WeexAPI.warn('langObj is null', 'i18n');
                return '';
            }
            if (!lang) {
                WeexAPI.warn('lang is null', 'i18n');
                return '';
            }
            let value = langObj[key];
            if (!value) {
                WeexAPI.warn(`[${key}]: value is null`, 'i18n');
                return '';
            }
            let str = langObj[key][lang];
            if (!str) {
                WeexAPI.warn(`[${key}][${lang}]: lang str is null`, 'i18n');
                return '';
            }
            return str.replace(/\{.*?\}/g, rep => options[rep.replace(/(\{|\})/g, '')] || '');
        };
    }

    /*
    * translate的同步实现, 避免语言种类异步获取慢导致的问题
    * key和options参考translate, times是循环的次数, 一次50ms, 默认20次, 即最多等待1s, 若仍无结果则返回空字符串.
    * 不提供动态变化更改
    */
    async translateSync(key, options = {}, lang = lastLang, langObj = lastLangObj, times = 20) {
        lastLang = lang;
        lastLangObj = langObj;
        while (times--) {
            if (lastLangObj && lastLang) {
                return this.translate(lastLang, lastLangObj)(key, options);
            } else {
                await Util.sleep(50);
                console.log('wait');
            }
        }
        return '';
    }
}

const i18n = new I18n();
export default i18n;
