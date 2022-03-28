// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//            WebPageDrawTextureNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Mat4} from "./WebPageMath.js";

class WebPageDrawTextureNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "textureNode"},
            {name: "transformNode"},
            {name: "projectionNode"},
            {name: "eventNode"},
            {name: "objectId"},
            {name: "framebuffer"},
            {name: "width"},
            {name: "height"},
            {name: "instantDraw"},
            {name: "clear"},
            {name: "clearColor"},
            {name: "blending", defaultValue: true},
            {name: "blendColor", defaultValue: [0,0,0,0]},
            {name: "blendEquationRGB", defaultValue: "add"},
            {name: "blendEquationAlpha", defaultValue: "add"},
            {name: "blendSrcRGB", defaultValue: "srcAlpha"},
            {name: "blendSrcAlpha", defaultValue: "srcAlpha"},
            {name: "blendDstRGB", defaultValue: "oneMinusSrcAlpha"},
            {name: "blendDstAlpha", defaultValue: "oneMinusSrcAlpha"},
        );
        if(this.enable && this.instantDraw) {
            this.draw();
        }
    }
    __getBlendFunc(argName) {
        switch(argName.toLowerCase()) {
            case "zero": return this.gl.ZERO;
            case "one": return this.gl.ONE;
            case "srccolor": return this.gl.SRC_COLOR;
            case "oneminussrccolor": return this.gl.ONE_MINUS_SRC_COLOR;
            case "dstcolor": return this.gl.DST_COLOR;
            case "oneminusdstcolor": return this.gl.ONE_MINUS_DST_COLOR;
            case "srcalpha": return this.gl.SRC_ALPHA;
            case "oneminussrcalpha": return this.gl.ONE_MINUS_SRC_ALPHA;
            case "dstalpha": return this.gl.DST_ALPHA;
            case "oneminusdstalpha": return this.gl.ONE_MINUS_DST_ALPHA;
            case "constantcolor": return this.gl.CONSTANT_COLOR;
            case "oneminusconstantcolor": return this.gl.ONE_MINUS_CONSTANT_COLOR;
            case "constantalpha": return this.gl.CONSTANT_ALPHA;
            case "oneminusconstantalpha": return this.gl.ONE_MINUS_CONSTANT_ALPHA;
            case "srcalphasaturate": return this.gl.SRC_ALPHA_SATURATE;
            default: return undefined;
        }
    }
    __getBlendEquation(argName) {
        switch(argName.toLowerCase()) {
            case "add": return this.gl.FUNC_ADD;
            case "subtract": return this.gl.SUBTRACT;
            case "reversesubtract": return this.gl.REVERSE_SUBTRACT;
            default: return this.gl.FUNC_ADD;
        }
    }
    static __draw = {
        ready: false,
        vSrc: `
			attribute vec4 a_vertex;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			void main() {
				gl_Position = a_vertex;
				v_texCoord = a_texCoord;
			}
		`,
        fSrc: `
			precision mediump float;
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
			void main() {
				gl_FragColor = texture2D(u_texture, v_texCoord);
			}
		`,
        indexData: [0,1,2,3],
        program: undefined,
        attribute: {
            vertex: undefined,
            texture: undefined
        },
        uniform: {
            texture: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __createProgram() {
        const draw = WebPageDrawTextureNode.__draw;
        draw.program = this.root.program(draw.vSrc, draw.fSrc);
        draw.buffer.vertex = this.gl.createBuffer();
        draw.buffer.texture = this.gl.createBuffer();
        draw.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(draw.indexData), this.gl.STATIC_DRAW);
        draw.attribute.vertex = this.gl.getAttribLocation(draw.program, "a_vertex");
        draw.attribute.texture = this.gl.getAttribLocation(draw.program, "a_texCoord");
        draw.uniform.texture = this.gl.getUniformLocation(draw.program, 'u_texture');
        draw.ready = true;
    }
    draw() {
        if(!WebPageDrawTextureNode.__draw.ready) {
            this.__createProgram();
        }
        const draw = WebPageDrawTextureNode.__draw;
        this.gl.useProgram(draw.program);
        const width = this.width ? this.width : this.textureNode.width;
        const height = this.height ? this.height : this.textureNode.height;
        const vertexData = [
            0,      0,      0, 1,
            0,      height, 0, 1,
            width,  height, 0, 1,
            width,  0,      0, 1
        ];
        const textureData = [
            0, 1,
            0, 0,
            1, 0,
            1, 1
        ];
        let projectionMatrix;
        if(this.__isNode(this.projectionNode)) {
            projectionMatrix = this.projectionNode.matrix;
        } else {
            const far = 5000;
            projectionMatrix = new Float32Array(
                [2 / (this.framebuffer ? this.framebuffer.width : this.gl.canvas.width), 0, 0, -1,
                0, -2 / (this.framebuffer ? this.framebuffer.height : this.gl.canvas.height), 0, 1,
                0, 0, 2 / far, -1, 
                0, 0, 0, 1]
            );
        }
        let transformMatrix;
        if(this.__isNode(this.transformNode)) {
            transformMatrix = this.transformNode.matrix;
        } else {
            transformMatrix = Mat4.identity();
        }
//         console.log(transformMatrix);
        let actualVertexData = [];
        let actualVertexData2 = [];
        for(let i = 0; i < 4; i++) {
            const k = i * 4;
            const vertex = [vertexData[k], vertexData[k + 1], vertexData[k + 2], vertexData[k + 3]];
            const v1 = Mat4.multiplyByVector(transformMatrix, vertex);
            const v2 = Mat4.multiplyByVector(projectionMatrix, v1);
            actualVertexData.push(v2[0] / v2[3], v2[1] / v2[3], v2[2] / v2[3]);
            actualVertexData2.push(v2[0], v2[1], v2[2], v2[3]);
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
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(actualVertexData2), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(draw.attribute.vertex, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.vertex);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.texture);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureData), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(draw.attribute.texture, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.texture);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureNode.texture);
        this.gl.uniform1i(draw.uniform.texture, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
        
        // Blending
        if(this.blending) {
            const blendEquationRGB = this.__getBlendEquation(this.blendEquationRGB);
            const blendEquationAlpha = this.__getBlendEquation(this.blendEquationAlpha);
            let blendSrcRGB = this.__getBlendFunc(this.blendSrcRGB);
            if(!blendSrcRGB) {
                blendSrcRGB = this.gl.SRC_ALPHA;
            }
            let blendSrcAlpha = this.__getBlendFunc(this.blendSrcAlpha);
            if(!blendSrcAlpha) {
                blendSrcAlpha = this.gl.SRC_ALPHA;
            }
            let blendDstRGB = this.__getBlendFunc(this.blendDstRGB);
            if(!blendDstRGB) {
                blendDstRGB = this.gl.ONE_MINUS_SRC_ALPHA;
            }
            let blendDstAlpha = this.__getBlendFunc(this.blendDstAlpha);
            if(!blendDstAlpha) {
                blendDstAlpha = this.gl.ONE_MINUS_SRC_ALPHA;
            }
            this.gl.blendEquationSeparate(blendEquationRGB, blendEquationAlpha);
            this.gl.blendFuncSeparate(blendSrcRGB, blendDstRGB, blendSrcAlpha, blendDstAlpha);
            this.gl.blendColor(this.blendColor[0], this.blendColor[1], this.blendColor[2], this.blendColor[3]);
        } else {
            this.gl.disable(this.gl.BLEND);
        }
        
        if(this.framebuffer) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer.framebuffer);
            this.gl.viewport(0,0, this.framebuffer.width, this.framebuffer.height);
        } else {
            this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);
        }
        if(this.clear) {
            if(this.clearColor) {
                this.root.clearColor(this.clearColor);
            }
            if(this.framebuffer) {
                this.framebuffer.clear();
            } else {
                this.root.clear("color", "depth", "stencil");
            }
            if(this.clearColor) {
                this.root.clearColor();
            }
        }
