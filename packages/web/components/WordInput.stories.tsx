import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WordInput from "./WordInput";

const meta: Meta<typeof WordInput> = {
  title: "Game/WordInput",
  component: WordInput,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WordInput>;

export const Empty: Story = {
  args: {
    existingWords: [],
    onSubmit: async (text: string) => {
      await new Promise((r) => setTimeout(r, 500));
      console.log("Submitted:", text);
    },
    disabled: false,
  },
};

export const WithExistingWords: Story = {
  args: {
    existingWords: ["Synergy", "Circle back", "Low-hanging fruit"],
    onSubmit: async (text: string) => {
      await new Promise((r) => setTimeout(r, 500));
      console.log("Submitted:", text);
    },
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    existingWords: [],
    onSubmit: async () => {},
    disabled: true,
  },
};
