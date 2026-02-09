import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NotFound from "./not-found";

const meta: Meta<typeof NotFound> = {
  title: "Pages/NotFound",
  component: NotFound,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof NotFound>;

export const Default: Story = {};
