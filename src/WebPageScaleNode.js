// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageScaleNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Mat4} from './WebPageMath.js';

class WebPageScaleNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "transformNode"},
            {name: "transformMatrix"},
            {name: "instantCalculate", defaultValue: true},
            {name: "x", defaultValue: 1},
            {name: "y", defaultValue: 1},
            {name: "z", defaultValue: 1},
        );
        if(this.instantCalculate && this.enable) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        } else {
            this.data.matrix = Mat4.identity();
        }
    }
    calculate() {
        if(this.__isNode(this.transformNode)) {
            this.data.matrix = Mat4.multiplyByMatrix(Mat4.scale(this.x, this.y, this.z), this.transformNode.matrix);
        } else if (this.__isMatrix(this.transformMatrix)) {
            this.data.matrix = Mat4.multiplyByMatrix(Mat4.scale(this.x, this.y, this.z), this.transformMatrix);
        } else {
            this.data.matrix = Mat4.scale(this.x, this.y, this.z);
        }
        return this;
    }
    __update() {
        if(this.update && this.enable) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
}
Object.defineProperties(WebPageScaleNode.prototype, {
    "transformNode": {
        get() {return this.__getValue(this.input.transformNode);},
        set(value) {this.input.transformNode = value;}
    },
    "transformMatrix": {
        get() {return this.__getValue(this.input.transformMatrix);},
        set(value) {this.input.transformMatrix = value;}
    },
    "instantCalculate": {
        get() {return this.__getValue(this.input.instantCalculate);},
        set(value) {this.input.instantCalculate = value;}
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
                } else if (this.__isMatrix(this.transformMatrix)) {
                    return this.transformMatrix;
                } else {
                    return Mat4.identity();
                }
            }
        },
    },
});

export {WebPageScaleNode};
