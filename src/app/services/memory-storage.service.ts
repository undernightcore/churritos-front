import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MemoryStorageService {
  #storage = new Map<string, string | undefined>();

  getItem(key: string) {
    return this.#storage.get(key);
  }

  setItem(key: string, value: string | undefined) {
    return this.#storage.set(key, value);
  }
}
