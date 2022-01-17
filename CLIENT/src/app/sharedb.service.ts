import { Injectable, OnDestroy } from '@angular/core';
import { Connection, types } from 'sharedb/lib/client';
//@ts-ignore
import * as richText from 'rich-text';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SharedbService implements OnDestroy {
  socket!: WebSocket;
  connection!: Connection;

  constructor() {
    types.register(richText.type);
    this.socket = new WebSocket('ws://localhost:3000');
    this.connection = new Connection(this.socket as any);
  }
  ngOnDestroy(): void {
    this.connection.close();
  }

  getDocument(collectionName: string, documentID: string) {
    return this.connection.get(collectionName, documentID);
  }

  onMessage(socket: WebSocket): Observable<string> {
    return new Observable((observer) => {
      socket.onmessage = (event: MessageEvent<any>) => {
        observer.next(event.data);
      };

      socket.onclose = (event: CloseEvent) => {
        observer.error(event);
      };
    });
  }
}
