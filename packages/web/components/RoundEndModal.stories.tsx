import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import RoundEndModal from "./RoundEndModal";

const meta: Meta<typeof RoundEndModal> = {
  title: "Game/RoundEndModal",
  component: RoundEndModal,
  argTypes: {
    onClose: { action: "closed" },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof RoundEndModal>;

export const Default: Story = {};
