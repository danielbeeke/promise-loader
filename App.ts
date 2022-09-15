import { createPerson } from './person'
import { html, render, Hole } from './uhtml'
import { wait } from './wait'
let person = null

const withLoader = (promise, loader) => {
  promise.loader = loader
  return promise
}

const nest = (templates, ...values) => async (object) => {
  return html(templates, ...values)
}

const draw = async () => {
  if (person === null) person = await createPerson()

  render(document.body, html`

    <div class="person">
      ${nest`
        <img src=${person.depiction}/>
      `(person)}
    </div>
  `)
}

draw()

// setTimeout(() => {
//   draw()
//   console.log('re-render')
// }, 4000)


/*
    Hello ${'World'} <span>${withLoader(wait(1, html`woop woop`), html`...`)}</span>
    <br />
    ${html`test 2: <span>${wait(2, 'woop 2')}</span>`}

    <h1>LDflex</h1>
*/