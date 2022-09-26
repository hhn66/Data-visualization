<!-- 
针对于 /rankpage 这条路径而显示出来的
在这个组件中，通过子组件注册方式，要显示出Rank.vue这个组件
 -->

 <template>
    <div class="com-page">
        <rank></rank>
    </div>
    
</template>

<script>
import Rank from '../components/Rank.vue'
export default {
  // 地区销售排行图表
  name: 'RankPage',
  components:{
    rank:Rank
  }
}
</script>

<style lang="less" scoped>

</style>
