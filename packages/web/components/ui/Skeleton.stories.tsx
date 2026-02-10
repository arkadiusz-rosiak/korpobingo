import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton, SkeletonBoard, SkeletonText } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const SingleLine: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const TextBlock: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <SkeletonText lines={4} />
    </div>
  ),
};

export const Board3x3: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <SkeletonBoard size={3} />
    </div>
  ),
};

export const Board4x4: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <SkeletonBoard size={4} />
    </div>
  ),
};
