import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FullPollInterface } from '../../../interfaces/poll.interface';
import Chart, { ChartEvent } from 'chart.js/auto';
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
    return this.memoryStorageService.getItem('option');
  }

  set currentVote(value: string | undefined) {
    this.memoryStorageService.setItem('option', value);
  }

  get currentPassword() {
    return this.memoryStorageService.getItem('password');
  }

  set currentPassword(value: string | undefined) {
    this.memoryStorageService.setItem('password', value);
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pollService: PollsService,
    private dialogService: MatDialog,
    private memoryStorageService: MemoryStorageService,
    private realtimeService: RealtimeService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.#getAll(params['id'], this.currentPassword);
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
        this.currentPassword = password;
        this.#buildChart(votes);
        this.#listenToPoll(pollId);
      },
      error: (error) => {
        if (error.status === 403) {
          this.dialogService
            .open(PasswordModalComponent, { disableClose: true })
            .afterClosed()
            .subscribe((newPassword) => {
              this.#getAll(pollId, newPassword);
            });
        } else {
          this.router.navigate(['/']);
        }
      },
    });
  }

  #listenToPoll(pollId: number) {
    this.votesSubscription?.unsubscribe();
    this.votesSubscription = this.realtimeService
      .listenToPoll(pollId)
      .pipe(
        mergeMap(() => this.pollService.getVotes(pollId, this.currentPassword))
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
          onClick: (event) => this.handleClick(votes, event),
        },
      }
    );
  }

  handleSave() {
    this.voteForm.markAllAsTouched();
    if (!this.voteForm.valid || !this.poll) return;
    this.pollService
      .createVote(
        this.poll.id,
        this.voteForm.value as CreateVoteInterface,
        this.currentPassword
      )
      .subscribe(() => {
        this.currentVote = this.poll?.options.find(
          (option) => option.id === this.voteForm.value.option
        )?.title;
      });
  }

  handleClick(votes: OptionWithVotesInterface[], event: ChartEvent) {
    if (!this.chart || !this.poll) return;
    const selectedOption =
      votes[
        this.chart.getElementsAtEventForMode(
          event as unknown as Event,
          'nearest',
          {},
          false
        )[0].index
      ];
    this.router.navigate(['/poll', this.poll.id, 'option', selectedOption.id]);
  }
}
