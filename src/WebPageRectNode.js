// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                WebPageRectNode
// ----------------------------------------------

import {WebPageFramebuffer2dNode} from './WebPageFramebuffer2dNode.js';

class WebPageRectNode extends WebPageFramebuffer2dNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "width", defaultValue: 100},
            {name: "height", defaultValue: 100},
            {name: "color", defaultValue: [0,0,0,1]},
            {name: "instantDraw"},
        );
        this.__init();
        if(this.enable && this.instantDraw) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    __init() {
        super.__init();
    }
    static __draw = {
        ready: false,
        vSrc: `
			attribute vec4 a_vertex;
			void main() {
				gl_Position = a_vertex;
			}
		`,
        fSrc: `
			precision mediump float;
            uniform vec4 u_color;
			void main() {
                gl_FragColor = u_color;
			}
		`,
		vertexData: [
			-1,1,
			-1,-1,
			 1,-1,
			 1,1
		],
        indexData: [0,1,2,3],
        program: undefined,
        attribute: {
            vertex: undefined,
        },
        uniform: {
            color: undefined
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __createProgram() {
        const draw = WebPageRectNode.__draw;
        draw.program = this.root.program(draw.vSrc, draw.fSrc);
        draw.buffer.vertex = this.gl.createBuffer();
        draw.buffer.index = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(draw.vertexData), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(draw.indexData), this.gl.STATIC_DRAW);
        draw.attribute.vertex = this.gl.getAttribLocation(draw.program, "a_vertex");
        draw.uniform.color = this.gl.getUniformLocation(draw.program, 'u_color');
        draw.ready = true;
    }
    draw() {
        if(!WebPageRectNode.__draw.ready) {
            this.__createProgram();
        }
        const draw = WebPageRectNode.__draw;
        this.gl.useProgram(draw.program);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, draw.buffer.vertex);
        this.gl.vertexAttribPointer(draw.attribute.vertex, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(draw.attribute.vertex);

        this.gl.uniform4fv(draw.uniform.color, this.color);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, draw.buffer.index);
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.data.framebuffer);
        this.gl.viewport(0,0, this.width, this.height);
        this.clear();
        this.gl.drawElements(this.gl.TRIANGLE_FAN, 4, this.gl.UNSIGNED_BYTE, 0);
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
Object.defineProperties(WebPageRectNode.prototype, {
    "width": {
        get() {return this.__getValue(this.input.width);},
        set(value) {this.input.width = value;}
    },
    "height": {
        get() {return this.__getValue(this.input.height);},
        set(value) {this.input.height = value;}
    },
    "color": {
        get() {return this.__getValue(this.input.color);},
        set(value) {this.input.color = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
    'texture': {
        get() {return this.data.texture;},
        set(value) {this.data.texture = value;}
    }
});

export {WebPageRectNode};
