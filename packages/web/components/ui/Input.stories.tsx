import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Input from "./Input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter a buzzword..." },
};

export const WithLabel: Story = {
  args: { label: "Meeting name", placeholder: "Q4 Planning" },
};

export const WithError: Story = {
  args: { label: "PIN", value: "abc", error: "PIN must be 4 digits" },
};

export const WithHelperText: Story = {
  args: { label: "Share code", placeholder: "ABC123", helperText: "6-character code from your organizer" },
};

export const Disabled: Story = {
  args: { label: "Round name", value: "Sprint Retro", disabled: true },
};
