<template>
<div class="translate-text-container" :style="styles.container" ref="textContainer">
    <template v-for="(block, blockIndex) in blocks">
        <div v-if="block.type !== 'br'" :style="styles.textBlock" :key="blockIndex">
            <text
                :style="styles.text({highlight: highlightWords.indexOf(word) > -1, type: block.type, attrs: block.attrs })"
                v-for="(word, wordIndex) in block.words"
                @click="e => translate(e, block, blockIndex, word, wordIndex)"
                :key="wordIndex">{{ word.val }}</text>
        </div>
        <div v-if="block.type === 'br'" class="br" :style="styles.lineBreakBlock" :key="blockIndex"></div>
    </template>
</div>
</template>

<script>
import EasyWeex from '../util/EasyWeex';
import TextParser from './TextParser';
const tapWordsModule = weex.requireModule('tapWordsModule');

export default {
    name: 'TranslatableText',
    mixins: [EasyWeex()],
    props: {
        text: {
            type: String,
            default: ''
        },
        textStyle: {
            type: Object,
            default: () => ({
                _origin: {
                    fontSize: '14dp'
                }
            })
        },
        noTranslation: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            highlightWords: [],
            fontSize: '1.25rem',
            textContainerRect: {}
        };
    },
    computed: {
        blocks() {
            return new TextParser().parse(this.text);
        },
        plainText() {
            return new TextParser().getPlainText(this.text);
        },
        // 传过来的是已经处理过了的style, 需要取_origin
        style() {
            let result = this.textStyle._origin;
            // 如果没有设置font-size, 则设置一个默认值
            if (!result.fontSize) {
                result.fontSize = '14dp';
            }
            return result;
        },
        styleSheet() {
            return {
                container: {
                    ...this.style,
                    textAlign: 'center',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                    overflow: 'hidden',
                    justifyContent: { center: 'center', left: 'flex-start', right: 'flex-end' }[this.style.textAlign]
                },
                textBlock: {
                    flexDirection: 'row'
                },
                lineBreakBlock: {
                    height: '1px',
                    width: '1000dp'
                },
                text: ({ highlight, type, attrs }) => {
                    let result = {
                        color: this.style.color,
                        lines: this.style.lines,
                        lineHeight: this.style.lineHeight,
                        fontWeight: this.style.fontWeight,
                        textDecoration: this.style.textDecoration,
                        fontSize: this.style.fontSize,
                        fontStyle: this.style.fontStyle,
                        fontFamily: this.style.fontFamily,
                        textOverflow: this.style.textOverflow,
                        noTranslation: this.noTranslation,
                        // padding: '0 ' + this.getVal(this.style.fontSize) * 0.16 + this.getUnit(this.style.fontSize),
                        background: highlight ? 'rgba(251, 197, 121, 0.4)' : null
                    };
                    switch (type) {
                        case 'em':
                            result.color = '#949494';
                            break;
                        case 'b':
                            result.fontWeight = 'bold';
                            break;
                        case 'i':
                            result.fontStyle = 'italic';
                            break;
                        case 'u':
                            result.textDecoration = 'underline';
                            break;
                        case 'del':
                            result.textDecoration = 'line-through';
                            break;
                    }
                    attrs.forEach(attr => {
                        result[attr.key] = attr.val;
                    });
                    return result;
                }
            };
        }
    },
    methods: {
        translate(e, block, blockIndex, word, wordIndex) {
            // 判断全局点词翻译开关&单词翻译属性
            if (!this.noTranslation && !block.attrs.find(i => i.key === 'noTranslation') && word.translatable) {
                console.log(word);
                e.stopPropagation();
                this.highlight(block, blockIndex, word, wordIndex);
                this.noWeb(() => tapWordsModule.selectedWord(this.highlightWords.map(i => i.val).join(''), this.plainText, () => {}));
            }
        },
        highlight(block, blockIndex, word, wordIndex) {
            // 移除其他单词的高亮
            if (this.global.removeTranslateHighLight) {
                this.global.removeTranslateHighLight();
            }
            // 设置高亮
            this.highlightWords = [];
            let startBlock = block;
            let endBlock = block;
            while (startBlock.linkPrev) {
                startBlock = this.blocks[this.blocks.indexOf(startBlock) - 1];
            }
            while (endBlock.linkNext) {
                endBlock = this.blocks[this.blocks.indexOf(endBlock) + 1];
            }
            let words = [];
            for (let i = this.blocks.indexOf(startBlock); i <= this.blocks.indexOf(endBlock); i++) {
                words = words.concat(this.blocks[i].words);
            }
            let startWord = word;
            while (true) {
                if (words.indexOf(startWord) !== 0) {
                    let nextWord = words[words.indexOf(startWord) - 1];
                    if (nextWord.translatable) {
                        startWord = nextWord;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            let endWord = startWord;
            while (endWord.translatable) {
                this.highlightWords.push(endWord);
                if (words.indexOf(endWord) !== words.length - 1) {
                    endWord = words[words.indexOf(endWord) + 1];
                } else {
                    break;
                }
            }
            // 注册移除方法到全局
            this.global.removeTranslateHighLight = () => {
                this.global.removeTranslateHighLight = null;
                this.highlightWords = [];
            };
        }
    }
};
</script>
