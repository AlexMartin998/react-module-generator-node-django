import { InterfaceDeclaration } from 'ts-morph';
import { addSAfterFirstWord } from './code-generation';

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

export const getReturnUrlTablePageVarName = (interfaceName: string): string => {
  const returnUrl = `returnUrl${addSAfterFirstWord(interfaceName)}Page`;
  return returnUrl;
};

export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function getFormSchemaName(interfaceName: string): string {
  return `${toCamelCase(interfaceName)}FormSchema`;
}

// // actions
type GetAxiosUrlParams = {
  interfaceName: string;
  pm?: string;
  fcm?: string;

  getAll?: boolean;
  endPoint?: string;
};

export const getAxiosUrl = ({
  getAll,
  interfaceName,
  endPoint,
}: GetAxiosUrlParams): string => {
  const endPointName = endPoint ? endPoint : toKebabCase(interfaceName);

  if (getAll) {
    if (endPoint) {
      return `(\`/${endPointName}/\${queryParams}\`, true);`;
    }

    return `(\`/${endPointName}/?\${queryParams}\`, true);`;
  }

  return endPointName;
};
