import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <div className="flex h-screen items-center justify-center">
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
        </div>
        <Modal open={open} onClose={() => setOpen(false)}>
          <h2 className="mb-2 text-xl font-bold">Synergy Achieved!</h2>
          <p className="mb-4 text-gray-600">You completed a row of corporate buzzwords.</p>
          <Button onClick={() => setOpen(false)} className="w-full">
            Return to the meeting
          </Button>
        </Modal>
      </>
    );
  },
};
