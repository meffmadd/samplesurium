import { SampleCodeComponent } from "./detail/code/sample-code/sample-code.component";
import { TensorsCodeComponent } from "./detail/code/tensors-code/tensors-code.component";
import { RegressionCodeComponent } from "./detail/code/regression-code/regression-code.component";
import { ClassificationCodeComponent } from "./detail/code/classification-code/classification-code.component";
import { TicTacToeCodeComponent } from "./detail/code/tic-tac-toe-code/tic-tac-toe-code.component";

export const CodeStore = [
    { name: 'Project 1', cmp: SampleCodeComponent },
    { name: 'Tensors', cmp: TensorsCodeComponent },
    { name: 'Polynomial Regression', cmp: RegressionCodeComponent },
    { name: 'Classification', cmp: ClassificationCodeComponent },
    { name: 'Tic-Tac-Toe', cmp: TicTacToeCodeComponent }
];