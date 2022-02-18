import {defaultBrush} from './default-brush';
import {smoothBrush} from './smooth-brush';
import {sketchyBrush} from './sketchy-brush';
import {pixelBrush} from './pixel-brush';
import {eraserBrush} from './eraser-brush';
import {smudgeBrush} from './smudge-brush';

export const brushes = {
    defaultBrush: defaultBrush,
    smoothBrush: smoothBrush,
    sketchy: sketchyBrush,
    pixel: pixelBrush,
    smudge: smudgeBrush,
    eraser: eraserBrush,
}