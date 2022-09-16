export function toIterablePromise(iterable) {
  // If called with a generator function,
  // memoize it to enable multiple iterations
  if (typeof iterable === 'function')
    iterable = memoizeIterable(iterable());

  // Return an object that is iterable and a promise
  return {
    [Symbol.asyncIterator]() {
      return iterable[Symbol.asyncIterator]();
    },
    get then() {
      return getThen(() => getFirstItem(this));
    },
    catch(onRejected) {
      return this.then(null, onRejected);
    },
    finally(callback) {
      return this.then().finally(callback);
    },
  };
}


/**
 * Returns a memoized version of the iterable
 * that can be iterated over as many times as needed.
 */
 export function memoizeIterable(iterable) {
  const cache = [];
  let iterator = iterable[Symbol.asyncIterator]();

  return {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        async next() {
          // Return the item if it has been read already
          if (i < cache.length)
            return cache[i++];

          // Stop if there are no more items
          if (!iterator)
            return { done: true };

          // Read and cache an item from the iterable otherwise
          const item = cache[i++] = iterator.next();
          if ((await item).done)
            iterator = null;
          return item;
        },
      };
    },
  };
}

/**
 * Lazily returns the `then` function of the created promise.
 */
 export function getThen(createPromise) {
  return (onResolved, onRejected) =>
    createPromise().then(onResolved, onRejected);
}

/**
 * Gets the first element of the iterable.
 */
 export function getFirstItem(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return iterator.next().then(item => item.value);
}


function _isWildCard(tag) {
  return tag === '*';
}

function _matchLangTag(left, right) {
  const matchInitial = new RegExp(`/${left}/`, 'iu');
  return matchInitial.test(`/${right}/`);
}

// TODO: Not an XPath function
// TODO: Publish as package
// https://www.ietf.org/rfc/rfc4647.txt
// https://www.w3.org/TR/sparql11-query/#func-langMatches
export function langMatches(tag, range) {
  const langTags = tag.split('-');
  const rangeTags = range.split('-');

  if (!_matchLangTag(rangeTags[0], langTags[0]) &&
    !_isWildCard(langTags[0]))
    return false;

  let lI = 1;
  let rI = 1;
  while (rI < rangeTags.length) {
    if (_isWildCard(rangeTags[rI])) {
      rI++;
      // eslint-disable-next-line no-continue
      continue;
    }
    if (lI === langTags.length)
      return false;
    if (_matchLangTag(rangeTags[rI], langTags[lI])) {
      lI++;
      rI++;
      // eslint-disable-next-line no-continue
      continue;
    }
    if (langTags[lI].length === 1)
      return false;
    lI++;
  }
  return true;
}

/**
 * Resolves to the given item in the path data.
 * For example, new DataHandler({}, 'foo', 'bar')
 * will return pathData.foo.bar.
 *
 * Resolution can optionally be async,
 * and/or be behind a function call.
 */
export default class LanguageHandler {
  constructor(langCode) {
    this.langCode = langCode;
  }

  // Resolves the data path, or returns a function that does so
  handle(pathData, path) {
    return toIterablePromise(this._handle(pathData, path));
  }

  async* _handle(pathData, path) {
    pathData.skipDefaultLanguageFilter = true;
    for await (const item of path.results) {
      if (langMatches(await item.language, this.langCode))
        yield item;
    }
  }
}
