import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-classification',
  templateUrl: './classification.component.html',
  styles: ['p {margin-bottom: 5px; }']
})
export class ClassificationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  sequential: string = "model = tf.sequential();";
  layers: string = `model.add(
	tf.layers.dense({
		units: 10,
		inputShape: [2],
		activation: 'sigmoid'
	})
);

model.add(
	tf.layers.dense({
		units: 1,
		activation: 'sigmoid'
	})
);

optimizer = tf.train.adam(0.23);
model.compile({
	optimizer: optimizer,
	loss: tf.losses.meanSquaredError
});`;

  fit: string = `function train() {
return model.fit(xs, ys, {
    shuffle: true,
    epochs: 2
  });
}
  
function trainModel() {
  train().then(result => {
    result.history.loss.forEach(element => console.log(element));
    trainModel();
  });
}`;

  contour: string = `  async function drawCountour() {
    tf.tidy(() => {
      let yOutputs = model.predict(xInputs);
      const reshaped = yOutputs.reshape([Math.floor(size) + 1, Math.floor(size) + 1, 1]);
      const resized = tf.image.resizeBilinear(reshaped, [upscaleRes, upscaleRes]);
      let yPreds = resized.dataSync();
      let index = 0;
      const predSize = Math.sqrt(yPreds.length);
      const tileSize = canvasSize / predSize;
      noStroke();
      for (let i = 0; i < predSize; i++) {
        for (let j = 0; j < predSize; j++) {
          fill(getColor(yPreds[index++]));
          rect(i * tileSize, j * tileSize, tileSize, tileSize);
        }
      }
    });
  }`;


}
