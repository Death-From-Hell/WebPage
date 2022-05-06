// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                WebPageRectNode
// ----------------------------------------------

import {WebPageFramebuffer2dNode} from './WebPageFramebuffer2dNode.js';

class WebPageRectNode extends WebPageFramebuffer2dNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "width", defaultValue: 100},
            {name: "height", defaultValue: 100},
            {name: "color", defaultValue: [0,0,0,1]},
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
        super.__init();
    }
    draw() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.data.framebuffer);
        this.gl.viewport(0,0, this.width, this.height);
        this.root.clearColor(this.color);
        this.clear();
        this.root.clearColor();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.generateMipmap();
        return this;
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}
Object.defineProperties(WebPageRectNode.prototype, {
    "width": {
        get() {return this.__getValue(this.input.width);},
        set(value) {this.input.width = value;}
    },
    "height": {
        get() {return this.__getValue(this.input.height);},
        set(value) {this.input.height = value;}
    },
    "color": {
        get() {return this.__getValue(this.input.color);},
        set(value) {this.input.color = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
    'texture': {
        get() {return this.data.texture;},
        set(value) {this.data.texture = value;}
    }
});

export {WebPageRectNode};
