<template>
 <div>
    <el-button @click="snow">雪</el-button>
    <el-button @click="rain">雨</el-button>
    <el-button @click="fog">雾</el-button>
    <el-button @click="cloud">云</el-button>
    <el-button @click="night">建筑渐变</el-button>
    <el-button type="" @click="clockLight">日照模拟</el-button>
    <!-- <el-button type="" @click="changeTime">北京时间</el-button> -->
    <span>北京时间:{{ year }}-{{ month }}-{{ day }}:{{ hour+8 }}时</span>
    <el-slider v-model="hours" :min="0" :max="24" @input="changeSliderTime">时间</el-slider>
    <el-button @click="Fly">绘制</el-button>
    <el-button type="" @click="startFly">开始漫游</el-button>
    <el-button type="" @click="stopFly">停止漫游</el-button>
 </div>
</template>

<script>
import * as ViewUtils from '../utils/viewerUtils'
import * as Cesium from "cesium/Cesium";
export default {
  data () {
    
    return {
      hour:undefined,
      day:undefined,
      year:undefined,
      minute:undefined,
      month:undefined,
      hours:undefined,
      tempCurrent:undefined,
      currentTime:undefined
    }
  },
  watch:{
  },
  methods:{
    snow(){
        // console.log("下雪");
        // console.log(ViewUtils.staticParams.weatherInstance.snow);
        let snowStatus = ViewUtils.staticParams.weatherInstance.snow.enabled
        ViewUtils.staticParams.weatherInstance.snow.enabled = !snowStatus
    },
    rain(){
      ViewUtils.staticParams.weatherInstance.rain.enabled = !ViewUtils.staticParams.weatherInstance.rain.enabled
    },
    fog(){
      ViewUtils.staticParams.weatherInstance.fog.enabled = !ViewUtils.staticParams.weatherInstance.fog.enabled
    },
    cloud(){
      ViewUtils.staticParams.weatherInstance.clouds.show = !ViewUtils.staticParams.weatherInstance.clouds.show
    },
    night(){
      if(ViewUtils.staticParams.building.customShader){
        ViewUtils.staticParams.building.customShader = undefined
      }else{
        ViewUtils.staticParams.building.customShader = ViewUtils.staticParams.customShader
      }
    
    },
    //日照交替
    clockLight(){
      ViewUtils.SunlightAna(ViewUtils.staticParams.viewer)
    },
    changeTime(){
      // console.log(ViewUtils.staticParams.viewer.clock);
      // 获取当前时间
      // this.currentTime = ViewUtils.staticParams.viewer.clock.currentTime
      // 添加8小时，使地图时间和北京时间相同
      // ViewUtils.staticParams.viewer.clock.currentTime = Cesium.JulianDate.addHours(this.currentTime, 8, new Cesium.JulianDate());
      //start = Cesium.JulianDate.fromIso8601('2020-04-18');
      // console.log(this.start);
      this.hour += 8 
      
    },
    changeSliderTime(){
      let current = ViewUtils.staticParams.viewer.clock.currentTime
      let addHours = this.hours - this.tempCurrent
      // console.log(addHours);
      ViewUtils.staticParams.viewer.clock.currentTime = Cesium.JulianDate.addHours(current, addHours, new Cesium.JulianDate())
      // console.log( ViewUtils.staticParams.viewer.clock.currentTime);
      this.tempCurrent = Cesium.JulianDate.toGregorianDate(ViewUtils.staticParams.viewer.clock.currentTime).hour + 8
      // console.log('滑块时间',this.hours);
      // console.log('当前时间',this.tempCurrent);
    },
    Fly(){
      ViewUtils.drawShapeRange(ViewUtils.staticParams.viewer)
      console.log(ViewUtils.staticParams.activeShapePoints);
    },
    startFly(){
      ViewUtils.flyTo(ViewUtils.staticParams.viewer)
    },
    stopFly(){
      ViewUtils.stopFly(ViewUtils.staticParams.viewer)
    }
  },
  mounted(){
    let julianDate = Cesium.JulianDate.now();
    // console.log(julianDate);
    var gregorianDate = Cesium.JulianDate.toGregorianDate(julianDate)
    // console.log(gregorianDate);
    this.hours = gregorianDate.hour + 8
    this.tempCurrent = this.hours
    this.hour = gregorianDate.hour
    this.day = gregorianDate.day
    this.year = gregorianDate.year
    this.month = gregorianDate.month
  },
}
</script>

<style>

</style>