// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              WebPageCanvasNode
// ----------------------------------------------

import {WebPageBaseTextureNode} from './WebPageBaseTextureNode.js';

class WebPageCanvasNode extends WebPageBaseTextureNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "width", defaultValue: 100},
            {name: "height", defaultValue: 100},
            {name: "code"},
            {name: "instantDraw"},
        );
        this.__init();
        if(this.enable && this.instantDraw) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    __init() {
        this.texture = this.gl.createTexture();
        this.__checkPowerOfTwo();
        this.__setMipmap();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    draw() {
//         this.canvas = document.createElement("canvas");
//         this.context = this.canvas.getContext("2d");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
//         console.log("Canvas", this.width, this.height, this.canvas.width, this.canvas.height);
        if(this.__getType(this.code) === "function") {
            this.code.call(this);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.canvas);
        this.generateMipmap();
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return this;
    }
}
Object.defineProperties(WebPageCanvasNode.prototype, {
    "width": {
        get() {return this.__getValue(this.input.width);},
        set(value) {this.input.width = value;}
    },
    "height": {
        get() {return this.__getValue(this.input.height);},
        set(value) {this.input.height = value;}
    },
    "code": {
        get() {return this.input.code;},
        set(value) {this.input.code = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
    "canvas": {
        get() {return this.data.canvas;},
        set(value) {this.data.canvas = value;}
    },
    "context": {
        get() {return this.data.context;},
        set(value) {this.data.context = value;}
    },
});

export {WebPageCanvasNode};
