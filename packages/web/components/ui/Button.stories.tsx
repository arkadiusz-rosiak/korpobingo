import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    onClick: { action: "clicked" },
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "Start the meeting", variant: "primary" } };
export const Secondary: Story = { args: { children: "Cancel", variant: "secondary" } };
export const Ghost: Story = { args: { children: "Skip", variant: "ghost" } };
export const Danger: Story = { args: { children: "End round", variant: "danger" } };
export const Small: Story = { args: { children: "Vote", variant: "primary", size: "sm" } };
export const Large: Story = { args: { children: "Create Round", variant: "primary", size: "lg" } };
export const Loading: Story = { args: { children: "Submitting...", variant: "primary", loading: true } };
export const Disabled: Story = { args: { children: "Disabled", variant: "primary", disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
