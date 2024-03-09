import { InterfaceDeclaration } from 'ts-morph';

export const toKebabCase = (str: string): string => {
  return str.replace(/(.)([A-Z])/g, '$1-$2').toLowerCase();
};

export const getFiltersButId = (
  interfaceObj: InterfaceDeclaration,
  isOnlyFilters = false
): string => {
  const properties = interfaceObj.getProperties();
  const filters = properties
    .map(prop => {
      if (prop.getName().includes('id')) return '';

      return `${prop.getName()}${isOnlyFilters ? '?' : ''}: ${prop
        .getType()
        .getText()}; `;
    })
    .join('\n  ');
  return filters;
};
