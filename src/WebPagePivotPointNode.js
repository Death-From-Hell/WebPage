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
            {name: "objectNode"},
            {name: "x", defaultValue: 0},
            {name: "y", defaultValue: 0},
        );
        this.data.matrix = Mat4.identity();
        if(this.enable) {
            this.calculate();
        }
    }
    calculate() {
        const x = this.x;
        const y = this.y;
        let dx = 0, dy = 0;
        const isObjectNode = this.__isNode(this.objectNode);
        switch(this.__getType(x)) {
            case "number":
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
        } else {
            this.data.matrix = Mat4.translate(-dx, -dy, 0);
        }
    }
    __update() {
        if(this.enable && this.update) {
            this.calculate();
        }
    }
}
Object.defineProperties(WebPagePivotPointNode.prototype, {
    "transformNode": {
        get() {return this.__getValue(this.input.transformNode);},
        set(value) {this.input.transformNode = value;}
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
                } else {
                    return Mat4.identity();
                }
            }
        },
    },
});

export {WebPagePivotPointNode};
