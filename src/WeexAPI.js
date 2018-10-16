import Timer from './util/Timer';
import { global } from './index';

const modal = weex.requireModule('modal');
const dom = weex.requireModule('dom');
const weexFetch = weex.requireModule('stream').fetch;
const globalEvent = weex.requireModule('globalEvent');

export default {
    /*
    * 弹窗提示信息
    * info: 消息主体
    * okTitle: 确定键标题, Android 默认为OK
    */
    alert(info, okTitle, duration = 3) {
        let message;
        if (typeof info === 'object') {
            message = JSON.stringify(info).replace(/,/g, ',\n');
        } else {
            message = info;
        }
        console.log('%c[alert]', 'color:red', message);
        if (!okTitle && weex.config.env.platform === 'android') {
            okTitle = 'OK';
        }
        if (!okTitle) {
            this.noWeb(() => modal.alert({ message, duration }));
        } else {
            this.noWeb(() => modal.alert({ message, okTitle, duration }));
        }
    },

    /*
    * 显示toast消息
    */
    toast(info, duration = 3) {
        let message;
        if (typeof info === 'object') {
            message = JSON.stringify(info).replace(/,/g, ',\n');
        } else {
            message = info;
        }
        console.log('%c[toast]', 'color:red', message);
        modal.toast({ message, duration });
    },

    async _log(message, level, ...tag) {
        // 开发环境才打日志
        if (global.NODE_ENV !== 'development') {
            return;
        }
        tag.splice(0, 0, weex.config.env.platform);
        // 将log信息打印到 weex debug page上
        this.inWeb(() => {
            let log = [console.log, console.warn, console.error][level];
            log(message, '---', `level:${level}`, ...tag);
        });
        this.noWeb(() => {
            this.fetch({
                method: 'POST',
                url: weex.config.bundleUrl.match(/https?:\/\/([0-9]|[a-zA-Z]|\.|-)*/)[0] + ':8100/log',
                type: 'json',
                body: JSON.stringify({ tag, level, message })
            });
        });
    },

    /*
    * 打印info日志, 需要开启weex debug page
    */
    info(message, ...tag) {
        this._log(message, 0, ...tag);
    },

    /*
    * 打印info日志, 需要开启weex debug page
    */
    warn(message, ...tag) {
        this._log(message, 1, ...tag);
    },

    /*
    * 打印info日志, 需要开启weex debug page
    */
    error(message, ...tag) {
        this._log(message, 2, ...tag);
    },

    /*
    * 获取节点的位置以及长宽信息
    */
    async getComponentRect(ref) {
        let getRect = ref =>
            new Promise((resolve, reject) => {
                dom.getComponentRect(ref, res => {
                    // android下获取rect有延迟, 以及有可能数值全为0, 所以hack. 值全为0的组件, 不要用这个接口
                    if (res && res.result && res.size.width + res.size.height + res.size.top + res.size.bottom + res.size.left + res.size.right !== 0) {
                        resolve(res.size);
                    } else {
                        resolve(null);
                    }
                });
            });
        for (let i = 0; i < 100; i++) {
            let res = await getRect(ref);
            if (res) {
                return res;
            } else {
                await Timer.sleep(20);
            }
        }
        return null;
    },

    /*
    * 获取节点的信息,传入ref名称. el需要序列化, 否则赋值到data中, computed使用后, 会存在循环引用, 导致weex下次加载失败
    */
    async ref(name) {
        let el = (this.$refs || {})[name];
        let rect = await this.getComponentRect(el);
        return { rect };
    },

    // 自动打印输出点
    debug() {
        if (!this._debug_index) {
            this._debug_index = 0;
        }
        this._debug_index++;
        this.alert('debug: ' + this._debug_index);
    },

    // 非Web平台则执行函数
    noWeb(fn) {
        if (weex.config.env.platform !== 'Web') {
            fn();
        }
    },

    inWeb(fn) {
        if (weex.config.env.platform === 'Web') {
            fn();
        }
    },

    inAndroid(fn) {
        if (weex.config.env.platform === 'android') {
            fn();
        }
    },

    inIOS(fn) {
        if (weex.config.env.platform === 'iOS') {
            fn();
        }
    },

    /*
    * 网络请求封装, promise化以及自动填入timeout, 自动超时reject
    */
    fetch(option) {
        return new Promise((resolve, reject) => {
            let state = 0; // 0: 请求中, 1: 已成功, 2: 已失败
            if (!option.timeout) {
                option.timeout = 15000;
            }
            weexFetch(option, res => {
                if (state !== 2) {
                    resolve(res);
                }
            });
            setTimeout(() => {
                if (state !== 1) {
                    reject(new Error('fetch timeout'));
                }
            }, option.timeout);
        });
    },

    /*
    * 自动重试的fetch, 避免网络波动
    */
    async autoFetch(option, retryTimes = 2) {
        let error = new Error('Time out');
        for (let i = 0; i < retryTimes; i++) {
            try {
                let result = await this.fetch(option);
                return result;
            } catch (e) {
                error = e;
            }
        }
        throw error;
    },

    /*
    * 从$refs的变量中获取element
    * bindingX用
    */
    getEl(el) {
        if (weex.config.env.platform === 'Web') {
            return el;
        } else {
            return el.ref;
        }
    },

    listenGlobalEvent(eventName, callback = () => {}) {
        globalEvent.addEventListener(eventName, callback);
    }
};
