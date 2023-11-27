<template>
 <div >
    <div class="cesiumMap">
    <Viewer/>
    <Tdanalysis/>
    <Weather/>
    <Footer/>
 </div>
 </div>
</template>

<script>
import Viewer from '../components/viewer.vue'
import Tdanalysis from '../components/tdanalysis.vue'
import Footer from '../components/footer.vue'
import Weather from '../components/weather.vue'
export default {
  components:{
    Viewer,
    Footer,
    Weather,
    Tdanalysis
  },
  data () {
    return {

    }
  },
}
</script>

<style>
.cesiumMap{
  width: 100%;
  height: 100%;
}
</style>