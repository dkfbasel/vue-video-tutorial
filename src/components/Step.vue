<template>
  <div><slot></slot></div>
</template>

<script lang="ts">
import Vue from 'vue'

let propValidator = function(value: string|number) {
  if (typeof value === 'number') {
    return true
  }
  let asNumber = parseInt(value, 10)
  return isNaN(asNumber) === false
}

export default Vue.extend({
  name: 'Step',
  props: {
    top: {
      type: [String, Number],
      required: true,
      validator: propValidator
    },
    left: {
      type: [String, Number],
      required: true,
      validator: propValidator
    },
    timepoint: {
      type: [String, Number],
      required: true,
      validator: propValidator
    }
  }
})
</script>

<style lang="stylus" module>
</style>
