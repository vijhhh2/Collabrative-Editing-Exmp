import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QuillModule } from 'ngx-quill';
import QuillCursors from 'quill-cursors';
import * as Quill from 'quill';
import { YjsDemoComponent } from './components/yjs-demo/yjs-demo.component';
(Quill as any).register('modules/cursors', QuillCursors);

@NgModule({
  declarations: [AppComponent, YjsDemoComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    QuillModule.forRoot({
      modules: {
        cursors: true,
        toolbar: [
          // adding some basic Quill content features
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'code-block'],
        ],
        history: {
          // Local undo shouldn't undo changes
          // from remote users
          userOnly: true,
        },
      },
      placeholder: 'Start collaborating...',
      theme: 'snow', // 'bubble' is also great
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
