<template>
  <div :class="$style.app">
    <video-tutorial v-bind="props">
      <step timepoint="0" top="332" left="250">
        This is my first step
      </step>
      <step timepoint="3" top="200" left="200">
        This is my second step
      </step>
      <step timepoint="5" top="150" left="150">
        This is my third step
      </step>
    </video-tutorial>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VideoTutorial from '../src/components/VideoTutorial.vue'
import Step from '../src/components/Step.vue'

export default Vue.extend({
  name: 'App',
  components: { VideoTutorial, Step },
  data() {
    return {
      props: {
        src: '/video/test-movie.mp4',
        width: '1200px',
        height: '800px',
        devMode: true
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
    height: 100vh;
  }

  .app {
    display: block;
  }

</style>
