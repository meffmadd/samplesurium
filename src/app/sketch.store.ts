import { Sample } from '../assets/sample';
import { Tensors } from '../assets/tensors';

import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

interface Sketch {
    name: string;
    src: (p: p5) => void;
}  
export const SketchStore: Sketch[] = [
    {name: 'Project 1', src: Sample},
    {name: 'Tensors', src: Tensors},
   
];