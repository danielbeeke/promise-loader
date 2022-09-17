export const loaders = new WeakMap()

export const withLoader = (promise, loader) => {
  loaders.set(promise, loader)
  return promise
}
