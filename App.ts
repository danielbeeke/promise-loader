import { createPerson } from './person'
import { html, render } from './uhtml'
import { wait } from './wait'
let person = null

const withLoader = (promise, loader) => {
  promise.loader = loader
  return promise
}

const draw = async () => {
  if (person === null) person = await createPerson()

  render(document.body, html`
    Hello ${'World'} <span>${withLoader(wait(1, html`woop woop`), html`...`)}</span>
    <br />
    ${html`test 2: <span>${wait(2, 'woop 2')}</span>`}

    <h1>LDflex</h1>
    <span>${person.name}</span>
    <span>${withLoader(person.birthDate, html`......`)}</span>


    <div class="person">
      <h2>${person.name}</h2>
      <img src=${person.depiction}/>
    </div>
  `)
}

draw()

setTimeout(() => {
  draw()
  console.log('re-render')
}, 4000)
