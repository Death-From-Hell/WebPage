// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                WebPageFuncNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';

class WebPageFuncNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "code"},
            {name: "thisValue", defaultValue: undefined},
            {name: "instantCall"},
        );
        if(this.enable && this.instantCall) {
            this.call();
        }
    }
    __update() {
        if(this.enable && this.update) {
            this.call();
        }
    }
    call() {
        if(this.__getType(this.code) === "function") {
            this.code.call(this.thisValue);
        }
    }
}
Object.defineProperties(WebPageFuncNode.prototype, {
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

export {WebPageFuncNode};
