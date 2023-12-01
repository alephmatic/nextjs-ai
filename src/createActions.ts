import { z } from "zod";
import _ from "lodash"; // ideally just import kebabCase. but this caused a build error
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import { loadSnippets, readMetadata } from "./lib/utils";
import { createFile, createFolder, readFile } from "./lib/file";
import { SnippetFile, Technology } from "./types";
import consola from "consola";
import fs from "fs";
import path from "path";

export const createActions = async (
  technology: Technology,
  projectRoot: string
): Promise<Record<string, RunnableFunctionWithParse<any>>> => {
  const { snippets: snippetsWithoutIds } = await loadSnippets(technology);
  const files: Record<string, SnippetFile> = {};

  // add ids to files for the expandSnippet action
  consola.debug("Creating snippets map...");
  const snippets = snippetsWithoutIds.map((snippet) => {
    return {
      ...snippet,
      files: snippet.files?.map((file) => {
        const id = `${_.kebabCase(snippet.name)}/${_.kebabCase(file.file)}`;
        files[id] = file;
        return {
          ...file,
          id,
        };
      }),
    };
  });
  consola.debug("\rCreating snippets map... done");
  return {
    getSnippets: {
      function: async (_args: {}) => {
        return snippets;
      },
      name: "getSnippets",
      description:
        "Returns the snippets for a given technology which helps create files with context.",
      parse: (args: string) => {
        return z.object({}).parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {},
      },
    },
    expandSnippet: {
      function: async (args: { id: string }) => {
        const { file, references } = files[args.id];

        const directory = process.cwd();

        const filePath = `${directory}/${file}`;
        const fileContents = readFile(filePath);
        const referenceContents = references?.map((reference) => {
          return {
            name: reference,
            contents: readFile(`${directory}/${reference}`),
          };
        });

        const contents = `## Snippet code
${fileContents}

## References:

${referenceContents?.map(
  (reference) => `### ${reference.name}
${reference.contents}`
)}
`;

        return contents;
      },
      name: "expandSnippet",
      description:
        "Returns the contents and references contents of a snippet file.",
      parse: (args: string) => {
        return z.object({ id: z.string() }).parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The id of the snippet file.",
          },
        },
      },
    },
    createFile: {
      function: async (args: { filename: string; content: string }) => {
        createFile(`${projectRoot}/${args.filename}`, args.content);
        return { success: true };
      },
      name: "createFile",
      description:
        "Write a new file relative to the project root with specified content.",
      parse: (args: string) => {
        return z
          .object({
            filename: z.string(),
            content: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "The filename to create.",
          },
          content: {
            type: "string",
            description: "The content to write to the file. Never empty.",
          },
        },
      },
    },
    listExsitingProjectFiles: {
      function: async (args: {}) => {
        let filesToCheck: string[] = [projectRoot];
        let fileList: string[] = [];

        while (filesToCheck.length > 0) {
          const currentPath = filesToCheck.shift()!;

          if (
            currentPath.includes("node_modules") ||
            currentPath.includes(".git") ||
            currentPath.includes(".next")
          ) {
            continue;
          }

          const stats = fs.statSync(currentPath);

          if (stats.isDirectory()) {
            fs.readdirSync(currentPath).forEach((file) => {
              filesToCheck.push(path.join(currentPath, file));
            });
          } else {
            fileList.push(currentPath);
          }
        }

        return fileList;
      },
      name: "listExistingProjectFiles",
      description:
        "Returns a list of files already present in the project directory (used to help read files you can reference and use like components).",
      parse: (args: string) => {
        return z.object({}).parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {},
      },
    },
    createDirectory: {
      function: async (args: { directoryPath: string }) => {
        createFolder(`${projectRoot}/${args.directoryPath}`);
        return { success: true };
      },
      name: "createDirectory",
      description: "Create a new directory relative to the project root.",
      parse: (args: string) => {
        return z
          .object({
            directoryPath: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          directoryPath: {
            type: "string",
            description: "The directory path to create.",
          },
        },
      },
    },
  };
};
