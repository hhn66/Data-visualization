<!-- 
针对于 /mappage 这条路径而显示出来的
在这个组件中，通过子组件注册方式，要显示出Map.vue这个组件
 -->

 <template>
    <div class="com-page">
        <single-map></single-map>
    </div>
    
</template>

<script>
import Map from '../components/Map.vue'
export default {
  // 商家地图分布图表
  name: 'MapPage',
  components:{
    'single-map':Map,
  }
}
</script>

<style lang="less" scoped>

</style>
