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
    const paths = values.filter(value => typeof value?.extendPath === 'function')
    if (paths.length) await preloadPaths(paths)

    values = values.map((value, index) => {
      const isAttr = templates[index].trim().endsWith('=')
      const isLDflex = typeof value?.extendPath === 'function'
      const mapper = mapValue(options, isAttr && isLDflex ? ldflexAttribute(value) : value)
      return mapper
    })

    return html(templates, ...values)
  }
}

export const preloadPaths = async (paths) => {
  const pathSubjects = new Map()

  const filteredPaths = (await Promise.all(paths.map(async path => {
    return await path.path
  }))).filter(path => !path.resultsCache)
  .map(path => path.proxy)

  for (const path of filteredPaths) {
    const subject = await (await path.subject).value
    if (!pathSubjects.has(subject)) pathSubjects.set(subject, [])
    const pathParts = pathSubjects.get(subject)
    pathParts.push(path)
  }

  for (const pathParts of pathSubjects.values()) {
    const pathExpressions = (await Promise.all(
      pathParts.map(value => value.pathExpression)
    )).map(pathExpression => {
      return pathExpression.filter(item => item.predicate).map(item => item.predicate.value)
    }).map(pathExpression => {
      const parts = pathExpression.map(part => part.startsWith('http') ? `<${part}>` : part)
      return parts.join(' / ')
    })
    .filter(Boolean)

    const object = pathParts[0].parent

    if (object) {
      try {
        object.finalClause = (variable) => `VALUES ${variable} { <${object.subject.value}> }`
         await object.proxy.preload(...pathExpressions)
  
        for (const path of pathParts) {
          const predicate = await (await path?.predicate)?.value
          if (predicate) {
            const cache = object.resultsCache[0].path.propertyCache[predicate]
            path.path.resultsCache = cache  
          }
        }
      }
      catch (exception) {
        console.log(exception)
      }  
    } 
  }
}

const mapValue = (options, value) => {
  const isLDflex = typeof value?.extendPath === 'function'
  if (isLDflex) value = new Promise(resolve => resolve(value))
  const isPromise = value instanceof Promise

  if (!isLDflex && !isPromise) return value

  // Return an uHTML interpolate callback.
  return (comment) => {
    const parentNode = comment.parentNode

    if (parentNode && parentNode instanceof HTMLElement) {
      render(parentNode, value.loader ?? options.defaultLoader)

      if (isPromise && !isLDflex) {
        value.then(resolved => render(parentNode, html`${resolved}`))
        return 
      }

      if (isLDflex) {
        value.then(async resolved => {
          const type = await (resolved?.datatype)?.id ?? 'iri'
          const valueValue = await resolved?.value  

          if (!valueValue) return parentNode.innerHTML = ''

          if (!options.dataHandlers[type]) throw new Error('Missing data handler: ' + type)
          return render(parentNode, options.dataHandlers[type](valueValue))  
        })
        return
      }
    }
  }
}