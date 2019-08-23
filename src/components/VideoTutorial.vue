<template>
  <!-- capture all click on the video area -->
  <div :class="$style.player">
    <!-- step information -->
    <template v-if="step">
      <!-- dot to indicate next action -->
      <dot
        :top="position.dot.top"
        :left="position.dot.left"
        :color="color"
        :dev-mode="devMode"
        @click="handleDotClick"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      ></dot>

      <!-- information for the current step -->
      <info v-if="dragging === false"
        :top="position.info.top" :left="position.info.left"
        :color="color"
        :content="position.component">
      </info>
    </template>

    <controls :duration="timeline.duration" :current-time="timeline.currentTime"
      :color="color" />

    <!-- include the video -->
    <div @click.capture.prevent="handleVideoClick">
      <video ref="video" :src="src" :width="width" :height="height" :class="$style.video" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Dot from './VideoDot.vue'
import Info from './VideoInfo.vue'
import Step from './Step.vue'
import Controls from './Controls.vue'

import posed from 'vue-pose'

interface Step {
  timepoint: number
  top: number
  left: number
  component: any
}

interface StepProps {
  timepoint: number | string
  top: number | string;
  left: number | string
  component: any
}

interface Position {
  dot: {
    top: string | number
    left: string | number
  }
  info: {
    top: string | number
    left: string | number
  }
  component: any;
}

// adapt the timepoint to a specific resolution
let adaptTimepoint = function adaptTimepoint(timepoint:number) {
  return Math.floor(timepoint * 100) / 100
}

