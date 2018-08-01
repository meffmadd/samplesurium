import { XOR } from '../assets/xor/sketch';

interface Sketch {
    name: string;
    src: (p: any) => void;
}  
export const SketchStore: Sketch[] = [
    {name: 'sample', src: XOR},
    {name: 'Project 1', src: XOR},
];