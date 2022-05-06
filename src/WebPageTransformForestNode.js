// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//           WebPageTransformForestNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Mat4} from './WebPageMath.js';

class WebPageTransformForestNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "forest"},
            {name: "instantCalculate", defaultValue: true},
        );
        this.data.node = new Map();
        this.__init();
        if(this.instantCalculate && this.enable) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
    __init() {
        const scan = (node, parentNode = undefined) => {
            if(!node.hasOwnProperty("name")) {
                node.name = this.__getRandomString();
            }
            if(!node.hasOwnProperty("enable")) {
                node.enable = true;
            }
            this.data.node.set(node.name, {
                matrix: undefined,
                finalMatrix: undefined,
                parentNode: parentNode
            });
            if(node.hasOwnProperty("children")) {
                for(const childNode of node.children) {
                    scan(childNode, node.name);
                }
            }
        };
        for(const node of this.forest) {
            scan(node);
        }
    }
    calculate() {
        // Calc Matrix
        const scanTree = node => {
            let matrix;
            if(!node.enable) {
                matrix = Mat4.identity();
            } else {
                switch(node.type.toLowerCase()) {
                    case "node":
                        matrix = this.__transformNode(node);
                        break;
                    case "matrix":
                        matrix = this.__transformMatrix(node);
                        break;
                    case "pivotpoint":
                        matrix = this.__pivotPoint(node);
                        break;
                    case "scale":
                        matrix = this.__scale(node);
                        break;
                    case "rotate":
                        matrix = this.__rotate(node);
                        break;
                    case "translate":
                        matrix = this.__translate(node);
                        break;
                }
            }
            this.data.node.get(node.name).matrix = matrix;
            if(node.hasOwnProperty("children")) {
                for(const childNode of node.children) {
                    scanTree(childNode);
                }
            }
        }
        for(const node of this.forest) {
            scanTree(node);
        }
        // Calc Final Matrix
        let matrix;
        for(const node of this.data.node.values()) {
            matrix = node.matrix;
            let n = node;
            while(n.parentNode) {
                n = this.data.node.get(n.parentNode);
                matrix = Mat4.multiplyByMatrix(n.matrix, matrix);
            }
            node.finalMatrix = matrix;
        }
//         console.log(this.data.node);
        return this;
    }
    __transformNode(argNode) {
        if(this.__isNode(argNode.transformNode)) {
            return argNode.transformNode.matrix;
        } else {
            return Mat4.identity();
        }
    }
    __transformMatrix(argNode) {
        if(this.__isMatrix(argNode.transformMatrix)) {
            return argNode.transformMatrix;
        } else {
            return Mat4.identity();
        }
    }
    __pivotPoint(argNode) {
        const x = argNode.hasOwnProperty("x") ? this.__getValue(argNode.x) : 0;
        const y = argNode.hasOwnProperty("y") ? this.__getValue(argNode.y) : 0;
        let dx = 0, dy = 0;
        const isObjectNode = this.__isNode(argNode.objectNode);
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
                            dx = argNode.objectNode.width;
                            break;
                        case "center":
                            dx = argNode.objectNode.width / 2;
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
                            dy = argNode.objectNode.height;
                            break;
                        case "center":
                            dy = argNode.objectNode.height / 2;
                            break;
                    }
                }
                break;
        }
        return Mat4.translate(-dx, -dy, 0);
    }
    __scale(argNode) {
        const x = argNode.hasOwnProperty("x") ? this.__getValue(argNode.x) : 1;
        const y = argNode.hasOwnProperty("y") ? this.__getValue(argNode.y) : 1;
        const z = argNode.hasOwnProperty("z") ? this.__getValue(argNode.z) : 1;
        return Mat4.scale(x, y, z);
    }
    __rotate(argNode) {
        let x = argNode.hasOwnProperty("x") ? this.__getValue(argNode.x) : 0;
        let y = argNode.hasOwnProperty("y") ? this.__getValue(argNode.y) : 0;
        let z = argNode.hasOwnProperty("z") ? this.__getValue(argNode.z) : 0;
        if(!argNode.radian) {
            [x, y, z] = [x / 180 * Math.PI, y / 180 * Math.PI, z / 180 * Math.PI];
        }
        return Mat4.rotateXYZ(x, y, z);
    }
    __translate(argNode) {
        const x = argNode.hasOwnProperty("x") ? this.__getValue(argNode.x) : 0;
        const y = argNode.hasOwnProperty("y") ? this.__getValue(argNode.y) : 0;
        const z = argNode.hasOwnProperty("z") ? this.__getValue(argNode.z) : 0;
        return Mat4.translate(x, y, z);
    }
    matrix(argName) {
        if(this.enable && this.data.node.has(argName)) {
            return this.data.node.get(argName).finalMatrix;
        } else {
            return Mat4.identity();
        }
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.calculate();
            this.__cleanup();
        }
    }
}
Object.defineProperties(WebPageTransformForestNode.prototype, {
    "forest": {
        get() {return this.__getValue(this.input.forest);},
        set(value) {this.input.forest = value;}
    },
    "instantCalculate": {
        get() {return this.__getValue(this.input.instantCalculate);},
        set(value) {this.input.instantCalculate = value;}
    },
});

export {WebPageTransformForestNode};