export default Vue.extend({
  name: 'VueVideoPlayer',
  components: { Controls, Dot, Info },
  props: {
    /** source path of the video */
    src: {
      type: String,
      required: true
    },
    /** width of the video in pixel */
    width: {
      type: String,
      required: true
    },
    /** height of the video in pixel */
    height: {
      type: String,
      required: false,
      default: null
    },
    /** color to use for step indicators */
    color: {
      type: String,
      required: false,
      default: '#ff4785'
    },
    /** enable development mode to manage steps */
    devMode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      // timeline information
      timeline: {
        // current timepoint in the video duration
        currentTime: 0 as number,
        // duration of the video,
        duration: 0 as number,
        // direction of the playback
        direction: 'forward'
      },
      // steps to be displayed for the tutorial
      steps: [] as Step[],
      // steps to ignore
      ignore: null as number | null,
      // [DEVMODE] currently selected step
      selected: null as Step | null,
      // [DEVMODE] is the user dragging a dot
      dragging: false
    }
  },
  computed: {
    video(): HTMLVideoElement {
      // get a reference to the video element
      return this.$refs.video as HTMLVideoElement
    },
    step(): Step | null {
      // [DEVMODE] always display the selected element
      if (this.selected) {
        return this.selected
      }

      // find the current step in relation to the timeline position
      let startTimepoint = 0
      let endTimepoint = 0

      // note: we need a time range, since the timeline tracking is not exact
      // the resolution is different if we are in devMode or regular mode
      switch (this.timeline.direction) {
      case 'forward':
        if (this.devMode) {
          startTimepoint = this.timeline.currentTime - 0.03
          endTimepoint = startTimepoint + 0.08
        } else {
          startTimepoint = this.timeline.currentTime
          endTimepoint = startTimepoint + 0.05
        }
        break

      case 'backward':
        if (this.devMode) {
          endTimepoint = this.timeline.currentTime + 0.03
          startTimepoint = endTimepoint - 0.08
        } else {
          endTimepoint = this.timeline.currentTime
          startTimepoint = endTimepoint - 0.05
        }
        break
      }

      let step = null as Step | null
      for (let i = 0; i < this.steps.length; i++) {
        let stepTimepoint = this.steps[i].timepoint
        if (stepTimepoint === this.ignore) {
          continue
        }
        if (stepTimepoint >= startTimepoint && stepTimepoint <= endTimepoint) {
          step = this.steps[i]
          break
        }
      }

      return step
    },
    position(): Position {
      if (!this.step) {
        return {
          dot: {
            top: '0px',
            left: '0px'
          },
          info: {
            top: '0px',
            left: '0px'
          },
          component: null
        }
      }

      return {
        dot: {
          top: this.step.top + 'px',
          left: this.step.left + 'px'
        },
        info: {
          top: this.step.top + 'px',
          left: this.step.left + 40 + 'px'
        },
        component: this.step.component
      }
    }
  },
  mounted() {
    // register the duration of the video, once the information is available
    this.video.onloadedmetadata = () => {
      this.timeline.duration = this.video.duration
    }

    // emit event if video is paused
    this.video.onpause = () => {
      this.$emit('video:pause', this.video)
    }

    // emit an event when the video has ended
    this.video.onended = () => {
      this.$emit('video:ended', this.video)
    }

    this.video.onplay = () => {
      // synchronize the current time of the video with the component
      this.readCurrentTime()

      // emit a resume event if the video starts playing again
      this.video.onplay = () => {
        // synchronize the current time of the video with the component
        this.readCurrentTime()
        this.$emit('video:resume', this.video)
      }

      // emit a started event if the video starts playing for the first time
      this.$emit('video:started', this.video)
    }

    // steps are passed via the default slot
    if (!this.$slots.default) {
      return
    }

    // iterate through all steps in the slot and extract the component props
    for (let i = 0; i < this.$slots.default.length; i++) {
      let node = this.$slots.default[i]
      if (node.componentOptions && node.componentOptions.propsData) {
        let nodeProps = node.componentOptions.propsData as StepProps
        let step: Step = {
          top: parseInt(nodeProps.top as string, 10),
          left: parseInt(nodeProps.left as string, 10),
          timepoint: parseInt(nodeProps.timepoint as string, 10),
          component: node
        }
        this.steps.push(step)
      }
    }

    // setup dev mode controls
    if (!this.devMode) {
      return
    }

    window.addEventListener('keydown', this.handleKeyboardEvents)
    this.$once('hook:beforeDestory', () => {
      window.removeEventListener('keydown', this.handleKeyboardEvents)
    })
  },
  methods: {

    // read out the current time of the video
    // note: we are using requestAnimationFrame to get a high resolution of
    // the time position
    readCurrentTime() {
      let videoTime = this.video.currentTime

      // get the direction of the video playback
      if (videoTime < this.timeline.currentTime) {
        this.timeline.direction = 'backward'
      } else {
        this.timeline.direction = 'forward'
      }

      this.timeline.currentTime = videoTime

      // stop checking the position if the video is paused
      if (this.video.paused) {
        return
      }

      if (this.step && this.step !== this.selected) {
        this.video.pause()
        return
      }

      window.requestAnimationFrame(() => {
        this.readCurrentTime()
      })
    },

    // toggle the play/pause status of the video
    toggleVideo() {
      if (this.video.paused) {
        this.triggerStep()
        return
      }

      this.video.pause()
    },

    // handle clicks directly on the video
    handleVideoClick(event: MouseEvent) {
      // do not handle clicks on the video if we are not in the development mode
      if (!this.devMode) return

      // do not react to clicks on the video if there is already a step displayed
      if (this.step) return

      // get a reference to the video element
      this.video.pause()

      let videoPos = this.video.getBoundingClientRect()

      let top = event.clientY - videoPos.top
      let left = event.clientX - videoPos.left

      let timepoint = this.timeline.currentTime

      // add a new step
      let step: Step = {
        timepoint: timepoint,
        top: top,
        left: left,
        component: null
      }

      this.steps.push(step)
    },

    triggerStep() {
      if (this.step) {
        this.ignore = this.step.timepoint
      }
      this.video.play()
    },

    // handle clicks on the main area
    handleDotClick() {
      if (this.step) {
        this.ignore = this.step.timepoint
      }
      this.dragging = false
      this.selected = null
      this.triggerStep()
    },

    // [DEVMODE] handle keyboard events
    // NOTE: this might lead to conflicts with multiple video-tutorial-instances
    // on the same page.
    handleKeyboardEvents(event: KeyboardEvent) {
      // spacebar toggles the video
      if (event.key === ' ' || event.keyCode === 32) {
        this.toggleVideo()
      }

      if (event.key === 'ArrowLeft' || event.keyCode === 37) {
        if (this.video.currentTime > 0.05) {
          this.video.currentTime = this.video.currentTime - 0.05
        } else {
          this.video.currentTime = 0.00
        }
        this.timeline.currentTime = this.video.currentTime
      }

      if (event.key === 'ArrowRight' || event.keyCode === 39) {
        if (this.video.currentTime < this.video.duration - 0.05) {
          this.video.currentTime = this.video.currentTime + 0.05
        } else {
          this.video.currentTime = this.video.duration
        }
        this.timeline.currentTime = this.video.currentTime
      }

      if (event.key === 'Backspace' || event.key === 'Delete' ||
        event.keyCode === 8 || event.keyCode === 46) {
        if (!this.step) {
          return
        }
        let index = this.steps.findIndex((step) => {
          if (!this.step) {
            return false
          }
          return step.timepoint === this.step.timepoint
        })
        this.$delete(this.steps, index)
      }
    },

    // [DEVMODE] handle start of dragging of the dot
    handleDragStart(event: MouseEvent) {
      this.selected = this.step
      this.dragging = true
    },

    // [DEVMODE] handle end of dragging
    handleDragEnd(delta: { x: number; y: number }) {
      // pause the video if its running
      this.video.pause()

      if (!this.selected) {
        this.dragging = false
        return
      }

      this.selected.top += delta.y
      this.selected.left += delta.x
      this.selected.timepoint = this.timeline.currentTime

      this.dragging = false
      this.selected = null
    }
  }
})
</script>

<style lang="stylus" module>
.player {
  position: relative;
  box-sizing: border-box;

  *, *:before, *:after {
    box-sizing: inherit;
  }
}
</style>
