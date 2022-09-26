const theme = {
    chalk: {
        //背景颜色
        backgroundColor:'#161522',
        //标题文字颜色
        titleColor:'#ffffff',
        //左上角logo图标路径
        // logoSrc:'logo_dark.png',
        //切换主题按钮的图片路径
        themeSrc:'qiehuan_dark.png',
        //页面顶部的边框图片
        headerBorderSrc:'header_border_dark.png',
        sellerAxisPointerColor: '#2D3443',
    },
    vintage: {
        //背景颜色
        backgroundColor:'#eeeeee',
        //标题文字颜色
        titleColor:'#000000',
        //左上角logo图标路径
        // logoSrc:'logo_light2.png',
        //切换主题按钮的图片路径
        themeSrc:'qiehuan_light.png',
        //页面顶部的边框图片
        headerBorderSrc:'header_border_light.png',
        sellerAxisPointerColor: '#f1f2f6',
    },
}

export function getThemeValue (themeName) {
    return theme[themeName]
}