# KorpoBingo

A multiplayer corporate buzzword bingo web app. Create a round, invite your colleagues, crowdsource the most groan-worthy corporate phrases, and play bingo during your next meeting.

## Tech Stack

- **[SST v3](https://sst.dev/)** -- Infrastructure-as-code framework deploying to AWS
- **[Next.js 14](https://nextjs.org/)** -- App Router frontend with React 18
- **[DynamoDB](https://aws.amazon.com/dynamodb/)** -- NoSQL database for all game state
- **[Tailwind CSS 3](https://tailwindcss.com/)** -- Utility-first styling with a custom indigo-based color palette
- **TypeScript** throughout

## Project Structure

This is an npm workspaces monorepo:

```
korpobingo/
├── infra/                      # SST infrastructure definitions
│   ├── storage.ts              #   DynamoDB tables (Rounds, Words, Players, Boards)
│   ├── api.ts                  #   API Gateway v2 routes
│   ├── web.ts                  #   Next.js deployment & environment
│   └── monitoring.ts           #   CloudWatch dashboard
├── packages/
│   ├── core/                   # Shared business logic & DynamoDB operations
│   │   └── src/                #   Namespaced modules: Round, Word, Board, Player
│   ├── functions/              # AWS Lambda handlers
│   │   └── src/                #   rounds.ts, words.ts, players.ts, boards.ts
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/                #   App Router pages & routes
│   │   ├── components/ui/      #   Reusable UI primitives (Button, Card, Modal, etc.)
│   │   └── lib/                #   API client, session management, hooks
│   └── scripts/                # Utility scripts
└── sst.config.ts               # SST app configuration
```

## Getting Started

### Prerequisites

- **Node.js 22** or later
- **AWS CLI** configured with a profile named `korpobingo`
- **SST v3** (installed as a project dependency)

### Installation

```bash
git clone https://github.com/arkadiusz-rosiak/korpobingo.git
cd korpobingo
npm install
```

### Local Development

Start the SST dev environment (provisions real AWS resources and proxies Lambda calls locally):

```bash
AWS_PROFILE=korpobingo npx sst dev
```

To run just the Next.js frontend (requires API URLs to be set):

```bash
npm run dev -w packages/web
```

### Linting & Formatting

```bash
npm run lint          # ESLint across all packages
npm run format        # Prettier --write across all packages
```

### Testing

```bash
npm test --workspace=packages/core    # Vitest (core package)
```

### Storybook

```bash
npm run storybook -w packages/web     # Runs on port 6006
```

## Deployment

The project uses two SST stages:

| Stage        | Command                                                  |
|--------------|----------------------------------------------------------|
| **dev**      | `AWS_PROFILE=korpobingo npx sst deploy`                 |
| **production** | `AWS_PROFILE=korpobingo npx sst deploy --stage production` |

Production deploys to `korpobingo.rosiak.it` with a custom domain and ACM certificate.

## Game Flow

A round progresses through three phases:

1. **Collecting** -- The host creates a round and shares a 6-character join code. Players join, submit corporate buzzwords, and vote on each other's submissions.
2. **Playing** -- The host starts the game. Each player receives a randomized bingo board built from the submitted words. Players mark off squares as buzzwords are spotted in the wild.
3. **Finished** -- A player calls bingo (or the host ends the round) and results are displayed.

## License

[MIT](LICENSE)
