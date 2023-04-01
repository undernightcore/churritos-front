import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VoteInterface } from '../../../../../interfaces/vote.interface';
import { PollsService } from '../../../../services/polls.service';
import { MemoryStorageService } from '../../../../services/memory-storage.service';
import { OptionInterface } from '../../../../../interfaces/option.interface';
import { forkJoin, mergeMap, Subscription, tap } from 'rxjs';
import { RealtimeService } from '../../../../services/realtime.service';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
})
export class OptionComponent implements OnInit, OnDestroy {
  constructor(
    private activatedRoute: ActivatedRoute,
    private pollService: PollsService,
    private memoryStorageService: MemoryStorageService,
    private router: Router,
    private realtimeService: RealtimeService
  ) {}

  option?: OptionInterface;
  votes?: VoteInterface[];
  maxVotes = 0;
  #fetchingVotes = false;
  optionSubscription?: Subscription;

  get currentPassword() {
    return this.memoryStorageService.getItem('password');
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      const pollId = Number(params['id']);
      const optionId = Number(params['optionId']);
      forkJoin([
        this.#getOption(pollId, optionId),
        this.getVotes(optionId),
      ]).subscribe({
        error: () => {
          this.router.navigate(['/']);
        },
        next: () => {
          this.#listenToPoll(optionId);
        },
      });
    });
  }

  ngOnDestroy() {
    this.optionSubscription?.unsubscribe();
  }

  #getOption(pollId: number, optionId: number) {
    return this.pollService.getPoll(pollId, this.currentPassword).pipe(
      tap((poll) => {
        this.option = poll.options.find((option) => option.id === optionId);
      })
    );
  }

  #listenToPoll(optionId: number) {
    this.optionSubscription?.unsubscribe();
    this.optionSubscription = this.realtimeService
      .listenToOption(optionId)
      .pipe(
        mergeMap(() =>
          this.pollService.getOptionVotes(
            optionId,
            this.currentPassword,
            1,
            Math.ceil((this.votes!.length + 0.01) / 20) * 20
          )
        )
      )
      .subscribe(() => {
        this.getVotes(
          optionId,
          1,
          Math.ceil((this.votes!.length + 0.01) / 20) * 20
        )?.subscribe();
      });
  }

  getVotes(optionId: number, page = 1, size = 20) {
    if (this.#fetchingVotes) return;
    this.#fetchingVotes = true;
    return this.pollService
      .getOptionVotes(optionId, this.currentPassword, page, size)
      .pipe(
        tap((votes) => {
          this.votes = [
            ...(!this.votes || page === 1 ? [] : this.votes),
            ...votes.data,
          ];
          this.maxVotes = votes.meta.total;
          this.#fetchingVotes = false;
        })
      );
  }
}
