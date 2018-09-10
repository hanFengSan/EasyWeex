export default {
    FONT_PingFangSC_Medium() {
        switch (WXEnvironment.platform) {
            case 'Android':
                return 'sans-serif';
            default:
                return 'PingFangSC-Medium';
        }
    },
    FONT_Verdana() {
        return 'Verdana';
    }
};
