import {Component, ViewChild} from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Editor } from 'brace';
import "brace/theme/eclipse"

//to use theme eclipse
//with angular-cli add "../node_modules/ace-builds/src-min/ace.js" 
//and "../node_modules/ace-builds/src-min/theme-eclipse.js" to "scripts" var into the file angular-cli.json

@Component({
    template: `
  <ace-editor
       [(text)]="text"
        #editor style="height:100%; width:100%; margin-top:14px;"></ace-editor>
  `
})
export class SampleCodeComponent {
    @ViewChild('editor', {static: false}) editor: AceEditorComponent;
    public text: string = `
let rects = [];

function setup() {
  createCanvas(800,800);
  background(100);
  noStroke();
  fill(255,255,255);
  for (let index = 0; index < 40; index++) {
    rects[index] = 0;
  }
}

let reachedEnd = 0;

function draw() {
  for (let i = 0; i < rects.length; i++) {
    if (rects[i] >= 800) {
      drawRect(i);
      continue;
    }
    let prog = Math.round(Math.random()*6);
    prog = prog ** 2;
    rects[i] +=prog;
    if (rects[i] >= 800) reachedEnd++;
    drawRect(i);
    if (reachedEnd === 40) reset();
  }
}

function drawRect(i) {
  rect(0,i*20,rects[i],20);
}

function reset() {
  let r = Math.round(Math.random()*255);
  let g = Math.round(Math.random()*255);
  let b = Math.round(Math.random()*255);
  fill(r,g,b);
  reachedEnd = 0;
  for (let i = 0; i < 40; i++) {
    rects[i] = 0;
  }
}
    `;

    ngAfterViewInit() {
      this.editor.setTheme("eclipse");

      this.editor.setReadOnly(true);
      this.editor.setMode("javascript");
      //this.editor.getEditor().getOptions

      let ed: Editor = this.editor.getEditor();
      ed.resize()
      ed.on('resize', (arg: any) => {
        const aceEditor = ed;
        const newHeight = aceEditor.getSession().getScreenLength() *
          (aceEditor.renderer.lineHeight);
         aceEditor.container.style.height = `${newHeight}px`;
        aceEditor.resize();
      });
      console.log(this.editor.getEditor());
    }
}