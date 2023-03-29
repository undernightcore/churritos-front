import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MemoryStorageService {
  #storage = new Map<string, string>();

  getItem(key: string) {
    return this.#storage.get(key);
  }

  setItem(key: string, value: string) {
    return this.#storage.set(key, value);
  }
}
