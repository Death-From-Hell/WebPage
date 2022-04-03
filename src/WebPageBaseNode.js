// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                WebPageBaseNode
// ----------------------------------------------

class WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        this.input = {};
        this.data = {};
        this.event = {};
//         this.parent = new Set();
        this.__loadVar(argDataVar);
        this.__loadInputVar(argObject,
            {name: "name"},
            {name: "setup"},
            {name: "cleanup"},
            {name: "parentNodes", defaultValue: []},
            {name: "update", defaultValue: true},
            {name: "enable", defaultValue: true},
        );
    }
    __getType(arg) {
        // number, boolean, string, array, object, function, undefined, window, htmldocument и т.д.
        return Object.prototype.toString.call(arg).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
    __getValue(argValue) {
        if(this.__getType(argValue) === "function" && !WebPageBaseNode.prototype.isPrototypeOf(argValue)) {
            return argValue.call(this);
        } else {
            return argValue;
        }
    }
    __setup() {
        if(this.__getType(this.setup) === "function") {
            const o = {};
            this.setup.call(this);
        }
    }
    __cleanup() {
        if(this.__getType(this.cleanup) === "function") {
            this.cleanup.call(this);
        }
    }
    __loadInputVar(argData, ...argFields) {
        argFields.forEach((e) => {
            if(argData.hasOwnProperty(e.name)) {
                this.input[e.name] = argData[e.name];
            } else {
                this.input[e.name] = e.defaultValue;
            }
        });
    }
    __loadVar(argData) {
        for(const [key, value] of Object.entries(argData)) {
            this[key] = value;
        }
    }
    __loadEvents(argData, ...argFields) {
        argFields.forEach((e) => {
            if(argData.hasOwnProperty(e.name)) {
                this.addEventListener(e.name, argData[e.name]);
            }
        });
    }
    __isNode(argNode) {
        return WebPageBaseNode.prototype.isPrototypeOf(argNode);
    }
    __getParentNodes() {
        const nodes = new Set();
        for(const [key, value] of Object.entries(this.input)) {
            const object = this[key];
            if(this.__isNode(object)) {
                nodes.add(object);
            }
        }
        for(const parentNode of this.parentNodes) {
            if(this.__isNode(parentNode)) {
                nodes.add(parentNode);
            }
        }
        return nodes;
    }
    addParentNodes(...argNodes) {
        for(const node of argNodes) {
            this.parentNodes.push(node);
        }
        return this;
    }
    addEventListener(argName, argFunc) {
        if(!this.event[argName]) {
            this.event[argName] = new Set();
        }
        if(this.event[argName].has(argFunc)) {
            return false;
        } else {
            this.event[argName].add(argFunc);
            return true;
        }
    }
    removeEventListener(argName, argFunc) {
        if(this.event[argName]) {
            return this.event[argName].delete(argFunc);
        }
        return false;
    }
    trigger(argName, ...args) {
        if(this.event[argName]) {
            this.event[argName].forEach(handler => handler.apply(this, args));
        }
    }
}
Object.defineProperties(WebPageBaseNode.prototype, {
    "name": {
        get() {return this.__getValue(this.input.name);},
        set(value) {this.input.name = value;}
    },
    "setup": {
        get() {return this.input.setup;},
        set(value) {this.input.setup = value;}
    },
    "cleanup": {
        get() {return this.input.cleanup;},
        set(value) {this.input.cleanup = value;}
    },
    "parentNodes": {
        get() {return this.__getValue(this.input.parentNodes);},
        set(value) {this.input.parentNodes = value;}
    },
    "update": {
        get() {return this.__getValue(this.input.update);},
        set(value) {this.input.update = value;}
    },
    "enable": {
        get() {return this.__getValue(this.input.enable);},
        set(value) {this.input.enable = value;}
    },
});

export {WebPageBaseNode};
