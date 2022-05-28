interface Vote {
  userId: number;
  count: number;
}

export interface Game {
  roomId: string;
  order: number[];
  liar: number;
  keyword: string;
  loadingEndNumber: number;
  vote: Vote[];
}
