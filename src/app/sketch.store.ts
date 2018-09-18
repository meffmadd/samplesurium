import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

import { Sample } from '../assets/sample';
import { Tensors } from '../assets/tensors';
import { Regression } from '../assets/regression';
import { Classification } from '../assets/classification';
import { TicTacToe } from '../assets/tic-tac-toe';

interface Sketch {
    name: string;
    src: (p: p5) => void;
}
export const SketchStore: Sketch[] = [
    { name: 'Project 1', src: Sample },
    { name: 'Tensors', src: Tensors },
    { name: 'Polynomial Regression', src: Regression},
    { name: 'Classification', src: Classification },
    { name: 'Tic-Tac-Toe', src: TicTacToe }
];