<!-- 
针对于 /sellerpage 这条路径而显示出来的
在这个组件中，通过子组件注册方式，要显示出Seller.vue这个组件
 -->

<template>
    <div class="com-page">
        <seller></seller>
    </div>
    
</template>

<script>
import Seller from '../components/Seller.vue'
export default {
   // Seller 商家销量
   name: "SellerPage",
  components: {
    seller: Seller,
  },
};
</script>

<style lang="less" scoped>

</style>
