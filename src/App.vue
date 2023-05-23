<template>
  <div id="app">
    <drawing></drawing>
  </div>
</template>

<script>
import Drawing from '@/components/Drawing.vue'

export default {
  components: { Drawing },
  name: 'App',
}
</script>

<style lang="scss">
html,body{
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
