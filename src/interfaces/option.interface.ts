export interface OptionInterface {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface OptionWithVotes extends OptionInterface {
  votes_count: number;
}
