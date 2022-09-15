import { PathFactory, defaultHandlers } from 'ldflex'
import ComunicaEngine from '@ldflex/comunica'
import { namedNode } from '@rdfjs/data-model'

/**
 * Returns a new path starting from the subject of the current path.
 *
 * Requires:
 * - (optional) a subject property on the path data
 * - (optional) a parent property on the path data
 */
 class ParentHandler {
  handle(pathData) {
    let node = pathData
    while (node.parent) node = node.parent
    return node
  }

}

/**
 * Returns a new path starting from the subject of the current path.
 *
 * Requires:
 * - (optional) a subject property on the path data
 * - (optional) a parent property on the path data
 */
class PathHandler {
  handle(pathData) {
     return pathData
  }

}


const handlers = Object.assign({}, defaultHandlers, {
  parent: new ParentHandler(),
  path: new PathHandler()
})

export const createPerson = async (uri: string) => {
  const queryEngine = new ComunicaEngine([uri])
  const path = new PathFactory({ queryEngine, handlers, context: {
    '@context': {
      schema: 'https://schema.org',
      foaf: 'http://xmlns.com/foaf/0.1/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      '@vocab': 'http://xmlns.com/foaf/0.1/'
    },
  } })
  const thing = path.create({ subject: namedNode(uri) })
  return thing
}