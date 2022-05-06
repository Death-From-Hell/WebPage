// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             WebPagePivotPointNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Mat4} from './WebPageMath.js';

class WebPagePivotPointNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "transformNode"},
            {name: "transformMatrix"},
            {name: "instantCalculate", defaultValue: true},
            {name: "objectNode"},
            {name: "x", defaultValue: 0},
            {name: "y", defaultValue: 0},
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
        const x = this.x;
        const y = this.y;
        let dx = 0, dy = 0;
        const isObjectNode = this.__isNode(this.objectNode);
        switch(this.__getType(x)) {
            case "number":
            case "function":
                dx = x;
                break;
            case "string":
                if(isObjectNode) {
                    switch(x.toLowerCase()) {
                        case "left":
                            dx = 0;
                            break;
                        case "right":
                            dx = this.objectNode.width;
                            break;
                        case "center":
                            dx = this.objectNode.width / 2;
                            break;
                    }
                }
                break;
        }
        switch(this.__getType(y)) {
            case "number":
            case "function":
                dy = y;
                break;
            case "string":
                if(isObjectNode) {
                    switch(y.toLowerCase()) {
                        case "top":
                            dy = 0;
                            break;
                        case "bottom":
                            dy = this.objectNode.height;
                            break;
                        case "center":
                            dy = this.objectNode.height / 2;
                            break;
                    }
                }
                break;
        }
        if(this.__isNode(this.transformNode)) {
            this.data.matrix = Mat4.multiplyByMatrix(Mat4.translate(-dx, -dy, 0), this.transformNode.matrix);
        } else if (this.__isMatrix(this.transformMatrix)) {
            this.data.matrix = Mat4.multiplyByMatrix(Mat4.translate(-dx, -dy, 0), this.transformMatrix);
        } else {
            this.data.matrix = Mat4.translate(-dx, -dy, 0);
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
Object.defineProperties(WebPagePivotPointNode.prototype, {
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
    "objectNode": {
        get() {return this.__getValue(this.input.objectNode);},
        set(value) {this.input.objectNode = value;}
    },
    "x": {
        get() {return this.__getValue(this.input.x);},
        set(value) {this.input.x = value;}
    },
    "y": {
        get() {return this.__getValue(this.input.y);},
        set(value) {this.input.y = value;}
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

export {WebPagePivotPointNode};
