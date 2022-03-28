// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             WebPageTranslateNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Mat4} from './WebPageMath.js';

class WebPageTranslateNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "transformNode"},
            {name: "x", defaultValue: 0},
            {name: "y", defaultValue: 0},
            {name: "z", defaultValue: 0},
        );
        if(this.enable) {
            this.calculate();
        } else {
            this.data.matrix = Mat4.identity();
        }
    }
    calculate() {
        if(this.__isNode(this.transformNode)) {
            this.data.matrix = Mat4.multiplyByMatrix(Mat4.translate(this.x, this.y, this.z), this.transformNode.matrix);
        } else {
            this.data.matrix = Mat4.translate(this.x, this.y, this.z);
        }
    }
    __update() {
        if(this.enable && this.update) {
            this.calculate();
        }
    }
}
Object.defineProperties(WebPageTranslateNode.prototype, {
    "transformNode": {
        get() {return this.__getValue(this.input.transformNode);},
        set(value) {this.input.transformNode = value;}
    },
    "x": {
        get() {return this.__getValue(this.input.x);},
        set(value) {this.input.x = value;}
    },
    "y": {
        get() {return this.__getValue(this.input.y);},
        set(value) {this.input.y = value;}
    },
    "z": {
        get() {return this.__getValue(this.input.z);},
        set(value) {this.input.z = value;}
    },
    "matrix": {
        get() {
            if(this.enable) {
                return this.data.matrix;
            } else {
                if(this.__isNode(this.transformNode)) {
                    return this.transformNode.matrix;
                } else {
                    return Mat4.identity();
                }
            }
        },
    },
});

export {WebPageTranslateNode};
