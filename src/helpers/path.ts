import PathFactory from './PathFactory'
import FetchEngine from './FetchEngine'
import PreloadHandler from 'ldflex/src/PreloadHandler';
import AsyncIteratorHandler from 'ldflex/src/AsyncIteratorHandler';
import { listHandler, containerHandler, collectionHandler } from 'ldflex/src/CollectionsHandler';
import DataHandler from 'ldflex/src/DataHandler';
import ExecuteQueryHandler from 'ldflex/src/ExecuteQueryHandler';
import GetHandler from 'ldflex/src/GetFunctionHandler';
import MutationExpressionsHandler from 'ldflex/src/MutationExpressionsHandler';
import PathExpressionHandler from 'ldflex/src/PathExpressionHandler';
import PredicateHandler from 'ldflex/src/PredicateHandler';
import PredicatesHandler from 'ldflex/src/PredicatesHandler';
import PropertiesHandler from 'ldflex/src/PropertiesHandler';
import SortHandler from 'ldflex/src/SortHandler';
import SparqlHandler from 'ldflex/src/SparqlHandler';
import StringToLDflexHandler from 'ldflex/src/StringToLDflexHandler';
import SubjectHandler from 'ldflex/src/SubjectHandler';
import SubjectsHandler from 'ldflex/src/SubjectsHandler';
import ThenHandler from 'ldflex/src/ThenHandler';
import ToArrayHandler from 'ldflex/src/ToArrayHandler';
import { PathHandler } from 'ldflex/src/PathHandler';
import { ParentHandler } from 'ldflex/src/ParentHandler';
import { termToPrimitive } from 'ldflex/src/valueUtils';
import { handler } from 'ldflex/src/handlerUtil';
import { prefixHandler, namespaceHandler, fragmentHandler } from 'ldflex/src/URIHandler';
import BundleHandler from 'ldflex/src/BundleHandler';

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

const handlers = {
  ...defaultHandlers,

  parent: new ParentHandler(),
  path: new PathHandler(),
  preload: new PreloadHandler(),
  bundle: new BundleHandler()
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