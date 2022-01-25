import {BB} from '../../bb/bb';
import {eventResMs} from './filters-consts';
import {PcSlider} from '../ui/base-components/slider';
import {KlCanvasPreview} from '../canvas-ui/canvas-preview';
import {getSharedFx} from './shared-gl-fx';

export const glUnsharpMask = {

    getDialog(params) {
        let context = params.context;
        let canvas = params.canvas;
        if (!context || !canvas) {
            return false;
        }

        let layers = canvas.getLayers();
        let selectedLayerIndex = canvas.getLayerIndex(context.canvas);

        let fit = BB.fitInto(280, 200, context.canvas.width, context.canvas.height, 1);
        let w = parseInt('' + fit.width), h = parseInt('' + fit.height);

        let tempCanvas = BB.canvas();
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCanvas.getContext("2d").drawImage(context.canvas, 0, 0, w, h);
        let previewFactor = w / context.canvas.width;

        let div = document.createElement("div");
        let result: any = {
            element: div
        };

        function finishInit() {
            let radius = 2, strength = 5.1 / 10;
            div.innerHTML = "Sharpens the selected layer by scaling pixels away from the average of their neighbors.<br/><br/>";

            let glCanvas = getSharedFx();
            if (!glCanvas) {
                return; // todo throw?
            }
            let texture = glCanvas.texture(tempCanvas);

            let radiusSlider = new PcSlider({
                label: 'Radius',
                width: 300,
                height: 30,
                min: 0,
                max: 200,
                initValue: 2,
                eventResMs: eventResMs,
                onChange: function (val) {
                    radius = val;
                    glCanvas.draw(texture).unsharpMask(radius * previewFactor, strength).update();
                    klCanvasPreview.render();
                },
                curve: [[0, 0], [0.1, 2], [0.5, 50], [1, 200]]
            });
            let strengthSlider = new PcSlider({
                label: 'Strength',
                width: 300,
                height: 30,
                min: 0,
                max: 50,
                initValue: 5.1,
                eventResMs: eventResMs,
                onChange: function (val) {
                    strength = val / 10;
                    glCanvas.draw(texture).unsharpMask(radius * previewFactor, strength).update();
                    klCanvasPreview.render();
                },
                curve: [[0, 0], [0.1, 2], [0.5, 10], [1, 50]]
            });
            radiusSlider.getElement().style.marginBottom = "10px";
            div.appendChild(radiusSlider.getElement());
            div.appendChild(strengthSlider.getElement());


            let previewWrapper = document.createElement("div");
            BB.css(previewWrapper, {
                width: "340px",
                marginLeft: "-20px",
                height: "220px",
                backgroundColor: "#9e9e9e",
                marginTop: "10px",
                boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px inset, rgba(0, 0, 0, 0.2) 0px -1px inset",
                overflow: "hidden",
                position: "relative",
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            });

            let previewLayerArr = [];
            {
                for(let i = 0; i < layers.length; i++) {
                    previewLayerArr.push({
                        canvas: i === selectedLayerIndex ? glCanvas : layers[i].context.canvas,
                        opacity: layers[i].opacity,
                        mixModeStr: layers[i].mixModeStr
                    });
                }
            }
            let klCanvasPreview = new KlCanvasPreview({
                width: parseInt('' + w),
                height: parseInt('' + h),
                layerArr: previewLayerArr
            });

            let previewInnerWrapper = BB.el({
                css: {
                    position: 'relative',
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                    width: parseInt('' + w) + 'px',
                    height: parseInt('' + h) + 'px'
                }
            });
            previewInnerWrapper.appendChild(klCanvasPreview.getElement());
            previewWrapper.appendChild(previewInnerWrapper);


            div.appendChild(previewWrapper);

            try {
                glCanvas.draw(texture).unsharpMask(radius * previewFactor, strength).update();
                klCanvasPreview.render();
            } catch(e) {
                (div as any).errorCallback(e);
            }

            result.destroy = () => {
                radiusSlider.destroy();
                strengthSlider.destroy();
                texture.destroy();
            };
            result.getInput = function () {
                result.destroy();
                return {
                    radius: radius,
                    strength: strength
                };
            };
        }

        setTimeout(finishInit, 1);

        return result;
    },


    apply(params) {
        let context = params.context;
        let history = params.history;
        let radius = params.input.radius;
        let strength = params.input.strength;
        if (!context || radius === null || strength === null || !history)
            return false;
        history.pause();
        let glCanvas = getSharedFx();
        if (!glCanvas) {
            return false; // todo more specific error?
        }
        let texture = glCanvas.texture(context.canvas);
        glCanvas.draw(texture).unsharpMask(radius, strength).update();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(glCanvas, 0, 0);
        texture.destroy();
        history.pause(false);
        history.add({
            tool: ["filter", "glUnsharpMask"],
            action: "apply",
            params: [{
                input: params.input
            }]
        });
        return true;
    }

};