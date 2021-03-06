// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//              WebPageFunctionNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';

class WebPageFunctionNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "code"},
            {name: "thisValue", defaultValue: undefined},
            {name: "instantCall"},
        );
        if(this.enable && this.instantCall) {
            this.__setup();
            this.call();
            this.__cleanup();
        }
    }
    __update() {
        if(this.enable && this.update) {
            this.__setup();
            this.call();
            this.__cleanup();
        }
    }
    call() {
        if(this.__getType(this.code) === "function") {
            this.code.call(this.thisValue);
        }
    }
}
Object.defineProperties(WebPageFunctionNode.prototype, {
    "code": {
        get() {return this.input.code;},
        set(value) {this.input.code = value;}
    },
    "thisValue": {
        get() {return this.input.thisValue;},
        set(value) {this.input.thisValue = value;}
    },
    "instantCall": {
        get() {return this.__getValue(this.input.instantCall);},
        set(value) {this.input.instantCall = value;}
    },
});

export {WebPageFunctionNode};
