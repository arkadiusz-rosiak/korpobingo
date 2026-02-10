import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Word } from "@/lib/types";
import WordList from "./WordList";

const meta: Meta<typeof WordList> = {
  title: "Game/WordList",
  component: WordList,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WordList>;

const sampleWords: Word[] = [
  {
    roundId: "r1",
    wordId: "w1",
    text: "Synergy",
    submittedBy: "Alice",
    votes: 5,
    votedBy: ["Bob", "Charlie", "Diana", "Eve", "Frank"],
    createdAt: new Date().toISOString(),
  },
  {
    roundId: "r1",
    wordId: "w2",
    text: "Circle back",
    submittedBy: "Bob",
    votes: 3,
    votedBy: ["Alice", "Charlie", "Diana"],
    createdAt: new Date().toISOString(),
  },
  {
    roundId: "r1",
    wordId: "w3",
    text: "Low-hanging fruit",
    submittedBy: "Charlie",
    votes: 1,
    votedBy: ["Alice"],
    createdAt: new Date().toISOString(),
  },
  {
    roundId: "r1",
    wordId: "w4",
    text: "Move the needle",
    submittedBy: "Alice",
    votes: 0,
    votedBy: [],
    createdAt: new Date().toISOString(),
  },
];

const deleteAction = async (wordId: string) => {
  console.log("Delete:", wordId);
};

export const Default: Story = {
  args: {
    words: sampleWords,
    onVote: async (wordId: string) => {
      console.log("Voted for:", wordId);
    },
    onDelete: deleteAction,
    currentPlayer: "Alice",
    disabled: false,
  },
};

export const Empty: Story = {
  args: {
    words: [],
    onVote: async () => {},
    onDelete: deleteAction,
    currentPlayer: "Alice",
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    words: sampleWords,
    onVote: async () => {},
    onDelete: deleteAction,
    currentPlayer: "Alice",
    disabled: true,
  },
};

export const WithDeleteButtons: Story = {
  name: "Author with delete buttons",
  args: {
    words: sampleWords,
    onVote: async () => {},
    onDelete: deleteAction,
    currentPlayer: "Alice",
    disabled: false,
  },
};
