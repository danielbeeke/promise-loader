import PathFactory from './PathFactory'
import FetchEngine from './FetchEngine'
import PreloadHandler from './PreloadHandler'
import AsyncIteratorHandler from 'ldflex/module/AsyncIteratorHandler';
import { listHandler, containerHandler, collectionHandler } from 'ldflex/module/CollectionsHandler';
import DataHandler from 'ldflex/module/DataHandler';
import ExecuteQueryHandler from 'ldflex/module/ExecuteQueryHandler';
import GetHandler from 'ldflex/module/GetFunctionHandler';
import MutationExpressionsHandler from 'ldflex/module/MutationExpressionsHandler';
import PathExpressionHandler from 'ldflex/module/PathExpressionHandler';
import PredicateHandler from 'ldflex/module/PredicateHandler';
import PredicatesHandler from 'ldflex/module/PredicatesHandler';
import PropertiesHandler from 'ldflex/module/PropertiesHandler';
import SortHandler from 'ldflex/module/SortHandler';
import SparqlHandler from 'ldflex/module/SparqlHandler';
import StringToLDflexHandler from 'ldflex/module/StringToLDflexHandler';
import SubjectHandler from 'ldflex/module/SubjectHandler';
import SubjectsHandler from 'ldflex/module/SubjectsHandler';
import ThenHandler from 'ldflex/module/ThenHandler';
import ToArrayHandler from 'ldflex/module/ToArrayHandler';
import { termToPrimitive } from 'ldflex/module/valueUtils';
import { handler } from 'ldflex/module/handlerUtil';
import { prefixHandler, namespaceHandler, fragmentHandler } from 'ldflex/module/URIHandler';
/**
 * A map with default property handlers.
 */

const defaultHandlers = {
  // Flag to loaders that exported paths are not ES6 modules
  __esModule: () => undefined,
  // Add thenable and async iterable behavior
  then: new ThenHandler(),
  [Symbol.asyncIterator]: new AsyncIteratorHandler(),
  // Add utilities for collections
  list: listHandler(),
  container: containerHandler(false),
  containerAsSet: containerHandler(true),
  collection: collectionHandler(),
  // Add read and query functionality
  get: new GetHandler(),
  subject: new SubjectHandler(),
  predicate: new PredicateHandler(),
  properties: new PropertiesHandler(),
  predicates: new PredicatesHandler(),
  pathExpression: new PathExpressionHandler(),
  sparql: new SparqlHandler(),
  subjects: new SubjectsHandler(),
  results: new ExecuteQueryHandler(),
  sort: new SortHandler('ASC'),
  sortDesc: new SortHandler('DESC'),
  preload: new PreloadHandler(),
  // Add write functionality
  mutationExpressions: new MutationExpressionsHandler(),
  // Add RDFJS term handling
  termType: termPropertyHandler('termType'),
  value: termPropertyHandler('value'),
  datatype: termPropertyHandler('datatype'),
  language: termPropertyHandler('language'),
  canonical: termPropertyHandler('canonical'),
  equals: DataHandler.sync('subject', 'equals'),
  toString: DataHandler.syncFunction('subject', 'value'),
  valueOf: subjectToPrimitiveHandler(),
  toPrimitive: subjectToPrimitiveHandler(),
  // URI / namedNode handling
  prefix: prefixHandler,
  namespace: namespaceHandler,
  fragment: fragmentHandler,
  // Add iteration helpers
  toArray: new ToArrayHandler(),
  termTypes: handler((_, path) => path.toArray(term => term.termType)),
  values: handler((_, path) => path.toArray(term => term.value)),
  datatypes: handler((_, path) => path.toArray(term => term.datatype)),
  languages: handler((_, path) => path.toArray(term => term.language)),
  // Parse a string into an LDflex object
  resolve: new StringToLDflexHandler()
}; // Creates a handler for the given RDF/JS Term property

function termPropertyHandler(property) {
  // If a resolved subject is present,
  // behave as an RDF/JS term and synchronously expose the property;
  // otherwise, return a promise to the property value
  return handler((_ref, path) => {
    let {
      subject
    } = _ref;
    return subject && property in subject ? subject[property] : path.then && path.then(term => term === null || term === void 0 ? void 0 : term[property]);
  });
} // Creates a handler that converts the subject into a primitive


function subjectToPrimitiveHandler() {
  return handler(_ref2 => {
    let {
      subject
    } = _ref2;
    return () => typeof (subject === null || subject === void 0 ? void 0 : subject.termType) !== 'string' ? undefined : termToPrimitive(subject);
  });
}

class ParentHandler {
  handle(pathData) {
    let node = pathData
    while (node.parent) node = node.parent
    return node
  }
}

class PathHandler {
  handle(pathData) {
     return pathData
  }
}

export const map = {
  handle: (pathData, path) => {
    return async (callback) => {
      const result = []
      
      const innerPredicates = []

      const tester = new Proxy({}, {
        get(target, property, receiver) {
          innerPredicates.push(property)
          return Reflect.get(target, property, receiver)
        }
      })

      callback(tester)

      await path.preload(innerPredicates)

      for await (const subPath of path) {
        result.push(callback(subPath))
      }

      return result  
    }
  }
}

const handlers = {
  ...defaultHandlers,

  parent: new ParentHandler(),
  path: new PathHandler(),
  preload: new PreloadHandler(),
  map
}

export const path = (iri: string, prefixes, vocab?: string, source?: string, extraLDflexHandlers: { [key: string]: any } = {}) => {
  if (!source) source = iri
  const queryEngine = new FetchEngine(source)
  const context = { '@context': { ...prefixes }}
  if (vocab) { context['@context']['@vocab'] = prefixes[vocab] }
  const path = new PathFactory({ queryEngine, handlers: {
    ...handlers,
    ...extraLDflexHandlers
  }, context }, undefined)
  /** @ts-ignore */
  return path.create({ subject: { termType: 'NamedNode', value: iri } })
}