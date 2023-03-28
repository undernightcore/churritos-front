export interface CreatePollInterface {
  name: string;
  description: string;
  password: string | null;
  options: string[];
}
