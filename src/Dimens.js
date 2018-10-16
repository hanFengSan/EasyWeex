import WeexAPI from './WeexAPI';

// 屏幕宽度(dp), web端写死, 不推荐使用
export const SCREEN_WIDTH_DP = dp(weex.config.viewport || 375);

// 屏幕宽度(px), Web端写死750px
export const SCREEN_WIDTH_PX = weex.config.env.platform === 'Web' ? '750px' : px(weex.config.env.deviceWidth);

let viewportSize = null;
export async function getViewportSize() {
    if (!viewportSize) {
        let rect = await WeexAPI.getComponentRect('viewport');
        viewportSize = { height: dp(rect.height), width: dp(rect.width) };
    }
    return viewportSize;
}

// 逻辑像素与实际物理像素比
export const PIXEL_RATIO = weex.config.env.platform === 'Web' ? 2 : Number(weex.config.env.scale);

// 对应web上html根节点的font-size, 形成1rem等于iphone6设计稿中的1px
export const REM_RATIO = (weex.config.viewport || 375) * 0.5 / 375;

/* 带单位数值转换为实际显示的数值, 实际像素值输出是weex的px单位,等于EasyWeex的dp单位
* dp: 逻辑像素
* px: 物理像素
* rem: 相对于物理设备宽度的等比缩放像素
*/
export function convertUnit(value) {
    if (/^([0-9]|\.)*?px$/.test(value)) {
        return Number(value.replace('px', '')) / PIXEL_RATIO + 'px';
    }
    if (/^([0-9]|\.)*?dp$/.test(value)) {
        return value.replace('dp', '') + 'px';
    }
    if (/^([0-9]|\.)*?rem$/.test(value)) {
        return Number(value.replace('rem', '')) * REM_RATIO + 'px';
    }
    return value;
}

// 带单位数值转为dp
export function toDP(value) {
    return convertUnit(value).replace('px', 'dp');
}

// 带单位数值转为纯数值
export function getVal(val) {
    return Number(val.replace(/(px|rem|dp)/, ''));
}

// 数值转化为dp
export function dp(val) {
    return (val || 0) + 'dp';
}

// 数值转化为px
export function px(val) {
    return (val || 0) + 'px';
}

// 数值转化为rem
export function rem(val) {
    return (val || 0) + 'rem';
}

export function getUnit(val) {
    return val.replace(/^([0-9]|\.)*/, '');
}

/* eslint-disable no-eval */
// 提供对各种单位的四则运算能力
export function calc(exp) {
    let parsedExp = exp.replace(/(([0-9]([0-9]|\.)*?[0-9]|[0-9]))(rem|px|dp)/g, val => getVal(toDP(val)));
    return dp(eval(parsedExp));
}

export function transformStr(str) {
    return str.replace(/(([0-9]([0-9]|\.)*?[0-9]|[0-9]))(rem|px|dp)/g, val => convertUnit(val));
}

// 注入到vue的methods方法集
export const methods = {
    px,
    dp,
    rem,
    getVal,
    getUnit,
    toDP,
    calc,
    getViewportSize,
    transformStr
};

// 注入到vue的computed方法集
export const constants = {
    SCREEN_WIDTH_DP: () => SCREEN_WIDTH_DP,
    SCREEN_WIDTH_PX: () => SCREEN_WIDTH_PX,
    PIXEL_RATIO: () => PIXEL_RATIO,
    REM_RATIO: () => REM_RATIO
};
