import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ShareCode from "./ShareCode";

const meta: Meta<typeof ShareCode> = {
  title: "Game/ShareCode",
  component: ShareCode,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ShareCode>;

export const Default: Story = {
  args: {
    code: "ABC123",
  },
};

export const TypicalCode: Story = {
  args: {
    code: "HX7K9W",
  },
};

export const ShortCode: Story = {
  args: {
    code: "XY7",
  },
};

export const InCard: Story = {
  args: {
    code: "MEET42",
  },
  decorators: [
    (Story) => (
      <div className="w-[480px] rounded-xl bg-white p-8 shadow-lg">
        <Story />
      </div>
    ),
  ],
};

export const NarrowMobile: Story = {
  args: {
    code: "HX7K9W",
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
};
