let path = require('path')

module.exports = {
  configureWebpack: {
    entry: path.join(__dirname, '/dev/main.ts'),
    devServer: {
      contentBase: path.join(__dirname, '/dev/public'),
      overlay: {
        warning: true,
        errors: true
      }
    }
  },
  pluginOptions: {
    storybook: {
      allowedPlugins: [
        'define'
      ]
    }
  }
}
