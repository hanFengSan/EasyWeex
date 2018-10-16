import * as Dimens from './Dimens';

function border(val, type) {
    let result = [];
    let params = val.split(' ');
    let borderStyle = params.find(i => ['solid', 'dashed', 'dotted'].includes(i)) || 'solid';
    result.push({ name: `border${type}Style`, value: borderStyle });
    let borderWidth = params.find(i => /(px|dp|rem)$/.test(i)) || 0;
    result.push({ name: `border${type}Width`, value: borderWidth });
    let borderColor = params.find(i => i !== borderStyle && i !== borderWidth) || '#000000';
    result.push({ name: `border${type}Color`, value: borderColor });
    return result;
}

function margin(val) {
    let result = [];
    let params = val.split(' ');
    switch (params.length) {
        case 1:
            result.push({ name: 'marginLeft', value: params[0] });
            result.push({ name: 'marginRight', value: params[0] });
            result.push({ name: 'marginTop', value: params[0] });
            result.push({ name: 'marginBottom', value: params[0] });
            break;
        case 2:
            result.push({ name: 'marginLeft', value: params[1] });
            result.push({ name: 'marginRight', value: params[1] });
            result.push({ name: 'marginTop', value: params[0] });
            result.push({ name: 'marginBottom', value: params[0] });
            break;
        case 4:
            result.push({ name: 'marginTop', value: params[0] });
            result.push({ name: 'marginRight', value: params[1] });
            result.push({ name: 'marginBottom', value: params[2] });
            result.push({ name: 'marginLeft', value: params[3] });
            break;
    }
    return result;
}

function padding(val) {
    let result = [];
    let params = val.split(' ');
    switch (params.length) {
        case 1:
            result.push({ name: 'paddingLeft', value: params[0] });
            result.push({ name: 'paddingRight', value: params[0] });
            result.push({ name: 'paddingTop', value: params[0] });
            result.push({ name: 'paddingBottom', value: params[0] });
            break;
        case 2:
            result.push({ name: 'paddingLeft', value: params[1] });
            result.push({ name: 'paddingRight', value: params[1] });
            result.push({ name: 'paddingTop', value: params[0] });
            result.push({ name: 'paddingBottom', value: params[0] });
            break;
        case 4:
            result.push({ name: 'paddingTop', value: params[0] });
            result.push({ name: 'paddingRight', value: params[1] });
            result.push({ name: 'paddingBottom', value: params[2] });
            result.push({ name: 'paddingLeft', value: params[3] });
            break;
    }
    return result;
}

function background(val) {
    return [{ name: 'backgroundColor', value: val }];
}

function fontSize(val) {
    return [{ name: 'fontSize', value: Math.round(Dimens.methods.getVal(Dimens.toDP(val))) + 'dp' }];
}

function transform(val) {
    return [{ name: 'transform', value: Dimens.methods.transformStr(val) }];
}

function transformOrigin(val) {
    return [{ name: 'transformOrigin', value: Dimens.methods.transformStr(val) }];
}

function transition(val) {
    return [{ name: 'transition', value: Dimens.methods.transformStr(val) }];
}

/*
* 样式处理
*/
export default function polyfillStyle(name, value) {
    let result = [];
    if (value === null || value === undefined) {
        return [];
    }
    switch (name) {
        case 'border':
            result = border(value, '');
            break;
        case 'borderLeft':
            result = border(value, 'Left');
            break;
        case 'borderRight':
            result = border(value, 'Right');
            break;
        case 'borderTop':
            result = border(value, 'Top');
            break;
        case 'borderBottom':
            result = border(value, 'Bottom');
            break;
        case 'margin':
            result = margin(value);
            break;
        case 'padding':
            result = padding(value);
            break;
        case 'background':
            result = background(value);
            break;
        case 'fontSize':
            result = fontSize(value);
            break;
        case 'transform':
            result = transform(value);
            break;
        case 'transformOrigin':
            result = transformOrigin(value);
            break;
        case 'transition':
            result = transition(value);
            break;
        default:
            result.push({ name, value });
    }
    return result.map(i => ({ name: i.name, value: Dimens.convertUnit(i.value) }));
}
