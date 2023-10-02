import fs from "node:fs";

async function main() {
  // example to create an "article" component with an api route
  // in the future the AI will write the file contents

  console.log(`Adding form with API route...`);

  // route
  const routeFile = Bun.file("./snippets/form-api/route.ts.txt");
  const routeContents = await routeFile.text();
  if (!fs.existsSync("../examples/next/app/api/article"))
    fs.mkdirSync("../examples/next/app/api/article");
  await Bun.write("../examples/next/app/api/article/route.ts", routeContents);

  // form
  const formFile = Bun.file("./snippets/form-api/form.tsx.txt");
  const formContents = await formFile.text();
  if (!fs.existsSync("../examples/next/app"))
    fs.mkdirSync("../examples/next/app");
  await Bun.write("../examples/next/app/ArticleForm.tsx", formContents);

  console.log(`✅ Added form with API route`);
}

main();
