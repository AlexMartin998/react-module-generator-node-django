/* eslint-disable indent */
import { InterfaceDeclaration } from 'ts-morph';
import {
  getFiltersButId,
  getFormSchemaName,
  getReturnUrlTablePageVarName,
  toKebabCase,
} from './helpers';

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
      navigate && returnUrl && navigate(returnUrl);
      toast.success('${interfaceName} creado correctamente');
    },
    onError: () => {
      navigate && returnUrl && navigate(returnErrorUrl || returnUrl || '');
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
      navigate && returnUrl && navigate(returnUrl);
      toast.success('${interfaceName} actualizado correctamente');
    },
    onError: () => {
      navigate && returnUrl && navigate(returnErrorUrl || returnUrl || '');
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
  }>(\`/${toKebabCase(interfaceName)}/?\${queryParams}\`, true);
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

  const returnUrl = `${getReturnUrlTablePageVarName(interfaceName)}`;

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
import { emptyCellOneLevel } from '@/shared/utils';

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
    // searchTerm, // TODO: add filters here - searchTerm
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
  return `import { Save${interfaceName} } from './../../shared/components';

export type Create${interfaceName}PageProps = {};

const Create${interfaceName}Page: React.FC<Create${interfaceName}PageProps> = () => {
  return <Save${interfaceName} title="Crear ${interfaceName}" />;
};

export default Create${interfaceName}Page;
`;
}

export function getUpdatePageCode({
  interfaceName,
  actionsPath,
  firstChildModule,
}): string {
  const actionsPathSplit = actionsPath.split(firstChildModule);
  const actionsPathModule = (actionsPathSplit[0] + firstChildModule).replace(
    'src/',
    '@/' // replace src/ with @/
  );
  const returnUrl = `${getReturnUrlTablePageVarName(interfaceName)}`;

  return `import { Navigate, useParams } from 'react-router-dom';

import { Save${interfaceName} } from './../../shared/components';
import { useGet${interfaceName} } from '${actionsPathModule}';
import { ${returnUrl} } from '../${addSAfterFirstWord(
    interfaceName
  )}Page/${addSAfterFirstWord(interfaceName)}Page';

export type Update${interfaceName}PageProps = {};

const Update${interfaceName}Page: React.FC<Update${interfaceName}PageProps> = () => {
  const { id } = useParams();
  const { data, isLoading } = useGet${interfaceName}(+id!);

  if (isLoading) return null;
  if (!data?.data?.id_${interfaceName.toLowerCase()}) return <Navigate to={${getReturnUrlTablePageVarName(
    interfaceName
  )}} />;

  return <Save${interfaceName}
    title="Editar ${interfaceName}"
    ${interfaceName.toLowerCase()}={data.data}
  />;
};

export default Update${interfaceName}Page;
`;
}

export function getSaveFormComponentCode({
  interfaceName,
  // interfaceText,
  actionsPath,
  interfaceObj,
  // parentModule,
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

  const contentText = interfaceObj.getText();
  const thereIsFk = contentText.includes('///* fk');
  let capitalizedInterfaceNameFkArr = [];
  if (thereIsFk) {
    const contentAfterFkComment = contentText.split('///* fk')[1].split('}')[0];
    const fkPropsAndValue = contentAfterFkComment
      .split(';')
      .map(prop => prop.trim())
      .filter(Boolean);
    capitalizedInterfaceNameFkArr = fkPropsAndValue.map(fk => {
      const [prop /* propType */] = fk.split(':');
      return prop.charAt(0).toUpperCase() + prop.slice(1);
    });
  }

  return `import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

${getCustomComponentsImportsBasedOnType(interfaceObj)}
import { gridSizeMdLg6 } from '@/shared/constants';
import { 
  ${interfaceName},
  ${
    capitalizedInterfaceNameFkArr.length > 0
      ? capitalizedInterfaceNameFkArr
      : ''
  }

} from '@/shared/interfaces';
import { ${getFormSchemaName(interfaceName)} } from '@/shared/utils';
import { 
  useCreate${interfaceName}, 
  useUpdate${interfaceName},
  Create${interfaceName}Params,
} from '${actionsPathModule}';
import { ${getReturnUrlTablePageVarName(interfaceName)} } from '../../../pages';

