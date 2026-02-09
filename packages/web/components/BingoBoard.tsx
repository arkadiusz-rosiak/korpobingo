"use client";

import type { BingoLine } from "@/lib/types";
import BingoCell from "./BingoCell";

interface BingoBoardProps {
  cells: string[];
  marked: boolean[];
  size: 3 | 4;
  bingoLines?: BingoLine[];
  onToggleCell: (index: number) => void;
  readOnly?: boolean;
}

function getCellsInLine(line: BingoLine, size: number): Set<number> {
  const cells = new Set<number>();
  if (line.type === "row") {
    for (let col = 0; col < size; col++) cells.add(line.index * size + col);
  } else if (line.type === "col") {
    for (let row = 0; row < size; row++) cells.add(row * size + line.index);
  } else if (line.type === "diagonal" && line.index === 0) {
    for (let i = 0; i < size; i++) cells.add(i * size + i);
  } else if (line.type === "diagonal" && line.index === 1) {
    for (let i = 0; i < size; i++) cells.add(i * size + (size - 1 - i));
  }
  return cells;
}

export default function BingoBoard({
  cells,
  marked,
  size,
  bingoLines = [],
  onToggleCell,
  readOnly = false,
}: BingoBoardProps) {
  const highlightedCells = new Set<number>();
  for (const line of bingoLines) {
    for (const cell of getCellsInLine(line, size)) {
      highlightedCells.add(cell);
    }
  }

  return (
    <div
      className="mx-auto grid w-full gap-1.5 sm:gap-2"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        maxWidth: "var(--board-size)",
      }}
    >
      {cells.map((text, i) => (
        <BingoCell
          key={`${i}-${text}`}
          text={text}
          marked={marked[i]}
          highlight={highlightedCells.has(i)}
          onToggle={() => onToggleCell(i)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
