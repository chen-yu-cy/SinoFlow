// FILE: src/lib/version.ts
import pkg from "../../package.json";

export interface AppVersionInfo {
  version: string;
  commitSha: string;
  displayVersion: string;
}

export function getAppVersionInfo(): AppVersionInfo {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || pkg.version || "0.1.0";
  const rawSha = process.env.NEXT_PUBLIC_GIT_SHA || process.env.GIT_SHA || "local";
  const commitSha = rawSha !== "local" ? rawSha.slice(0, 7) : "local";
  const displayVersion = commitSha !== "local" ? `v${version} (${commitSha})` : `v${version}`;

  return {
    version,
    commitSha,
    displayVersion,
  };
}
