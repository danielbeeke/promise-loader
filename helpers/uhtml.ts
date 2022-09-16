import { interpolatedValueHandler } from './interpolatedValueHandler'
import { html as uHtml } from 'uhtml/esm/async'
export { render, Hole } from 'uhtml/esm/async'

export const html = interpolatedValueHandler({
  defaultLoader: uHtml`Loading...`,
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
        return string
      }
      return string
    }
  }
})