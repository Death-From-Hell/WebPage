// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageImageNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';

class WebPageImageNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "src"},
            {name: "crossOrigin", defaultValue: "anonymous"},
        );
        this.__loadEvents(argObject,
            {name: "onloadstart"},
            {name: "onloadend"},
            {name: "onload"},
            {name: "onerror"},
        );
        this.data.image = new Image();
        this.data.image.crossOrigin = this.crossOrigin;
    }
    load() {
        this.trigger("onloadstart");
        return new Promise((resolve, reject) => {
            this.image.addEventListener("load", () => {
                this.trigger("onload");
                this.trigger("onloadend");
                resolve(this);
            }, false);
            this.image.addEventListener("error", () => {
                this.trigger("onerror");
                this.trigger("onloadend");
                reject(new Error(`Image loading error '${this.src}'`));
            }, false);
            this.image.src = this.src;
        });
    }
}
Object.defineProperties(WebPageImageNode.prototype, {
    "src": {
        get() {return this.__getValue(this.input.src);},
        set(value) {this.input.src = value;}
    },
    "crossOrigin": {
        get() {return this.__getValue(this.input.crossOrigin);},
        set(value) {this.input.crossOrigin = value;}
    },
    "image": {
        get() {return this.data.image;},
    },
    "width": {
        get() {return this.data.image.width;},
    },
    "height": {
        get() {return this.data.image.height;},
    },
});

export {WebPageImageNode};
