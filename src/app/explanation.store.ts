import { SampleComponent } from './detail/expl/sample/sample.component';
import { TensorsComponent } from './detail/expl/tensors/tensors.component';
import { RegressionComponent } from './detail/expl/regression/regression.component';
import { ClassificationComponent } from './detail/expl/classification/classification.component';
import { TicTacToeComponent } from './detail/expl/tic-tac-toe/tic-tac-toe.component';

export const ComponentStore = [
    { name: 'Project 1', cmp: SampleComponent },
    { name: 'Tensors', cmp: TensorsComponent },
    { name: 'Polynomial Regression', cmp: RegressionComponent },
    { name: 'Classification', cmp: ClassificationComponent },
    { name: 'Tic-Tac-Toe', cmp: TicTacToeComponent }
];