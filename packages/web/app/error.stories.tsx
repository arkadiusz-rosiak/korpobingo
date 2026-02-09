import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ErrorPage from "./error";

const meta: Meta<typeof ErrorPage> = {
  title: "Pages/Error",
  component: ErrorPage,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
};

export default meta;
type Story = StoryObj<typeof ErrorPage>;

export const Default: Story = {
  args: {
    error: Object.assign(new Error("Something broke"), { digest: "abc123" }),
    reset: () => alert("Retry clicked"),
  },
};
