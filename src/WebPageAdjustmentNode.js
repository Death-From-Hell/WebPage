// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             WebPageAdjustmentNode
// ----------------------------------------------

import {WebPageEffectNode} from './WebPageEffectNode.js';

class WebPageAdjustmentNode extends WebPageEffectNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "gamma", defaultValue: 1},
            {name: "brightness", defaultValue: 0},  // [-1, 1]
            {name: "contrast", defaultValue: 1},    // [-1, 1]
            {name: "saturation", defaultValue: 0},  // [-1, 1]
            {name: "exposure", defaultValue: 0},    // [-1, 1]
            {name: "red", defaultValue: 1},
            {name: "green", defaultValue: 1},
            {name: "blue", defaultValue: 1},
            {name: "alpha", defaultValue: 1},
        );
        this.data.vSrc = `
			attribute vec4 a_vertex;
			attribute vec2 a_texCoord;
			varying vec2 v_texCoord;
			void main() {
				gl_Position = a_vertex;
				v_texCoord = a_texCoord;
			}
        `;
        this.data.fSrc = `
            precision ${this.root.precision} float;
			uniform sampler2D u_texture;
			varying vec2 v_texCoord;
            uniform float u_gamma;
            uniform float u_brightness;
            uniform float u_contrast;
            uniform float u_saturation;
            uniform float u_exposure;
            uniform float u_red;
            uniform float u_green;
            uniform float u_blue;
            uniform float u_alpha;
			vec3 adjustGamma(vec3 color, float value) {
                return pow(color, vec3(1.0 / value));
            }
			vec3 adjustBrightness(vec3 color, float value) {
                return color + value;
            }
            vec3 adjustContrast(vec3 color, float value) {
                return 0.5 + value * (color - 0.5);
            }
            vec3 adjustExposure(vec3 color, float value) {
                return (1.0 + value) * color;
            }
            vec3 adjustSaturation(vec3 color, float value) {
                const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
                vec3 grayscale = vec3(dot(color, luminosityFactor));
                return mix(grayscale, color, 1.0 + value);
            }            
            void main() {
				vec4 texel = texture2D(u_texture, v_texCoord);
                vec3 color = texel.rgb;
                color = adjustGamma(color, u_gamma);
                color = adjustBrightness(color, u_brightness);
                color = adjustContrast(color, u_contrast);
                color = adjustExposure(color, u_exposure);
                color = adjustSaturation(color, u_saturation);
                color.r *= u_red;
                color.g *= u_green;
                color.b *= u_blue;
                float alpha = texel.a * u_alpha;
                gl_FragColor = vec4(color, alpha);
			}
        `;
        this.__init();
        if(this.enable && this.instantDraw) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    static __draw = {
        ready: false,
		vertexData: [
			-1,1,
			-1,-1,
			 1,-1,
			 1,1
		],
		textureData: [
			0,1,
			0,0,
			1,0,
			1,1
		],
        indexData: [0,1,2,3],
        program: undefined,
        attribute: {
            vertex: undefined,
            texture: undefined
        },
        uniform: {
            texture: undefined,
            gamma: undefined,
            contrast: undefined,
            saturation: undefined,
            brightness: undefined,
            red: undefined,
            green: undefined,
            blue: undefined,
            alpha: undefined,
        },
        buffer: {
            vertex: undefined,
            texture: undefined,
            index: undefined
        },
    }
    __getUniformLocation() {
        this.data.currentClass.__draw.uniform.gamma = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_gamma');
        this.data.currentClass.__draw.uniform.brightness = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_brightness');
        this.data.currentClass.__draw.uniform.contrast = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_contrast');
        this.data.currentClass.__draw.uniform.saturation = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_saturation');
        this.data.currentClass.__draw.uniform.exposure = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_exposure');
        this.data.currentClass.__draw.uniform.red = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_red');
        this.data.currentClass.__draw.uniform.green = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_green');
        this.data.currentClass.__draw.uniform.blue = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_blue');
        this.data.currentClass.__draw.uniform.alpha = this.gl.getUniformLocation(this.data.currentClass.__draw.program, 'u_alpha');
    }
    __setUniform() {
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.gamma, this.gamma);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.brightness, this.brightness);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.contrast, this.contrast);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.saturation, this.saturation);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.exposure, this.exposure);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.red, this.red);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.green, this.green);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.blue, this.blue);
        this.gl.uniform1f(this.data.currentClass.__draw.uniform.alpha, this.alpha);
    }
}
Object.defineProperties(WebPageAdjustmentNode.prototype, {
    "gamma": {
        get() {return this.__getValue(this.input.gamma);},
        set(value) {this.input.gamma = value;}
    },
    "brightness": {
        get() {return this.__getValue(this.input.brightness);},
        set(value) {this.input.brightness = value;}
    },
    "contrast": {
        get() {return this.__getValue(this.input.contrast);},
        set(value) {this.input.contrast = value;}
    },
    "saturation": {
        get() {return this.__getValue(this.input.saturation);},
        set(value) {this.input.saturation = value;}
    },
    "exposure": {
        get() {return this.__getValue(this.input.exposure);},
        set(value) {this.input.exposure = value;}
    },
    "red": {
        get() {return this.__getValue(this.input.red);},
        set(value) {this.input.red = value;}
    },
    "green": {
        get() {return this.__getValue(this.input.green);},
        set(value) {this.input.green = value;}
    },
    "blue": {
        get() {return this.__getValue(this.input.blue);},
        set(value) {this.input.blue = value;}
    },
    "alpha": {
        get() {return this.__getValue(this.input.alpha);},
        set(value) {this.input.alpha = value;}
    },
});

export {WebPageAdjustmentNode};
