import { PathFactory } from 'ldflex'
import ComunicaEngine from '@ldflex/comunica'
import { namedNode } from '@rdfjs/data-model'
import { Store } from 'n3'

export const LDflexPath = (store: Store, uri: string, prefixes, vocab: string) => {
  const context = { "@context": prefixes }

  if (vocab) context['@context']['@vocab'] = context['@context'][vocab]
  const queryEngine = new ComunicaEngine([store])
  const path = new PathFactory({ context, queryEngine })
  return path.create({ subject: namedNode(uri) })
}