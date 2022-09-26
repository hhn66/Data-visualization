<!-- 商家分布图表 -->
<template>
    <div class='com-container' @dblclick="revertMap">
      <div class='com-chart' ref='map_ref'></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'
export default {
data () {
    return {
        chartInstance: null, //图表的实例对象
        allData: null, //从服务器中获取的所有数据
        mapData: {} // 所获取的省份的地图矢量数据
    }
},
created () {
    //在组件创建完成后进行回调函数的注册
    this.$socket.registerCallBack('mapData', this.getData)
},
computed: {
    ...mapState(['theme'])
},
watch: {
    theme () {
        console.log('主题切换了')
        this.chartInstance.dispose() //销毁当前的图表
        this.initChart() //重新以最新的主题名称初始化图表对象
        this.screenAdapter() //完成屏幕的适配
        this.updateChart() //更新图表的展示

    }
},
mounted () {
    this.initChart()
    // this.getData()
    //发送数据给服务器  告诉服务器，我现在需要数据
    this.$socket.send({
        action: 'getData',
        socketType: 'mapData',
        chartName: 'map',
        value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter() //主动触发 响应式配置
},
destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    //在组件销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('mapData')
},
methods: {
    async initChart () { //初始化图表
    this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
    // 获取中国地图的矢量数据 可以通过发送网络请求获取,static/map/china.json 的数据
    // http://localhost:8999/static/map/china.json
    // 由于我们现在获取的地图矢量数据并不是位于KOA2的后台, 所以不能使用this.$http
    const ret = await axios.get('http://localhost:8999/static/map/china.json')
    this.$echarts.registerMap('china', ret.data) //注册地图数据
    const initOption = { //初始化配置项
        title: {
        text: '▎ 商家分布',
        left: 20,
        top: 20
        },
        geo: {
        type: 'map',
        map: 'china',
        top: '5%',
        bottom: '5%',
        itemStyle: {
            areaColor: '#2E72BF', //地图的填充色
            borderColor: '#333'  //省份的边框色
        }
        },
        legend: {
        left: '5%',
        bottom: '5%',
        orient: 'vertical'  //图例排版方向(竖列)
        }
    }
    this.chartInstance.setOption(initOption)
    this.chartInstance.on('click', async arg => { //进入省份事件函数 
        // 通过工具函数拿到点击的地图对应的中文拼音(key),和拼接出需要的文件路径(path)
        // arg.name 得到所点击的省份, 这个省份他是中文
        const provinceInfo = getProvinceMapInfo(arg.name)
        console.log(provinceInfo)
        // 需要获取这个省份的地图矢量数据
        // 判断当前所点击的这个省份的地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) { //不存在，发送请求获取点击的地图矢量数据
        const ret = await axios.get('http://localhost:8999' + provinceInfo.path)
        this.mapData[provinceInfo.key] = ret.data  //把请求到的数据保存下来
        this.$echarts.registerMap(provinceInfo.key, ret.data) //注册点击的地图
        }
        const changeOption = {  //配置最新的配置项
        geo: {
            map: provinceInfo.key
        }
        }
        this.chartInstance.setOption(changeOption)  //赋值给echarts实例
    })
    },
    getData (ret) { //发送请求获取数据
    // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
    // const { data: ret } = await this.$http.get('map')
    this.allData = ret
    console.log(this.allData)
    this.updateChart()
    },
    updateChart () { //更新图标配置项
    // 处理图表需要的数据
    // 图例的数据
    const legendArr = this.allData.map(item => {
        return item.name
    })
    const seriesArr = this.allData.map(item => {  //散点图的数据
        // return的这个对象就代表的是一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据, 我们需要给散点的图表增加一个配置, coordinateSystem:geo
        return {
        type: 'effectScatter',
        rippleEffect: {   // 涟漪动画效果配置
            scale: 5,   // 涟漪效果直径
            brushType: 'stroke'   // 空心的涟漪动画效果
        },
        name: item.name, //图例的name需要与series的name相同
        data: item.children, 
        coordinateSystem: 'geo'  // 让散点图使用地图坐标系统
        }
    })
    const dataOption = {  //数据配置项
        legend: {
        data: legendArr
        },
        series: seriesArr
    }
    this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {  // 不同分辨率的响应式
    const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6  // 当前比较合适的字体大小
    const adapterOption = {  // 响应式的配置项
        title: {
        textStyle: {
            fontSize: titleFontSize
        }
        },
        legend: {
        itemWidth: titleFontSize / 2,  // 图例宽度
        itemHeight: titleFontSize / 2,   // 图例高度
        itemGap: titleFontSize / 2,  // 间隔
        textStyle: {
            fontSize: titleFontSize / 2
        }
        }
    }
    this.chartInstance.setOption(adapterOption)
    this.chartInstance.resize()
    },
    // 回到中国地图
    revertMap () {
    const revertOption = {
        geo: {
        map: 'china'
        }
    }
    this.chartInstance.setOption(revertOption)
    }
}
}
</script>

<style lang='less' scoped>
</style>
