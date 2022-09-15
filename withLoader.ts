export const withLoader = (promise, loader) => {
  promise.loader = loader
  return promise
}
