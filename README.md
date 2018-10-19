# EasyWeex
一个简单的Weex工具库, 提供一些简单的功能封装.

## Feature
* 提供rem, dp和px三种单位
* 提供类似Rect的样式编写体验, 可在方便样式内进行各种单位计算
* I18n实现
* 提供一些简单的style支持, 比如border, margin, padding的简写支持
* 提供一些weex api的便捷封装
* 便捷的存储实现

## 使用
安装:
```JavaScript
# bash
npm install https://github.com/hanFengSan/EasyWeex.git
# vue文件
import EasyWeex from 'EasyWeex';
export default {
    mixins: [EasyWeex()]
}

```

## 样式编写示例
```Vue
<template>
    <div :style="styles.container">
        <text :style="styles.text"></text>
        <text :style="styles.colorText('red')"></text>
    </div>
</template>

<script>
import EasyWeex from 'EasyWeex';

export default {
    mixins: [EasyWeex()],
    computed: {
        styleSheet: {
            return {
                container: {
                    width: '100dp',
                    height: '100dp',
                    background: 'red'
                },
                text: {
                    color: 'red'
                },
                colorText: (color) => ({
                    color
                })
            }
        }
    }
}
</script>

```

## 样式使用说明
在`computed`属性中声明styleSheet变量, 并return一个样式表即可在template中使用styles变量去索引对应的样式项.
EasyWeex会实时将styleSheet里声明的样式表进行运算, 生成可用的style, 注入到styles中供使用.
### 样式名称格式
样式名称的命名方式都为小骆驼峰式, EasyWeex在转换样式时, 会将其转换为kebab-case格式.
例:
```
margin-top => marginTop
justify-content => justifyContent
```
### 样式尺寸单位
EasyWeex支持三种尺寸单位, px/rem/dp.
* rem的参考iphone6的750px, 即750rem为全屏宽度.
* dp为逻辑像素, 对应ios上的pt和android上的dp.
* px为实际像素.
EasyWeex在底层会将三种单位给转为dp.
**注意: 字体的尺寸fontSize在android上无法支持小数, 由于EasyWeex底层是转化为dp, 所以实际上设置的fontSize的对应的dp值的四舍五入值**
### 方便样式计算的全局变量
以下变量在vue文件中, 是直接注入到this变量中, 可以直接使用:
```JavaScript
this.SCREEN_WIDTH_DP // 屏幕宽度, dp单位, 例:'365dp'
this.SCREEN_WIDTH_PX // 屏幕宽度, px单位, 例: '750px'
this.global.$viewportSize.height // weex渲染面积的高度, dp单位. 在渲染出weex后获取, 存在延迟, 但这个是vue watch了的值, 可以直接用于computed中, 获取后自动刷新.
this.global.$viewportSize.width // weex渲染面积的宽度, dp单位, 异步, 同this.global.$viewportSize.height
```
 在js文件中需要使用的话, 需要import:
 ```JavaScript
import { Dimens } from 'EasyWeex';

console.log(this.SCREEN_WIDTH_DP);
 ```
 ### 尺寸运算
 `this.calc`提供类似css3中calc的计算能力, 通过编写表达式, 数值更新时, 自动变化. 支持简单的四则运算和单位混合运算, 示例:
 ```JavaScript
styleSheet: {
    return {
        container: {
            width: this.calc(`${this.SCREEN_WIDTH_DP} / 2`), // 取屏幕的一半宽度
            height: this.calc(`${this.SCREEN_WIDTH_DP} + 200rem - (40px * 2 + 10dp)`), // 单位混合运算
            background: 'red'
        },
        text: {
            color: 'red'
        }
    }
}
 ```
### 字面量声明
通过`styles.$of`方法, 实现字面量声明EasyWeex的样式.
```Vue
<template>
    <div :style="styles.$of({ marginTop: '200rem' })"></div>
</template>
```

### 样式方法
除了定义Object外, 还可以定义Function, 通过传参, 达到动态调整样式的功能. 比如在一个列表项的渲染中需要通过index来判断具体样式时, 这个就很有用, 例如通过index来判断标题颜色:
```Vue
<template>
    <div :style="styles.list" v-for="(item, index) for array">
        <text :style="styles.colorTitle(index)">{{ item.title }}</text>
    </div>
</template>

<script>
import EasyWeex from 'EasyWeex';

export default {
    mixins: [EasyWeex()],
    computed: {
        styleSheet: {
            return {
                colorTitle: (index) => ({
                    color: index === 0 ? 'red' : 'green'
                })
            }
        }
    }
}
</script>

```

