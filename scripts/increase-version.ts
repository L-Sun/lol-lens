#!/usr/bin/env bun

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

type VersionType = "major" | "minor" | "patch";

interface Version {
  major: number;
  minor: number;
  patch: number;
}

function parseVersion(version: string): Version {
  const [major, minor, patch] = version.split(".").map(Number);
  return { major, minor, patch };
}

function formatVersion(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

function increaseVersion(version: Version, type: VersionType): Version {
  switch (type) {
    case "major":
      return { major: version.major + 1, minor: 0, patch: 0 };
    case "minor":
      return { major: version.major, minor: version.minor + 1, patch: 0 };
    case "patch":
      return {
        major: version.major,
        minor: version.minor,
        patch: version.patch + 1,
      };
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

function updatePackageJson(version: string) {
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  console.log(
    `Updating package.json version from ${packageJson.version} to ${version}`,
  );
  packageJson.version = version;

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
}

function updateCargoToml(version: string) {
  const cargoTomlPath = join(process.cwd(), "src-tauri", "Cargo.toml");
  const cargoTomlContent = readFileSync(cargoTomlPath, "utf-8");

  // 使用正则表达式更新版本号
  const updatedContent = cargoTomlContent.replace(
    /^version = "([^"]+)"$/m,
    `version = "${version}"`,
  );

  console.log(`Updating Cargo.toml version to ${version}`);
  writeFileSync(cargoTomlPath, updatedContent);
}

function updateTauriConfJson(version: string) {
  const tauriConfJsonPath = join(process.cwd(), "src-tauri", "tauri.conf.json");
  const tauriConfJsonContent = readFileSync(tauriConfJsonPath, "utf-8");

  const tauriConfig = JSON.parse(tauriConfJsonContent);

  console.log(`Updating tauri.conf.json version to ${version}`);
  tauriConfig.version = version;

  writeFileSync(tauriConfJsonPath, JSON.stringify(tauriConfig, null, 2) + "\n");
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: bun run scripts/increase-version.ts <major|minor|patch>",
    );
    console.log("");
    console.log("Examples:");
    console.log(
      "  bun run scripts/increase-version.ts patch  # 0.1.0 -> 0.1.1",
    );
    console.log(
      "  bun run scripts/increase-version.ts minor  # 0.1.0 -> 0.2.0",
    );
    console.log(
      "  bun run scripts/increase-version.ts major  # 0.1.0 -> 1.0.0",
    );
    process.exit(1);
  }

  const versionType = args[0] as VersionType;

  if (!["major", "minor", "patch"].includes(versionType)) {
    console.error("Error: Version type must be one of: major, minor, patch");
    process.exit(1);
  }

  try {
    // 读取当前版本号
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const currentVersion = packageJson.version;

    console.log(`Current version: ${currentVersion}`);

    // 解析并增加版本号
    const parsedVersion = parseVersion(currentVersion);
    const newVersion = increaseVersion(parsedVersion, versionType);
    const newVersionString = formatVersion(newVersion);

    console.log(`New version: ${newVersionString}`);

    // 更新文件
    updatePackageJson(newVersionString);
    updateCargoToml(newVersionString);
    updateTauriConfJson(newVersionString);

    console.log("✅ Version updated successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Commit your changes");
    console.log("  2. Create a git tag: git tag v" + newVersionString);
    console.log("  3. Push the tag: git push origin v" + newVersionString);
  } catch (error) {
    console.error("Error updating version:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
