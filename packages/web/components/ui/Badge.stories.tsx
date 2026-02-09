import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Badge from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "Collecting" } };
export const Success: Story = { args: { children: "BINGO!", variant: "success" } };
export const Warning: Story = { args: { children: "Playing", variant: "warning" } };
export const Error: Story = { args: { children: "Finished", variant: "error" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge>Collecting</Badge>
      <Badge variant="success">BINGO!</Badge>
      <Badge variant="warning">Playing</Badge>
      <Badge variant="error">Finished</Badge>
    </div>
  ),
};
