<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  
  }
}
</script>

<style lang="scss">
*{
  margin: 0;
  padding: 0;
}
html, body{
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

#app{
  width: 100%;
  height: 100%;
}

</style>
