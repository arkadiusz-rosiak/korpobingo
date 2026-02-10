import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import DurationPicker from "./DurationPicker";

const meta: Meta<typeof DurationPicker> = {
  title: "Components/DurationPicker",
  component: DurationPicker,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DurationPicker>;

function DurationPickerDemo({ initial = 1 / 6 }: { initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <DurationPicker value={value} onChange={setValue} />
      <p className="mt-4 text-center text-xs text-gray-400">durationDays: {value.toFixed(4)}</p>
    </div>
  );
}

export const Default: Story = {
  render: () => <DurationPickerDemo />,
};

export const StartWithDays: Story = {
  render: () => <DurationPickerDemo initial={7} />,
};

export const ShortDuration: Story = {
  render: () => <DurationPickerDemo initial={1 / 48} />,
  name: "30 Minutes",
};

export const LongDuration: Story = {
  render: () => <DurationPickerDemo initial={31} />,
  name: "31 Days",
};
