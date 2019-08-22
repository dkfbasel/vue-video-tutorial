<template>
  <div @click="$emit('click', $event)" :class="$style.dot"></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Dot'
})
</script>

<style lang="stylus" module>
$dotSize = 40px;

.dot {
  cursor: pointer;
  position: absolute;
  width: $dotSize;
  height: $dotSize;
  z-index: 1000;
  background: transparent;

  &:before, &:after {
    content: '';
    display: block;
    position: absolute;
    border-radius: $dotSize;
  }

  &:before {
    background: rgb(255, 71, 133);
    height: 37.5%;
    width: 37.5%;
    left: 0px;
    top: 0px;
    transform: translate3d(-50%, -50%, 0px);
  }

  &:after {
    opacity: 0.2;
    background: rgb(255, 71, 133);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    transform: translate3d(-50%, -50%, 0px);
  }
}
</style>
