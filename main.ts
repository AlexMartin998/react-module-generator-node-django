/* eslint-disable indent */
import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  addSAfterFirstWord,
  getActionsCode,
  getCreatePageCode,
  getSaveFormComponentCode,
  getTablePageCode,
  getUpdatePageCode,
  getValidationSchemaCode,
} from './code-generation';
import { toKebabCase } from './helpers';

const argv = yargs(hideBin(process.argv)).argv;

// bun ./__ts__/main.ts --ts_file="src/shared/interfaces/sisrecob/test/test.interface.ts" --iname=Test --pm=sisrecob --fcm=test --ep="testasd-s-endpoint" --idmk="id_tesssst"
// // // --------------------------------------
const tsFile = argv.ts_file as string;
const interfaceName = argv.iname as string;
const parentModule = argv.pm as string;
const firstChildModule = argv.fcm as string;
// optional args
const endPoint = argv.ep as string;
const idModelKey = argv.idmk as string;

// Parse the ts_file argument to get the directory structure.
const tsFileDir = path.dirname(tsFile);
const tsFileDirParts = tsFileDir.split('/');

// Find the index of 'sisrecob' in the path
const sisrecobIndex = tsFileDirParts.indexOf('sisrecob');

const actionsFilename =
  toKebabCase(tsFileDirParts[tsFileDirParts.length - 1]) + '.actions.ts';
const baseActionsPath = `src/store/${tsFileDirParts
  .slice(sisrecobIndex)
  .join('/')}`;
const actionsPath = `${baseActionsPath}/${actionsFilename}`;

const project = new Project();
const sourceFile = project.addSourceFileAtPath(tsFile);
const interfaceObj = sourceFile.getInterface(interfaceName);

