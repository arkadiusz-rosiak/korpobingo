import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Toast from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Feedback/Toast",
  component: Toast,
  argTypes: {
    onClose: { action: "closed" },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Info: Story = {
  args: {
    message: "Alice achieved synergy!",
    type: "info",
    duration: 60000,
  },
};

export const Success: Story = {
  args: {
    message: "Word submitted successfully",
    type: "success",
    duration: 60000,
  },
};

export const Error: Story = {
  args: {
    message: "Something went wrong. Please circle back later.",
    type: "error",
    duration: 60000,
  },
};
