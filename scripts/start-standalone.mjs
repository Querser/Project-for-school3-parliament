import { spawn } from "node:child_process";
import { access, cp, mkdir } from "node:fs/promises";
import path from "node:path";

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function syncDirectory(sourcePath, targetPath) {
  if (!(await pathExists(sourcePath))) {
    return;
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { recursive: true, force: true });
}

async function run() {
  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, ".next", "standalone");
  const standaloneServer = path.join(standaloneDir, "server.js");

  if (!(await pathExists(standaloneServer))) {
    console.error("Standalone build is missing. Run `npm run build` first.");
    process.exit(1);
    return;
  }

  await syncDirectory(path.join(rootDir, ".next", "static"), path.join(standaloneDir, ".next", "static"));
  await syncDirectory(path.join(rootDir, "public"), path.join(standaloneDir, "public"));

  const child = spawn(process.execPath, [standaloneServer], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("error", (error) => {
    console.error("Failed to start standalone server:", error);
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

run();
