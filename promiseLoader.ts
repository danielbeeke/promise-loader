export const promiseLoader = (options: {
  html: Function,
  render: Function,
  loader: any,
  element: HTMLElement
}) => {
  const render = (contents) => options.render(options.element, contents)
  const html = function (templates, ...values) {

    values = values.map(value => {
      if (value instanceof Promise) {
        let createdElement

        value.then(resolved => {
          options.render(createdElement, resolved)
        })

        return options.html`<span ref=${element => {
          if (element) {
            createdElement = element
            options.render(element, options.loader)  
          }
        }}></span>`
      }

      return value
    })

    return options.html(templates, ...values)
  }

  return {
    html, 
    render
  }
}