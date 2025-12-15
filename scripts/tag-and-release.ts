import { join } from "node:path";

import { tagAndRelease } from "../src/index";

const main = async () => {
  const packageJsonPath = join(__dirname, "../package.json");
  await tagAndRelease("bdrhn9", "test-release", packageJsonPath);
};

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.info(error);
    process.exitCode = 1;
  });
