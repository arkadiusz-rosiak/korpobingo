import { boardsApi, playersApi, roundsApi, wordsApi } from "./api";

export const web = new sst.aws.Nextjs("Web", {
  path: "packages/web",
  domain: $app.stage === "production" ? "korpobingo.rosiak.it" : undefined,
  environment: {
    NEXT_PUBLIC_ROUNDS_API_URL: roundsApi.url,
    NEXT_PUBLIC_WORDS_API_URL: wordsApi.url,
    NEXT_PUBLIC_PLAYERS_API_URL: playersApi.url,
    NEXT_PUBLIC_BOARDS_API_URL: boardsApi.url,
  },
});
