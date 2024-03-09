/* eslint-disable indent */
import { InterfaceDeclaration } from 'ts-morph';
import { getFiltersButId, toKebabCase } from './helpers';

type GetActionsCodeParams = {
  interfaceName: string;
  interfaceText?: string;
  interfaceObj?: any;
};
export function getActionsCode({
  interfaceName,
  interfaceObj,
}: GetActionsCodeParams): string {
  return `import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { ${interfaceName}, ${
    addSAfterFirstWord(interfaceName.split('PaginatedRes')[0]) + 'PaginatedRes'
  }, MutationParams } from '@/shared/interfaces';
import { sisrecobAPI } from '@/shared/axios';
import { getUrlParams } from '@/shared/utils';

const { get, post, put, remove } = sisrecobAPI();

///* tanStack query
export const useFetch${interfaceName}s = (params?: Get${interfaceName}sParams) => {
  return useQuery({
    queryKey: ['${toKebabCase(
      interfaceName
    )}s', ...Object.values(params || {})],
    queryFn: () => get${interfaceName}s(params),
  });
};

export const useGet${interfaceName} = (id: number) => {
  return useQuery({
    queryKey: ['${toKebabCase(interfaceName)}', id],
    queryFn: () => get${interfaceName}(id),
  });
};

export const useCreate${interfaceName} = ({
  navigate,
  returnUrl,
  returnErrorUrl,
}: MutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: create${interfaceName},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${toKebabCase(
        interfaceName
      )}s'] });
      navigate(returnUrl);
      toast.success('${interfaceName} creado correctamente');
    },
    onError: () => {
      navigate(returnErrorUrl || returnUrl);
      toast.error('Error al crear el ${interfaceName}');
    },
  });
};

export const useUpdate${interfaceName} = ({
  navigate,
  returnUrl,
  returnErrorUrl,
}: MutationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: update${interfaceName},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${toKebabCase(
        interfaceName
      )}s'] });
      navigate(returnUrl);
      toast.success('${interfaceName} actualizado correctamente');
    },
    onError: () => {
      navigate(returnErrorUrl || returnUrl);
      toast.error('Error al actualizar el ${interfaceName}');
    },
  });
};

export const useDelete${interfaceName} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: delete${interfaceName},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${toKebabCase(
        interfaceName
      )}s'] });
      toast.success('${interfaceName} eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el ${interfaceName}');
    },
  });
};

///* axios
export type Get${interfaceName}sParams = {
  page?: number;
  page_size?: number;

  // filters
  ${getFiltersButId(interfaceObj, true)}
};
export type Create${interfaceName}Params = Omit<${interfaceName}, 'id_${interfaceName.toLowerCase()}'>;
export type Update${interfaceName}Params = {
  id: number;
  data: Create${interfaceName}Params;
}

export const get${interfaceName}s = (params?: Get${interfaceName}sParams) => {
  const queryParams = getUrlParams(params || {});
  return get<${
    addSAfterFirstWord(interfaceName.split('PaginatedRes')[0]) + 'PaginatedRes'
  }>(\`/${toKebabCase(interfaceName)}/\${queryParams}\`, true);
};

export const get${interfaceName} = (id: number) => {
  return get<${interfaceName}>(\`/${toKebabCase(interfaceName)}/\${id}\`, true);
};

export const create${interfaceName} = (data: Create${interfaceName}Params) => {
  return post<${interfaceName}>('/${toKebabCase(interfaceName)}/', data, true);
};

export const update${interfaceName} = ({ id, data }: Update${interfaceName}Params) => {
  return put<${interfaceName}>(\`/${toKebabCase(
    interfaceName
  )}/\${id}/\`, data, true);
};

export const delete${interfaceName} = (id: number) => {
  return remove<${interfaceName}>(\`/${toKebabCase(
    interfaceName
  )}/\${id}/\`, true);
};
`;
}

