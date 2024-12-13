// src/sdk/build.ts
import esbuild from "esbuild";
import { copy } from "fs-extra";
import * as dotenv from "dotenv";

dotenv.config();

const env = {
  'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(process.env.NEXT_PUBLIC_APP_URL)
};

async function build() {
  // Build the main SDK
  await esbuild.build({
    entryPoints: ["sdk/edubot.ts"],
    bundle: true,
    minify: true,
    format: "iife",
    globalName: "EduBot",
    outfile: "public/sdk/edubot.js",
    platform: "browser",
    target: ["es2020"],
    define: env,
    footer: {
      js: "window.EduBot = EduBot.EduBot;", // Fix for ES Module export
    },
  });

  // Build the embedded component
  await esbuild.build({
    entryPoints: ["sdk/components/EmbeddedChat.tsx"],
    bundle: true,
    minify: true,
    format: "iife",
    outfile: "public/sdk/embedded.js",
    platform: "browser",
    define: env,
    target: ["es2020"],
  });

  // Copy styles
  await copy('sdk/styles', 'public/sdk/styles', { overwrite: true });

  console.log('SDK build completed successfully!');
}

build().catch(console.error);
