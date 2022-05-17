// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             WebPageDrawRegionNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Mat4} from "./WebPageMath.js";

class WebPageDrawRegionNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "width"},
            {name: "height"},
            {name: "transformNode"},
            {name: "transformMatrix"},
            {name: "projectionNode"},
            {name: "eventNode"},
            {name: "objectId", defaultValue: this.id},
            {name: "instantDraw"},
        );
        if(this.enable && this.instantDraw) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    draw() {
        const vertexData = [
            0,          0,              0, 1,
            0,          this.height,    0, 1,
            this.width, this.height,    0, 1,
            this.width, 0,              0, 1
        ];
        let projectionMatrix;
        if(this.__isNode(this.projectionNode)) {
            projectionMatrix = this.projectionNode.matrix;
        } else {
            const far = 5000;
            projectionMatrix = new Float32Array(
                [2 / this.gl.canvas.width, 0, 0, -1,
                0, -2 / this.gl.canvas.height, 0, 1,
                0, 0, 2 / far, -1, 
                0, 0, 0, 1]
            );
        }
        let transformMatrix;
        if(this.__isNode(this.transformNode)) {
            transformMatrix = this.transformNode.matrix;
        } else if (this.__isMatrix(this.transformMatrix)) {
            transformMatrix = this.transformMatrix;
        } else {
            transformMatrix = Mat4.identity();
        }
        let actualVertexData = [];
        for(let i = 0; i < 4; i++) {
            const k = i * 4;
            const vertex = [vertexData[k], vertexData[k + 1], vertexData[k + 2], vertexData[k + 3]];
            const v1 = Mat4.multiplyByVector(transformMatrix, vertex);
            const v2 = Mat4.multiplyByVector(projectionMatrix, v1);
            actualVertexData.push(v2[0] / v2[3], v2[1] / v2[3], v2[2] / v2[3]);
        }
        
        const polygon = [
            {x: actualVertexData[0], y: actualVertexData[1], z: actualVertexData[2]},
            {x: actualVertexData[3], y: actualVertexData[4], z: actualVertexData[5]},
            {x: actualVertexData[6], y: actualVertexData[7], z: actualVertexData[8]},
            {x: actualVertexData[9], y: actualVertexData[10], z: actualVertexData[11]},
        ];
        const polygonVec = [
            [polygon[0].x, polygon[0].y, polygon[0].z],
            [polygon[1].x, polygon[1].y, polygon[1].z],
            [polygon[2].x, polygon[2].y, polygon[2].z],
            [polygon[3].x, polygon[3].y, polygon[3].z],
        ];

        const notInFrustum = this.__frustumCulling(polygon);
        if(notInFrustum) {
            return;
        }
        
        if(this.__isNode(this.eventNode)) {
            this.eventNode.setData({
                id: this.objectId,
                data: {
                    t1: {
                        v0: polygonVec[1],
                        v1: polygonVec[2],
                        v2: polygonVec[0],
                    },
                    t2: {
                        v0: polygonVec[3],
                        v1: polygonVec[0],
                        v2: polygonVec[2],
                    },
                }
            });
        }
    }
    __frustumCulling(polygon2) {
        const polygon1 = [
            {x: -1, y: 1},
            {x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: -1},
        ];
        if(polygon2.every((e) => e.z > 1 ? true : false)) {
            return true;
        }
        if(polygon2.every((e) => e.z < -1 ? true : false)) {
            return true;
        }
        for(let g1_idx = 0; g1_idx < polygon1.length; g1_idx++) {
            const g1_p0 = polygon1[g1_idx];
            let g1_p1, g1_p2;
            if(g1_idx === 0) {
                g1_p1 = polygon1[polygon1.length - 1];
            } else {
                g1_p1 = polygon1[g1_idx - 1];
            }
            if(g1_idx === polygon1.length - 1) {
                g1_p2 = polygon1[0];
            } else {
                g1_p2 = polygon1[g1_idx + 1];
            }
            for(let g2_idx = 0; g2_idx < polygon2.length; g2_idx++) {
                const g2_p0 = polygon2[g2_idx];
                let g2_p1, g2_p2;
                if(g2_idx === 0) {
                    g2_p1 = polygon2[polygon2.length - 1];
                } else {
                    g2_p1 = polygon2[g2_idx - 1];
                }
                if(g2_idx === polygon2.length - 1) {
                    g2_p2 = polygon2[0];
                } else {
                    g2_p2 = polygon2[g2_idx + 1];
                }
                const dx = g1_p0.x - g2_p0.x;
                const dy = g1_p0.y - g2_p0.y;
                const formula = (argData) => Math.sign((argData.x - g1_p0.x) * dy - (argData.y - g1_p0.y) * dx);
                const g1_p1_s = formula(g1_p1);
                const g1_p2_s = formula(g1_p2);
                if(g1_p1_s != g1_p2_s) {
                    continue;
                }
                const g2_p1_s = formula(g2_p1);
                const g2_p2_s = formula(g2_p2);
                if(g2_p1_s != g2_p2_s) {
                    continue;
                }
                if(g1_p1_s == g2_p1_s) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}
Object.defineProperties(WebPageDrawRegionNode.prototype, {
    "width": {
        get() {return this.__getValue(this.input.width);},
        set(value) {this.input.width = value;}
    },
    "height": {
        get() {return this.__getValue(this.input.height);},
        set(value) {this.input.height = value;}
    },
    "transformNode": {
        get() {return this.__getValue(this.input.transformNode);},
        set(value) {this.input.transformNode = value;}
    },
    "transformMatrix": {
        get() {return this.__getValue(this.input.transformMatrix);},
        set(value) {this.input.transformMatrix = value;}
    },
    "projectionNode": {
        get() {return this.__getValue(this.input.projectionNode);},
        set(value) {this.input.projectionNode = value;}
    },
    "eventNode": {
        get() {return this.__getValue(this.input.eventNode);},
        set(value) {this.input.eventNode = value;}
    },
    "objectId": {
        get() {return this.__getValue(this.input.objectId);},
        set(value) {this.input.objectId = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
});

export {WebPageDrawRegionNode};
