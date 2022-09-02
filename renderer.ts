import { html as uHtml, render as uRender } from 'https://cdn.skypack.dev/uhtml'
import { html as hHtml, render as hRender } from 'https://unpkg.com/htm/preact/standalone.module.js'

export const renderers = {
  uhtml: {
    html: uHtml,
    render: uRender
  },
  htm: {
    html: hHtml,
    render: (a, b) => hRender(b, a)
  }
}
