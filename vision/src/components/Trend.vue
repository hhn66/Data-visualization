<!-- 地区销售趋势 -->
<template>
    <div class="com-container">
        <div class="title" :style="themeStyle">
            <span>{{'| ' + showTitle}}</span>
            <span class="iconfont title-icon" :style="themeStyle" @click="showChoice = !showChoice">&#xe6eb;</span>
            <div class="select-con" v-show="showChoice" :style="marginStyle">
                <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
                    {{item.text}}    
                </div>
            </div>
        </div>
        <div class="com-chart" ref="trend_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'
export default {
    // 地区销量趋势
    name: 'Trend',
    data() {
        return {
            chartInstance: null, //图表的实例对象
            allData: null, //从服务器中获取的所有数据
            showChoice: false, //是否显示可选项
            choiceType: 'map', //显示的数据
            titleFontSize: 0 //指明标题字体大小
        }
    },
    created () {
        //在组件创建完成后进行回调函数的注册
        this.$socket.registerCallBack('trendData', this.getData)
    },
    computed: {
        ...mapState(['theme']),
        selectTypes () { //点击后需要显示的数组
            if (!this.allData) {
                return [] 
            } else { //过滤掉当前选中的类别
                return this.allData.type.filter(item => {
                    return item.key !== this.choiceType
                })
            }
        },
        //显示标题
        showTitle () {
            if (!this.allData) {
                return ''
            } else {
                return this.allData[this.choiceType].title
            }
        },
        //标题样式
        themeStyle () {
           return {
            fontSize: this.titleFontSize + 'px',
            color: getThemeValue(this.theme).titleColor
           } 
        },
        marginStyle () {
            return {
                marginLeft: this.titleFontSize / 2 + 'px'
            }
        }
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
            socketType: 'trendData',
            chartName: 'trend',
            value: ''
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()  //主动触发 响应式配置
    },
    destroyed () {
        window.removeEventListener('resize', this.screenAdapter)
        //在组件销毁的时候，进行回调函数的取消
        this.$socket.unRegisterCallBack('trendData')
    },
    
    methods: {
        //初始化图表的方法
        initChart () {
            this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
            const initOption = {
                //坐标轴大小设置
                grid: {
                    left: '3%',
                    top: '35%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true //包含坐标轴
                },
                //工具提示
                tooltip: {
                    trigger: 'axis'
                },
                //图例位置和形状
                legend: {
                    left: 'center',
                    top: '18%',
                    icon: 'circle'
                },
                xAxis: {
                    type:'category',
                    boundaryGap: false //紧挨边缘
                },
                yAxis: {
                    type:'value'
                },
            }
            this.chartInstance.setOption(initOption)
        },
        //发送数据，获取请求
        //ret: 服务端发送给客户端的图表的数据
        getData (ret) {
            //await this.$http.get()
            //对allData进行赋值
            // const {data: ret} = await this.$http.get('trend')
            this.allData = ret
            console.log(this.allData)
            this.updataChart()
        },
        //更新图表配置项
        updataChart () {
            // 半透明的颜色值
            const colorArr1 = [
                'rgba(11, 168, 44, 0.5)',
                'rgba(44, 110, 255, 0.5)',
                'rgba(22, 242, 217, 0.5)',
                'rgba(254, 33, 30, 0.5)',
                'rgba(250, 105, 0, 0.5)'
            ]
            // 全透明的颜色值
            const colorArr2 = [
                'rgba(11, 168, 44, 0)',
                'rgba(44, 110, 255, 0)',
                'rgba(22, 242, 217, 0)',
                'rgba(254, 33, 30, 0)',
                'rgba(250, 105, 0, 0)'
            ]
            //处理数据
            //类目轴的数据
            const timeArr = this.allData.common.month
            //y轴数据 series下的数据
            const valueArr = this.allData[this.choiceType].data
            const seriesArr = valueArr.map((item, index) => {
                return {
                    //图例的数据需要和series的name匹配
                    name:item.name,
                    type: 'line',
                    data:item.data,
                    stack: this.choiceType,
                    areaStyle: { //区域填充样式
                        //颜色渐变
                        color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            // 0% 颜色
                            {
                                offset: 0,
                                color: colorArr1[index]
                            },
                            // 100% 颜色
                            {
                                offset: 1,
                                color: colorArr2[index]
                            }
                        ])
                    }
                }
            })
            //图例的数据
            const legenArr = valueArr.map(item => {
                return item.name
            })
            const dataOption = {
                xAxis: {
                    data: timeArr
                },
                legend: {
                    data: legenArr
                },
                series: seriesArr
            }
            this.chartInstance.setOption(dataOption)
        },
        //不同分辨率的响应式
        screenAdapter () {
            this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6
            const adapterOption = {
                legend: {
                    itemWidth: this.titleFontSize,
                    itemHeigt: this.titleFontSize,
                    itemGap: this.titleFontSize,
                    textStyle: {
                        fontSize: this.titleFontSize / 2
                    }
                }
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        handleSelect (currentTyhpe) {
            this.choiceType = currentTyhpe
            this.updataChart()
            this.showChoice = false
        }
    }
}
</script>

<style lang="less" scoped>
    .title {
        position: absolute;
        left: 20px;
        top: 20px;
        z-index: 10;
        color: white;

        .title-icon {
            margin-left: 10px;
            cursor: pointer; //使箭头变为小手效果
        }
        .select-con {
            background-color: #222733;
        }
    }


</style>
