import {Component, ViewChild} from '@angular/core';
import { AceEditorComponent } from '../../../../node_modules/ng2-ace-editor';
import { Editor } from '../../../../node_modules/brace';
import "brace/theme/eclipse"

//to use theme eclipse
//with angular-cli add "../node_modules/ace-builds/src-min/ace.js" 
//and "../node_modules/ace-builds/src-min/theme-eclipse.js" to "scripts" var into the file angular-cli.json

@Component({
    template: `
  <ace-editor
       [(text)]="text"
        #editor style="height:500px; width:500px; margin-top:14px;"></ace-editor>
  `
})
export class SampleCodeComponent {
    @ViewChild('editor') editor: AceEditorComponent;
    text: string = `
import * as tf from '@tensorflow/tfjs';

export const XOR = (p) => {

    let canvas;
    let model;
    let rects = [];
    let reachedEnd = 0;

    p.preload = () => {
        console.log('preload');
    }

    p.setup = () => {
        canvas = p.createCanvas(500, 500);
        document.getElementById("sketch").appendChild(canvas.canvas);

        p.background(100);
        p.noStroke();
        p.fill(255, 255, 255);
        for (let index = 0; index < 40; index++) {
            rects[index] = 0;
        }

        // Define a model for linear regression.
        model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

        // Prepare the model for training: Specify the loss and the optimizer.
        model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

        // Generate some synthetic data for training.
        const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
        const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

        // Train the model using the data.
        model.fit(xs, ys, { epochs: 10 }).then(() => {
            // Use the model to do inference on a data point the model hasn't seen before:
            model.predict(tf.tensor2d([5], [1, 1])).print();
        });
    }

    p.draw = () => {
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
        p.rect(0,i*20,rects[i],20);
      }
      
      function reset() {
        let r = Math.round(Math.random()*255);
        let g = Math.round(Math.random()*255);
        let b = Math.round(Math.random()*255);
        p.fill(r,g,b);
        reachedEnd = 0;
        for (let i = 0; i < 40; i++) {
          rects[i] = 0;
        }
      }
}
    `;

    ngAfterViewInit() {
      this.editor.setTheme("eclipse");

      this.editor.setReadOnly(true);
      this.editor.setMode("javascript");
      //this.editor.getEditor().getOptions

      let ed: Editor = this.editor.getEditor();
      console.log(this.editor.getEditor());
    }
}