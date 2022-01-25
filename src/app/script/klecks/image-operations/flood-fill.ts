
/**
 * Flood fill. Tried https://github.com/binarymax/floodfill.js/ but it implemented tolerance wrong, and had bugs.
 * So, my own implementation. can handle tolerance, grow, opacity.
 * Needs to be optimized.
 */

/**
 * Set values in data within rect to 254, unless they're 255
 *
 * @param data Uint8Array
 * @param width int
 * @param x0 int
 * @param y0 int
 * @param x1 int >x0
 * @param y1 int >y0
 */
function fillRect(data, width, x0, y0, x1, y1) {
    for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
            if (data[y * width + x] === 255) {
                continue;
            }
            data[y * width + x] = 254;
        }
    }
}

let mx, my;

/**
 * Get index i moved by dX, dY. in array with dimensions width height.
 * Returns null if outside bounds.
 *
 * @param width int
 * @param height int
 * @param i int
 * @param dX int
 * @param dY int
 * @returns {null|*}
 */
function moveIndex(width, height, i, dX, dY) {
    mx = i % width + dX;
    my = Math.floor(i / width) + dY;

    if (mx < 0 || my < 0 || mx >= width || my >= height) {
        return null;
    }

    return my * width + mx;
}

/**
 * If pixel can be filled (within tolerance) will be set 255 and returns true.
 * returns false if already filled, or i is null
 *
 * @param srcArr Uint8Array rgba
 * @param targetArr Uint8Array
 * @param width int
 * @param height int
 * @param initRgba rgba
 * @param tolerance int 0 - 255
 * @param i int - srcArr index
 * @returns {boolean}
 */
function testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, i) {
    if (i === null || targetArr[i] === 255) {
        return false;
    }

    if (
        srcArr[i * 4] === initRgba[0] &&
        srcArr[i * 4 + 1] === initRgba[1] &&
        srcArr[i * 4 + 2] === initRgba[2] &&
        srcArr[i * 4 + 3] === initRgba[3]
    ) {
        targetArr[i] = 255;
        return true;
    }

    if (
        tolerance > 0 &&
        Math.abs(srcArr[i * 4] - initRgba[0]) <= tolerance &&
        Math.abs(srcArr[i * 4 + 1] - initRgba[1]) <= tolerance &&
        Math.abs(srcArr[i * 4 + 2] - initRgba[2]) <= tolerance &&
        Math.abs(srcArr[i * 4 + 3] - initRgba[3]) <= tolerance
    ) {
        targetArr[i] = 255;
        return true;
    }

    return false;
}


/**
 *
 * @param srcArr Uint8Array rgba
 * @param targetArr Uint8Array
 * @param width int
 * @param height int
 * @param px int
 * @param py int
 * @param tolerance int 0 - 255
 * @param grow int >= 0
 * @param isContiguous boolean
 */
function floodFill(srcArr, targetArr, width, height, px, py, tolerance, grow, isContiguous) {

    let initRgba = [
        srcArr[(py * width + px) * 4],
        srcArr[(py * width + px) * 4 + 1],
        srcArr[(py * width + px) * 4 + 2],
        srcArr[(py * width + px) * 4 + 3]
    ];

    if (isContiguous) {
        let q = [];
        q.push(py * width + px);
        targetArr[py * width + px] = 255;

        let i, e;
        while (q.length) {
            i = q.pop();

            // queue up unfilled neighbors
            e = moveIndex(width, height, i, -1, 0); // left
            testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);

            e = moveIndex(width, height, i, 1, 0); // right
            testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);

            e = moveIndex(width, height, i, 0, -1); // up
            testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);

            e = moveIndex(width, height, i, 0, 1); // bottom
            testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, e) && q.push(e);
        }
    } else {
        for (let i = 0; i < width * height; i++) {
            testAndFill(srcArr, targetArr, width, height, initRgba, tolerance, i);
        }
    }


    // grow
    if (grow === 0) {
        return;
    }

    // how does it grow? it finds all pixel at the edge.
    // then depending on what kind of edge it is, it draws a rectangle into target
    // the rectangle has the value 254, or else it mess it all up.
    // after it's all done, replaces it with 255
    let x0, x1, y0, y1;
    let l, tl, t, tr, r, br, b, bl; // left, top left, top, top right, etc.
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (targetArr[y * width + x] !== 255) {
                continue;
            }

            // bounds of rectangle
            x0 = x;
            x1 = x;
            y0 = y;
            y1 = y;

            l = targetArr[(y) * width + x - 1] !== 255;
            tl = targetArr[(y - 1) * width + x - 1] !== 255;
            t = targetArr[(y - 1) * width + x] !== 255;
            tr = targetArr[(y - 1) * width + x + 1] !== 255;
            r = targetArr[(y) * width + x + 1] !== 255;
            br = targetArr[(y + 1) * width + x + 1] !== 255;
            b = targetArr[(y + 1) * width + x] !== 255;
            bl = targetArr[(y + 1) * width + x - 1] !== 255;

            if (l) { // left
                x0 = x - grow;
            }
            if (l && tl && t) { // top left
                x0 = x - grow;
                y0 = y - grow;
            }
            if (t) { // top
                y0 = Math.min(y0, y - grow);
            }
            if (t && tr && r) { // top right
                y0 = Math.min(y0, y - grow);
                x1 = x + grow;
            }
            if (r) { // right
                x1 = Math.max(x1, x + 1 * grow);
            }
            if (r && br && b) { // bottom right
                x1 = Math.max(x1, x + 1 * grow);
                y1 = Math.max(y1, y + 1 * grow);
            }
            if (b) { // bottom
                y1 = Math.max(y1, y + 1 * grow);
            }
            if (b && bl && l) { // bottom left
                x0 = Math.min(x0, x - 1 * grow);
                y1 = Math.max(y1, y + 1 * grow);
            }

            if (!l && !tl && !t && !tr && !r && !br && !b && !bl) {
                continue;
            }

            fillRect(
                targetArr,
                width,
                Math.max(0, x0),
                Math.max(0, y0),
                Math.min(width - 1, x1),
                Math.min(height - 1, y1)
            );
        }
    }
    for (let i = 0; i < width * height; i++) {
        if (targetArr[i] === 254) {
            targetArr[i] = 255;
        }
    }

}


/**
 * Does flood fill, and returns that. an array - 0 not filled. 255 filled
 *
 * returns {
 *     data: Uint8Array
 * }
 *
 * @param rgbaArr Uint8Array rgba
 * @param width int
 * @param height int
 * @param x int
 * @param y int
 * @param tolerance int 0 - 255
 * @param grow int >= 0
 * @param isContiguous boolean
 * @returns {{data: Uint8Array}}
 */
export function floodFillBits(rgbaArr, width, height, x, y, tolerance, grow, isContiguous) {
    x = Math.round(x);
    y = Math.round(y);

    let resultArr = new Uint8Array(new ArrayBuffer(width * height));

    floodFill(rgbaArr, resultArr, width, height, x, y, tolerance, grow, isContiguous);

    return {
        data: resultArr
    }
}
