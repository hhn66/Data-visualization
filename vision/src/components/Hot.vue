<!-- 热销商品图表 -->
<template>
    <div class='com-container'>
      <div class='com-chart' ref='hot_ref'></div>
      <span class="iconfont arr-left" @click="toLeft" :style="themeStyle">&#xe6ef;</span>
      <span class="iconfont arr-right" @click="toRight" :style="themeStyle">&#xe6ed;</span>
      <span class="cate-name" :style="themeStyle">{{ cateName }}</span>
    </div>
</template>
  
<script>
import { mapState } from 'vuex'
import { getThemeValue } from '../utils/theme_utils'

export default {
  name:'Hot',
  data () {
    return {
        chartInstance: null,  // 图表的实例对象
        allData: null,   // 从服务器中获取的所有数据
        currentIndex: 0, // 当前所展示出的一级分类数据
        titleFontSize: 0  // 字体响应式大小
      }
  },
  computed: {
    ...mapState(['theme']),
    cateName () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    themeStyle () {
      if (!this.titleFontSize) {
        return { color: getThemeValue(this.theme).titleColor }
      }
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  created () {
      //在组件创建完成后进行回调函数的注册
      this.$socket.registerCallBack('hotData', this.getData)
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
          socketType: 'hotData',
          chartName: 'hotproduct',
          value: ''
      })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    //在组件销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('hotData')
  },
  methods: {
    initChart () {  // 初始化图表的方法
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initOption = {
        title: {
          text: '| 热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '15%',
          icon: 'circle' // 图标类型 圆形
        },
        tooltip: {
          show: true,
          formatter: arg => {
            // console.log(arg)
            const thirdCategory = arg.data.children
            // 计算出所有三级分类的数值总和
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let showStr = ''   // 显示的文本
            thirdCategory.forEach(item => {
              //三级分类的名称：三级分类的占比
              showStr += `
              ${item.name}:${parseInt(item.value / total * 100) + '%'}  
              <br/>
              `
            })
            return showStr
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: { // 高亮状态下的样式
              label: {
                show: true
              },
              labelLine: {  // 连接文字的线条
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },
    getData (ret) {   // 发送请求，获取数据
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get('hotproduct')
      this.allData = ret
      console.log(this.allData)
      this.updateChart()
    },
    updateChart () {  // 更新图表配置项
      // 处理图表需要的数据
      const legendData = this.allData[this.currentIndex].children.map(item => {
        return item.name
      })
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children // 新增加children的原因是为了在tooltip中的formatter的回调函数中,来拿到这个二级分类下的三级分类数据
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },
    screenAdapter () {   // 不同分辨率的响应式
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,  // 图例的间隔
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,  // 饼图的大小 半径
            center: ['50%', '55%']   // 控制饼图的位置 x,y
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },
    toLeft () {  // 点击左侧按钮
      this.currentIndex--
      if (this.currentIndex < 0) {  // 已到达最左边
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight () {   // 点击右侧按钮
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {  // 已到达最右边
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>
  
<style lang='less' scoped>
  .arr-left {
    position:absolute;
    left: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
  }
  .arr-right {
    position:absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: white;
  }
  .cate-name {
    position:absolute;
    left: 80%;
    bottom: 20px;
    color: white;
  }
</style>
  