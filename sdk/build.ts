// src/sdk/build.ts
import esbuild from "esbuild";
import { copy } from "fs-extra";

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
    target: ["es2020"],
  });

  // Copy styles
  await copy('sdk/styles', 'public/sdk/styles', { overwrite: true });

  console.log('SDK build completed successfully!');
}

build().catch(console.error);
