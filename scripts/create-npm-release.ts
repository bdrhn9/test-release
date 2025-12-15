// NOTE: This script is not included in TS lint process, so it should be typechecked at runtime.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const execSyncWithErrorHandling = (command: string) => {
  // eslint-disable-next-line functional/no-try-statements
  try {
    return execSync(command).toString();
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.info("STDOUT", error.stdout.toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.info("STDERR", error.stderr.toString());
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
};

const main = () => {
  const versionBump = process.argv[2];
  if (
    versionBump !== "major" &&
    versionBump !== "minor" &&
    versionBump !== "patch"
  )
    throw new Error("Invalid version");

  const noGitChecks = process.argv[3];
  if (noGitChecks && noGitChecks !== "--no-git-checks")
    throw new Error("Expected --no-git-checks flag");

  if (noGitChecks) {
    console.info("Skipping git checks...");
  } else {
    console.info("Ensuring working directory is clean...");
    const gitStatus = execSyncWithErrorHandling("git status --porcelain");
    if (gitStatus !== "") throw new Error("Working directory is not clean");

    console.info("Ensuring we are on the main branch...");
    const branch = execSyncWithErrorHandling("git branch --show-current");
    if (branch !== "main\n") throw new Error("Not on the main branch");

    console.info("Ensuring we are up to date with the remote...");
    execSyncWithErrorHandling("git fetch");
    const gitDiff = execSyncWithErrorHandling("git diff origin/main");
    if (gitDiff !== "") throw new Error("Not up to date with the remote");
  }

  console.info("Making sure we have the latest version of the dependencies...");
  execSyncWithErrorHandling("pnpm install");

  const currentVersion = JSON.parse(
    readFileSync(join(__dirname, "../package.json"), "utf8"),
  ).version;
  console.info(`Current version is ${currentVersion}...`);

  console.info("Bumping root package.json version...");
  execSyncWithErrorHandling(`pnpm version --no-git-tag-version ${versionBump}`);

  const newVersion = JSON.parse(
    readFileSync(join(__dirname, "../package.json"), "utf8"),
  ).version;

  console.info("Creating new commit...");
  execSyncWithErrorHandling("git add .");
  execSyncWithErrorHandling(`git commit -m "v${newVersion}"`);

  console.info("");
  console.info("Ensure the changes are correct by inspecting the last commit.");
  console.info(
    "If everything looks good, push the commit to the remote which releases the packages.",
  );
};

main();
