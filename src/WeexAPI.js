import Time from './util/Time';

const modal = weex.requireModule('modal');
const dom = weex.requireModule('dom');
const fetch = weex.requireModule('stream').fetch;

export default {
    // 弹窗提示信息
    alert(info) {
        let message;
        if (typeof info === 'object') {
            message = JSON.stringify(info).replace(/,/g, ',\n');
        } else {
            message = info;
        }
        console.log('%c[alert]', 'color:red', message);
        this.noWeb(() => modal.alert({ message, duration: 0.3 }));
    },
    toast(info) {
        let message;
        if (typeof info === 'object') {
            message = JSON.stringify(info).replace(/,/g, ',\n');
        } else {
            message = info;
        }
        console.log('%c[toast]', 'color:red', message);
        modal.toast({ message, duration: 0.3 });
    },
    async _log(message, level, ...tag) {
        tag.splice(0, 0, weex.config.env.platform);
        // 将log信息打印到 weex debug page上
        let res = await this.fetch({
            method: 'POST',
            url: weex.config.bundleUrl.match(/https?:\/\/([0-9]|[a-zA-Z]|\.|-)*/)[0] + ':8100/log',
            type: 'json',
            body: JSON.stringify({ tag, level, message })
        });
        this.alert(res);
    },
    info(message, ...tag) {
        this._log(message, 0, ...tag);
    },
    warn(message, ...tag) {
        this._log(message, 1, ...tag);
    },
    error(message, ...tag) {
        this._log(message, 2, ...tag);
    },
    // 获取节点的位置以及长宽信息
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
                await Time.timeout(20);
            }
        }
        return null;
    },
    // 获取节点的信息,传入ref名称. el需要序列化, 否则赋值到data中, computed使用后, 会存在循环引用, 导致weex下次加载失败
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
    isWeb(fn) {
        if (weex.config.env.platform === 'Web') {
            fn();
        }
    },
    isAndroid(fn) {
        if (weex.config.env.platform === 'android') {
            fn();
        }
    },
    isIOS(fn) {
        if (weex.config.env.platform === 'iOS') {
            fn();
        }
    },
    fetch(option) {
        return new Promise((resolve, reject) => {
            if (!option.timeout) {
                option.timeout = 30000;
            }
            fetch(option, (res) => {
                resolve(res);
            })
        });
    }
};
