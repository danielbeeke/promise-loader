import { LDflexPath } from './ldflexpath'
import { rdfToStore } from './rdfToStore'

 
export const createPerson = async () => {
  const {store, prefixes} = await rdfToStore(`
  @prefix schema: <https://schema.org/> .
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
  @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

  <https://danielbeeke.nl>
      a                schema:Person ;
      schema:name        "Daniel Beeke" ;
      schema:title       "Mr" ;
      schema:givenName   "Daniel" ;
      schema:birthDate "1990-01-07"^^xsd:date ;
      schema:familyName "Beeke" ;
      schema:mbox        <mailto:mail@danielbeeke.nl> ;
      schema:homepage    <https://danielbeeke.nl> ;
      schema:depiction   [
        schema:url <https://danielbeeke.nl/images/daniel.jpg> 
      ];
  
      schema:knows ( [
          a schema:Person ;
          schema:name "John Doo"
      ] ) ;
  
      schema:phone       <tel:0031637346364> .
  `)
  
  return LDflexPath(store, 'https://schema.org/Person', prefixes, 'schema')
}