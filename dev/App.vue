<template>
  <div :class="$style.app">
    <video-tutorial v-bind="props"></video-tutorial>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VideoTutorial from '../src/components/VideoTutorial.vue'

export default Vue.extend({
  name: 'App',
  components: { VideoTutorial },
  data() {
    return {
      props: {
        src: '/video/test-movie.mp4',
        width: '1200px',
        height: '800px'
      }
    }
  }
})
</script>

<style lang="stylus" module>

  body {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0px;
    padding: 0px;
  }

  .app {
    display: block;
  }

</style>
