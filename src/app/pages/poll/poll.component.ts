import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FullPollInterface } from '../../../interfaces/poll.interface';
import Chart from 'chart.js/auto';
import { PollsService } from '../../services/polls.service';
import { MatDialog } from '@angular/material/dialog';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';
import { MemoryStorageService } from '../../services/memory-storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OptionWithVotesInterface } from '../../../interfaces/option.interface';
import { forkJoin, mergeMap, Subscription } from 'rxjs';
import { randomColor } from '../../utils/color.utils';
import { RealtimeService } from '../../services/realtime.service';
import { CreateVoteInterface } from '../../../interfaces/create-vote.interface';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss'],
})
export class PollComponent implements OnInit, OnDestroy {
  poll?: FullPollInterface;
  voteForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    option: new FormControl<number | null>(null, [Validators.required]),
  });
  chart?: Chart;

  votesSubscription?: Subscription;

  get currentVote() {
    return this.poll
      ? this.memoryStorageService.getItem(`${this.poll.id}:option`)
      : undefined;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private pollService: PollsService,
    private dialogService: MatDialog,
    private memoryStorageService: MemoryStorageService,
    private realtimeService: RealtimeService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.#getAll(params['id']);
    });
  }

  ngOnDestroy() {
    this.votesSubscription?.unsubscribe();
  }

  #getAll(pollId: number, password?: string) {
    forkJoin([
      this.pollService.getPoll(pollId, password),
      this.pollService.getVotes(pollId, password),
    ]).subscribe({
      next: ([poll, votes]) => {
        this.poll = poll;
        this.memoryStorageService.setItem('password', password);
        this.#buildChart(votes);
        this.#listenToPoll(pollId);
      },
      error: () => {
        this.dialogService
          .open(PasswordModalComponent, { disableClose: true })
          .afterClosed()
          .subscribe((newPassword) => {
            this.#getAll(pollId, newPassword);
          });
      },
    });
  }

  handleSave() {
    this.voteForm.markAllAsTouched();
    if (!this.voteForm.valid || !this.poll) return;
    this.pollService
      .createVote(
        this.poll.id,
        this.voteForm.value as CreateVoteInterface,
        this.memoryStorageService.getItem('password')
      )
      .subscribe(() => {
        const voted = this.poll?.options.find(
          (option) => option.id === this.voteForm.value.option
        )?.title;
        if (!voted) return;
        localStorage.setItem(`${this.poll?.id}:option`, voted);
      });
  }

  #listenToPoll(pollId: number) {
    this.votesSubscription?.unsubscribe();
    this.votesSubscription = this.realtimeService
      .listenToPoll(pollId)
      .pipe(
        mergeMap(() =>
          this.pollService.getVotes(
            pollId,
            this.memoryStorageService.getItem('password')
          )
        )
      )
      .subscribe((votes) => {
        if (!this.chart) return;
        this.chart.data.datasets[0].data = votes.map(
          (vote) => vote.votes_count
        );
        this.chart.update();
      });
  }

  #buildChart(votes: OptionWithVotesInterface[]) {
    this.chart = new Chart(
      this.elementRef.nativeElement.querySelector('#chart'),
      {
        type: 'pie',
        data: {
          labels: votes.map((option) => option.title),
          datasets: [
            {
              label: 'Votos totales',
              data: votes.map((vote) => vote.votes_count),
              backgroundColor: votes.map(() => randomColor()),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      }
    );
  }
}
