// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                   WebPage
// ----------------------------------------------

import {WebPageBaseNode} from "./WebPageBaseNode.js";

// Обработчик ошибок
function WebPageError(argMessage) {
  	const error = new Error(argMessage);
	console.log("%cОшибка.", "font-weight: bold; color: red;");
  	console.log(`%c${error.message}`, "color: red;");
    console.log(`%c${error.stack}`, "color: blue;");
  	throw 'Программа остановлена.';
}
function WebPageSimpleError(argMessage) {
	console.error(argMessage);
  	throw 'Программа остановлена.';
}

class WebPage extends WebPageBaseNode {
    constructor(argObject = {}) {
        super();
        this.root = this;
        this.gl = undefined;
        this.input = {};
        this.data = {
            id: 1,
            importedNodes: new Map(),
        };
        this.event = {};
        this.rootNode = undefined;
        this.__loadInputVar(argObject,
            {name: "canvas"},
            {name: "resize", defaultValue: false},
            {name: "cullFaceEnable", defaultValue: false},
            {name: "cullFace", defaultValue: "back"},
            {name: "clearColor", defaultValue: [1,1,1,1]},
            {name: "clearDepth", defaultValue: 1},
            {name: "clearStencil", defaultValue: 0},
        );
        if(!this.canvas) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.documentElement.appendChild(this.canvas);
        }
        this.gl = this.canvas.getContext("webgl", {depth: true, stencil: true, alpha: true, premultipliedAlpha: false });
        if(!this.gl) {
            WebPageError("Невозможно инициализировать webgl.");
        }
        if(this.input.resize) {
            window.addEventListener("resize", () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.trigger("resize", {width: this.canvas.width, height: this.canvas.height});
            }, false);
        }
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.STENCIL_TEST);
        this.gl.enable(this.gl.BLEND);
        this.blending();
        this.clearColor();
        this.clearDepth();
        this.clearStencil();
        this.cullFaceEnable();
        this.cullFace();
    }
    __uniqueId() {
        return this.data.id++;
    }
    clear(...argModes) {
        let param = 0;
        for(const mode of argModes) {
            switch(mode.toLowerCase()) {
                case "color":
                    param = param | this.gl.COLOR_BUFFER_BIT;
                    break;
                case "depth":
                    param = param | this.gl.DEPTH_BUFFER_BIT;
                    break;
                case "stencil":
                    param = param | this.gl.STENCIL_BUFFER_BIT;
                    break;
            }
        }
        if(param != 0) {
            this.gl.clear(param);
        }
        return this;
    }
    clearColor(argColor = this.input.clearColor) {
        this.gl.clearColor(argColor[0], argColor[1], argColor[2], argColor[3]);
        return this;
    }
    clearDepth(argDepth = this.input.clearDepth) {
        this.gl.clearDepth(argDepth);
        return this;
    }
    clearStencil(argStencil = this.input.clearStencil) {
        this.gl.clearStencil(argStencil);
        return this;
    }
    cullFaceEnable(argCullFaceEnable = this.input.cullFaceEnable) {
        if(argCullFaceEnable) {
            this.gl.enable(this.gl.CULL_FACE);
        } else {
            this.gl.disable(this.gl.CULL_FACE);
        }
        return this;
    }
    cullFace(argCullFace = this.input.cullFace) {
        switch(argCullFace.toLowerCase()) {
            case "front":
                this.gl.cullFace(this.gl.FRONT);
                break;
            case "frontandback":
                this.gl.cullFace(this.gl.FRONT_AND_BACK);
                break;
            default: 
                this.gl.cullFace(this.gl.BACK);
                break;
        }
        return this;
    }
    blending() {
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        // Blending with straight-alpha input colors and transparent output colors
//         this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        // Blending premultiplied colors
//         this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
        // Эксперимент
//         this.gl.blendEquation(this.gl.FUNC_ADD);
//         this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
    }
    update() {
        this.rootNode?.__update();
    }
    program(argVShaderSrc, argFShaderSrc) {
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(vertexShader, argVShaderSrc);
        this.gl.shaderSource(fragmentShader, argFShaderSrc);
        this.gl.compileShader(vertexShader);
        if(!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
            WebPageError("Ошибка в вершинном шейдере: " + this.gl.getShaderInfoLog(vertexShader));
        }
        this.gl.compileShader(fragmentShader);
        if(!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
            WebPageError("Ошибка в фрагментном шейдере: " + this.gl.getShaderInfoLog(fragmentShader));
        }
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            WebPageError("Ошибка линковки программы: " + this.gl.getProgramInfoLog(program));
        }
        return program;
    }
    __fullNameNode(argName) {
        return "WebPage" + argName[0].toUpperCase() + argName.substring(1) + "Node";
    }
    importNode(...argNodes) {
        const nodes = argNodes.filter(node => !this.data.importedNodes.has(this.__fullNameNode(node)));
        const promises = nodes.map(node => {
            return import("./" + this.__fullNameNode(node) + ".js")
                .then(element => {
                    for(const [key, value] of Object.entries(element)) {
                        this.data.importedNodes.set(key, value);
                    }
                })
                .catch(error => {
                    let dopMessage = ``;
                    if(error.hasOwnProperty("lineNumber") && error.hasOwnProperty("columnNumber")) {
                        dopMessage = ` в строке ${error.lineNumber}, колонке ${error.columnNumber}`;
                    }
                    WebPageSimpleError(`Ошибка в узле '${node}' ${error}${dopMessage}.`);
                });
        });
        return Promise.all(promises);
    }
    node(argName, argParams = {}) {
        const nameNode = this.__fullNameNode(argName);
        if(!this.data.importedNodes.has(nameNode)) {
            WebPageError(`Не загружено описание узла '${argName}'.`);
        }
        const node = this.data.importedNodes.get(nameNode);
        const instance = new node(argParams, {
            id: this.__uniqueId(),
            root: this,
            gl: this.gl
        });
        return instance;
    }
}
Object.defineProperties(WebPage.prototype, {
    "canvas": {
        get() {return this.__getValue(this.input.canvas);},
        set(value) {this.input.canvas = value;}
    },
});

export {WebPage, WebPageError};
