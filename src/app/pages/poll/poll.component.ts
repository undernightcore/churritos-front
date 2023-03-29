import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FullPollInterface } from '../../../interfaces/poll.interface';
import Chart from 'chart.js/auto';
import { PollsService } from '../../services/polls.service';
import { MatDialog } from '@angular/material/dialog';
import { PasswordModalComponent } from './components/password-modal/password-modal.component';
import { MemoryStorageService } from '../../services/memory-storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OptionWithVotesInterface } from '../../../interfaces/option.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss'],
})
export class PollComponent implements OnInit {
  poll?: FullPollInterface;
  votes?: OptionWithVotesInterface[];
  voteForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    option: new FormControl<number | null>(null, [Validators.required]),
  });
  chart?: Chart;

  constructor(
    private activatedRoute: ActivatedRoute,
    private pollService: PollsService,
    private dialogService: MatDialog,
    private memoryStorageService: MemoryStorageService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.#getAll(params['id']);
    });
  }

  #getAll(pollId: number, password?: string) {
    forkJoin([
      this.pollService.getPoll(pollId, password),
      this.pollService.getVotes(pollId, password),
    ]).subscribe({
      next: ([poll, votes]) => {
        this.poll = poll;
        this.votes = votes;
        this.#buildChart(poll, votes);
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

  #buildChart(poll: FullPollInterface, votes: OptionWithVotesInterface[]) {
    this.chart = new Chart(
      this.elementRef.nativeElement.querySelector('#chart'),
      {
        type: 'pie',
        data: {
          labels: poll.options.map((option) => option.title),
          datasets: [
            {
              label: 'Votos totales',
              data: votes.map((vote) => vote.votes_count),
              backgroundColor: ['red', 'blue'],
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
