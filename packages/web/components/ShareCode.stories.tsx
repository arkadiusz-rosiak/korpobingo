import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ShareCode from "./ShareCode";

const meta: Meta<typeof ShareCode> = {
  title: "Game/ShareCode",
  component: ShareCode,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ShareCode>;

export const Default: Story = {
  args: {
    code: "ABC123",
  },
};

export const ShortCode: Story = {
  args: {
    code: "XY7",
  },
};
