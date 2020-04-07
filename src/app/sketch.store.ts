import * as p5 from 'p5';
import 'p5/lib/addons/p5.dom';

import { Sample } from '../assets/sample';
import { Tensors } from '../assets/tensors';
import { Regression } from '../assets/regression';
import { Classification } from '../assets/classification';
import { TicTacToe } from '../assets/tic-tac-toe';
import { Breathe } from 'src/assets/art/breathe';
import { Comets } from 'src/assets/art/comets';
import { Strings } from 'src/assets/art/strings';
import { Eclipse } from 'src/assets/art/eclipse';
import { Space } from 'src/assets/art/space';

interface Sketch {
    name: string;
    src: (p: p5) => void;
}
export const SketchStore: Sketch[] = [
    { name: 'Project 1', src: Sample },
    { name: 'Tensors', src: Tensors },
    { name: 'Polynomial Regression', src: Regression},
    { name: 'Classification', src: Classification },
    { name: 'Tic-Tac-Toe', src: TicTacToe },
    { name: 'Breathe', src: Breathe },
    { name: 'Comets', src: Comets },
    { name: 'Strings', src: Strings },
    { name: 'Eclipse', src: Eclipse },
    { name: 'Space', src: Space }
];