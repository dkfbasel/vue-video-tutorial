/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

import VideoTutorial from '../components/VideoTutorial.vue'

storiesOf('Vue-Video-Tutorial', module)
  .add('with text', () => ({
    components: { VideoTutorial },
    template: '<video-tutorial @click="action">Hello Button</video-tutorial>',
    methods: { action: action('clicked') }
  }))
