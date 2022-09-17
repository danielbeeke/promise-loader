import { createHtml, prefixes } from '../src/index'
import { withLoader } from '../src/helpers/withLoader'

export const { html, render, Hole, get: getter } = createHtml({
  loader: () => html`Loading...`,
  error: (exception) => html``,
  prefixes,
  dataHandlers: {
    'rdf:langString': (value) => value,
    'xsd:string': (value) => value,
    'xsd:date': (value) => new Date(value).toLocaleString('nl', { dateStyle: 'short' }),
    'iri': (string: string) => {
      if (string.includes('mailto:')) {
        return html`<a href=${string}>${string.replace('mailto:', '')}</a>`
      }
      return string
    }
  }
})

const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis a feugiat turpis. Nam bibendum sed nibh et vestibulum. Praesent nibh neque, imperdiet in eleifend vitae, auctor in erat. Vestibulum fermentum consectetur urna, id lacinia neque facilisis sollicitudin. Aenean quis purus tellus. Nunc risus leo, suscipit quis massa nec, hendrerit congue justo.'
const loader = (length) => html`<span class="lorem">${loremIpsum.substring(0, length)}</span>`

const get = (url) => getter(url, 'dbo', 'https://dbpedia.org/sparql')

const philosopherData = [
  'Søren_Kierkegaard',
  'Friedrich_Nietzsche',
  'Immanuel_Kant',
  'Plato',
  'Aristotle'
].map(id => { 
  const url = `http://dbpedia.org/resource/${id}`
  return [get(url), url, id]
})

const draw = () => {
  render(document.body, html`
    <div class="container pt-5">
    <h1>A demonstration of <a target="_blank" href="https://github.com/danielbeeke/uhtml-ldflex">uHTML-LDflex</a></h1>

    <p>
      What are you seeing <a target="_blank" href="https://github.com/danielbeeke/uhtml-ldflex/blob/master/demo/demo.ts">here</a>?

      <ul>
      <li>uHTML templating engine, that automatically resolves LDflex paths via type specific handlers.</li>
      <li>Multiple calls inside a template are bundled into one query via the preload function of LDflex.</li>
      <li>The query bundling also works for .map(). A custom LDflex handler is written for that use case.</li>
      <li>Promises first show a preloader and then are shown.</li>
      <li>Dont mind the different languages, the demonstration is here to show fetching.</li>
      </ul>
    </p>

    <div class="row row-cols-1 row-cols-md-5 g-4">
      ${philosopherData.map(([person, url, id]) => html`
      <div class="col">
        <div class="card">
          <img onload=${(event) => event.target.classList.add('loaded')} src=${person.thumbnail} class="card-img-top" alt=" ">
          <div class="card-body">
            <h5 class="card-title">
              <span>${withLoader(person.label, loader(20))}</span>
            </h5>
            <span>${withLoader(person.deathYear, loader(4))}</span>

            <p class="card-text truncate">${withLoader(person.rdfs_comment, loader(1000))}</p>
            <a href=${url} target="_blank" class="btn btn-primary">Read more</a>
          </div>
        </div>
      </div>
      `)}
    </div>

  </div>
  `)
}

draw()
