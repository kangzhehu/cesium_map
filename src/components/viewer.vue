<template>
    <div>
      <div id="cesiumContainer"></div>
    </div>
  </template>
  
  <script>
  import * as ViewerUtils from '../utils/viewerUtils'
  export default {
    data() {
      return {
       
      };
    },
  
    mounted() {
      this.$nextTick(() => {
        //加载地图
        ViewerUtils.initViewer('cesiumContainer')
        // console.log(ViewerUtils.staticParams.viewer);
      })
    },
  };
  </script>
  
  <style>
  #cesiumContainer {
    height: 100%;
    width: 100%;
  }
  </style>
  