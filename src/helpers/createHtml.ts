import { html, render, Hole } from 'uhtml'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { foreign } from 'uhandlers'
import { loaders } from './withLoader'
import { preloadPaths } from './preloadPaths'
import { path } from './path'

const ldflexAttribute = (value, preloader) => foreign((node, name, value) => {
  preloader.then(() => {
    value.value.then(resolved => {
      if (typeof resolved === 'string') {
        node.setAttribute(name, resolved)
      }  
    })  
  })
}, value)

export const createHtml = (options: {
  loader: any,
  error: any,
  extraLDflexHandlers?: {
    [key: string]: any
  },
  dataHandlers: {
    [key: string]: Function
  },
  prefixes: {
    [key: string]: string
  }
}) => {
  const parsedContext = new JsonLdContextNormalized(options.prefixes)
  
  for (const [type, handler] of Object.entries(options.dataHandlers)) {
    const expandedType = parsedContext.expandTerm(type)
    if (expandedType !== type) options.dataHandlers[expandedType] = handler
  }

  const htmlReplacement = function (templates, ...values) {
    const paths = values.filter(value => typeof value?.extendPath === 'function')
    const preloader = paths.length ? preloadPaths(paths) : Promise.resolve()

    values = values.map((value, index) => {
      const isAttr = templates[index].trim().endsWith('=')
      const isLDflex = typeof value?.extendPath === 'function'

      if (isAttr && isLDflex) return ldflexAttribute(value, preloader)
      
      return mapValue(options, value, preloader)
    })

    return html(templates, ...values)
  }

  const get = (iri, vocab = 'foaf', source = null) => path(iri, options.prefixes, vocab, source, options.extraLDflexHandlers)

  return {
    html: htmlReplacement,
    render: render,
    Hole,
    get
  }
}



const mapValue = (options, value, preloader) => {
  const isLDflex = typeof value?.extendPath === 'function'
  const isPromise = value instanceof Promise

  if (!isLDflex && !isPromise) return value

  // Return an uHTML interpolate callback.
  return (comment) => {
    const parentNode = comment.parentNode

    if (parentNode && parentNode instanceof HTMLElement) {
      render(parentNode, loaders.get(value) ?? options.loader())

      if (isPromise && !isLDflex) {
        return value.then(resolved => render(parentNode, html`${resolved}`))
      }

      if (isLDflex) {
        return preloader.then(() => value.then(async resolved => {
          const type = await (resolved?.datatype)?.id ?? 'iri'
          const valueValue = await resolved?.value  

          if (!valueValue) return parentNode.innerHTML = ''

          if (!options.dataHandlers[type]) throw new Error('Missing data handler: ' + type)
          return render(parentNode, options.dataHandlers[type](valueValue))  
        })).catch((exception) => {
          render(parentNode, options.error(exception))
        })
      }
    }
  }
}