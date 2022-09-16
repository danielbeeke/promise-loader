import { html, render } from 'uhtml'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { foreign } from 'uhandlers'
import { loaders } from './withLoader'
import { preloadPaths } from './preloadPaths'

const ldflexAttribute = (value, preloader) => foreign((node, name, value) => {
  preloader.then(() => {
    value.value.then(resolved => {
      if (typeof resolved === 'string') {
        node.setAttribute(name, resolved)
      }  
    })  
  })
}, value)

export const interpolatedValueHandler = (options: {
  loader: any,
  error: any,
  dataHandlers: {
    [key: string]: Function
  },
  context: {
    [key: string]: string
  }
}) => {
  const parsedContext = new JsonLdContextNormalized(options.context)
  
  for (const [type, handler] of Object.entries(options.dataHandlers)) {
    const expandedType = parsedContext.expandTerm(type)
    if (expandedType !== type) options.dataHandlers[expandedType] = handler
  }

  return function (templates, ...values) {
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