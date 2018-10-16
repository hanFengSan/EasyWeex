import Timer from './Timer';

export default {
    /*
    * 延迟执行函数, 等待指定时间, 用于async/await
    * 使用: await sleep(number); number为毫秒
    */
    sleep: Timer.sleep,

    /*
    * 节流
    * fn: 执行的函数, time: 节流间隔(ms), 默认500ms
    */
    throttle(fn, time = 300) {
        let timer;
        return function(...args) {
            if (timer == null) {
                fn.apply(this, args);
                timer = setTimeout(() => {
                    timer = null;
                }, time);
            }
        };
    }
};
