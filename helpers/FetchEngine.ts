/**
 * Asynchronous iterator wrapper for the Comunica SPARQL query engine.
 */
export default class FetchEngine {

  private source: string

  constructor (source: string) {
    this.source = source
  }

  /**
   * Creates an asynchronous iterable of results for the given SPARQL query.
   */
  async* execute(query: string) {
    const url = new URL(this.source)
    url.searchParams.set('format', 'application/sparql-results+json')
    const data = new FormData()
    data.set('query', query)
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: data,
    })

    const json = await response.json()
    const { results: { bindings } } = json

    for (const binding of bindings) {
      yield new Proxy(binding, {
        get (target, name) {
          if (name === 'get') {
            return (variable) => binding[variable]
          }
        }
      })
    }
  }
}
