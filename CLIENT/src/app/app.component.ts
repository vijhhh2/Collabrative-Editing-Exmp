import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SharedbService } from './sharedb.service';
import { Doc } from 'sharedb';
import { DeltaStatic, Quill, RangeStatic } from 'quill';
import { Observable, of, OperatorFunction, UnaryFunction } from 'rxjs';
import { debounceTime, map, mergeMap } from 'rxjs/operators';

// function debounce(func: any, wait: any) {
//   let timeout: any;
//   return (...args: any) => {
//     //@ts-ignore
//     const context = this;
//     const later = function () {
//       timeout = null;
//       func.apply(context, args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }

function pipeIf(
  predicate: (value: [RangeStatic, RangeStatic, string]) => boolean,
  pipe: OperatorFunction<
    [RangeStatic, RangeStatic, string],
    [RangeStatic, RangeStatic, string]
  >
) {
  return function (source: Observable<[RangeStatic, RangeStatic, string]>) {
    return source.pipe(
      mergeMap((value) => (predicate(value) ? of(value).pipe(pipe) : of(value)))
    );
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  doc!: Doc;
  editor!: Quill;
  cursorModule: any;

  constructor(private sharedbService: SharedbService) {}

  ngOnInit(): void {
    this.doc = this.sharedbService.getDocument('documents', 'document1');
  }

  onEditorCreated(editor: Quill) {
    this.editor = editor;

    // Setup ShareDB Document
    this.doc.subscribe(() => {
      console.log(this.doc.data);
      this.editor.setContents(this.doc.data);
    });

    this.editor.on('text-change', (delta, oldDelta, source) => {
      if (source !== 'user') {
        return;
      }

      this.doc.submitOp(delta, { source: this.editor });
    });

    // this.editor.on('selection-change', (range, oldRange, source) => {
    //   const debouncedUpdate = debounce(this.updateCursor, 500);
    //   if (source === 'user') {
    //     this.updateCursor(this.cursorModule, range);
    //   } else {
    //     debouncedUpdate(range);
    //   }
    // });

    this.createSelectionChangObservable(this.editor)
      .pipe(
        pipeIf(
          ([range, oldRange, source]) => source !== 'user',
          debounceTime(1000)
        )
      )
      .subscribe(([range, oldRange, source]) => {
        console.log('selection-change', range, oldRange, source);
        this.updateCursor(this.cursorModule, range);
      });

    this.doc.on('op', (op, source) => {
      if (source === this.editor) {
        return;
      }

      this.editor.updateContents(op as unknown as DeltaStatic);
    });

    // Add Cursors
    this.cursorModule = this.editor.getModule('cursors');
    if (this.generateRandomTrueOrFalse()) {
      console.log('Generated true');
      this.cursorModule.createCursor('cursor', 'User1', 'red');
    } else {
      console.log('Generated false');
      this.cursorModule.createCursor('cursor', 'User2', 'blue');
    }
  }

  private generateRandomTrueOrFalse() {
    const n = Math.round(Math.random() * 100);
    if (n % 2 === 0) {
      return true;
    } else {
      return false;
    }
  }

  private updateCursor(cursorModule: any, range: any) {
    cursorModule.moveCursor('cursor', range);
  }

  private createSelectionChangObservable(
    editor: Quill
  ): Observable<[RangeStatic, RangeStatic, string]> {
    return new Observable((observer) => {
      editor.on('selection-change', (range, oldRange, source) => {
        observer.next([range, oldRange, source]);
      });
    });
  }

  // private dev
}
