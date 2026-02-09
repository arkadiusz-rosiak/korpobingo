import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PlayerList from "./PlayerList";

const meta: Meta<typeof PlayerList> = {
  title: "Game/PlayerList",
  component: PlayerList,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PlayerList>;

const players = [
  { playerName: "Alice", markedCount: 7, totalCells: 9, hasBingo: true },
  { playerName: "Bob", markedCount: 5, totalCells: 9, hasBingo: false },
  { playerName: "Charlie", markedCount: 3, totalCells: 9, hasBingo: false },
  { playerName: "Diana", markedCount: 8, totalCells: 9, hasBingo: true },
];

export const Default: Story = {
  args: {
    players,
    shareCode: "ABC123",
    currentPlayer: "Bob",
    showBoards: false,
  },
};

export const WithBoardLinks: Story = {
  args: {
    players,
    shareCode: "ABC123",
    currentPlayer: "Bob",
    showBoards: true,
  },
};

export const SinglePlayer: Story = {
  args: {
    players: [{ playerName: "Alice", markedCount: 0, totalCells: 9, hasBingo: false }],
    shareCode: "ABC123",
    currentPlayer: "Alice",
    showBoards: false,
  },
};

export const AllBingo: Story = {
  args: {
    players: players.map((p) => ({ ...p, hasBingo: true, markedCount: 9 })),
    shareCode: "ABC123",
    currentPlayer: "Bob",
    showBoards: true,
  },
};
