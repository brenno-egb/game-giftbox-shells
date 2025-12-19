export type SmarticoRuntime = {
  api: {
    getMiniGames: () => Promise<any[]>;
    playMiniGame: (templateId: number | string) => Promise<any>;
    getMiniGamesHistory?: (args: any) => Promise<any>;
    miniGameWinAcknowledgeRequest?: (requestId: number | string) => Promise<any>;
  };
  getPublicProps: () => Promise<any>;
  dp?: (dp: any) => void;
};

export type MiniGameState = {
  game: any | null;
  playerInfo: any | null;
  canPlay: boolean;
  status: string;
  countdownMs: number | null;
};

export type PlayNormalized = {
  raw: any;
  prizeId: string | null;
};

export type HistoryArgs = {
  templateId: number | string;
  limit?: number;
  offset?: number;
};

export type PendingPrize = {
  requestId: string | number;
  item: any;
};
