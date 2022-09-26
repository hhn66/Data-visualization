<!-- 地区销量排行 -->
<template>
    <div class='com-container'>
      <div class='com-chart' ref='rank_ref'></div>
    </div>    
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'
export default {
    data () {
        return {
            chartInstance: null, //图表的实例对象
            allData: null, //从服务器中获取的所有数据
            startValue: 0, //区域缩放起点值
            endValue: 9, //区域缩放终点值
            timerId: null //定时器标识
        }
    },
    created () {
        //在组件创建完成后进行回调函数的注册
        this.$socket.registerCallBack('rankData', this.getData)
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
            socketType: 'rankData',
            chartName: 'rank',
            value: ''
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter() //主动触发 响应式配置
    },
    destroyed () {
        window.removeEventListener('resize', this.screenAdapter)
        //在组件销毁的时候，进行回调函数的取消
        this.$socket.unRegisterCallBack('rankData')
        clearInterval(this.timerId)
    },
    methods :{
        initChart () {
            this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
            const initOption = {
                title: { //标题的设置
                    text: '| 地区销售排行',
                    left: 20,
                    top: 20
                },
                grid: { //坐标轴大小和位置
                    top: '25%',
                    left: '8%',
                    right: '5%',
                    bottom: '12%',
                    containLable: true  //包含坐标轴
                },
                tooltip: { //工具提示
                    show: true
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    type: 'value'
                },
                series: {
                    type: 'bar'
                }
            }
            this.chartInstance.setOption(initOption)
            this.chartInstance.on('mouseover', () => {
                clearInterval(this.timerId)
            })
            this.chartInstance.on('mouseout', () => {
                this.startInterval()
            })
        },
        getData (ret) {
            // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
            // const {data: ret} = await this.$http.get('rank')
            this.allData = ret
            this.allData.sort((a, b) => { //对allData里面的元素进行排序
                return b.value - a.value  //从大到小
            })
            // console.log(this.allData)
            this.updateChart()
            this.startInterval()
        },
        updateChart () {
            const colorArr = [  //渐变颜色数值
                ['#0BA82C', '#4FF778'],
                ['#2E72BF', '#23E5E5'],
                ['#5052EE', '#AB6EE5']
            ]
            //处理图表需要的数据
            //所有省份所形成的数组
            const provinceArr  = this.allData.map(item => {
                return item.name
            })
            //所有省份对应的销售金额
            const valueArr = this.allData.map(item => {
                return item.value
            })

            const dataOption = {
                xAxis: {
                    data: provinceArr
                },
                dataZoom: {
                    show: false,
                    startValue: this.startValue,
                    endValue: this.endValue
                },
                series: [
                    {
                        data: valueArr,
                        itemStyle: {
                            color: arg => {
                                let targetcolorArr = null
                                if (arg.value > 300) {
                                    targetcolorArr = colorArr[0]
                                } else if (arg.value > 200) {
                                    targetcolorArr = colorArr[1]
                                } else {
                                    targetcolorArr = colorArr[2]
                                }
                                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {
                                        offset: 0,
                                        color: targetcolorArr[0]
                                    },
                                    {
                                        offset: 1,
                                        color: targetcolorArr[1]
                                    }

                                ])
                            }
                        }
                    }
                ]
            }
            this.chartInstance.setOption(dataOption)
        },
        screenAdapter () {
            const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) *3.6
            const adapterOption = {
                title: {
                    titleStyle: {
                        fontSize: titleFontSize
                    }
                },
                series: [
                    {
                        barWidth: titleFontSize,
                        itemStyle: {
                            barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
                        }
                    }
                ]
            }
            this.chartInstance.setOption(adapterOption)
            this.chartInstance.resize()
        },
        startInterval () {
            if (this.timerId) {  //如果存在则关闭
                clearInterval(this.timerId)
            }
            this.timerId = setInterval(() => {
                this.startValue++
                this.endValue++
                if (this.endValue > this.allData.length - 1) {
                    this.startValue = 0
                    this.endValue = 9
                }
                this.updateChart()
            }, 2000)
        }
    }
}
</script>

<style lang="less" scoped>

</style>