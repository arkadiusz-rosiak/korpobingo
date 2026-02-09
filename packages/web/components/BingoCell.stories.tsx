import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BingoCell from "./BingoCell";

const meta: Meta<typeof BingoCell> = {
  title: "Game/BingoCell",
  component: BingoCell,
  argTypes: {
    onToggle: { action: "toggled" },
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 120, height: 120 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BingoCell>;

export const Default: Story = {
  args: {
    text: "Synergy",
    marked: false,
    highlight: false,
    readOnly: false,
  },
};

export const Marked: Story = {
  args: {
    text: "Circle back",
    marked: true,
    highlight: false,
    readOnly: false,
  },
};

export const Highlighted: Story = {
  args: {
    text: "Low-hanging fruit",
    marked: true,
    highlight: true,
    readOnly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    text: "Touch base",
    marked: false,
    highlight: false,
    readOnly: true,
  },
};

export const LongText: Story = {
  args: {
    text: "Let's take this offline and circle back later",
    marked: false,
    highlight: false,
    readOnly: false,
  },
};
