import {BB} from '../../../bb/bb';
import {CropCopy} from '../components/crop-copy';
import {checkBox} from '../base-components/check-box';
import {popup} from './popup';

/**
 *
 * p = {
 *     image: convertedPsd | {type: 'image', width: number, height: number, canvas: image | canvas},
 *     maxSize: number,
 *     target: htmlElement,
 *     callback: func(
 *         {
 *             type: 'as-image',
 *             image: image | canvas,
 *         } | {
 *             type: 'as-image-psd',
 *             image: convertedPsd,
 *             cropObj: {x: number, y: number, width: number, height: number}
 *         } | {
 *             type: 'as-layer',
 *             image: image | canvas,
 *         } | {
 *             type: 'cancel',
 *         }
 *     )
 * }
 *
 * @param p {}
 */
export function showImportImageDialog(p) {
    let div = BB.el({});

    const isSmall = window.innerWidth < 550 || window.innerHeight < 550;
    const style = isSmall ? {} : { width: '500px' };
    let resolutionEl;
    let cropCopy = new CropCopy({
        width: isSmall ? 340 : 540,
        height: isSmall ? 300 : 400,
        canvas: p.image.canvas,
        isNotCopy: true,
        onChange: function(width, height) {
            if (!resolutionEl) {
                return;
            }
            resolutionEl.textContent = width + ' x ' + height;
            updateResolution(width, height);
        }
    });
    BB.css(cropCopy.getEl(), {
        marginLeft: '-20px',
        borderTop: '1px solid #bbb',
        borderBottom: '1px solid #bbb'
    });
    cropCopy.getEl().title = 'Drag to crop';
    div.appendChild(cropCopy.getEl());


    resolutionEl = BB.el({
        parent: div,
        textContent: p.image.width + ' x ' + p.image.height,
        css: {
            marginTop: '10px',
            textAlign: 'center'
        }
    });
    function updateResolution(w, h) {
        let isTooLarge = w > p.maxSize || h > p.maxSize;
        resolutionEl.style.color = isTooLarge ? '#f00' : '#888';
    }
    updateResolution(p.image.width, p.image.height);


    let doFlatten = false;
    function showWarnings(psdWarningArr) {
        let contentArr = [];
        let warningMap = {
            'mask': 'Masks not supported. Mask was applied.',
            'clipping': 'Clipping not supported. Clipping layers were merged.',
            'group': 'Groups not supported. Layers were ungrouped.',
            'adjustment': 'Adjustment layers not supported.',
            'layer-effect': 'Layer effects not supported.',
            'smart-object': 'Smart objects not supported.',
            'blend-mode': 'Unsupported layer blend mode.',
            'bits-per-channel': 'Unsupported color depth. Only 8bit per channel supported.',
        };
        for (let i = 0; i < psdWarningArr.length; i++) {
            contentArr.push('- ' + warningMap[psdWarningArr[i]]);
        }
        alert(contentArr.join("\n"));
    }

    if (p.image.type === 'psd') {
        let noteStyle = {
            background: 'rgba(255,255,0,0.5)',
            padding: '10px',
            marginTop: '5px',
            marginBottom: '5px',
            border: '1px solid #e7d321',
            borderRadius: '5px'
        };
        if (p.image.layerArr) {
            let flattenCheckbox = checkBox({
                init: doFlatten,
                label: 'Flatten image',
                callback: function(b) {
                    doFlatten = b;
                }
            });
            div.appendChild(flattenCheckbox);

            if (p.image.warningArr) {
                let noteEl = BB.el({
                    content: 'PSD support is limited. Flattened will more likely look correct. ',
                    css: noteStyle
                });
                noteEl.appendChild(BB.el({
                    tagName: 'a',
                    content: 'Details',
                    onClick: function() {
                        showWarnings(p.image.warningArr);
                    }
                }));
                div.appendChild(noteEl);
            }
        } else {
            let noteEl = BB.el({
                content: 'Unsupported features. PSD had to be flattened. ',
                css: noteStyle
            });
            div.appendChild(noteEl);
        }
    }

    function callback(result) {
        let croppedImage = cropCopy.getCroppedImage();
        let cropRect = cropCopy.getRect();
        cropCopy.destroy();

        if (result === "As Layer") {
            p.callback({
                type: 'as-layer',
                image: croppedImage
            });

        } else if (result === "As Image") {
            if (p.image.type === 'psd') {
                if (doFlatten) {
                    p.image.layerArr = null;
                }
                p.callback({
                    type: 'as-image-psd',
                    image: p.image,
                    cropObj: cropRect
                });
            } else if (p.image.type === 'image') {
                p.callback({
                    type: 'as-image',
                    image: croppedImage
                });
            }
        } else {
            p.callback({
                type: 'cancel'
            });
        }
    }
    popup({
        target: p.target,
        message: "<b>Import Image</b>",
        div: div,
        style,
        buttons: ["As Layer", "As Image", "Cancel"],
        callback: callback,
        autoFocus: 'As Image'
    });
}