import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BingoModal from "./BingoModal";

const meta: Meta<typeof BingoModal> = {
  title: "Game/BingoModal",
  component: BingoModal,
  argTypes: {
    onClose: { action: "closed" },
    bingoCount: { control: { type: "number", min: 1, max: 5 } },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BingoModal>;

export const FirstBingo: Story = {
  args: { bingoCount: 1 },
};

export const DoubleSynergy: Story = {
  args: { bingoCount: 2 },
};

export const TripleSynergy: Story = {
  args: { bingoCount: 3 },
};

export const TotalAlignment: Story = {
  args: { bingoCount: 4 },
};
