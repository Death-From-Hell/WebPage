// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//            WebPageBaseTextureNode
// ----------------------------------------------
 
import {WebPageBaseNode} from "./WebPageBaseNode.js";

class WebPageBaseTextureNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "update", defaultValue: true},
            {name: "enable", defaultValue: true},
            {name: "mipmap", defaultValue: true},
            {name: "minFilter"},
            {name: "magFilter", defaultValue: "linear"},
            {name: "wrapS", defaultValue: "repeat"},
            {name: "wrapT", defaultValue: "repeat"},
        );
        this.data.texture = undefined;
        this.data.width = undefined;
        this.data.height = undefined;
        this.data.mipmapEnable = undefined;
        this.data.powerOfTwo = undefined;
    }
    generateMipmap() {
        if(this.data.mipmapEnable) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }
    __isTextureNode(argNode) {
        return WebPageBaseTextureNode.prototype.isPrototypeOf(argNode);
    }
    __isPowerOfTwo(argValue) {
        return (argValue & (argValue - 1)) === 0;
    }
    __checkPowerOfTwo() {
        if(this.__isPowerOfTwo(this.width) && this.__isPowerOfTwo(this.height)) {
            this.data.powerOfTwo = true;
        } else {
            this.data.powerOfTwo = false;
        }
    }
    __setMipmap() {
        if(this.mipmap === true) {
            if(this.data.powerOfTwo) {
                this.data.mipmapEnable = true;
            } else {
                this.data.mipmapEnable = false;
            }
        } else {
            this.data.mipmapEnable = false;
        }
    }
    __setMinFilter() {
        let minFilter;
        switch(String(this.minFilter).toLowerCase()) {
            case "linear": 
            {
                minFilter = this.gl.LINEAR;
                break;
            }
            case "nearest": 
            {
                minFilter = this.gl.NEAREST;
                break;
            }
            case "nearestmipmapnearest": 
            {
                minFilter = this.gl.NEAREST_MIPMAP_NEAREST;
                break;
            }
            case "linearmipmapnearest": 
            {
                minFilter = this.gl.LINEAR_MIPMAP_NEAREST;
                break;
            }
            case "nearestmipmaplinear": 
            {
                minFilter = this.gl.NEAREST_MIPMAP_LINEAR;
                break;
            }
            case "linearmipmaplinear": 
            {
                minFilter = this.gl.LINEAR_MIPMAP_LINEAR;
                break;
            }
            default:
            {
                if(this.data.mipmapEnable) {
                    minFilter = this.gl.LINEAR_MIPMAP_LINEAR;
                } else {
                    minFilter = this.gl.LINEAR;
                }
                break;
            }
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
    __setMagFilter() {
        let magFilter;
        switch(String(this.magFilter).toLowerCase()) {
            case "nearest": 
            {
                magFilter = this.gl.NEAREST;
                break;
            }
            default:
            {
                magFilter = this.gl.LINEAR;
                break;
            }
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
    __setWrapS() {
        let wrapS;
        if(!this.data.powerOfTwo) {
            wrapS = this.gl.CLAMP_TO_EDGE;
        } else {
            switch(String(this.wrapS).toLowerCase()) {
                case "clamptoedge": 
                {
                    wrapS = this.gl.CLAMP_TO_EDGE;
                    break;
                }
                case "mirroredrepeat": 
                {
                    wrapS = this.gl.MIRRORED_REPEAT;
                    break;
                }
                default:
                {
                    wrapS = this.gl.REPEAT;
                    break;
                }
            }
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapS);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
    __setWrapT() {
        let wrapT;
        if(!this.data.powerOfTwo) {
            wrapT = this.gl.CLAMP_TO_EDGE;
        } else {
            switch(String(this.wrapT).toLowerCase()) {
                case "clamptoedge": 
                {
                    wrapT = this.gl.CLAMP_TO_EDGE;
                    break;
                }
                case "mirroredrepeat": 
                {
                    wrapT = this.gl.MIRRORED_REPEAT;
                    break;
                }
                default:
                {
                    wrapT = this.gl.REPEAT;
                    break;
                }
            }
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapT);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}
Object.defineProperties(WebPageBaseTextureNode.prototype, {
    "update": {
        get() {return this.__getValue(this.input.update);},
        set(value) {this.input.update = value;}
    },
    "enable": {
        get() {return this.__getValue(this.input.enable);},
        set(value) {this.input.enable = value;}
    },
    "texture": {
        get() {return this.data.texture;},
        set(value) {this.data.texture = value;}
    },
    "width": {
        get() {return this.data.width;},
        set(value) {this.data.width = value;}
    },
    "height": {
        get() {return this.data.height;},
        set(value) {this.data.height = value;}
    },
    "mipmap": {
        get() {return this.__getValue(this.input.mipmap);},
        set(value) {this.input.mipmap = value; this.__setMipmap();}
    },
    "minFilter": {
        get() {return this.__getValue(this.input.minFilter);},
        set(value) {this.input.minFilter = value; this.__setMinFilter();}
    },
    "magFilter": {
        get() {return this.__getValue(this.input.magFilter);},
        set(value) {this.input.magFilter = value; this.__setMagFilter();}
    },
    "wrapS": {
        get() {return this.__getValue(this.input.wrapS);},
        set(value) {this.input.wrapS = value; this.__setWrapS();}
    },
    "wrapT": {
        get() {return this.__getValue(this.input.wrapT);},
        set(value) {this.input.wrapT = value; this.__setWrapT();}
    },
});

export {WebPageBaseTextureNode};
