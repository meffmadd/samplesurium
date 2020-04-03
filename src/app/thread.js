// adapted from: https://gist.github.com/sergiodxa/06fabb866653bd8b3165e9fe9fd8036b
class Thread {

  constructor(fn) {
    if (!window.Worker) throw Promise.reject(
      new ReferenceError(`WebWorkers aren't available.`)
    );

    this.fn = fn;

    this.fnWorker = `
    importScripts('https://unpkg.com/@tensorflow/tfjs');
    tf.setBackend('cpu');

    tf.tensor([5,6,7])

    let fun = ${this.fn.toString().replace("_tensorflow_tfjs__WEBPACK_IMPORTED_MODULE_1__", "tf")}

    self.onmessage = function(message) {

      let post = fun.apply(null, message.data);
      self.postMessage(post);
    }`;
    console.log(this.fnWorker)
    console.log(this.fn.toString())
    const blob = new Blob([this.fnWorker], { type: 'text/javascript' });
    const blobUrl = window.URL.createObjectURL(blob);
    this.worker = new Worker(blobUrl);
    window.URL.revokeObjectURL(blobUrl);
        
  }
  
  execute(...args) {

    return new Promise((resolve, reject) => {
      try {
        this.worker.onmessage = result => {
          resolve(result.data);
          this.worker.terminate();
        };

        this.worker.onerror = error => {
          reject(error);
          this.worker.terminate();
        };

        this.worker.postMessage(args);
      } catch (error) {
        reject(error);
      }
    });
    }
}

export {Thread}
