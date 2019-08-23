<template>
  <div :class="$style.controls">
    <div :class="$style.progress" :style="progressStyle" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Controls',
  props: {
    duration: {
      type: Number,
      required: true
    },
    currentTime: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  computed: {
    percentage(): number {
      return this.currentTime / this.duration
    },
    progressStyle(): object {
      return {
        background: this.color,
        transform: 'scaleX(' + this.percentage + ')'
      }
    }
  }
})
</script>

<style lang="stylus" module>
.controls {
  position: absolute;
  bottom: -1px;
  height: 2px;
  left: 0px;
  right: 0px;
  background: #16083C
}
.progress {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  width: 100%;
  background: red;
  transform-origin: center left;
  transform: scaleX(0.0);
}
</style>
