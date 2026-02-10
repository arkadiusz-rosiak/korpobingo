import { readFileSync } from "fs";
import { api } from "./api";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

export const web = new sst.aws.Nextjs("Web", {
  path: "packages/web",
  domain:
    $app.stage === "production"
      ? {
          name: "korpobingo.rosiak.it",
          dns: false,
          cert: "arn:aws:acm:us-east-1:936197736945:certificate/3cb0b808-bfe2-4f60-b87f-88db26f72b70",
        }
      : undefined,
  environment: {
    NEXT_PUBLIC_ROUNDS_API_URL: $interpolate`${api.url}/rounds`,
    NEXT_PUBLIC_WORDS_API_URL: $interpolate`${api.url}/words`,
    NEXT_PUBLIC_PLAYERS_API_URL: $interpolate`${api.url}/players`,
    NEXT_PUBLIC_BOARDS_API_URL: $interpolate`${api.url}/boards`,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || pkg.version || "dev",
  },
});
