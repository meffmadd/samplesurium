import { Component, OnInit } from '@angular/core';
import { AceEditorComponent } from 'ng2-ace-editor';


@Component({
  selector: 'app-regression',
  templateUrl: './regression.component.html',
  styles: ['p {margin-bottom: 5px; }']
})
export class RegressionComponent implements OnInit {

  options:any = {maxLines: 40, printMargin: false};

  polynomial: string = "f(x) = a x^3 + b x^2 + c x + d";
  mse: string = `{\\displaystyle \\operatorname {MSE} ={\\frac {1}{n}}\\sum _{i=1}^{n}(Y_{i}-{\\hat {Y_{i}}})^{2}}`;
  xVector: string = "\\vec{x}"
  fVector: string = "f(\\vec{x})"

  predict: string = `function predict(x) {
    return tf.tidy(() => {
      return a.mul(tf.pow(x, tf.scalar(3)))
        .add(b.mul(tf.square(x)))
        .add(c.mul(x))
        .add(d);
    });
  }`;

  initVariables: string = `a = tf.variable(tf.scalar(Math.random()));
b = tf.variable(tf.scalar(Math.random()));
c = tf.variable(tf.scalar(Math.random()));
d = tf.variable(tf.scalar(Math.random()));`;

  minimize: string = `	if (xs.length > 0) {
		optimizer.minimize(() => {
			const predsYs = predict(xs);
			return loss(predsYs, ys);
		});
  }`;
  
  mseCode: string = `function loss(predictions, labels) {
    const meanSquareError = predictions.sub(labels).square().mean();
    return meanSquareError;
  }`
  

  constructor() { }

  ngOnInit() {
  }

}
