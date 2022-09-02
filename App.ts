import { renderers } from './renderer'
import { wait } from './wait'
import { promiseLoader } from './promiseLoader'

const currentRenderer = renderers.htm

const { html, render } = promiseLoader({
  element: document.body,
  html: currentRenderer.html,
  render: currentRenderer.render,
  loader: currentRenderer.html`Loading`
})

const draw = () => render(html`
  Hello ${'World'} ${wait(1, html`woop woop`)}
  <br />
  ${html`test 2: ${wait(2, 'woop 2')}`}
`)

draw()

setTimeout(() => {
  draw()
  console.log('re-render')
}, 4000)