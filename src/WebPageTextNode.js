// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                WebPageTextNode
// ----------------------------------------------

import {WebPageFramebuffer2dNode} from './WebPageFramebuffer2dNode.js';

class WebPageTextNode extends WebPageFramebuffer2dNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "paddingTop", defaultValue: 0},
            {name: "paddingBottom", defaultValue: 0},
            {name: "paddingLeft", defaultValue: 0},
            {name: "paddingRight", defaultValue: 0},
            {name: "fontFamily", defaultValue: "sans-serif"},
            {name: "fontSize", defaultValue: 10},
            {name: "fontWeight", defaultValue: "normal"},
            {name: "fontStyle", defaultValue: "normal"},
            {name: "textBaseline", defaultValue: "alphabetic"},
            {name: "textAlign", defaultValue: "left"},
            {name: "text", defaultValue: ""},
            {name: "maxWidth", defaultValue: () => this.gl.canvas.width},
            {name: "shrink", defaultValue: true},
            {name: "grow", defaultValue: true},
            {name: "alpha", defaultValue: 1},
            {name: "color", defaultValue: "#000000"},
            {name: "backgroundColor", defaultValue: "#ffffff"},
            {name: "shadowColor", defaultValue: "#888888"},
            {name: "shadowOffsetX", defaultValue: 0},
            {name: "shadowOffsetY", defaultValue: 0},
            {name: "shadowBlur", defaultValue: 0},
            {name: "lineHeight", defaultValue: 1.1},
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
        this.data.canvas = document.createElement("canvas");
        this.data.context = this.data.canvas.getContext("2d");
        this.height = 10;
        this.width = 10;
        super.__init();
    }
    __parseText() {
        const widthWithoutPadding = this.maxWidth - (this.paddingLeft + this.paddingRight);
        this.data.lineHeight = this.lineHeight * this.fontSize;
        this.data.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        this.data.textLines = [];
        this.data.context.font = this.data.font;
        let actualWidth = 0;
        const widthLineInPixel = (argLine) => {
            return this.data.context.measureText(argLine).width;
        }
        const pushLine = (argLine) => {
            const lineWidth = widthLineInPixel(argLine);
            this.data.textLines.push({
                line: argLine,
                width: lineWidth
            });
            actualWidth = Math.max(actualWidth, lineWidth + this.paddingLeft + this.paddingRight);
        }
        const re=/\r\n|\n\r|\n|\r/g;
        const lines=this.text.replace(re,"\n").split("\n");
        for(const line of lines) {
            const words = line.split(/\s+/).filter(e => e.length > 0);
            let lineWords = "", oldLineWords = "";
            for(const word of words) {
                oldLineWords = lineWords;
                lineWords = lineWords + (lineWords.length > 0 ? " " : "") + word;
                const width = widthLineInPixel(lineWords);
                if(width > widthWithoutPadding && oldLineWords.length > 0) {
                    pushLine(oldLineWords);
                    lineWords = word;
                }
            }
            pushLine(lineWords);
        }
        if((actualWidth > this.maxWidth && this.grow) || (actualWidth < this.maxWidth && this.shrink)) {
            this.width = actualWidth;
        } else {
            this.width = this.maxWidth;
        }
        this.height = this.paddingTop + this.data.lineHeight * this.data.textLines.length + this.paddingBottom;
    }
    __drawText() {
//         this.gl.disable(this.gl.BLEND);
        this.data.canvas.width = this.width;
        this.data.canvas.height = this.height;
        this.data.context.globalAlpha = this.alpha;
        this.data.context.fillStyle = this.backgroundColor;
        this.data.context.fillRect(0, 0, this.data.canvas.width, this.data.canvas.height);
        let position;
        switch(this.textAlign) {
            case "left":
            case "start":
                position = this.paddingLeft;
                break;
            case "right":
            case "end":
                position = this.width - this.paddingRight;
                break;
            case "center":
                position = this.paddingLeft + (this.width - (this.paddingLeft + this.paddingRight)) / 2;
                break;
            default:
                position = this.paddingLeft;
                break;
        }
        this.data.context.fillStyle = this.color;
        this.data.context.textBaseline = this.textBaseline;
        this.data.context.textAlign = this.textAlign;
        this.data.context.font = this.data.font;
        this.data.context.shadowColor = this.shadowColor;
        this.data.context.shadowOffsetX = this.shadowOffsetX;
        this.data.context.shadowOffsetY = this.shadowOffsetY;
        this.data.context.shadowBlur = this.shadowBlur;
        let i = 1;
        const widthWithoutPadding = this.width - (this.paddingLeft + this.paddingRight);
        for(const entry of this.data.textLines) {
            this.data.context.fillText(entry.line, position, this.paddingTop + this.data.lineHeight * i++, Math.max(entry.width, widthWithoutPadding));
        }
//         this.gl.enable(this.gl.BLEND);
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    draw() {
        this.__parseText();
        this.__drawText();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.data.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data.canvas);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
}
Object.defineProperties(WebPageTextNode.prototype, {
    "paddingTop": {
        get() {return this.__getValue(this.input.paddingTop);},
        set(value) {this.input.paddingTop = value;}
    },
    "paddingBottom": {
        get() {return this.__getValue(this.input.paddingBottom);},
        set(value) {this.input.paddingBottom = value;}
    },
    "paddingLeft": {
        get() {return this.__getValue(this.input.paddingLeft);},
        set(value) {this.input.paddingLeft = value;}
    },
    "paddingRight": {
        get() {return this.__getValue(this.input.paddingRight);},
        set(value) {this.input.paddingRight = value;}
    },
    "fontFamily": {
        get() {return this.__getValue(this.input.fontFamily);},
        set(value) {this.input.fontFamily = value;}
    },
    "fontSize": {
        get() {return this.__getValue(this.input.fontSize);},
        set(value) {this.input.fontSize = value;}
    },
    "fontWeight": {
        get() {return this.__getValue(this.input.fontWeight);},
        set(value) {this.input.fontWeight = value;}
    },
    "fontStyle": {
        get() {return this.__getValue(this.input.fontStyle);},
        set(value) {this.input.fontStyle = value;}
    },
    "textBaseline": {
        get() {return this.__getValue(this.input.textBaseline);},
        set(value) {this.input.textBaseline = value;}
    },
    "textAlign": {
        get() {return this.__getValue(this.input.textAlign);},
        set(value) {this.input.textAlign = value;}
    },
    "text": {
        get() {return this.__getValue(this.input.text);},
        set(value) {this.input.text = value;}
    },
    "maxWidth": {
        get() {return this.__getValue(this.input.maxWidth);},
        set(value) {this.input.maxWidth = value;}
    },
    "shrink": {
        get() {return this.__getValue(this.input.shrink);},
        set(value) {this.input.shrink = value;}
    },
    "grow": {
        get() {return this.__getValue(this.input.grow);},
        set(value) {this.input.grow = value;}
    },
    "context": {
        get() {return this.__getValue(this.data.context);},
        set(value) {this.data.context = value;}
    },
    "alpha": {
        get() {return this.__getValue(this.input.alpha);},
        set(value) {this.input.alpha = value;}
    },
    "color": {
        get() {return this.__getValue(this.input.color);},
        set(value) {this.input.color = value;}
    },
    "backgroundColor": {
        get() {return this.__getValue(this.input.backgroundColor);},
        set(value) {this.input.backgroundColor = value;}
    },
    "shadowColor": {
        get() {return this.__getValue(this.input.shadowColor);},
        set(value) {this.input.shadowColor = value;}
    },
    "shadowOffsetX": {
        get() {return this.__getValue(this.input.shadowOffsetX);},
        set(value) {this.input.shadowOffsetX = value;}
    },
    "shadowOffsetY": {
        get() {return this.__getValue(this.input.shadowOffsetY);},
        set(value) {this.input.shadowOffsetY = value;}
    },
    "shadowBlur": {
        get() {return this.__getValue(this.input.shadowBlur);},
        set(value) {this.input.shadowBlur = value;}
    },
    "lineHeight": {
        get() {return this.__getValue(this.input.lineHeight);},
        set(value) {this.input.lineHeight = value;}
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

export {WebPageTextNode};
