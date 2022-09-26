<!-- 
针对于 /trendpage 这条路径而显示出来的
在这个组件中，通过子组件注册方式，要显示出Trend.vue这个组件
 -->

 <template>
    <div class="com-page">
      <trend></trend>
    </div>
    
</template>

<script>
import Trend from '../components/Trend.vue'
export default {
  // trend 销量趋势
  name: "TrendPage",
  components: {
    trend: Trend
  },
};
</script>

<style lang="less" scoped>

</style>
