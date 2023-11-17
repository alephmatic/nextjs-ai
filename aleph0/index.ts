import { Command } from "commander";
import consola from "consola";
import { createTaskDescriptionPrompt } from "./prompts";
import { ai } from "./openai";
import { completeTask } from "./completeTask";

const PROJECT_DIR = "../examples/next";

type GenerateOptions = {
  projectDir: string;
  regenerateDescription: boolean;
  model?: string;
};

async function generate(originalUserPrompt: string, options?: GenerateOptions) {
  consola.start("Creating:", originalUserPrompt, "\n");

  if (!options || !options.projectDir) {
    consola.error(
      "next-ai requires a project directory to be specified under options: {projectDir: string}"
    );
    return;
  }

  // TODO: maybe move to a function call?
  const userPrompt = await generateDescription(
    originalUserPrompt,
    options.regenerateDescription
  );

  const result = await completeTask(userPrompt, {
    projectDir: options.projectDir,
    model: options.model ?? "gpt-4-1106-preview",
  });

  consola.info("Result:", result);
}

async function generateDescription(
  originalUserPrompt: string,
  regenerateDescription: boolean
): Promise<string> {
  if (!regenerateDescription) return originalUserPrompt;

  consola.info(`Step 1a - create a cleaner task description`);
  const regeneratedUserPrompt = await ai(
    createTaskDescriptionPrompt({ userPrompt: originalUserPrompt })
  );
  if (!regeneratedUserPrompt) throw new Error(`AI didn't return a description`);

  return regeneratedUserPrompt;
}

const program = new Command();
program
  .command("gen <text>")
  .description("Generate nextjs snippet.")
  .option(
    "-srd, --skip-regenerate-description",
    "AI will skip regenerating the description"
  )
  .option("-p --project-dir <projectDir>", "Project directory to work on.")
  .action(
    (
      text,
      options: { projectDir: string; skipRegenerateDescription: boolean }
    ) => {
      generate(text, {
        projectDir: options.projectDir,
        regenerateDescription: options.skipRegenerateDescription ?? false,
      });
    }
  );
program.parse(process.argv);

// async function generate(
//   originalUserPrompt: string,
//   regenerateDescription: boolean
// ) {
//   consola.start("Creating:", originalUserPrompt, "\n");

//   const userPrompt = await generateDescription(
//     originalUserPrompt,
//     regenerateDescription
//   );
//   const snippetMetadata = await chooseSnippet(userPrompt);
//   const changes = await findProjectFiles({
//     userPrompt,
//     snippetMetadata,
//   });
//   const newFiles = await generateNewFiles(userPrompt, snippetMetadata, changes);

//   return newFiles;
// }

// async function chooseSnippet(userPrompt: string): Promise<SnippetMetadata> {
//   consola.info(`Step 1b - choose the snippet to use for this task`);
//   const snippets = await loadSnippets();
//   const snippetString = await ai(
//     findRelevantSnippetPrompt({ userPrompt, snippets })
//   );
//   if (!snippetString) throw new Error(`AI didn't return a snippet`);

//   const snippetMetadata = snippetMetadataSchema.parse(
//     JSON.parse(snippetString)
//   );
//   return snippetMetadata;
// }

// async function findProjectFiles(options: {
//   userPrompt: string;
//   snippetMetadata: SnippetMetadata;
// }): Promise<ChangeFilesSchemaWithSnippet> {
//   consola.info(`Step 2 - find the project files to edit`);
//   const { userPrompt, snippetMetadata } = options;
//   const projectStructure = await getProjectStructure(PROJECT_DIR);

//   const chooseFilePathsRaw = await ai(
//     await chooseFilePathsPrompt({
//       userPrompt,
//       snippetMetadata,
//       projectStructure,
//     }),
//     "Find what files are relevant for these snippets in this project.",
//     "gpt-4"
//   );
//   if (!chooseFilePathsRaw)
//     throw new Error(`AI returned a bad changes array: ${snippetMetadata}`);

//   const changes = changeFilesSchema.parse(JSON.parse(chooseFilePathsRaw));

//   const changesWithSnippets = changes
//     .map((change) => {
//       const snippet = snippetMetadata.snippets.find(
//         (snippet) => snippet.name === change.snippetName
//       );
//       if (!snippet) {
//         consola.warn(`Snippet not found: ${change.snippetName}`);
//         return;
//       }

//       return {
//         ...change,
//         snippet,
//       };
//     })
//     .filter(isDefined);

//   return changesWithSnippets;
// }

// async function generateNewFiles(
//   userPrompt: string,
//   snippetMetadata: SnippetMetadata,
//   fileChanges: ChangeFilesSchemaWithSnippet
// ) {
//   consola.info(
//     `Step 3 - for each file in the changes array, ask the AI for the new file and create/modify it.`
//   );

//   for (const fileChange of fileChanges) {
//     consola.log(`Change operation: ${JSON.stringify(fileChange, null, 2)}`);

//     const sourceFilePath = path.join(PROJECT_DIR, fileChange.filePath);
//     const sourceFile = Bun.file(sourceFilePath);

//     const snippet = readFile(
//       `./snippets/${snippetMetadata.path}/${fileChange.snippet.file}`
//     );

//     const snippetKnowledge = fileChange.snippet.knowledgeFiles
//       .map((file) => readFile(`./knowledge/nextjs13_4/${file}`))
//       .join("\n\n");

//     let fileContents;
//     if (await sourceFile.exists()) {
//       consola.info("Updating existing file");
//       const currentFileContents = await sourceFile.text();
//       fileContents = await ai(
//         await updateFilePrompt({
//           snippet,
//           userPrompt,
//           snippetKnowledge,
//           fileContents: currentFileContents,
//         }),
//         undefined,
//         "gpt-4"
//       );
//     } else {
//       consola.info("Creating a new file");
//       fileContents = await ai(
//         await createFilePrompt({ snippet, userPrompt, snippetKnowledge }),
//         undefined,
//         "gpt-4"
//       );
//     }

//     if (!fileContents) throw new Error(`AI returned a bad file`);

//     const cleanCode = removeCodeWrapper(fileContents);
//     createFile(sourceFilePath, cleanCode);
//   }
// }
