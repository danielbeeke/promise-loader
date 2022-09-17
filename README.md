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
```