const writeActions = () => {
  if (interfaceObj) {
    // // set actions file path
    const actionsCode = getActionsCode({
      interfaceName,
      interfaceObj,
      interfaceText: interfaceObj.getText(),
      endPoint,
      idModelKey,
      parentModule,
    });

    // // write actions file, if exists delete it
    if (fs.existsSync(actionsPath)) fs.unlinkSync(actionsPath);
    if (!fs.existsSync(actionsPath)) {
      // if not exists path and directories create them
      if (!fs.existsSync(baseActionsPath)) {
        fs.mkdirSync(baseActionsPath, { recursive: true });
      }

      fs.writeFileSync(actionsPath, actionsCode);
    } else {
      console.log(`El archivo ${actionsPath} ya existe`);
    }

    //--------------------------------------
    // // write actions file, if exists delete it
    if (fs.existsSync(actionsPath)) fs.unlinkSync(actionsPath);
    if (!fs.existsSync(actionsPath)) {
      // if not exists path and directories create them
      if (!fs.existsSync(baseActionsPath)) {
        fs.mkdirSync(baseActionsPath, { recursive: true });
      }

      fs.writeFileSync(actionsPath, actionsCode);
    } else {
      console.log(`El archivo ${actionsPath} ya existe`);
    }

    // // write index INTERFACE file
    const indexFilename = 'index.ts';

    // Check if the directory exists, if not, create it
    const interfaceMainPathModule = `src/shared/interfaces/${parentModule}/${firstChildModule}`;
    if (!fs.existsSync(interfaceMainPathModule)) {
      fs.mkdirSync(interfaceMainPathModule, { recursive: true });
    }

    const indexPathInterfaces = `${interfaceMainPathModule}/${indexFilename}`;

    // interface index file
    if (!fs.existsSync(indexPathInterfaces)) {
      fs.writeFileSync(
        indexPathInterfaces,
        `export * from './${
          firstChildModule.includes('/')
            ? toKebabCase(firstChildModule).split('/')[1]
            : toKebabCase(firstChildModule)
        }.interface';`
      );
    } else {
      const indexContent = fs.readFileSync(indexPathInterfaces, 'utf8');
      if (!indexContent.includes(toKebabCase(firstChildModule))) {
        const criteriaToCheck = firstChildModule.includes('/')
          ? toKebabCase(firstChildModule).split('/')[1]
          : toKebabCase(firstChildModule);
        if (!indexContent.includes(criteriaToCheck)) {
          fs.appendFileSync(
            indexPathInterfaces,
            `export * from './${
              firstChildModule.includes('/')
                ? toKebabCase(firstChildModule).split('/')[1]
                : toKebabCase(firstChildModule)
            }.interface';`
          );
        }
      }
    }

    // // add import line to Interface Module index file
    const indexPathModuleInterface =
      interfaceMainPathModule.split('/').slice(0, -1).join('/') +
      `/${indexFilename}`;

    if (!fs.existsSync(indexPathModuleInterface)) {
      fs.writeFileSync(
        indexPathModuleInterface,
        `export * from './${
          firstChildModule.includes('/')
            ? toKebabCase(firstChildModule).split('/')[1]
            : toKebabCase(firstChildModule)
        }';`
      );
    } else {
      const indexContent = fs.readFileSync(indexPathModuleInterface, 'utf8');
      if (
        !indexContent.includes(
          firstChildModule.includes('/')
            ? toKebabCase(firstChildModule).split('/')[1]
            : toKebabCase(firstChildModule)
        )
      ) {
        fs.appendFileSync(
          indexPathModuleInterface,
          `
export * from './${
            firstChildModule.includes('/')
              ? toKebabCase(firstChildModule).split('/')[1]
              : toKebabCase(firstChildModule)
          }';`
        );
      }
    }

    // // write Actions Index file
    const indexPathActions = `${baseActionsPath}/${indexFilename}`;
    // if exists delete it - no problem 'cause it will have one line
    if (fs.existsSync(indexPathActions)) fs.unlinkSync(indexPathActions);
    if (!fs.existsSync(indexPathActions)) {
      fs.writeFileSync(indexPathActions, getIndexActionsContent(indexFilename));
    } else {
      const indexContent = fs.readFileSync(indexPathActions, 'utf8');
      if (!indexContent.includes(toKebabCase(firstChildModule))) {
        fs.appendFileSync(
          indexPathActions,
          getIndexActionsContent(indexFilename)
        );
      }
    }

    // // // // write TABLE Page -------------------
    // // //* table page
    // // set table page path
    const tablePagePathModule = `src/${parentModule}/${firstChildModule}`;

    const tablePageFilenameWithoutExt = `${addSAfterFirstWord(
      interfaceName
    )}Page`;
    const tablePageFilename = `${tablePageFilenameWithoutExt}.tsx`;
    const tablePagePathDir = `${tablePagePathModule}/pages/${tablePageFilenameWithoutExt}`;
    const tablePagePathFile = `${tablePagePathDir}/${tablePageFilename}`;

    // // write table page file if not exists, and if exists delete it
    if (fs.existsSync(tablePagePathFile)) fs.unlinkSync(tablePagePathFile);
    if (!fs.existsSync(tablePagePathFile)) {
      // if not exists path and directories create them
      if (!fs.existsSync(tablePagePathDir)) {
        const tablePageBarrel = `${tablePagePathDir}/index.ts`;

        fs.mkdirSync(tablePagePathDir, { recursive: true });
        fs.writeFileSync(
          tablePageBarrel,
          `export { default as ${tablePageFilenameWithoutExt} } from './${tablePageFilenameWithoutExt}';

export * from './${tablePageFilenameWithoutExt}';
`
        );
      }

      fs.writeFileSync(
        tablePagePathFile,
        getTablePageCode({
          interfaceName,
          interfaceText: interfaceObj.getText(),
          interfaceObj,
          actionsPath,
          parentModule,
          firstChildModule,
          idModelKey,
        })
      );
    }

    // // // // write CREATE Page -------------------
    // // set create page path
    const createPageFilenameWithoutExt = `Create${interfaceName}Page`;
    const createPageFilename = `${createPageFilenameWithoutExt}.tsx`;
    const createPagePathDir = `${tablePagePathModule}/pages/${createPageFilenameWithoutExt}`;
    const createPagePathFile = `${createPagePathDir}/${createPageFilename}`;

    // // write create page file if not exists, and if exists delete it
    if (fs.existsSync(createPagePathFile)) fs.unlinkSync(createPagePathFile);
    if (!fs.existsSync(createPagePathFile)) {
      // if not exists path and directories create them
      if (!fs.existsSync(createPagePathDir)) {
        // Check if the directory exists, if not, create it
        fs.mkdirSync(createPagePathDir, { recursive: true });

        // Write index file if not exists, and if exists delete it
        const createPageBarrel = `${createPagePathDir}/index.ts`;
        fs.writeFileSync(
          createPageBarrel,
          `export { default as ${createPageFilenameWithoutExt} } from './${createPageFilenameWithoutExt}';`
        );
      }

      fs.writeFileSync(
        createPagePathFile,
        getCreatePageCode({
          interfaceName,
          // parentModule,
          // firstChildModule,
        })
      );
    } else {
      console.log(`El archivo ${createPagePathFile} ya existe`);
    }

    // // // // write upd page -------------------
    // // set upd page path
    const updPageFilenameWithoutExt = `Update${interfaceName}Page`;
    const updPageFilename = `${updPageFilenameWithoutExt}.tsx`;
    const updPagePathDir = `${tablePagePathModule}/pages/${updPageFilenameWithoutExt}`;
    const updPagePathFile = `${updPagePathDir}/${updPageFilename}`;

    // // write upd page file if not exists, and if exists delete it
    if (fs.existsSync(updPagePathFile)) fs.unlinkSync(updPagePathFile);
    if (!fs.existsSync(updPagePathFile)) {
      // if not exists path and directories create them
      if (!fs.existsSync(updPagePathDir)) {
        const updPageBarrel = `${updPagePathDir}/index.ts`;

        fs.mkdirSync(updPagePathDir, { recursive: true });
        fs.writeFileSync(
          updPageBarrel,
          `export { default as ${updPageFilenameWithoutExt} } from './${updPageFilenameWithoutExt}';`
        );
      }

      fs.writeFileSync(
        updPagePathFile,
        getUpdatePageCode({
          interfaceName,
          actionsPath,
          firstChildModule,
          idModelKey,
        })
      );
    }

    // // // write table page index file
    const tablePageIndexFile = `${tablePagePathModule}/pages/${indexFilename}`;
    if (!fs.existsSync(tablePageIndexFile)) {
      fs.writeFileSync(
        tablePageIndexFile,
        `export * from './${tablePageFilenameWithoutExt}';
export * from './${createPageFilenameWithoutExt}';
export * from './${updPageFilenameWithoutExt}';`
      );
    } else {
      // add import line to module index file if it's not added yet
      const tablePageIndexContent = fs.readFileSync(tablePageIndexFile, 'utf8');
      if (!tablePageIndexContent.includes(tablePageFilenameWithoutExt)) {
        fs.appendFileSync(
          tablePageIndexFile,
          `export * from './${tablePageFilenameWithoutExt}';`
        );
      }
    }

    // // // // write save form SCHEMA --------------------------
    // // set save form schema path
    const saveFormSchemaPathDir = `src/shared/utils/validation-schemas/${tsFileDirParts
      .slice(sisrecobIndex)
      .join('/')}`;
    const saveFormSchemaFilename =
      toKebabCase(tsFileDirParts[tsFileDirParts.length - 1]) + '.schema.ts';
    const saveFormSchemaPathFile = `${saveFormSchemaPathDir}/${saveFormSchemaFilename}`;

    // // write save form schema file if not exists, and if exists delete it
    if (fs.existsSync(saveFormSchemaPathFile))
      fs.unlinkSync(saveFormSchemaPathFile);
    if (!fs.existsSync(saveFormSchemaPathFile)) {
      // if not exists path and directories create them
      if (!fs.existsSync(saveFormSchemaPathDir)) {
        fs.mkdirSync(saveFormSchemaPathDir, { recursive: true });
      }

      fs.writeFileSync(
        saveFormSchemaPathFile,
        getValidationSchemaCode({
          interfaceName,
          interfaceObj,
        })
      );
    } else {
      console.log(`El archivo ${saveFormSchemaPathFile} ya existe`);
    }

    // // write save form SCHEMA index file
    const saveFormSchemaIndexFile = `${saveFormSchemaPathDir}/${indexFilename}`;
    if (!fs.existsSync(saveFormSchemaIndexFile)) {
      fs.writeFileSync(
        saveFormSchemaIndexFile,
        `export * from './${
          firstChildModule.includes('/')
            ? toKebabCase(firstChildModule).split('/')[1]
            : toKebabCase(firstChildModule)
        }.schema';`
      );
    } else {
      // add import line to module index file if it's not added yet
      const saveFormSchemaIndexContent = fs.readFileSync(
        saveFormSchemaIndexFile,
        'utf8'
      );
      const criteriaToCheck = firstChildModule.includes('/')
        ? toKebabCase(firstChildModule).split('/')[1]
        : toKebabCase(firstChildModule);
      if (!saveFormSchemaIndexContent.includes(criteriaToCheck)) {
        fs.appendFileSync(
          saveFormSchemaIndexFile,
          `export * from './${toKebabCase(firstChildModule)}.schema';`
        );
      }
    }

    // // write save form schema index module file
    const saveFormSchemaPathComponentDir = `src/shared/utils/validation-schemas/${parentModule}`;
    const saveFormSchemaIndexModuleFile = `${saveFormSchemaPathComponentDir}/${indexFilename}`;

    if (!fs.existsSync(saveFormSchemaIndexModuleFile)) {
      fs.writeFileSync(
        saveFormSchemaIndexModuleFile,
        `export * from './${toKebabCase(firstChildModule)}';`
      );
    } else {
      // add import line to module index file if it's not added yet
      const saveFormSchemaIndexModuleContent = fs.readFileSync(
        saveFormSchemaIndexModuleFile,
        'utf8'
      );
      const criteriaToCheck = firstChildModule.includes('/')
        ? toKebabCase(firstChildModule).split('/')[1]
        : toKebabCase(firstChildModule);
      if (!saveFormSchemaIndexModuleContent.includes(criteriaToCheck)) {
        fs.appendFileSync(
          saveFormSchemaIndexModuleFile,
          `export * from './${
            firstChildModule.includes('/')
              ? toKebabCase(firstChildModule).split('/')[1]
              : toKebabCase(firstChildModule)
          }';`
        );
      }
    }

    // // // // write SAVE form component -------------------
    // // set save form component path
    const saveFormComponentFilename = `Save${interfaceName}`;
    const saveFormComponentPathDir = `${tablePagePathModule}/shared/components/${saveFormComponentFilename}`;
    const saveFormComponentPathFile = `${saveFormComponentPathDir}/${saveFormComponentFilename}.tsx`;

    // // write save form component file if not exists, and if exists delete it
    if (fs.existsSync(saveFormComponentPathFile))
      fs.unlinkSync(saveFormComponentPathFile);
    if (!fs.existsSync(saveFormComponentPathFile)) {
      // if not exists path and directories create them
      if (!fs.existsSync(saveFormComponentPathDir)) {
        fs.mkdirSync(saveFormComponentPathDir, { recursive: true });
      }

      fs.writeFileSync(
        saveFormComponentPathFile,
        getSaveFormComponentCode({
          interfaceName,
          interfaceObj,
          actionsPath,
          parentModule,
          firstChildModule,
          idModelKey,
        })
      );
    }

    // // write SAVE form component index file
    const saveFormComponentIndexFile = `${saveFormComponentPathDir}/${indexFilename}`;
    if (!fs.existsSync(saveFormComponentIndexFile)) {
      fs.writeFileSync(
        saveFormComponentIndexFile,
        `export { default as ${saveFormComponentFilename} } from './${saveFormComponentFilename}';`
      );
    } else {
      // add import line to module index file if it's not added yet
      const saveFormComponentIndexContent = fs.readFileSync(
        saveFormComponentIndexFile,
        'utf8'
      );
      if (!saveFormComponentIndexContent.includes(saveFormComponentFilename)) {
        fs.appendFileSync(
          saveFormComponentIndexFile,
          `export * from './${saveFormComponentFilename}';`
        );
      }
    }

    // // write save form component index module file
    const saveFormComponentPathComponentDir = `${tablePagePathModule}/shared/components`;
    const saveFormComponentIndexModuleFile = `${saveFormComponentPathComponentDir}/${indexFilename}`;

    if (!fs.existsSync(saveFormComponentIndexModuleFile)) {
      fs.writeFileSync(
        saveFormComponentIndexModuleFile,
        `export * from './${saveFormComponentFilename}';`
      );
    } else {
      // add import line to module index file if it's not added yet
      const saveFormComponentIndexModuleContent = fs.readFileSync(
        saveFormComponentIndexModuleFile,
        'utf8'
      );
      if (
        !saveFormComponentIndexModuleContent.includes(saveFormComponentFilename)
      ) {
        fs.appendFileSync(
          saveFormComponentIndexModuleFile,
          `export * from './${saveFormComponentFilename}';`
        );
      }
    }

    // // // final log
    console.log(`Se crearon los archivos para ${interfaceName}`);
  } else {
    console.log(`No se encontró la interfaz ${interfaceName} en ${tsFile}`);
  }
};
writeActions();

// // // -------------------------------------- Helpers
function getIndexActionsContent(indexFilename: string) {
  // if not exist create file and add import line
  if (!fs.existsSync(`${baseActionsPath}/${indexFilename}`)) {
    return `export * from './${
      firstChildModule.includes('/')
        ? toKebabCase(firstChildModule).split('/')[1]
        : toKebabCase(firstChildModule)
    }.actions';`;
  }

  // if exist get last line number and add
  if (fs.existsSync(`${baseActionsPath}/${indexFilename}`)) {
    const data = fs.readFileSync(`${baseActionsPath}/${indexFilename}`, 'utf8');
    const lines = data.split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.includes(toKebabCase(firstChildModule))) {
      return '';
    }
    return `export * from './${toKebabCase(firstChildModule)}.actions';`;
  }

  return `
export * from './${toKebabCase(firstChildModule)}.actions';
  `;
}
