import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Header from "./Header";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {},
};

export const WithShareCode: Story = {
  args: {
    shareCode: "ABC123",
  },
};

export const WithShareCodeAndName: Story = {
  args: {
    shareCode: "XYZ789",
    roundName: "Q4 Planning Meeting",
  },
};

export const WithClickableShareCode: Story = {
  args: {
    shareCode: "ABC123",
    onShareCodeClick: () => alert("Share code clicked"),
  },
};

export const WithClickableShareCodeAndName: Story = {
  args: {
    shareCode: "XYZ789",
    roundName: "Q4 Planning Meeting",
    onShareCodeClick: () => alert("Share code clicked"),
  },
};
