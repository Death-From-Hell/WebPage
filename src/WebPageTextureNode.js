// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              WebPageTextureNode
// ----------------------------------------------

import {WebPageBaseTextureNode} from './WebPageBaseTextureNode.js';

class WebPageTextureNode extends WebPageBaseTextureNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "sourceNode"},
            {name: "instantLoad"},
        );
        this.__init();
        if(this.enable && this.instantLoad) {
            this.__setup();
            this.load();
            this.__cleanup();
        }
    }
    __init() {
        this.texture = this.gl.createTexture();
        this.width = this.sourceNode.width;
        this.height = this.sourceNode.height;
        this.__checkPowerOfTwo();
        this.__setMipmap();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
    }
    reinit() {
        if(this.sourceNode.width != this.width || this.sourceNode.height != this.height) {
            this.width = this.sourceNode.width;
            this.height = this.sourceNode.height;
            this.__checkPowerOfTwo();
            this.__setMipmap();
            this.__setMagFilter();
            this.__setMinFilter();
            this.__setWrapS();
            this.__setWrapT();
        }
    }
    load() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        switch(this.sourceNode.constructor.name) {
            case "ImageBitmap":
            {
                const canvas = document.createElement("canvas");
                canvas.width = this.sourceNode.width;
                canvas.height = this.sourceNode.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(this.sourceNode, 0, 0);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
                this.generateMipmap();
                break;
            }
            case "WebPageImageNode":
            {
                console.log("2");
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.sourceNode.image);
                this.generateMipmap();
                break;
            }
            case "WebPageVideoNode":
            {
                console.log("3");
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.sourceNode.video);
                this.generateMipmap();
                break;
            }
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.load();
            this.__cleanup();
        }
    }
}
Object.defineProperties(WebPageTextureNode.prototype, {
    "sourceNode": {
        get() {return this.__getValue(this.input.sourceNode);},
        set(value) {this.input.sourceNode = value;}
    },
    "instantLoad": {
        get() {return this.__getValue(this.input.instantLoad);},
        set(value) {this.input.instantLoad = value;}
    },
});

export {WebPageTextureNode};
