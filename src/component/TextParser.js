/*
    @author: Alex chen
    @desc: 将文本切分为可布局的独立块, 独立块内切割出单词
    @warn: 输入的文本, '<'需要转义为'&lt;', '&'需要转移为'&amp;', 支持\n换行, 但\n不能包裹在任何标签里
    @usage: 1. 调用parse方法, return: [
            { // 可用于布局的独立块
                type: String, // 标签类型, 无标签类型则为plain
                words: [ { val: String, translatable: Boolean }, ...], // 独立块的单词切割
                attrs: [ { key: String, val: String }], // 标签的属性key-value数组
                linkPrev: Boolean, // 是否和前面的独立块连起来的, 用于'-'连词符
                linkNext: Boolean, // 是否和后面的独立块连起来的, 用于'-'连词符
            },
            ...
        ]
        2. 在富文本的标签内填入unify属性, 可以让整个标签的内容作为整一个独立块
*/
export default class TextParser {
    _init() {
        this._textList = []; // 独立文本数组
        this._stack = []; // 字符栈, 存储字符
        this._tagStack = []; // 标签栈, 推入<em ...>或</em>等, 用于解析标签
        this._type = 'plain'; // 类型
        this._attrs = []; // 属性列表
        this._linkPrev = false; // 用于判断是否需要标识连接前面的独立文本, 用于'-'分词处理
    }

    _popStack(linkNext) {
        if (this._stack.length > 0) {
            this._textList.push({ type: this._type, words: this._parseWord(this._stack), attrs: this._attrs, linkPrev: this._linkPrev, linkNext: linkNext || false });
            this._linkPrev = false;
            this._stack = [];
        }
    }

    /*
    * 添加换行符
    */
    _addLineBreak() {
        this._linkPrev = false;
        this._textList.push({ type: 'br', words: [], attrs: [], linkPrev: this._linkPrev, linkNext: false });
    }

    _handleTagStack(char) {
        // 解析标签
        this._tagStack.push(char);
        if (char === '>') {
            let tagText = this._tagStack.join('');
            this._tagStack = [];
            let result = this._parseTag(tagText);
            this._type = result.type;
            this._attrs = result.attrs;
        }
    }

    _handleSpace(char, isAlignRight) {
        if (!isAlignRight) {
            this._stack.push(char);
            this._popStack();
        } else {
            this._popStack();
            this._stack.push(char);
        }
    }

    /*
    @desc: 将文本切分为可布局的独立块, 独立块内切割出单词
    @warn: 输入的文本, '<'需要转义为'&lt;', '&'需要转移为'&amp;', 支持\n换行, 但\n不能包裹在任何标签里
    @return: [
        { // 可用于布局的独立块
            type: String, // 标签类型, 无标签类型则为plain
            words: [ { val: String, translatable: Boolean }, ...], // 独立块的单词切割
            attrs: [ { key: String, val: String }], // 标签的属性key-value数组
            linkPrev: Boolean, // 是否和前面的独立块连起来的, 用于'-'连词符
            linkNext: Boolean, // 是否和后面的独立块连起来的, 用于'-'连词符
        },
        ...
    ]
    */
    parse(text, isAlignRight) {
        let chars = text.split('');
        this._init();
        // 扫描字符数组
        for (let i = 0; i < chars.length; i++) {
            let char = chars[i];
            if (this._tagStack.length > 0) {
                this._handleTagStack(char);
            } else {
                switch (char) {
                    // 遇到空格则添加一个独立部分
                    case ' ':
                        this._handleSpace(char, isAlignRight);
                        break;
                    // 遇到标签开始标志则清空字符栈, 推入标签栈
                    case '<':
                        this._popStack();
                        this._tagStack.push(char);
                        break;
                    case '\n':
                        // 解析换行符
                        this._popStack();
                        this._addLineBreak();
                        // 扫描后面是否有连续的换行符
                        let t = i;
                        while (t < chars.length - 1) {
                            let nextChar = chars[++t];
                            if (nextChar === '\n') {
                                // 填充一个空格后再添加换行符, 因为多个连续换行符在一起时, 间隔之间需要空一行, 用空格撑开
                                this._stack.push(' ');
                                this._popStack();
                                this._addLineBreak();
                                i = t;
                            } else {
                                break;
                            }
                        }
                        break;
                    default:
                        if (char === '&') {
                            // 解析转义字符
                            let escape = '&';
                            let t = i;
                            while (t < chars.length - 1) {
                                let nextChar = chars[++t];
                                escape += nextChar;
                                if (nextChar === ';') {
                                    char = this._getOriginalChar(escape);
                                    i = t;
                                    break;
                                }
                            }
                        }
                        if (this._isInDependentChar(char)) {
                            // 独立字符独立出来
                            this._popStack();
                            this._textList.push({ type: this._type, words: [{ val: char, translatable: false }], attrs: this._attrs, linkPrev: false, linkNext: false });
                        } else if (char === '-') {
                            // 判断您是否是用于连词
                            if (i > 0 && i < chars.length - 1) {
                                let prevCharCode = chars[i - 1].toLowerCase().charCodeAt(0);
                                let nextCharCode = chars[i + 1].toLowerCase().charCodeAt(0);
                                // 前后都是字母
                                if (prevCharCode >= 97 && prevCharCode <= 122 && nextCharCode >= 97 && nextCharCode <= 122) {
                                    // -用于分词, 不和后面的字符连起来
                                    this._stack.push(char);
                                    this._popStack(true);
                                    this._linkPrev = true;
                                } else {
                                    this._stack.push(char);
                                }
                            } else {
                                this._stack.push(char);
                            }
                        } else if (char === '(') {
                            // '('单独起一个独立块, 不和前面连起来
                            this._popStack();
                            this._stack.push(char);
                        } else if (char === '/') {
                            // '/'单独截断一个独立块, 不和后面连起来
                            this._stack.push(char);
                            this._popStack();
                        } else {
                            if (char) {
                                this._stack.push(char);
                            }
                        }
                }
            }
        }
        if (this._stack.length > 0) {
            this._popStack();
        }
        return this._textList;
    }

