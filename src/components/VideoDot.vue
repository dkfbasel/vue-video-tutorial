<template>
  <component
    :is="use"
    :class="$style.box"
    :pose="animation"
    :left="left"
    :top="top"
    @drag-start="handleDragStart"
    @drag-end="handleDragEnd"
  >
    <div @click="handleClick" :class="$style.dot">
      <div :class="$style.center" :style="{background: color}" />
      <Pulsar :class="$style.border" :style="{background: color}" />
    </div>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'
import posed from 'vue-pose'

let Box = posed.div({
  hoverable: true,
  init: { scale: 1 },
  hover: { scale: 1.2 }
})

let DevBox = posed.div({
  hoverable: true,
  draggable: true,
  init: {
    scale: 1,
    x: (props: { left: any }) => {
      return props.left
    },
    y: (props: { top: any }) => {
      return props.top
    }
  },
  hover: { scale: 1.2 },
  drag: { scale: 1.5 }
})

let Pulsar = posed.div({
  init: { scale: 1 },
  pulsating: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 40,
      damping: 0
    }
  },
  drag: { scale: 1.0 }
})

export default Vue.extend({
  name: 'Dot',
  components: { Box, DevBox, Pulsar },
  props: {
    color: {
      type: String,
      required: true
    },
    top: {
      type: String,
      required: true
    },
    left: {
      type: String,
      required: true
    },
    devMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  mounted() {
    this.animation = 'pulsating'
  },
  data() {
    return {
      animation: 'init',
      dev: {
        start: 0,
        top: 0,
        left: 0
      }
    }
  },
  computed: {
    // define which type of point should be used depending on the
    // current mode (dev or regular)
    use() {
      if (this.devMode) {
        return 'DevBox'
      }
      return 'Box'
    },
    // define the position of the dot
    style(): object {
      return {
        left: this.left,
        top: this.top
      }
    }
  },
  methods: {
    // handle click on dot
    handleClick(event: MouseEvent) {
      if (this.devMode) {
        return false
      }
      this.$emit('click', event)
    },
    // [DEVMODE] handle start of dragging action (instead of click)
    handleDragStart(event: MouseEvent) {
      this.dev.start = Date.now()
      // store the current coordinates to calculate the position delta at
      // the end of the drag action
      this.dev.left = event.clientX
      this.dev.top = event.clientY
      this.$emit('drag-start', event)
    },
    // [DEVMODE] handle end of dragging action
    handleDragEnd(event: MouseEvent) {
      // calculate position delta in relation to drag start position
      let delta = {
        x: event.clientX - this.dev.left,
        y: event.clientY - this.dev.top
      }

      let duration = Date.now() - this.dev.start
      if (duration <= 300) {
        this.$emit('click', event)
        return
      }

      // reset the state
      this.dev.left = 0
      this.dev.top = 0

      this.$emit('drag-end', delta)
    }
  }
})
</script>

<style lang="stylus" module>
$dotSize = 40px;

.box {
  position: absolute;
  width: $dotSize;
  height: $dotSize;
  z-index: 1000;
  transform-origin: top left;
}

.dot {
  cursor: pointer;
  width: $dotSize;
  height: $dotSize;
  position: relative;
  background: transparent;
  transform: translate3d(-50%, -50%, 0);

  .center, .border {
    content: '';
    display: block;
    position: absolute;
    border-radius: $dotSize;
  }

  .center {
    background: rgb(255, 71, 133);
    height: 37.5%;
    width: 37.5%;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  .border {
    opacity: 0.2;
    background: rgb(255, 71, 133);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    transform: scale(1);
  }
}
</style>
