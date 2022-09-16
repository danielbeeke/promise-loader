import { interpolatedValueHandler } from './interpolatedValueHandler'
import { html as uHtml } from 'uhtml'
export { render, Hole } from 'uhtml'

export const html = interpolatedValueHandler({
  loader: () => uHtml`Loading...`,
  error: (exception) => uHtml``,
  context: {
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  },
  dataHandlers: {
    'rdf:langString': (value) => value,
    'xsd:string': (value) => value,
    'xsd:date': (value) => new Date(value).toLocaleString('nl', { dateStyle: 'short' }),
    'iri': (string: string) => {
      if (string.includes('mailto:')) {
        return uHtml`<a href=${string}>${string.replace('mailto:', '')}</a>`
      }
      return string
    }
  }
})