export function getTablePageCode({
  interfaceName,
  // interfaceText,
  actionsPath,
  interfaceObj,
  parentModule,
  firstChildModule,
}: GetActionsCodeParams & {
  actionsPath: string;
  parentModule: string;
  firstChildModule: string;
}): string {
  // find firstChildModule in actionsPath and slipt it
  const actionsPathSplit = actionsPath.split(firstChildModule);
  const actionsPathModule = (actionsPathSplit[0] + firstChildModule).replace(
    'src/',
    '@/' // replace src/ with @/
  );

  const returnUrl = `returnUrl${addSAfterFirstWord(interfaceName)}Page`;

  return `import { MRT_ColumnDef } from 'material-react-table';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CustomSearch,
  CustomTable,
  SingleTableBoxScene,
} from '@/shared/components';
import { useTableFilter } from '@/shared/hooks/useTableFilter';
import { ${interfaceName} } from '@/shared/interfaces';
import {
  useDelete${interfaceName},
  useFetch${interfaceName}s,
} from '${actionsPathModule}';
import { useUiConfirmModalStore } from '@/store/ui';

// TODO: change this to the correct url
export const ${returnUrl} = '/${parentModule}/${firstChildModule}';
 
export type ${addSAfterFirstWord(interfaceName)}PageProps = {};

const ${addSAfterFirstWord(interfaceName)}Page: React.FC<${addSAfterFirstWord(
    interfaceName
  )}PageProps> = () => {
  const navigate = useNavigate();

  ///* global state
  const setConfirmDialog = useUiConfirmModalStore(s => s.setConfirmDialog);
  const setConfirmDialogIsOpen = useUiConfirmModalStore(
    s => s.setConfirmDialogIsOpen
  );

  ///* mutations
  const delete${interfaceName} = useDelete${interfaceName}();

  ///* table
  const {
    globalFilter,
    pagination,
    searchTerm,
    onChangeFilter,
    setPagination,
  } = useTableFilter();
  const { pageIndex, pageSize } = pagination;

  ///* fetch data
  const {
    data: ${addSAfterFirstWord(interfaceName)}PagingRes,
    isLoading,
    isRefetching,
  } = useFetch${interfaceName}s({
    page: pageIndex + 1,
    page_size: pageSize,
    // TODO: add filters here - searchTerm
  });

  ///* handlers
  const onEdit = (${interfaceName.toLowerCase()}: ${interfaceName}) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Editar ${interfaceName}',
      subtitle: '¿Está seguro que desea editar este ${interfaceName}?',
      onConfirm: () => {
        setConfirmDialogIsOpen(false);
        navigate(\`\${${returnUrl}}/editar/\${${interfaceName.toLowerCase()}.id_${interfaceName.toLowerCase()}}\`);
      },
    });
  };

  const onDelete = (${interfaceName.toLowerCase()}: ${interfaceName}) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar ${interfaceName}',
      subtitle: '¿Está seguro que desea eliminar este ${interfaceName}?',
      onConfirm: () => {
        setConfirmDialogIsOpen(false);
        delete${interfaceName}.mutate(${interfaceName.toLowerCase()}.id_${interfaceName.toLowerCase()}!);
      },
    });
  };

  ///* columns
  const columns = useMemo<MRT_ColumnDef<${interfaceName}>[]>(
    () => [
      ${genColumnsTable(interfaceObj)}
    ],
    []
  );

  return (
    <SingleTableBoxScene
      title="${interfaceName
        .split(/(?=[A-Z])/)
        .join(' ')
        .replace(/_/g, ' ')}"
      createPageUrl={\`\${${returnUrl}}/crear\`}
    >
      <CustomSearch
        onChange={onChangeFilter}
        value={globalFilter}
        text="por "
      />

      <CustomTable<${interfaceName}>
        columns={columns}
        data={${addSAfterFirstWord(interfaceName)}PagingRes?.data?.data || []}
        isLoading={isLoading}
        isRefetching={isRefetching}
        // // search
        enableGlobalFilter={false}
        // // pagination
        pagination={pagination}
        onPaging={setPagination}
        rowCount={${addSAfterFirstWord(interfaceName)}PagingRes?.data?.count}
        // // actions
        actionsColumnSize={180}
        // crud
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </SingleTableBoxScene>
  );
};

export default ${addSAfterFirstWord(interfaceName)}Page;
  `;
}

