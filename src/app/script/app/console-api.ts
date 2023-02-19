import {IVector2D} from '../bb/bb-types';



export type TConsoleApi = {
    readonly draw: (path: IVector2D[]) => void;
    readonly help: () => void;
};

export function createConsoleApi (
    p: {
        onDraw: (path: IVector2D[]) => void;
    }
): TConsoleApi {

    console.info('Draw via the console! Learn more: %cKL.help()', 'background: #000; color: #0f0;');

    return Object.freeze({
        draw: (path: IVector2D[]): void => {
            p.onDraw(path);
        },
        help: (): void => {
            console.log(`KL.draw({x: number; y: number}[]) // draw a line
KL.help() // print help
`);
        },
    });
}