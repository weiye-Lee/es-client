import {defineConfig} from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  rules: [
    [/^abs-(\d+)$/, ([, size]) => ({
      'position': 'absolute',
      'top': `${size}px`,
      'left': `${size}px`,
      'right': `${size}px`,
      'bottom': `${size}px`
    })],
  ]
})