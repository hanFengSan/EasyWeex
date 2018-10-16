/*
* 字体集, 解决各个平台下, 字体集的差异
*/
export default {
    FONT_PingFangSC_Medium() {
        switch (WXEnvironment.platform) {
            case 'Android':
                return null;
            default:
                return 'PingFangSC-Medium';
        }
    },
    FONT_PingFangSC_Semibold() {
        switch (WXEnvironment.platform) {
            case 'Android':
                return null;
            default:
                return 'PingFangSC-Semibold';
        }
    },
    FONT_PingFangSC_Regular() {
        switch (WXEnvironment.platform) {
            case 'Android':
                return null;
            default:
                return 'PingFangSC-Regular';
        }
    },
    FONT_SFUIText_Bold() {
        return 'SFUIText-bold';
    },
    FONT_SFUIText_Regular() {
        return 'SFUIText-Regular';
    },
    FONT_Verdana() {
        return 'Verdana';
    },
    FONT_Helvetica() {
        return 'Helvetica';
    },
    FONT_DINAlternate() {
        return 'DINAlternate';
    }
};
