import { html, render } from 'uhtml/esm/async'
import { JsonLdContextNormalized } from 'jsonld-context-parser'
import { foreign } from 'uhandlers'

const ldflexAttribute = (value) => foreign((node, name, value) => {
  value.value.then(resolved => {
    if (typeof resolved === 'string') {
      node.setAttribute(name, resolved)
    }  
  })
}, value)

export const interpolatedValueHandler = (options: {
  defaultLoader: any,
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

  return async function (templates, ...values) {
    const object = values.find(value => typeof value.extendPath === 'function')

    const pathExpressions = (await Promise.all(
      values
        .filter(value => typeof value.extendPath === 'function')
        .map(value => value.pathExpression)
    )).map(pathExpression => {
      return pathExpression.filter(item => item.predicate).map(item => item.predicate.value)
    }).map(pathExpression => {
      const parts = pathExpression.map(part => part.startsWith('http') ? `<${part}>` : part)
      return parts.join(' / ')
    })
  
    await object.preload(...pathExpressions)

    values = values.map((value, index) => {
      const isAttr = templates[index].trim().endsWith('=')
      const isLDflex = typeof value.extendPath === 'function'
      const mapper = mapValue(options, isAttr && isLDflex ? ldflexAttribute(value) : value)
      return mapper
    })

    return html(templates, ...values)
  }
}

const mapValue = (options, value) => {
  const isLDflex = typeof value.extendPath === 'function'
  if (isLDflex) value = new Promise(resolve => resolve(value))
  const isPromise = value instanceof Promise

  if (!isLDflex && !isPromise) return value

  // Return an uHTML interpolate callback.
  return (comment) => {
    const parentNode = comment.parentNode

    if (parentNode && parentNode instanceof HTMLElement) {
      render(parentNode, value.loader ?? options.defaultLoader)

      if (isPromise && !isLDflex) {
        value.then(resolved => {
          return render(parentNode, resolved)
        })
        return 
      }

      if (isLDflex) {
        value.then(async resolved => {
          const type = await (resolved?.datatype)?.id ?? 'iri'
          const valueValue = await resolved?.value  

          if (!valueValue) return ''

          if (!options.dataHandlers[type]) throw new Error('Missing data handler: ' + type)
          return render(parentNode, options.dataHandlers[type](valueValue))  
        })
        return
      }
    }
  }
}