### 样式混合
多种样式, 可通过`styles.$merge`进行混合:
```Vue
<template>
    <div :style="styles.$merge(styles.test, styles.test2)"></div> // 混合test和test2的样式
</template>
```
### 支持的样式简写
* 支持background-color简写为background
* 支持margin, padding的简写, 例: 
```JavaScript
styleSheet: {
    return {
        container: {
            margin: '10dp',
            margin: '10dp 10dp',
            margin: '10dp 10dp 10dp 10dp'
        }
    }
}
```
* 支持border的简写, 例:
```JavaScript
styleSheet: {
    return {
        container: {
            border: '1px solid #ccc',
            borderLeft: '1px solid #ccc',
            borderRight: '1px solid #ccc',
            borderTop: '1px solid #ccc',
            borderBottom: '1px solid #ccc'
        }
    }
}
```

## 多语言支持
EasyWeex内置了多语言支持, 且支持模板替换, 使用示例:
```Vue
// template中
<text>{{ $t('MY_LESSONS') }}</test>
<text>{{ $t('LESSON_COUNT', { num: 4 }) }}</test>
// js中
this.$t('MY_LESSONS');
this.$t('LESSON_COUNT', { num: 4 });
```
### 多语言文件
使用EasyWeex的多语言支持, 首先得编写一个js多语言文件:
```JavaScript
// 示例js文件:
export default {
    $default: 'en', // 默认的语言种类key
    $map: {
        // 语言映射, 传进来的语言种类昵称要映射到哪个简写key
        Chinese: 'zh',
        Chinese_yy: 'zh',
        English: 'en',
        Japanese: 'jp',
        Turkish: 'tr',
        Portuguese: 'pt'
    },
    MY_LESSONS: { // key名称
        en: 'My lesson',
        zh: '我的课程'
    },
    LESSON_COUNT: { 
        en: '{num} lessons', // {num}可以被传进来的{ num: 4 }替换, 若是没有可替换的配置, 默认删除.
        zh: '共{num}节课'
    },
}
```
EasyWeex中引入:

```JavaScript
// vue文件
import EasyWeex from 'EasyWeex';
import langFile from 'lang.js'; // 编写的js多语言文件
export default {
    mixins: [EasyWeex({ langObj: langFile, lang: 'en' })] // 启用english的多语言翻译
}
// 如果要使用的语言种类, 需要异步获取, 可以编写getLang方法, 提供一个promise来取语言种类:
export default {
    mixins: [EasyWeex({ langObj: langFile, getLang: getLang })] // getLang是一个方法, 返回一个promise, promise会resolve一个语言种类字符串
}
// getLang比lang的优先级高, 两者共存时, 使用getLang
```

## storage优化
EasyWeex提供Promise化的storage操作:
vue文件下:
```JavaScript
await this.saveItem('key', value); // value值不必是字符串, EasyWeex会序列化Object
await this.loadItem('key', value); // value值会尝试JSON.parse, 如果可以JSON.parse, 则会返回对应的结果
```
JS文件下:
```JavaScript
import { Storage } from 'EasyWeex';
await this.saveItem('key', value); // value值不必是字符串, EasyWeex会序列化Object
await this.loadItem('key', value); // value值会尝试JSON.parse, 如果可以JSON.parse, 则会返回对应的结果
```
注意, loadItem时, 如果不存在该key, 会返回undefined, 而不是错误.

## 工具类
工具类下面有两个方法:
1. throttle方法
函数式节流的实现, 默认的节流间隔是300ms
throttle(fn)
```JavaScript
vue文件:
import { default as EasyWeex, Util } from 'EasyWeex';
methods: {
    handleClick: Util.throttle(function (param) {
        this.handleParam(parm); // 直接写function可以提供有效的作用域支持, 箭头函数的作用域会混乱.
    }),
    handleClick2: Util.throttle(function (param) {
        this.handleParam(parm);
    }, 500) // 限流间隔, (ms)
}
JS文件: 
import { Util } from 'EasyWeex';
Util.throttle(...);
```
2. sleep方法
提供线程sleep的模拟, 本质上是timeout的语法糖, 最好是在async/await中编写.
```JavaScript
vue文件:
import { default as EasyWeex, Util } from 'EasyWeex';
methods: {
    async test() {
        await Util.sleep(3000); // 先沉睡3000ms再执行下面的语句
        do some things...
    }
}
JS文件:
import { Util } from 'EazyWeex';
async test() {
    await Util.sleep(3000); // 先沉睡3000ms再执行下面的语句
    do some things...
}
```

