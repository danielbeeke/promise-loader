import { createHtml, prefixes } from '../src/index'
import { withLoader } from '../src/helpers/withLoader'
import { langMatches } from 'ldflex/src/filters'
import asyncHandlers from '@ldflex/async-iteration-handlers'

const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis a feugiat turpis. Nam bibendum sed nibh et vestibulum. Praesent nibh neque, imperdiet in eleifend vitae, auctor in erat. Vestibulum fermentum consectetur urna, id lacinia neque facilisis sollicitudin. Aenean quis purus tellus. Nunc risus leo, suscipit quis massa nec, hendrerit congue justo.'

export const { html, render, Hole, get: getter } = createHtml({
  loader: (path) => {
    const property = path?.path?.property
    
    const propertyLenghts = {
      label: 20,
      deathYear: 4,
      rdfs_comment: 1000
    }

    return property ? html`<span class="lorem">${loremIpsum.substring(0, propertyLenghts[property] ?? 10)}</span>` :
    html`<span class="loader">Loading...</span>`
  },
  error: (exception) => html``,
  prefixes,
  extraLDflexHandlers: {
    ...asyncHandlers,
  },
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

const en = langMatches('en')

const philosopherData = [
  'Søren_Kierkegaard',
  'Friedrich_Nietzsche',
  'Immanuel_Kant',
  'Plato',
  // 'Marcus_Aurelius'
].map(id => { 
  const url = `http://dbpedia.org/resource/${id}`
  return [get(url), url]
})

const draw = async () => {

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
      </ul>
    </p>

    <div class="row row-cols-1 row-cols-md-4 g-4">
      ${philosopherData.map(([person, url]) => html`
      <div class="col">
        <div class="card">
          <img onload=${(event) => {
            event.target.classList.add('loaded')
            const items = event.target.closest('.card').querySelectorAll('.lorem')
            for (const item of items) item.classList.remove('lorem')
          }} src=${person.thumbnail} class="card-img-top" alt=" ">
          <div class="card-body">
            <h5 class="card-title">
              <span>${person.label(en)}</span>
            </h5>
            <span>${person.deathYear}</span>
          
            <p class="card-text truncate">${person.rdfs_comment(en)}</p>
          </div>
          
          <ul class="list-group list-group-flush" style="border-top: none;">
          <li class="list-group-item"><em class="text-muted">Works:</em></li>
          </ul>
        
          <ul class="list-group list-group-flush" style="height: 200px; border-top: none; background-color: white; overflow-y: scroll;">
          
          ${person['^dbo:author'].label(en).map(label => html`
            <li class="list-group-item">
              <span>${label.value}</span>
            </li>`
          )}
          </ul>

          <div class="card-footer">
            <a href=${url} target="_blank" class="btn btn-primary float-end">Read more</a>
          </div>      

        </div>
      </div>
      `)}
    </div>

  </div>
  `)
}

draw()


