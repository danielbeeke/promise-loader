export const preloadPaths = async (paths) => {
  const pathSubjects = new Map()

  const filteredPaths = (await Promise.all(paths.map(async path => {
    return await path.path
  }))).filter(path => {
    return !path.resultsCache
  })
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