export function getCreatePageCode({ interfaceName }): string {
  return `import { Save${interfaceName}Form } from './../../shared/components';

export type Create${interfaceName}PageProps = {};

const Create${interfaceName}Page: React.FC<Create${interfaceName}PageProps> = () => {
  return <Save${interfaceName}Form title="Crear ${interfaceName}" />;
};

export default Create${interfaceName}Page;
`;
}

export function getUpdatePageCode({ interfaceName }): string {
  return `import { Save${interfaceName}Form } from './../../shared/components';

export type Update${interfaceName}PageProps = {};

const Update${interfaceName}Page: React.FC<Update${interfaceName}PageProps> = () => {
  return <Save${interfaceName}Form title="Editar ${interfaceName}" />;
};

export default Update${interfaceName}Page;
`;
}

export function getSaveFormComponentCode({
  interfaceName,
  // interfaceText,
  actionsPath,
  interfaceObj,
  parentModule,
  firstChildModule,
}: GetActionsCodeParams & {
  actionsPath: string;
  parentModule: string;
  firstChildModule: string;
}): string {
  // find firstChildModule in actionsPath and slipt it
  const actionsPathSplit = actionsPath.split(firstChildModule);
  const actionsPathModule = (actionsPathSplit[0] + firstChildModule).replace(
    'src/',
    '@/' // replace src/ with @/
  );

  return `import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

${getCustomComponentsImportsBasedOnType(interfaceObj)}
import { ${interfaceName}, ${
    addSAfterFirstWord(interfaceName.split('PaginatedRes')[0]) + 'PaginatedRes'
  } } from '@/shared/interfaces';
  `;
}

// // ------------------------------ Helpers
export function addSAfterFirstWord(str: string): string {
  const firstCapitalIndex = str
    .split('')
    .findIndex((char, i) => i !== 0 && char === char.toUpperCase());
  return str.slice(0, firstCapitalIndex) + 's' + str.slice(firstCapitalIndex);
}

export function genColumnsTable(interfaceObj: any): string {
  const properties = interfaceObj.getProperties();
  const columns = properties
    .map(prop => {
      const humanizedName = prop.getName().replace(/_/g, ' ');
      const capitalized =
        humanizedName.charAt(0).toUpperCase() + humanizedName.slice(1);

      return `{
        accessorKey: '${prop.getName()}',
        header: '${capitalized}',
        size: 180,
      }`;
    })
    .join(',\n  ');
  return columns;
}

export function getCustomComponentsImportsBasedOnType(
  interfaceObj: InterfaceDeclaration | undefined
) {
  if (!interfaceObj) return;

  // get props
  const properties = interfaceObj.getProperties();

  const componentsSet = new Set<string>();
  properties.forEach(prop => {
    const type = prop.getType().getText();
    if (type === 'string') {
      componentsSet.add('CustomTextField');
    }
    if (type === 'number' && !prop.getName().includes('id_')) {
      componentsSet.add('CustomNumberTextField');
    }
    if (type === 'boolean') {
      componentsSet.add('SampleCheckbox');
    }
  });

  const componentsArr = Array.from(componentsSet);
  if (componentsArr.length > 0) {
    return `import {\n  ${componentsArr.join(
      ',\n  '
    )}\n} from '@/shared/components';`;
  }
}

export function setCustomComponentBasedOnType(
  interfaceObj: InterfaceDeclaration | undefined,
  saveFormComponentPathComponentDir: string
) {
  if (!interfaceObj) return;
  console.log(
    'saveFormComponentPathComponentDir: ',
    saveFormComponentPathComponentDir
  );

  // get props
  const properties = interfaceObj.getProperties();

  const componentsArr = properties.map(prop => {
    const type = prop.getType().getText();
    if (type === 'string') {
      return `<CustomTextField
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        control={form.control}
        defaultValue={form.getValues('${prop.getName()}')}
        error={errors.${prop.getName()}}
        helperText={errors.${prop.getName()}?.message}
      />`;
    }
    if (type === 'number' && !prop.getName().includes('id_')) {
      console.log('number');
    }
    if (type === 'boolean') {
      console.log('boolean');
    }
  });

  return componentsArr.join('\n');
}
