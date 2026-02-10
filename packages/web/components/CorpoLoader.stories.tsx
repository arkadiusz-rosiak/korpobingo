import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CorpoLoader from "./CorpoLoader";

const meta: Meta<typeof CorpoLoader> = {
  title: "Feedback/CorpoLoader",
  component: CorpoLoader,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof CorpoLoader>;

export const Default: Story = {};

export const FullPage: Story = {
  render: () => (
    <div className="flex h-[400px] w-[400px] items-center justify-center">
      <CorpoLoader />
    </div>
  ),
};
