import { OptionInterface } from './option.interface';

export interface PollInterface {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FullPollInterface extends PollInterface {
  options: OptionInterface[];
}
