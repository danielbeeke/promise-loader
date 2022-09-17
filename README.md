# uHTML ldflex

This uHTML LDflex library only supports Sparql paths for now. In the future it will be possible to a more complex engine. This has been done to create a small library.

# Important!

This library is a proof of concept, it needs more experimentation and cleanup to be used.

## Example

```JavaScript

import { createHtml, prefixes } from 'uhtml-ldflex'

export const { html, render, Hole } = createHtml({
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

const soren = get('http://dbpedia.org/resource/Søren_Kierkegaard', 'dbo', 'https://dbpedia.org/sparql')

const draw = () => {
  render(document.body, html`
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

    <div class="philosopher">
      <h1>${soren.label}</h1>
      <p>${soren.abstract}</p>
      <span>${soren.deathYear}</span>
      <img src=${soren.thumbnail} />
      <ul>
        ${soren.influenced.map(influencee => html`
          <li>${influencee.label}</li>
        `)}
      </ul>
    </div>
  `)
}

draw()
```