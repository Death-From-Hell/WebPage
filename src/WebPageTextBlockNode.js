// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//             WebPageTextBlockNode
// ----------------------------------------------

import {WebPageBaseNode} from "./WebPageBaseNode.js";
 
class WebPageTextBlockNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "textNodeValue", defaultValue: {}},
            {name: "pivotPointX", defaultValue: "center"},
            {name: "pivotPointY", defaultValue: "center"},
            {name: "scaleX", defaultValue: 1},
            {name: "scaleY", defaultValue: 1},
            {name: "translateX", defaultValue: 0},
            {name: "translateY", defaultValue: 0},
            {name: "translateZ", defaultValue: 0},
            {name: "eventNode"},
            {name: "objectId", defaultValue: this.id},
            {name: "linkUrl"},
            {name: "linkTarget", defaultValue: "_self"},
            {name: "instantDraw"},
        );
    }
    async init() {
        const nodes = [
            "graph",
            "text",
            "pivotPoint",
            "scale",
            "translate",
            "drawTexture",
        ];
        await this.root.importNode(...nodes);
        this.data.graph = this.root.node("Graph", {
            name: "Graph",
            clear: false
        });
        this.data.textNode = this.data.graph.node("Text", {
            name: "Text Node",
            update: () => this.update,
            instantDraw: () => this.instantDraw,
            setup: () => {
                for(const [key, value] of Object.entries(this.textNodeValue)) {
                    this.data.textNode[key] = value;
                }
            },
        });
        this.root.addEventListener("resize", () => {this.data.textNode.draw();});
        const pivotPointText = this.data.graph.node("PivotPoint", {
            name: "Pivot Point Text",
            x: () => this.pivotPointX,
            y: () => this.pivotPointY,
            objectNode: this.data.textNode,
        });
        const scaleText = this.data.graph.node("Scale", {
            name: "Scale Text",
            transformNode: pivotPointText,
            x: () => this.scaleX,
            y: () => this.scaleY,
            z: 1,
        });
        const translateText = this.data.graph.node("Translate", {
            name: "Translate Text",
            transformNode: scaleText,
            x: () => this.translateX,
            y: () => this.translateY,
            z: () => this.translateZ,
        });
        const drawText = this.data.graph.node("DrawTexture", {
            name: "Draw Text",
            textureNode: this.data.textNode,
            transformNode: translateText,
            instantDraw: () => this.instantDraw,
            eventNode: () => this.eventNode,
            objectId: () => this.objectId,
        });
        if(this.linkUrl && this.__isNode(this.eventNode)) {
            this.eventNode.style({
                cursor: "pointer",
                objectId: this.objectId
            });
            this.eventNode.addEventListener({
                phase: "down",
                func: (e) => {
                    this.eventNode.link({url: this.linkUrl, target: this.linkTarget});
                },
                event: "click",
                objectId: this.objectId
            });
            this.eventNode.addEventListener({
                phase: "down",
                func: (e) => {
                    this.eventNode.link({url: this.linkUrl, target: this.linkTarget});
                },
                event: "touchclick",
                objectId: this.objectId
            });
        }
        this.data.graph.sort();
        return this;
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.update();
            this.__cleanup();
        }
    }
    update() {
        this.data.graph.__update();
        return this;
    }
}
Object.defineProperties(WebPageTextBlockNode.prototype, {
    "width": {
        get() {return this.data.textNode.width;},
    },
    "height": {
        get() {return this.data.textNode.height;},
    },
    "textNodeValue": {
        get() {return this.__getValue(this.input.textNodeValue);},
        set(value) {this.input.textNodeValue = value;}
    },
    "pivotPointX": {
        get() {return this.__getValue(this.input.pivotPointX);},
        set(value) {this.input.pivotPointX = value;}
    },
    "pivotPointY": {
        get() {return this.__getValue(this.input.pivotPointY);},
        set(value) {this.input.pivotPointY = value;}
    },
    "scaleX": {
        get() {return this.__getValue(this.input.scaleX);},
        set(value) {this.input.scaleX = value;}
    },
    "scaleY": {
        get() {return this.__getValue(this.input.scaleY);},
        set(value) {this.input.scaleY = value;}
    },
    "translateX": {
        get() {return this.__getValue(this.input.translateX);},
        set(value) {this.input.translateX = value;}
    },
    "translateY": {
        get() {return this.__getValue(this.input.translateY);},
        set(value) {this.input.translateY = value;}
    },
    "translateZ": {
        get() {return this.__getValue(this.input.translateZ);},
        set(value) {this.input.translateZ = value;}
    },
    "eventNode": {
        get() {return this.__getValue(this.input.eventNode);},
        set(value) {this.input.eventNode = value;}
    },
    "objectId": {
        get() {return this.__getValue(this.input.objectId);},
        set(value) {this.input.objectId = value;}
    },
    "linkUrl": {
        get() {return this.__getValue(this.input.linkUrl);},
        set(value) {this.input.linkUrl = value;}
    },
    "linkTarget": {
        get() {return this.__getValue(this.input.linkTarget);},
        set(value) {this.input.linkTarget = value;}
    },
    "instantDraw": {
        get() {return this.__getValue(this.input.instantDraw);},
        set(value) {this.input.instantDraw = value;}
    },
});

export {WebPageTextBlockNode};

