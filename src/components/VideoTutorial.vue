<template>
  <!-- capture all click on the video area -->
  <div :class="$style.player">
    <!-- add dot to indicate the next action -->
    <dot v-if="dot" :style="dot" @click="handleDotClick"></dot>

    <!-- include the video source -->
    <div @click.capture.prevent="handleVideoClick">
      <video
        ref="video"
        :src="src"
        :width="width"
        :height="height"
        :class="$style.video"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Dot from './VideoDot.vue'

export default Vue.extend({
  name: 'VueVideoPlayer',
  components: { Dot },
  props: {
    src: {
      type: String,
      required: true
    },
    width: {
      type: String,
      required: true
    },
    height: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      // timeline information
      timeline: {
        current: 0 as number | null, // current trigger
        next: 0 as number // next trigger
      },
      // triggers
      triggers: [
        {
          position: {
            x: 552,
            y: 332
          },
          timeline: 0
        },
        {
          position: {
            x: 200,
            y: 200
          },
          timeline: 3
        },
        {
          position: {
            x: 150,
            y: 150
          },
          timeline: 5
        }
      ]
    }
  },
  computed: {
    // style properties of the current dot
    dot(): object | null {
      // no dot should currently be shown
      if (this.timeline.current === null) {
        return null
      }

      // find the current trigger in the list
      let currentTrigger = this.triggers.find(trigger => {
        return trigger.timeline === this.timeline.current
      })

      if (!currentTrigger) {
        return null
      }

      // return the styling settings for the current dot
      return {
        top: currentTrigger.position.x + 'px',
        left: currentTrigger.position.y + 'px'
      }
    }
  },
  methods: {
    handleVideoClick() {},

    // handle clicks on the main area
    handleDotClick() {
      // get a reference to the video element
      let video = this.$refs.video as HTMLVideoElement

      // emit an event when the video has ended
      video.onended = () => {
        this.$emit('ended')
      }

      // fetch the current trigger
      let index = this.triggers.findIndex(trigger => {
        return trigger.timeline === this.timeline.current
      })

      // clear the current trigger point
      this.timeline.current = null

      // use the first trigger if no trigger was foudn
      if (!index) {
        index = 0
      }

      let trigger = this.triggers[index]
      let nextTrigger = this.triggers[index + 1]

      if (!nextTrigger) {
        // clear the ontimeupdate event handler
        video.ontimeupdate = () => {}

        // play the video until the end if there is no
        // nextTrigger
        video.play()
        return
      }

      // store the next timeline trigger in the context
      this.timeline.next = nextTrigger.timeline

      video.ontimeupdate = () => {
        if (video.currentTime >= this.timeline.next) {
          video.pause()
          this.timeline.current = this.timeline.next
        }
      }

      video.play()
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
