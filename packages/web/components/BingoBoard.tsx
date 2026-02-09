"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const prevBingoLines = useRef(bingoLines.length);
  const [bingoAnnouncement, setBingoAnnouncement] = useState("");

  const highlightedCells = new Set<number>();
  for (const line of bingoLines) {
    for (const cell of getCellsInLine(line, size)) {
      highlightedCells.add(cell);
    }
  }

  // Announce bingo to screen readers
  useEffect(() => {
    if (bingoLines.length > 0 && bingoLines.length > prevBingoLines.current) {
      setBingoAnnouncement("Bingo! You completed a line!");
    }
    prevBingoLines.current = bingoLines.length;
  }, [bingoLines.length]);

  const moveFocus = useCallback(
    (index: number) => {
      const total = size * size;
      const clamped = Math.max(0, Math.min(total - 1, index));
      setFocusedIndex(clamped);
      cellRefs.current[clamped]?.focus();
    },
    [size],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const row = Math.floor(index / size);
      const col = index % size;
      let handled = true;

      switch (e.key) {
        case "ArrowRight":
          moveFocus(col < size - 1 ? index + 1 : index);
          break;
        case "ArrowLeft":
          moveFocus(col > 0 ? index - 1 : index);
          break;
        case "ArrowDown":
          moveFocus(row < size - 1 ? index + size : index);
          break;
        case "ArrowUp":
          moveFocus(row > 0 ? index - size : index);
          break;
        case "Home":
          moveFocus(e.ctrlKey ? 0 : row * size);
          break;
        case "End":
          moveFocus(e.ctrlKey ? size * size - 1 : row * size + size - 1);
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
      }
    },
    [size, moveFocus],
  );

  // Build rows for semantic structure
  const rows: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    rows.push(row);
  }

  return (
    <>
      <div
        role="grid"
        aria-label="Bingo board"
        className="mx-auto w-full"
        style={{ maxWidth: "var(--board-size)" }}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            role="row"
            className={`grid gap-1.5 sm:gap-2${rowIndex < size - 1 ? " mb-1.5 sm:mb-2" : ""}`}
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {row.map((cellIndex) => (
              <BingoCell
                key={`${cellIndex}-${cells[cellIndex]}`}
                text={cells[cellIndex]}
                marked={marked[cellIndex]}
                highlight={highlightedCells.has(cellIndex)}
                onToggle={() => onToggleCell(cellIndex)}
                readOnly={readOnly}
                tabIndex={cellIndex === focusedIndex ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, cellIndex)}
                onFocus={() => setFocusedIndex(cellIndex)}
                ref={(el) => {
                  cellRefs.current[cellIndex] = el;
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {bingoAnnouncement && (
        <div role="alert" className="sr-only">
          {bingoAnnouncement}
        </div>
      )}
    </>
  );
}
