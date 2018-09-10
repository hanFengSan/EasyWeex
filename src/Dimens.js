// import WeexAPI from './WeexAPI'

// 屏幕宽度(dp), web端写死, 不推荐使用
export const SCREEN_WIDTH_DP = dp(weex.config.viewport || 375);

// 屏幕宽度(px)
export const SCREEN_WIDTH_PX = px(weex.config.env.deviceWidth);

// 逻辑像素与实际物理像素比
export const PIXEL_RATIO = weex.config.env.platform === 'Web' ? 2 : Number(weex.config.env.scale);

// 对应web上html根节点的font-size
export const REM_RATIO = (weex.config.viewport || 375) * 2 / 37.5;

/* 带单位数值转换为实际显示的数值, 实际像素值输出是weex的px单位,等于ExWeex的dp单位
dp: 逻辑像素
px: 物理像素
rem: 相对于物理设备宽度的等比缩放像素
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
    console.log(parsedExp);
    return dp(eval(parsedExp));
}

// 注入到vue的methods方法集
export const methods = {
    px,
    dp,
    rem,
    getVal,
    getUnit,
    toDP,
    calc
};

// 注入到vue的computed方法集
export const constants = {
    SCREEN_WIDTH_DP: () => SCREEN_WIDTH_DP,
    SCREEN_WIDTH_PX: () => SCREEN_WIDTH_PX,
    PIXEL_RATIO: () => PIXEL_RATIO,
    REM_RATIO: () => REM_RATIO
};
