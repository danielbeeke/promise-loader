import AbstractPathResolver from 'ldflex/src/AbstractPathResolver';

/**
 * This is a mutilated version of the LDflex ComplexPathResolver.
 * Because of this our LDflex paths may not support certain features.
 */
export default class ComplexPathResolver extends AbstractPathResolver {
  supports(property) {
    return super.supports(property) && /((^|[/|])[\^])|(([a-z:>)])[*+?])|([)>*+?]|[a-z]*[:][a-z]*)[|/]([<(^]|[a-z]*[:][a-z]*)|(((^[(<])|([)>]$)))/i.test(property);
  }

  async lookupProperty(property) {
    if (
      property.startsWith('<') && property.endsWith('>') && property.split('<').length === 2) {
        return { termType: 'namedNode', value: property.substring(1).substring(0, property.length - 2) };
      }

    try {
      return {
        termType: 'path',
        value: property
      };
    } catch (e) {
      throw new Error(`The Complex Path Resolver cannot expand the '${property}' path`);
    }
  }

}