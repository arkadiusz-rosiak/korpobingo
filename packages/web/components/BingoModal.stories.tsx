import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BingoModal from "./BingoModal";

const meta: Meta<typeof BingoModal> = {
  title: "Game/BingoModal",
  component: BingoModal,
  argTypes: {
    onClose: { action: "closed" },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof BingoModal>;

export const Default: Story = {
  args: {},
};
