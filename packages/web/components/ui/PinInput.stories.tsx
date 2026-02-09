import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import PinInput from "./PinInput";

const meta: Meta<typeof PinInput> = {
  title: "UI/PinInput",
  component: PinInput,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof PinInput>;

function PinInputWrapper(props: React.ComponentProps<typeof PinInput>) {
  const [value, setValue] = useState(props.value ?? "");
  return <PinInput {...props} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: () => (
    <PinInputWrapper
      value=""
      onChange={() => {}}
      label="4-digit PIN"
      helperText="Use this PIN to rejoin from another device"
    />
  ),
};

export const WithValue: Story = {
  render: () => (
    <PinInputWrapper
      value="12"
      onChange={() => {}}
      label="4-digit PIN"
      helperText="Type the remaining digits"
    />
  ),
};

export const Complete: Story = {
  render: () => <PinInputWrapper value="1234" onChange={() => {}} label="4-digit PIN" />,
};

export const WithError: Story = {
  render: () => (
    <PinInputWrapper
      value="1234"
      onChange={() => {}}
      label="4-digit PIN"
      error="PIN doesn't match"
    />
  ),
};

export const Disabled: Story = {
  render: () => <PinInputWrapper value="12" onChange={() => {}} label="4-digit PIN" disabled />,
};

export const SixDigit: Story = {
  render: () => (
    <PinInputWrapper
      value=""
      onChange={() => {}}
      label="6-digit code"
      length={6}
      helperText="Enter the code from your authenticator app"
    />
  ),
};
