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
    color: {
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

    return h('div', {
      class: this.$style.info,
      style: {
        top: this.top,
        left: this.left,
        background: this.color
      }
    }, [content])
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
    height: 200px;
    border-radius: 2px;
    transform: translate3d(0%, -50%, 0);
    line-height: 1.3em;
  }

</style>
