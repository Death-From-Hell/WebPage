// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//           WebPageFramebuffer2dNode
// ----------------------------------------------

import {WebPageBaseTextureNode} from './WebPageBaseTextureNode.js';
import {WebPageError} from './WebPage.js';

class WebPageFramebuffer2dNode extends WebPageBaseTextureNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
    }
    __init() {
		this.data.framebuffer = this.gl.createFramebuffer();
        this.data.texture = this.gl.createTexture();
        this.__checkPowerOfTwo();
        this.__setMipmap();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.data.framebuffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.data.texture, 0);
        if(this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            WebPageError("Ошибка создания фреймбуфера.");
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    reinit() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.data.framebuffer);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.__checkPowerOfTwo();
        this.__setMipmap();
        this.__setMagFilter();
        this.__setMinFilter();
        this.__setWrapS();
        this.__setWrapT();
    }
    clear() {
        this.root.clear("color");
    }
}
Object.defineProperties(WebPageBaseTextureNode.prototype, {
    "framebuffer": {
        get() {return this.__getValue(this.data.framebuffer);},
        set(value) {this.data.framebuffer = value;}
    },
});

export {WebPageFramebuffer2dNode};
