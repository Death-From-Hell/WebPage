// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageEffectNode
// ----------------------------------------------

import {WebPageFramebuffer2dNode} from './WebPageFramebuffer2dNode.js';

class WebPageEffectNode extends WebPageFramebuffer2dNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "textureNode"},
            {name: "instantDraw"},
        );
        this.data.currentClass = this.constructor;
    }
    __init() {
        this.width = this.textureNode.width;
        this.height = this.textureNode.height;
        super.__init();
    }
    reinit() {
        if(this.sourceNode.width != this.width || this.sourceNode.height != this.height) {
            this.width = this.sourceNode.width;
            this.height = this.sourceNode.height;
            super.reinit();
        }
    }
    __createProgram() {
        const draw = this.data.currentClass.__draw;
        draw.program = this.root.program(this.data.vSrc, this.data.fSrc);
        draw.buffer.vertex = this.gl.createBuffer();
        draw.buffer.texture = this.gl.createBuffer();
        draw.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(draw.vertexData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.texture);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(draw.textureData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(draw.indexData), this.gl.STATIC_DRAW);
        draw.attribute.vertex = this.gl.getAttribLocation(draw.program, "a_vertex");
        draw.attribute.texture = this.gl.getAttribLocation(draw.program, "a_texCoord");
        draw.uniform.texture = this.gl.getUniformLocation(draw.program, 'u_texture');
        this.__getUniformLocation();
        draw.ready = true;
    }
    draw() {
        const draw = this.data.currentClass.__draw;
        if(!draw.ready) {
            this.__createProgram();
        }
        this.gl.useProgram(draw.program);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
        this.gl.vertexAttribPointer(draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.vertex);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.texture);
        this.gl.vertexAttribPointer(draw.attribute.texture, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.texture);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureNode.texture);
        this.gl.uniform1i(draw.uniform.texture, 0);
        
        this.__setUniform();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.data.framebuffer);
        this.gl.viewport(0,0, this.width, this.height);
        this.clear();
        this.gl.disable(this.gl.BLEND);
        this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
        this.gl.enable(this.gl.BLEND);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.generateMipmap();
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
}
Object.defineProperties(WebPageEffectNode.prototype, {
    "textureNode": {
        get() {return this.__getValue(this.input.textureNode);},
        set(value) {this.input.textureNode = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
    'texture': {
        get() {
            if(this.enable) {
                return this.data.texture;
            } else {
                return this.textureNode.texture;
            }
        },
        set(value) {this.data.texture = value;}
    }
});

export {WebPageEffectNode};
