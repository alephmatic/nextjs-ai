import fs from "node:fs";
import { getProjectStructure, loadSnippets } from "./utils";

async function main() {
  console.log(await loadSnippets());
  console.log(await getProjectStructure("../examples/next"));

  // example to create an "article" component with an api route
  // in the future the AI will write the file contents

  //   console.log(`Adding form with API route...`);

  //   // route
  //   const routeFile = Bun.file("./snippets/form-api/route.ts.txt");
  //   const routeContents = await routeFile.text();
  //   if (!fs.existsSync("../examples/next/app/api/article"))
  //     fs.mkdirSync("../examples/next/app/api/article", { recursive: true });
  //   await Bun.write("../examples/next/app/api/article/route.ts", routeContents);

  //   // form
  //   const formFile = Bun.file("./snippets/form-api/form.tsx.txt");
  //   const formContents = await formFile.text();
  //   if (!fs.existsSync("../examples/next/app"))
  //     fs.mkdirSync("../examples/next/app", { recursive: true });
  //   await Bun.write("../examples/next/app/ArticleForm.tsx", formContents);

  //   // toaster - replace file example
  //   const existLayoutFile = Bun.file("../examples/next/app/layout.tsx");
  //   const existingLayoutContents = await existLayoutFile.text();

  //   const layoutFile = Bun.file("./snippets/toaster/toaster.tsx.txt");
  //   const layoutContents = await layoutFile.text();

  //   const updatedLayoutContents = existingLayoutContents
  //     .replace(
  //       "<body className={inter.className}>{children}</body>",
  //       layoutContents
  //     )
  //     .replace(
  //       `import { Inter } from 'next/font/google'`,
  //       `import { Inter } from 'next/font/google'
  // import { Toaster } from '@/components/ui/toaster'`
  //     );

  //   await Bun.write("../examples/next/app/layout.tsx", updatedLayoutContents);

  //   console.log(`✅ Added form with API route`);
}

main();
