import { createHtml, prefixes } from '../src/index'

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

const get = (url) => getter(url, 'dbo', 'https://dbpedia.org/sparql')

const philosopherUrls = [
  'Søren_Kierkegaard',
  'Friedrich_Nietzsche',
  'Immanuel_Kant',
  'Plato',
  'Aristotle'
].map(id => `http://dbpedia.org/resource/${id}`)

const philosopherData = philosopherUrls.map(url => [get(url), url])

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
      ${philosopherData.map(([person, url]) => html`
      <div class="col">
        <div class="card">
          <img src=${person.thumbnail} class="card-img-top" alt=${person.label}>
          <div class="card-body">
            <h5 class="card-title">
              <span>${person.label}</span>
            </h5>
            <em>✝<span>${person.deathYear}</span></em>

            <p class="card-text truncate">${person.rdfs_comment}</p>
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
