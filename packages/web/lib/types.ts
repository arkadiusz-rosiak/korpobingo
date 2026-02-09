export interface Round {
  roundId: string;
  name: string;
  status: "collecting" | "playing" | "finished";
  shareCode: string;
  createdAt: string;
  boardSize: 3 | 4;
  roundEndsAt: string;
}

export interface Word {
  roundId: string;
  wordId: string;
  text: string;
  submittedBy: string;
  votes: number;
  createdAt: string;
}

export interface Player {
  roundId: string;
  playerName: string;
  joinedAt: string;
}

export interface Board {
  roundId: string;
  playerName: string;
  cells: string[];
  marked: boolean[];
  size: number;
  createdAt: string;
}

export interface BoardWithBingo extends Board {
  hasBingo: boolean;
}
