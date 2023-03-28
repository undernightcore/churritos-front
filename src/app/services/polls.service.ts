import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatePollInterface } from '../../interfaces/create-poll.interface';
import { environment } from '../../environments/environment';
import {
  FullPollInterface,
  PollInterface,
} from '../../interfaces/poll.interface';
import { OptionWithVotesInterface } from '../../interfaces/option.interface';
import { CreateVoteInterface } from '../../interfaces/create-vote.interface';
import { VoteInterface } from '../../interfaces/vote.interface';
import { PaginatedInterface } from '../../interfaces/pagination.interface';

@Injectable({
  providedIn: 'root',
})
export class PollsService {
  constructor(private httpClient: HttpClient) {}

  getPoll(pollId: number, password?: string) {
    return this.httpClient.get<FullPollInterface>(
      `${environment.apiUrl}/polls/${pollId}`,
      { headers: password ? { password } : undefined }
    );
  }

  getVotes(pollId: number, password?: string) {
    return this.httpClient.get<OptionWithVotesInterface[]>(
      `${environment.apiUrl}/polls/${pollId}/votes`,
      { headers: password ? { password } : undefined }
    );
  }

  getOptionVotes(optionId: number, password?: string, page = 1, perPage = 10) {
    return this.httpClient.get<PaginatedInterface<VoteInterface>>(
      `${environment.apiUrl}/options/${optionId}/votes`,
      {
        headers: password ? { password } : undefined,
        params: { page, perPage },
      }
    );
  }

  createPoll(data: CreatePollInterface) {
    return this.httpClient.post<PollInterface>(
      `${environment.apiUrl}/polls`,
      data
    );
  }

  createVote(pollId: number, data: CreateVoteInterface, password?: string) {
    return this.httpClient.post<VoteInterface>(
      `${environment.apiUrl}/polls/${pollId}/votes`,
      data,
      { headers: password ? { password } : undefined }
    );
  }
}
