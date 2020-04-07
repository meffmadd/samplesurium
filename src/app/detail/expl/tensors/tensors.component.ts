import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tensors',
  templateUrl: './tensors.component.html',
  styles: []
})
export class TensorsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  tensor: string = "tf.tensor2d([1, 2, 3, 4], [2, 2])"
  tensor_infer: string = "tf.tensor2d([[1, 2], [3, 4]])"
  tensor_low: string =
  `tf.scalar(3.14);
tf.tensor1d([1, 2, 3]);
tf.tensor2d([[1, 2], [3, 4]]);
tf.tensor3d([[[1], [2]], [[3], [4]]]);
// etc.`;

  tensor_dispose: string = "const tensor = tf.tensor2d([1, 2, 3, 4], [2, 2]);\ntensor.dispose() // tensor is deleted"

  tensor_tidy: string = 
  `const square = tf.tidy(() => {
  const a = tf.scalar(2); // a is deleted after tidy
  const b = a.square();
  return b;
});`
}
