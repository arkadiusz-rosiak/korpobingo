import { api } from "./api";

export const web = new sst.aws.Nextjs("Web", {
  path: "packages/web",
  domain: $app.stage === "production" ? "korpobingo.rosiak.it" : undefined,
  environment: {
    NEXT_PUBLIC_ROUNDS_API_URL: $interpolate`${api.url}/rounds`,
    NEXT_PUBLIC_WORDS_API_URL: $interpolate`${api.url}/words`,
    NEXT_PUBLIC_PLAYERS_API_URL: $interpolate`${api.url}/players`,
    NEXT_PUBLIC_BOARDS_API_URL: $interpolate`${api.url}/boards`,
  },
});
