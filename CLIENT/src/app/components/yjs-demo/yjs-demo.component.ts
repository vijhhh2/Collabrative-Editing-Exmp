import { Component, OnInit } from '@angular/core';
import Quill from 'quill';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import { QuillBinding } from 'y-quill';

@Component({
  selector: 'app-yjs-demo',
  templateUrl: './yjs-demo.component.html',
  styleUrls: ['./yjs-demo.component.scss'],
})
export class YjsDemoComponent implements OnInit {
  ydoc = new Y.Doc();
  provider = new WebsocketProvider('ws://localhost:3000', 'demo', this.ydoc);
  ytext = this.ydoc.getText('quill');
  binding!: QuillBinding;

  constructor() {}

  ngOnInit(): void {}

  onEditorCreated(editor: Quill) {
    this.binding = new QuillBinding(
      this.ytext,
      editor,
      this.provider.awareness
    );
  }
}
