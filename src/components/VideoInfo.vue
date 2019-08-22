<template>
  <div :class="$style.info" :style="style">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Info',
  props: {
    top: {
      type: String,
      required: true
    },
    left: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  computed: {
    style():object {
      return {
        top: this.top,
        left: this.left,
        background: this.color
      }
    }
  }
})
</script>

<style lang="stylus" module>
  .info {
    position: absolute;
    padding: 16px;
    font-size: 18px;
    color: #fff;
    width: 320px;
    border-radius: 2px;
    transform: translate3d(0%, -50%, 0);
    line-height: 1.3em;
  }

</style>
