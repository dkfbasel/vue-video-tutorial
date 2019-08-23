<script lang="ts">
import Vue from 'vue'
import { ScopedSlot } from 'vue/types/vnode'

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
    content: {
      required: false
    }
  },
  render: function(h) {
    let content = this.content as ScopedSlot
    let top = this.top

    if (!this.content) {
      return h('div', {
        style: { display: 'none' }
      })
    }

    let style = {
      top: this.top,
      left: this.left
    }

    return h('div', {
      class: [this.$style.info, 'vue-video-tutorial__info'],
      style: {
        top: this.top,
        left: this.left
      }
    }, [content])
  }
})
</script>

<style lang="stylus" module>
  .info {
    position: absolute;
    padding: 20px 24px;
    font-family: sans-serif;
    font-size: 16px;
    color: #fff;
    background: #161423;
    box-shadow: 0px 0px 10px #fff;
    max-width: 320px;
    border-radius: 2px;
    transform: translate3d(0%, -50%, 0);
    line-height: 1.3em;
  }

</style>
