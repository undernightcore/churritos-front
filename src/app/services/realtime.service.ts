import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { EventInterface } from '../../interfaces/event.interface';

@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  socket = io(environment.apiUrl);

  listenToPoll(pollId: number) {
    return new Observable<EventInterface>((subscriber) => {
      this.socket.on(`poll:${pollId}`, (data: EventInterface) => {
        subscriber.next(data);
      });
    }).pipe(
      tap({
        unsubscribe: () => this.socket.removeAllListeners(`poll:${pollId}`),
      })
    );
  }

  listenToOption(optionId: number) {
    return new Observable<EventInterface>((subscriber) => {
      this.socket.on(`option:${optionId}`, (data: EventInterface) => {
        subscriber.next(data);
      });
    }).pipe(
      tap({
        unsubscribe: () => this.socket.removeAllListeners(`option:${optionId}`),
      })
    );
  }
}
