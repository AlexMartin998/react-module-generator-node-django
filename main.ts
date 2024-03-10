/* eslint-disable indent */
import fs from 'fs';
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

// bun ./__ts__/main.ts --ts_file="src/shared/interfaces/sisrecob/del/test-pro.interface.ts" --iname=TestPro --pm=sisrecob --fcm=del
// // // --------------------------------------
const tsFile = argv.ts_file as string;
const interfaceName = argv.iname as string;
const parentModule = argv.pm as string;
const firstChildModule = argv.fcm as string;

const interfaceMainPath = `src/shared/interfaces/${parentModule}`;
const interfaceMainPathModule = `${interfaceMainPath}/${firstChildModule}`;
const actionsFilename = toKebabCase(interfaceName) + '.actions.ts';
const baseActionsPath = `src/store/${parentModule}/${firstChildModule}`;
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

    // // write index interface file
    const indexFilename = 'index.ts';
    const indexPathInterfaces = `${interfaceMainPathModule}/${indexFilename}`;
    if (!fs.existsSync(indexPathInterfaces)) {
      fs.writeFileSync(
        indexPathInterfaces,
        `export * from './${toKebabCase(interfaceName)}.interface';`
      );
    } else {
      const indexContent = fs.readFileSync(indexPathInterfaces, 'utf8');
      if (!indexContent.includes(toKebabCase(interfaceName))) {
        fs.appendFileSync(
          indexPathInterfaces,
          `export * from './${toKebabCase(interfaceName)}.interface';`
        );
      }
    }

    // add import line to module index file
    const indexPathModuleInterface = `${interfaceMainPath}/${indexFilename}`;
    if (!fs.existsSync(indexPathModuleInterface)) {
      fs.writeFileSync(
        indexPathModuleInterface,
        `export * from './${toKebabCase(interfaceName)}.interface';`
      );
    } else {
      const indexContent = fs.readFileSync(indexPathModuleInterface, 'utf8');
      if (!indexContent.includes(firstChildModule)) {
        fs.appendFileSync(
          indexPathModuleInterface,
          `export * from './${firstChildModule}';`
        );
      }
    }

    // // write actions index file
    const indexPathActions = `${baseActionsPath}/${indexFilename}`;
    if (!fs.existsSync(indexPathActions)) {
      fs.writeFileSync(indexPathActions, getIndexActionsContent(indexFilename));
    } else {
      const indexContent = fs.readFileSync(indexPathActions, 'utf8');
      if (!indexContent.includes(toKebabCase(interfaceName))) {
        fs.appendFileSync(
          indexPathActions,
          getIndexActionsContent(indexFilename)
        );
      }
    }

    // // // // write table page -------------------
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
        })
      );
    }

    // // // // write CREATE page -------------------
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
        const createPageBarrel = `${createPagePathDir}/index.ts`;

        fs.mkdirSync(createPagePathDir, { recursive: true });
        fs.writeFileSync(
          createPageBarrel,
          `export { default as ${createPageFilenameWithoutExt} } from './${createPageFilenameWithoutExt}';`
        );
      }

      fs.writeFileSync(
        createPagePathFile,
        getCreatePageCode({
          interfaceName,
        })
      );
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

    // // // // write SAVE form SCHEMA -------------------
    // // set save form schema path
    const saveFormSchemaFilename = `${toKebabCase(interfaceName)}.schema.ts`;
    const saveFormSchemaPathDir = `src/shared/utils/validation-schemas/${parentModule}/${firstChildModule}`;
    const saveFormSchemaPathFile = `${saveFormSchemaPathDir}/${saveFormSchemaFilename}`;
    console.log({
      saveFormSchemaFilename,
      saveFormSchemaPathDir,
      saveFormSchemaPathFile,
    });

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
  } else {
    console.log(`No se encontró la interfaz ${interfaceName} en ${tsFile}`);
  }
};
// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
writeActions();

// // // -------------------------------------- Helpers
function getIndexActionsContent(indexFilename: string) {
  // if not exist create file and add import line
  if (!fs.existsSync(`${baseActionsPath}/${indexFilename}`)) {
    return `export * from './${toKebabCase(interfaceName)}.actions';`;
  }

  // if exist get last line number and add
  if (fs.existsSync(`${baseActionsPath}/${indexFilename}`)) {
    const data = fs.readFileSync(`${baseActionsPath}/${indexFilename}`, 'utf8');
    const lines = data.split('\n');
    const lastLine = lines[lines.length - 1];
    if (lastLine.includes(toKebabCase(interfaceName))) {
      return '';
    }
    return `export * from './${toKebabCase(interfaceName)}.actions';`;
  }

  return `
export * from './${toKebabCase(interfaceName)}.actions';
  `;
}