//         this.gl.depthMask(false);
        this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
//         this.gl.depthMask(true);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        if(this.framebuffer) {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.framebuffer.generateMipmap();
        }
        if(this.blending) {
            this.root.blending();
        } else {
            this.gl.enable(this.gl.BLEND);
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
        /*
        const polygon2 = [
            {x: argData[0], y: argData[1], z: argData[2]},
            {x: argData[3], y: argData[4], z: argData[5]},
            {x: argData[6], y: argData[7], z: argData[8]},
            {x: argData[9], y: argData[10], z: argData[11]},
        ];
        */
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
            this.draw();
        }
    }
}
Object.defineProperties(WebPageDrawTextureNode.prototype, {
    "textureNode": {
        get() {return this.__getValue(this.input.textureNode);},
        set(value) {this.input.textureNode = value;}
    },
    "transformNode": {
        get() {return this.__getValue(this.input.transformNode);},
        set(value) {this.input.transformNode = value;}
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
    "framebuffer": {
        get() {return this.__getValue(this.input.framebuffer);},
        set(value) {this.input.framebuffer = value;}
    },
    "width": {
        get() {return this.__getValue(this.input.width);},
        set(value) {this.input.width = value;}
    },
    "height": {
        get() {return this.__getValue(this.input.height);},
        set(value) {this.input.height = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
    "clear": {
        get() {return this.__getValue(this.input.clear);},
        set(value) {this.input.clear = value;}
    },
    "clearColor": {
        get() {return this.__getValue(this.input.clearColor);},
        set(value) {this.input.clearColor = value;}
    },
    "blending": {
        get() {return this.__getValue(this.input.blending);},
        set(value) {this.input.blending = value;}
    },
    "blendColor": {
        get() {return this.__getValue(this.input.blendColor);},
        set(value) {this.input.blendColor = value;}
    },
    "blendEquationRGB": {
        get() {return this.__getValue(this.input.blendEquationRGB);},
        set(value) {this.input.blendEquationRGB = value;}
    },
    "blendEquationAlpha": {
        get() {return this.__getValue(this.input.blendEquationAlpha);},
        set(value) {this.input.blendEquationAlpha = value;}
    },
    "blendSrcRGB": {
        get() {return this.__getValue(this.input.blendSrcRGB);},
        set(value) {this.input.blendSrcRGB = value;}
    },
    "blendSrcAlpha": {
        get() {return this.__getValue(this.input.blendSrcAlpha);},
        set(value) {this.input.blendSrcAlpha = value;}
    },
    "blendDstRGB": {
        get() {return this.__getValue(this.input.blendDstRGB);},
        set(value) {this.input.blendDstRGB = value;}
    },
    "blendDstAlpha": {
        get() {return this.__getValue(this.input.blendDstAlpha);},
        set(value) {this.input.blendDstAlpha = value;}
    },
});

export {WebPageDrawTextureNode};
