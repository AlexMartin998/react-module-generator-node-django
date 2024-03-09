# React code generator - MUI | TS | Django

This TypeScript script is used to generate actions and table pages for a given TypeScript interface. It uses the `ts-morph` library to read and analyze the TypeScript interface, and the `yargs` library to parse command line arguments.

## Tech

- React
- React Router DOM
- TypeScript
- `MUI` with custom components
- TanStack Query
- Axios
- Django

## Usage

You can run this script with the following command:

```bash
bun ./__ts__/main.ts --ts_file="src/shared/interfaces/app/del/test-pro.interface.ts" --iname=TestPro --pm=app --fcm=del
```

The script takes the following command line arguments:

- `ts_file`: The path to the TypeScript file that contains the interface.
- `iname`: The name of the TypeScript interface.
- `pm`: The parent module name.
- `fcm`: The first child module name.

# Functionality

The script performs the following steps:

1. It reads the TypeScript file and finds the specified interface.
2. It generates the code for the actions and table page based on the interface.
3. It writes the generated code to the appropriate files.
4. If the files already exist, it deletes them before writing the new code.
5. .It updates the index files to export the newly created actions and table page.

# Code Generation

The code generation is done in the `getActionsCode` and `getTablePageCode` functions. These functions take the interface name and the interface object as arguments, and return the generated code as a string.

The getActionsCode function generates the code for the actions. The `getTablePageCode` function generates the code for the table page.

# Helpers

The script uses a few helper functions:

toKebabCase: Converts a string from UpperCamelCase to kebab-case.
addSAfterFirstWord: Adds an 's' after the first word in a string.
getIndexActionsContent: Returns the content for the index actions file.
Output
The script writes the generated code to the following files:

- The actions file: `src/store/${parentModule}/${firstChildModule}/${interfaceName}.actions.ts`
- The table page file: `src/${parentModule}/${firstChildModule}/pages/${interfaceName}Page.tsx`
- The index files: `src/shared/interfaces/${parentModule}/${firstChildModule}/index.ts and src/store/${parentModule}/${firstChildModule}/index.ts`

If these files already exist, the script deletes them before writing the new code. If the directories for these files do not exist, the script creates them.
