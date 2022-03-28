// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                  WebPageRoot
// ----------------------------------------------

// import {WebPageBaseNode} from "./WebPageBaseNode.js";

class WebPageRoot {
    constructor() {
    }
    __getType(arg) {
        // number, boolean, string, array, object, function, undefined, window, htmldocument и т.д.
        return Object.prototype.toString.call(arg).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
    __getValue(argValue) {
        if(this.__getType(argValue) === "function" && !WebPageRoot.prototype.isPrototypeOf(argValue)) {
            return argValue();
        } else {
            return argValue;
        }
    }
}

export {WebPageRoot};
