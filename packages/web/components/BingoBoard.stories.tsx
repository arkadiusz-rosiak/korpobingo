import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BingoBoard from "./BingoBoard";

const meta: Meta<typeof BingoBoard> = {
  title: "Game/BingoBoard",
  component: BingoBoard,
  argTypes: {
    onToggleCell: { action: "cell toggled" },
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BingoBoard>;

const buzzwords3x3 = [
  "Synergy",
  "Circle back",
  "Low-hanging fruit",
  "Touch base",
  "Deep dive",
  "Bandwidth",
  "Move the needle",
  "Pivot",
  "Leverage",
];

const buzzwords4x4 = [
  "Synergy",
  "Circle back",
  "Low-hanging fruit",
  "Touch base",
  "Deep dive",
  "Bandwidth",
  "Move the needle",
  "Pivot",
  "Leverage",
  "Scalable",
  "Action items",
  "Deliverables",
  "Ecosystem",
  "Streamline",
  "Best practices",
  "ROI",
];

export const Board3x3: Story = {
  args: {
    cells: buzzwords3x3,
    marked: Array(9).fill(false),
    size: 3,
    bingoLines: [],
    readOnly: false,
  },
};

export const Board4x4: Story = {
  args: {
    cells: buzzwords4x4,
    marked: Array(16).fill(false),
    size: 4,
    bingoLines: [],
    readOnly: false,
  },
};

export const PartiallyMarked: Story = {
  args: {
    cells: buzzwords3x3,
    marked: [true, false, true, false, true, false, true, false, false],
    size: 3,
    bingoLines: [],
    readOnly: false,
  },
};

export const WithBingoRow: Story = {
  args: {
    cells: buzzwords3x3,
    marked: [true, true, true, false, true, false, true, false, false],
    size: 3,
    bingoLines: [{ type: "row", index: 0 }],
    readOnly: false,
  },
};

export const WithBingoDiagonal: Story = {
  args: {
    cells: buzzwords3x3,
    marked: [true, false, false, false, true, false, false, false, true],
    size: 3,
    bingoLines: [{ type: "diagonal", index: 0 }],
    readOnly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    cells: buzzwords3x3,
    marked: [true, true, true, false, true, false, true, false, false],
    size: 3,
    bingoLines: [{ type: "row", index: 0 }],
    readOnly: true,
  },
};