    // 解析标签<..>内部的内容
    _parseTag(tagText) {
        tagText.match(/^<(.*?)(?=(\s|>))/);
        let type = RegExp.$1.replace('/', '');
        if (/^<[^/].*?>$/.test(tagText)) {
            let attrs = [];
            // 处理<em style="font-size: 16px"></em>形式的属性
            let attrTextList = tagText.match(/\s([a-z]|-|[A-Z])*?=".*?"/g);
            if (attrTextList) {
                attrTextList.forEach(i => {
                    let strList = i.split('"');
                    attrs.push({
                        // 修减key以及转化为 camelCase
                        key: strList[0].replace(/(=|\s)/g, '').replace(/-[a-z]/gi, str => str[1].toUpperCase()),
                        val: strList[1]
                    });
                });
            }
            // 处理<em plain></em>形式的属性
            attrTextList = tagText.match(/\s([a-z]|-)*?(?=(\s|>))/gi);
            if (attrTextList) {
                attrTextList.forEach(i => {
                    attrs.push({ key: i.trim().replace(/-[a-z]/gi, str => str[1].toUpperCase()), val: true });
                });
            }
            return { type, attrs };
        } else if (/^<\/.*?>$/.test(tagText)) {
            return { type: 'plain', attrs: [] };
        } else {
            return { type: 'plain', attrs: [] };
        }
    }

    // 判断是否是独立字符, 即中日韩字符等需要独立换行的表意字符或emoji表情
    _isInDependentChar(char) {
        let code = char.charCodeAt(0);
        return (
            (code >= 0x3400 && code <= 0x4db5) || // CJK Unified Ideographs Extension A
            (code >= 0x4e00 && code <= 0x9fa5) || // CJK Unified Ideographs
            (code >= 0x9fa6 && code <= 0x9fbb) || // CJK Unified Ideographs
            (code >= 0xf900 && code <= 0xfa2d) || // CJK Compatibility Ideographs
            (code >= 0xfa30 && code <= 0xfa6a) || // CJK Compatibility Ideographs
            (code >= 0xfa70 && code <= 0xfad9) || // CJK Compatibility Ideographs
            (code >= 0x20000 && code <= 0x2a6d6) || // CJK Unified Ideographs Extension B
            (code >= 0x2f800 && code <= 0x2fa1d) ||
            (code >= 0x3040 && code <= 0x309f) || // 日文平假名
            (code >= 0x30a0 && code <= 0x30ff) || // 日文平假名
            (code >= 0x31f0 && code <= 0x31ff) || // 日文片假名语音扩展
            (code >= 0xac00 && code <= 0xd7af) || // 朝鲜文音节
            (code >= 0x1100 && code <= 0x11ff) || // 朝鲜文
            (code >= 0x3130 && code <= 0x318f) || // 朝鲜文兼容字母
            (code >= 0x1f601 && code <= 0x1f64f) || // emoji: 表情
            (code >= 0x2702 && code <= 0x27b0) || // emoji: 装饰符
            (code >= 0x1f680 && code <= 0x1f6c0) || // emoji: 交通标识
            (code >= 0x24c2 && code <= 0x1f251) || // emoji: Enclosed characters
            (code >= 0x1f004 && code <= 0x1f5ff) || // emoji Uncategorized
            (code >= 0x1f600 && code <= 0x1f636) || // emoji: Additional emoticons
            (code >= 0x1f681 && code <= 0x1f6c5) || // emoji: Additional Additional transport and map symbols
            (code >= 0x1f30d && code <= 0x1f567) // emoji: Other additional symbols
        );
    }

    // 从独立文本中抽选出可翻译项
    _parseWord(textStack) {
        let result = [];
        let wordStack = [];
        let otherStack = [];
        textStack.forEach(char => {
            let code = char.toLowerCase().charCodeAt(0);
            // 是否是英文字符或者连字符
            if ((code >= 97 && code <= 122) || (wordStack.length > 0 && char === '-')) {
                wordStack.push(char);
                if (otherStack.length > 0) {
                    result.push({ val: otherStack.join(''), translatable: false });
                    otherStack = [];
                }
            } else {
                otherStack.push(char);
                if (wordStack.length > 0) {
                    result.push({ val: wordStack.join(''), translatable: true });
                    wordStack = [];
                }
            }
        });
        if (wordStack.length > 0) {
            result.push({ val: wordStack.join(''), translatable: true });
        }
        if (otherStack.length > 0) {
            result.push({ val: otherStack.join(''), translatable: false });
        }
        return result;
    }

    // 还原转义字符
    _getOriginalChar(text) {
        text = text.replace(/(&lt;)/g, '<');
        text = text.replace(/(&amp;)/g, '&');
        text = text.replace(/&.*?;/g, ''); // 删除无效的转义字符
        return text;
    }

    // 从富文本从获取纯文本
    getPlainText(text) {
        text = text.replace(/<.*?>/g, '');
        text = this._getOriginalChar(text);
        return text;
    }
}