export interface Save${interfaceName}Props {
  title: string;
  ${interfaceName.toLowerCase()}?: ${interfaceName};
}

type SaveFormData =  Create${interfaceName}Params & {};

const Save${interfaceName}: React.FC<Save${interfaceName}Props> = ({ title, ${interfaceName.toLowerCase()} } ) => {
  const navigate = useNavigate();

  ///* form
  const form = useForm<SaveFormData>({
    resolver: yupResolver(${getFormSchemaName(interfaceName)}),
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = form;

  ///* mutations
  const create${interfaceName}Mutation = useCreate${interfaceName}({
    navigate,
    returnUrl: ${getReturnUrlTablePageVarName(interfaceName)},
  });
  const update${interfaceName}Mutation = useUpdate${interfaceName}({
    navigate,
    returnUrl: ${getReturnUrlTablePageVarName(interfaceName)},
  });

  ///* handlers
  const onSave = async (data: SaveFormData) => {
    if (!isValid) return;

    ///* upd
    if (${interfaceName.toLowerCase()}?.id_${interfaceName.toLowerCase()}) {
      update${interfaceName}Mutation.mutate({ id: ${interfaceName.toLowerCase()}.id_${interfaceName.toLowerCase()}, data }
      );
      return;
    }

    ///* create
    create${interfaceName}Mutation.mutate(data);
  };

  ///* effects
  useEffect(() => {
    if (!${interfaceName.toLowerCase()}?.id_${interfaceName.toLowerCase()}) return;
    reset(${interfaceName.toLowerCase()});
  }, [${interfaceName.toLowerCase()}, reset]);


  return (
    <SingleFormBoxScene
      titlePage={title}
      onCancel={() => navigate(${getReturnUrlTablePageVarName(interfaceName)})}
      onSave={handleSubmit(onSave, () => {})}
    >${setCustomComponentBasedOnType(interfaceObj)}
    </SingleFormBoxScene>
  );
};

export default Save${interfaceName};
`;
}

export function getValidationSchemaCode({
  interfaceObj,
}: GetActionsCodeParams): string {
  const properties = interfaceObj.getProperties();
  const schema = properties
    .map(prop => {
      if (prop.getName().includes('id_')) return;

      const type = prop.getType().getText();
      const required = !prop.hasQuestionToken();
      const name = prop.getName();
      const humanizedName = name.replace(/_/g, ' ');
      const schema = `${name}: yup.${type}()${
        type === 'number' || type === 'boolean'
          ? `.typeError('El campo ${humanizedName} es requerido')`
          : ''
      }${
        required
          ? `.required('El campo ${humanizedName} es requerido'),`
          : '.optional().nullable(),'
      }`;
      return schema;
    })
    .join('\n  ');

  return `import * as yup from 'yup';

export const ${getFormSchemaName(
    interfaceObj.getName()
  )} = yup.object({${schema}
});
`;
}

// // ------------------------------ Helpers
export function addSAfterFirstWord(str: string): string {
  const firstCapitalIndex = str
    .split('')
    .findIndex((char, i) => i !== 0 && char === char.toUpperCase());
  if (firstCapitalIndex === -1) {
    return str + 's';
  } else {
    return str.slice(0, firstCapitalIndex) + 's' + str.slice(firstCapitalIndex);
  }
}

export function genColumnsTable(interfaceObj: any): string {
  const properties = interfaceObj.getProperties();
  const columns = properties
    .map(prop => {
      const humanizedName = prop.getName().replace(/_/g, ' ');
      const capitalized =
        humanizedName.charAt(0).toUpperCase() + humanizedName.slice(1);

      return `
      {
        accessorKey: '${prop.getName()}',
        header: '${capitalized}',
        size: 180,
        Cell: ({ row }) => emptyCellOneLevel(row, '${prop.getName()}'),
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
  const contentText = interfaceObj.getText();

  const thereIsFk = contentText.includes('///* fk');
  let fkPropsAndValue: any = [];
  if (thereIsFk) {
    const contentAfterFkComment = contentText.split('///* fk')[1].split('}')[0];
    fkPropsAndValue = contentAfterFkComment
      .split(';')
      .map(prop => prop.trim())
      .filter(Boolean);
  }

  properties.forEach(prop => {
    const type = prop.getType().getText();

    if (type === 'string') {
      // there is fk
      if (fkPropsAndValue.some(fk => fk.includes(prop.getName()))) {
        componentsSet.add('CustomAutocomplete');
      }

      // is date field
      if (prop.getName().includes('fecha')) {
        componentsSet.add('SampleDatePicker');
      }

      // is telefono or celular
      if (
        prop.getName().includes('telefono') ||
        prop.getName().includes('celular')
      ) {
        componentsSet.add('CustomCellphoneTextField');
      } else componentsSet.add('CustomTextField');
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
    componentsArr.push('SingleFormBoxScene');
    return `import {\n  ${componentsArr.join(
      ',\n  '
    )}\n} from '@/shared/components';`;
  }
}

export function setCustomComponentBasedOnType(
  interfaceObj: InterfaceDeclaration | undefined
) {
  if (!interfaceObj) return;
  // get props
  const properties = interfaceObj.getProperties();
  const contentText = interfaceObj.getText();

  const thereIsFk = contentText.includes('///* fk');
  let fkPropsAndValue: any = [];
  if (thereIsFk) {
    const contentAfterFkComment = contentText.split('///* fk')[1].split('}')[0];
    fkPropsAndValue = contentAfterFkComment
      .split(';')
      .map(prop => prop.trim())
      .filter(Boolean);
  }

  const fkComponents = fkPropsAndValue.map(fk => {
    const [prop /* propType */] = fk.split(':');
    const capitalizedModelName = prop.charAt(0).toUpperCase() + prop.slice(1);

    return `
      <CustomAutocomplete<${capitalizedModelName}>
        label="${capitalizedModelName}"
        name="${prop}"
        // options
        options={[] || []}
        valueKey="string" // TODO: check this
        defaultValue={form.getValues().${prop}}
        isLoadingData={false} // TODO: add loading
        // vaidation
        control={form.control}
        error={errors.${prop}}
        helperText={errors.${prop}?.message}
        size={gridSizeMdLg6}
      />`;
  });
  const fkComponentsStr = fkComponents.join('\n');

  const componentsArr = properties.map(prop => {
    const type = prop.getType().getText();
    if (type === 'string') {
      // is fk
      if (fkPropsAndValue.some(fk => fk.includes(prop.getName()))) return;

      // is date field
      if (prop.getName().includes('fecha')) {
        return `
      <SampleDatePicker
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        control={form.control}
        defaultValue={form.getValues().${prop.getName()}}
        error={errors.${prop.getName()}}
        helperText={errors.${prop.getName()}?.message}
        size={gridSizeMdLg6}
      />`;
      }

      // is telefono or celular
      if (
        prop.getName().includes('telefono') ||
        prop.getName().includes('celular')
      ) {
        return `
      <CustomCellphoneTextField
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        control={form.control}
        defaultValue={form.getValues().${prop.getName()}}
        error={errors.${prop.getName()}}
        helperText={errors.${prop.getName()}?.message}
        size={gridSizeMdLg6}
      />`;
      }

      // is email
      if (prop.getName().includes('email')) {
        return `
      <CustomTextField
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        type="email"
        control={form.control}
        defaultValue={form.getValues().${prop.getName()}}
        error={errors.${prop.getName()}}
        helperText={errors.${prop.getName()}?.message}
        size={gridSizeMdLg6}
      />`;
      }

      return `
      <CustomTextField
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        control={form.control}
        defaultValue={form.getValues().${prop.getName()}}
        error={errors.${prop.getName()}}
        helperText={errors.${prop.getName()}?.message}
        size={gridSizeMdLg6}
      />`;
    }
    if (type === 'number' && !prop.getName().includes('id_')) {
      return `
      <CustomNumberTextField
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        control={form.control}
        defaultValue={form.getValues().${prop.getName()}}
        error={errors.${prop.getName()}}
        helperText={errors.${prop.getName()}?.message}
        size={gridSizeMdLg6}
        min={0}
      />`;
    }
    if (type === 'boolean') {
      return `
      <SampleCheckbox
        label="${prop.getName().replace(/_/g, ' ')}"
        name="${prop.getName()}"
        control={form.control}
        defaultValue={form.getValues().${prop.getName()}}
        size={gridSizeMdLg6}
      />
      `;
    }
  });

  return componentsArr.join('\n') + fkComponentsStr;
}
