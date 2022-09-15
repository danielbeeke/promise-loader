import { createPerson } from './person'
import { html, render, Hole } from './uhtml'
import { wait } from './wait'
let person = null
let person1 = null

const withLoader = (promise, loader) => {
  promise.loader = loader
  return promise
}

const draw = async () => {
  if (person === null) {
    person1 = await createPerson()
    person = person1['^rdf:type']
  }

  render(document.body, html`
    <div class="person">
      <h3>
        <span>${person.title}</span>
        <span>${person.givenName}</span>
        <span>${person.familyName}</span>
      </h3>
      <img src=${person.depiction.url}/>
      <span>${person.birthDate}</span>
      <span>${person.mbox}</span>
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