#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const envFilePath = process.env.CONTENT_GENERATION_WORKER_ENV_FILE?.trim() || ".env.production";
const workerAppBaseUrl =
  process.env.CONTENT_GENERATION_WORKER_APP_BASE_URL?.trim() || "http://127.0.0.1:3001";

const fileEnv = existsSync(envFilePath) ? parseEnvFile(readFileSync(envFilePath, "utf8")) : {};
const workerEnv = {
  ...process.env,
  ...fileEnv,
  APP_BASE_URL: workerAppBaseUrl,
};

delete workerEnv.CONTENT_GENERATION_WORKER_RUN_ONCE;

const child = spawn(process.execPath, ["scripts/content-generation-worker.mjs"], {
  env: workerEnv,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

function parseEnvFile(text) {
  const env = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = stripOuterQuotes(line.slice(separatorIndex + 1).trim());

    if (key) {
      env[key] = value;
    }
  }

  return env;
}

function stripOuterQuotes(value) {
  if (value.length < 2) {
    return value;
  }

  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.at(-1) === quote) {
    return value.slice(1, -1);
  }

  return value;
}
