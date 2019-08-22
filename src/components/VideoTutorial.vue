<template>
  <!-- capture all click on the video area -->
  <div :class="$style.player">
    <!-- add dot to indicate the next action -->
    <template v-if="step">
      <dot
        :top="position.dot.top"
        :left="position.dot.left"
        :color="color"
        :dev-mode="devMode"
        @click="handleDotClick"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
      ></dot>

      <!-- display information for the current step, if not dragging in dev mode -->
      <info v-if="dev.dragging === false" :top="position.info.top" :left="position.info.left" :color="color">
        <slot name="step"></slot>
      </info>
    </template>

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

import posed from 'vue-pose'

interface Step {
  timepoint: number
  top: number
  left: number
  component: any
}

interface StepProps {
  timepoint: number | string
  top: number | string
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
}

// adapt the timepoint to a specific resolution
let adaptTimepoint = function adaptTimepoint(timepoint:number) {
  return Math.floor(timepoint * 100) / 100
}

export default Vue.extend({
  name: 'VueVideoPlayer',
  components: { Dot, Info },
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
      // current step
      step: null as Step | null,
      // steps to be displayed for the tutorial
      steps: [] as Step[],
      // develop mode information
      dev: {
        dragging: false
      }
    }
  },
  computed: {
    video(): HTMLVideoElement {
      // get a reference to the video element
      return this.$refs.video as HTMLVideoElement
    },
    // sort the steps by timepoint
    sortedSteps():Step[] {
      let sorted:Step[] = []

      for (let i = 0; i < this.steps.length; i++) {
        sorted.push(this.steps[i])
      }

      sorted.sort((step1, step2) => {
        return step1.timepoint - step2.timepoint
      })

      return sorted
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
          }
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
        }
      }
    }
  },
  mounted() {
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
    for (let node of this.$slots.default) {
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

    this.$slots.step = [this.steps[0].component]

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

      // find the current step in relation to the timeline position
      let startTimepoint = 0
      let endTimepoint = 0

      switch (this.timeline.direction) {
      case 'forward':
        startTimepoint = videoTime
        endTimepoint = startTimepoint + 0.05
        break

      case 'backward':
        endTimepoint = videoTime
        startTimepoint = endTimepoint - 0.05
        break
      }

      let step = null as Step | null
      for (let i = 0; i < this.steps.length; i++) {
        let stepTimepoint = this.steps[i].timepoint
        if (stepTimepoint >= startTimepoint && stepTimepoint <= endTimepoint) {
          step = this.steps[i]
          break
        }
      }

      this.step = step
      if (step) {
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
        if (this.step !== null) {
          this.triggerStep()
          return
        }

        this.video.play()
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

      let timepoint = adaptTimepoint(this.timeline.currentTime)

      // add a new step
      let step: Step = {
        timepoint: timepoint,
        top: 100,
        left: 100,
        component: new Step({
          propsData: {
            top: 100,
            left: 100,
            timepoint: timepoint
          }
        })
      }

      this.steps.push(step)
    },

    triggerStep() {
      this.video.play()
    },

    // handle clicks on the main area
    handleDotClick() {
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

      // get a reference to the video element
      let video = this.$refs.video as HTMLVideoElement

      if (event.key === 'ArrowLeft' || event.keyCode === 37) {
        if (video.currentTime > 0.05) {
          video.currentTime = video.currentTime - 0.05
        } else {
          video.currentTime = 0.00
        }
      }

      if (event.key === 'ArrowRight' || event.keyCode === 39) {
        if (video.currentTime < video.duration - 0.05) {
          video.currentTime = video.currentTime + 0.05
        } else {
          video.currentTime = video.duration
        }
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
      this.dev.dragging = true
    },

    // [DEVMODE] handle end of dragging
    handleDragEnd(delta: { x: number; y: number }) {
      // pause the video if its running
      this.video.pause()

      if (!this.step) {
        this.dev.dragging = false
        return
      }

      this.step.top += delta.y
      this.step.left += delta.x
      this.step.timepoint = adaptTimepoint(this.timeline.currentTime)

      this.dev.dragging = false
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
