// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageVideoNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';

class WebPageVideoNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "src"},
            {name: "crossOrigin", defaultValue: "anonymous"},
        );
        this.video = document.createElement("video");
        this.video.crossOrigin = this.crossOrigin;
        this.video.preload = "auto";
    }
    async load() {
        await new Promise((resolve, reject) => {
            this.video.addEventListener("canplaythrough", () => {
                resolve(this);
            }, false);
            this.video.addEventListener("error", () => {
                reject(new Error(`Video file upload error ${this.src}`));
            }, false);
            this.video.src = this.src;
        });
        return this;
    }
}
Object.defineProperties(WebPageVideoNode.prototype, {
    "src": {
        get() {return this.__getValue(this.input.src);},
        set(value) {this.input.src = value; this.video.src = this.input.src;}
    },
    "crossOrigin": {
        get() {return this.__getValue(this.input.crossOrigin);},
        set(value) {this.input.crossOrigin = value;}
    },
    "width": {
        get() {return this.video.videoWidth;},
    },
    "height": {
        get() {return this.video.videoHeight;},
    },
});

export {WebPageVideoNode};