## 便捷的weex API封装以及支持
1. alert方法:
弹窗提示消息
alert(info: String|Object, okTitle: String, duration: Number)
info为字符串或Object格式, 如果是Object, 则会自动序列化, 并添加一些回车字符改善显示效果.
返回值: void
```JavaScript
// vue文件
this.alert('info'); // 弹窗提示消息
this.alert('info', 'OK'); 确认按钮的文本为OK
this.alert('info', 'OK', 3000); // 弹窗提示消息, 持续3000ms
// JS文件
import { WeeAPI } from 'EasyWeex';
WeexAPI.alert(...);
```
2. toast方法:
toast提示消息
toast(info: String|Object, duration: Number)
info为字符串或Object格式, 如果是Object, 则会自动序列化, 并添加一些回车字符改善显示效果.
返回值: void
```JavaScript
// Vue文件
this.toast('info'); // toast提示消息
this.toast('info', 3000); // toast提示消息, 持续3000ms
// JS文件
import { WeeAPI } from 'EasyWeex';
WeexAPI.toast(...);
```
3. getComponentRect方法:
获取组件的尺寸
getComponentRect(ref)
返回值: Promise<Object>, Object为{ height, width }. 纯数值, 对应dp单位.
```JavaScript
// Vue文件
await this.getComponentRect方法(this.$refs.container);
```
4. noWeb方法:
非Web平台执行方法.
noWeb(fn)
返回值: Void
```JavaScript
// vue文件

this.noWeb(() => {
    ... // 非Web平台则执行
});
// JS文件
import { WeeAPI } from 'EasyWeex';
WeeAPI.noWeb(() => {
    ... // 非Web平台则执行
});
```
5. inWeb/inAndroid/inIOS方法:
对应平台执行方法.
inWeb(fn)/inAndroid(fn)/inIOS(fn)
返回值: Void
```JavaScript
// vue文件
this.noWeb(() => {
    ... // 非Web平台则执行
});
// JS文件
import { WeeAPI } from 'EasyWeex';
WeeAPI.inWeb(() => {
    ... // Web平台则执行
});
WeeAPI.inAndroid(() => {
    ... // Android平台则执行
});
WeeAPI.inIOS(() => {
    ... // iOS平台则执行
});
```
**注意: 也可以通过this.global.isAndroid/this.global.isIOS/this.global.isWeb这三个Bool值来区分平台**
6. fetch方法
promise化的stream.fetch方法封装, 如果传入的option没有timeout设置, 则默认设置为15000ms. 自动超时.
fetch(option) // option对应weex的stream module的fetch方法的option
```JavaScript
// vue文件
this.fetch(option);
// JS文件
import { WeeAPI } from 'EasyWeex';
WeexAPI.fetch(option);
```
7. autoFetch方法
fetch方法的封装, 自动超时重试, 提供更可靠的网络服务.
autoFetch(option, retryTimes = 2) // option和fetch方法的一致, retryTimes为自动重试次数, 默认两次
```JavaScript
// vue文件
this.autoFetch(option);
this.autoFetch(option, 5);
// JS文件
import { WeeAPI } from 'EasyWeex';
WeexAPI.autoFetch(option);
WeexAPI.autoFetch(option, 5);
```
8. getEl方法
获取元素, 提供给bindingX使用. bindingX不能直接对着this.$refs.xxx的变量作用, 所以提供一层封装.
getEl(ref)
```
// vue文件
this.getEl(this.$refs.xxx);
// JS文件
import { WeeAPI } from 'EasyWeex';
WeexAPI.getEl(this.$refs.xxx);
```
9. listenGlobalEvent方法
添加全局事件的监听, 主要是方便操作.
listenGlobalEvent(eventName, callback = () => {})
```JavaScript
// vue文件
this.listenGlobalEvent('event', () => { console.log('event) });
// JS文件
import { WeeAPI } from 'EasyWeex';
WeeAPI.listenGlobalEvent('event', () => { console.log('event) });
```

## 日志调试
这个并没有直接没打包的发行版中, js文件位于项目的`/build/remoteDebug.js`路径.
运行`remoteDebug.js`后, 会起一个服务器, 打开对应的网页后, 网页会与服务器保持一个websocket的链接, 并且会定时发送心跳包, 实时显示是否和服务器保持活跃的连接.
打开后网页后, 在网页的console上, 会接受服务器来的日志, 并打印出来. 服务器接受post过来的日志打印请求, 并推送到网页上, 从而实现移动端日志直接打印到网页的console上, 方便调试.
### 使用步骤
1. 运行remoteDebug.js. 示例:
```
node run remoteDebug.js // 添加remoteDebug.js的真实路径
```
2. EasyWeex中调用API打印日志:
info/warn/error方法:
info/warn/error(...args) 参数为一下系列字符串或者Object, Object会自动序列化, 并在网页的控制台中自动parse
返回值: Void
info/warn/error的打印颜色各不一样.
**注意: remoteDebug.js开启的服务器的域名/ip必须和weex的bundleUrl的一致, 否则接受不到日志消息**
```JavaScript
// Vue文件
this.info('info')
this.warn('info')
this.error('info')
// JS文件
import { WeeAPI } from 'EasyWeex';
WeeAPI.info('info')
WeeAPI.warn('info')
WeeAPI.error('info')
```
## 富文本组件支持
这个并没有直接没打包的发行版中, js文件位于项目的`/src/component`路径.
`TextParser.js`提供简单的富文本解析, 具体可看文件开头的介绍.
`RichTranslatableText.vue`提供富文本解析加布局实现, 具体可看文件开头的介绍.
