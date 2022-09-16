export const wait = (seconds: number, text: any) => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(text)
    }, seconds * 1000)
  })

  promise.toString = function () {
    /* @ts-ignore */ // This is for uHTML
    return 'wait:' + seconds + (text?.template ? text?.template.join('') : text)
  }

  return promise
}