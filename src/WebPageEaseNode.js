// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//                WebPageEaseNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {WebPageError} from './WebPage.js';

class WebPageEaseNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super();
        this.__loadVar(argDataVar);
        this.__loadInputVar(argObject,
            {name: "name"},
            {name: "type", defaultValue: "linear"},
            {name: "startValue", defaultValue: 0},
            {name: "endValue", defaultValue: 0},
            {name: "duration", defaultValue: 0},
            {name: "timeout", defaultValue: 0},
            {name: "inTimeout", defaultValue: 0},
            {name: "outTimeout", defaultValue: 0},
            {name: "count", defaultValue: 1},
            {name: "reverse", defaultValue: false},
            {name: "enable", defaultValue: true},
        );
        
        Object.assign(this.data, {
            iteration: {
                number: 0,
                startValue: undefined,
                startTime: undefined
            },
            timeout: {
                value: 0,
                startValue: undefined,
                startTime: undefined
            },
            inTimeout: {
                value: 0,
                startValue: undefined,
                startTime: undefined
            },
            outTimeout: {
                value: 0,
                startValue: undefined,
                startTime: undefined
            },
            pause: {
                value: undefined,
                state: undefined
            },
//             deltaValue: this.endValue - this.startValue,
            value: this.startValue,
            parametricValue: 0,
            innerState: "stop",
            state: "stop",
            func: this.__func(this.type),
        });
    }
    __update() {
        if(this.enable) {
            this.__calculate();
        }
    }
    __clear() {
        this.data.value = this.startValue;
//         this.data.deltaValue = this.endValue - this.startValue;
        this.data.parametricValue = 0;
        this.data.iteration.number = 0;
        this.data.timeout.value = 0;
        this.data.inTimeout.value = 0;
        this.data.outTimeout.value = 0;
    }
    __calculate() {
        let done = false;
        let count = 0;
        do {
            switch(this.data.innerState) {
                case "start":
                {
                    this.__clear();
                    if(this.timeout > 0) {
                        this.data.innerState = "startTimeout";
                    } else {
                        this.data.innerState = "startIterationAll";
                    }
                    break;
                }
                case "stop":
                {
                    this.data.state = "stop";
                    this.__trigger("stop");
                    done = true;
                    break;
                }
                case "clear":
                {
                    this.__clear();
                    this.data.state = "stop";
                    this.__trigger("clear");
                    done = true;
                    break;
                }
                case "startTimeout":
                {
                    this.data.timeout.startTime = performance.now();
                    this.data.timeout.startValue = 0;
                    this.data.timeout.value = 0;
                    this.data.state = "timeout";
                    this.data.innerState = "timeout";
                    this.__trigger("startTimeout");
                    done = true;
                    break;
                }
                case "timeout":
                {
                    this.__calcTimeout();
                    if(this.data.timeout.value > 1) {
                        this.data.innerState = "stopTimeout";
                    } else {
                        this.__trigger("timeout");
                        done = true;
                    }
                    break;
                }
                case "stopTimeout":
                {
                    this.data.timeout.value = 1;
                    this.__trigger("stopTimeout");
                    this.data.innerState = "startIterationAll";
                    break;
                }
                case "startIterationAll":
                {
                    if(this.count > 0) {
                        this.data.innerState = "startIterationGlobal";
                    } else {
                        this.data.innerState = "stopIterationAll";
                    }
                    break;
                }
                case "stopIterationAll":
                {
                    this.data.innerState = "stop";
                    break;
                }
                case "startIterationGlobal":
                {
                    this.data.inTimeout.value = 0;
                    this.data.outTimeout.value = 0;
                    this.data.iteration.number++;
                    this.__calc(0);
                    if(this.inTimeout > 0) {
                        this.data.innerState = "startInTimeout";
                    } else {
                        this.data.innerState = "startIteration";
                    }
                    break;
                }
                case "stopIterationGlobal":
                {
                    if(this.data.iteration.number >= this.count) {
                        this.data.innerState = "stopIterationAll";
                    } else {
                        this.data.innerState = "startIterationGlobal";
                    }
                    break;
                }
                case "startIteration":
                {
                    this.data.iteration.startTime = performance.now();
                    this.data.iteration.startValue = 0;
                    this.data.state = "iteration";
                    this.data.innerState = "iteration";
                    this.__trigger("startIteration");
                    done = true;
                    break;
                }
                case "iteration":
                {
                    const p = this.__p();
                    if(p > 1) {
                        this.data.innerState = "stopIteration";
                    } else {
                        this.__calc(p);
                        this.__trigger("iteration");
                        done = true;
                    }
                    break;
                }
                case "stopIteration":
                {
                    this.__calc(1);
                    this.__trigger("stopIteration");
                    if(this.outTimeout > 0) {
                        this.data.innerState = "startOutTimeout";
                    } else {
                        this.data.innerState = "stopIterationGlobal";
                    }
                    break;
                }
                case "startInTimeout":
                {
                    this.data.inTimeout.startTime = performance.now();
                    this.data.inTimeout.startValue = 0;
                    this.data.inTimeout.value = 0;
                    this.data.state = "inTimeout";
                    this.data.innerState = "inTimeout";
                    this.__trigger("startInTimeout");
                    done = true;
                    break;
                }
                case "inTimeout":
                {
                    this.__calcInTimeout();
                    if(this.data.inTimeout.value > 1) {
                        this.data.innerState = "stopInTimeout";
                    } else {
                        this.__trigger("inTimeout");
                        done = true;
                    }
                    break;
                }
                case "stopInTimeout":
                {
                    this.data.inTimeout.value = 1;
                    this.data.innerState = "startIteration";
                    this.__trigger("stopInTimeout");
                    break;
                }
                case "startOutTimeout":
                {
                    this.data.outTimeout.startTime = performance.now();
                    this.data.outTimeout.startValue = 0;
                    this.data.outTimeout.value = 0;
                    this.data.state = "outTimeout";
                    this.data.innerState = "outTimeout";
                    this.__trigger("startOutTimeout");
                    done = true;
                    break;
                }
                case "outTimeout":
                {
                    this.__calcOutTimeout();
                    if(this.data.outTimeout.value > 1) {
                        this.data.innerState = "stopOutTimeout";
                    } else {
                        this.__trigger("outTimeout");
                        done = true;
                    }
                    break;
                }
                case "stopOutTimeout":
                {
                    this.data.outTimeout.value = 1;
                    this.data.innerState = "stopIterationGlobal";
                    this.__trigger("stopOutTimeout");
                    break;
                }
                case "startPause":
                {
                    switch(this.data.state) {
                        case "iteration":
                        {
                            const p = this.__p();
                            this.data.iteration.startValue = Math.min(p, 1);
                            break;
                        }
                        case "timeout":
                        {
                            this.__calcTimeout();
                            this.data.timeout.startValue = Math.min(this.data.timeout.value, 1);
                            break;
                        }
                        case "inTimeout":
                        {
                            this.__calcInTimeout();
                            this.data.inTimeout.startValue = Math.min(this.data.inTimeout.value, 1);
                            break;
                        }
                        case "outTimeout":
                        {
                            this.__calcOutTimeout();
                            this.data.outTimeout.startValue = Math.min(this.data.outTimeout.value, 1);
                            break;
                        }
                    }
                    this.data.pause.state = this.data.state;
                    this.data.state = "pause";
                    this.data.innerState = "pause";
                    this.__trigger("pause");
                    done = true;
                    break;
                }
                case "pause": {
                    done = true;
                    break;
                }
                case "continue":
                {
                    switch(this.data.pause.state) {
                        case "iteration":
                            this.data.iteration.startTime = performance.now();
                            break;
                        case "timeout":
                            this.data.timeout.startTime = performance.now();
                            break;
                        case "inTimeout":
                            this.data.inTimeout.startTime = performance.now();
                            break;
                        case "outTimeout":
                            this.data.outTimeout.startTime = performance.now();
                            break;
                    }
                    this.data.state = this.data.pause.state;
                    this.data.innerState = this.data.pause.state;
                    this.__trigger("continue");
                    break;
                }
                default: 
                {
                    WebPageError(`Неверное состояние innerState = '${this.data.innerState}'`);
                    throw new Error('');
                }
            }
            if(++count > 10) {
                WebPageError(`Зацикливание innerState = '${this.data.innerState}'`);
//                 break;
            }
        } while(!done)
    }
    start() {
        this.data.innerState = "start";
        this.__calculate();
    }
    stop() {
        this.data.innerState = "stop";
        this.__calculate();
    }
    clear() {
        this.data.innerState = "clear";
        this.__calculate();
    }
    pause() {
        if(["iteration", "timeout", "inTimeout", "outTimeout"].includes(this.data.innerState)) {
            this.data.innerState = "startPause";
            this.__calculate();
        }
    }
    continue() {
        if(this.data.innerState == "pause") {
            this.data.innerState = "continue";
            this.__calculate();
        }
    }
    __trigger(argName) {
        this.trigger(argName, this.__status());
    }
    __status() {
        return {
            iterationNumber: this.data.iteration.number,
            state: this.data.state,
            innerState: this.data.innerState,
            value: this.data.value,
            parametricValue: this.data.parametricValue,
            timeoutValue: this.data.timeout.value,
            inTimeoutValue: this.data.inTimeout.value,
            outTimeoutValue: this.data.outTimeout.value,
        };
    }
    __p() {
        return this.data.iteration.startValue + (1 - this.data.iteration.startValue) * (performance.now() - this.data.iteration.startTime) / this.duration;
    }
    __isEven() {
        if(this.reverse && this.data.iteration.number % 2 == 0) {
            return true;
        } else {
            return false;
        }
    }
    __calc(argP) {
        let p = this.data.func(argP);
        if(this.__isEven()) {
            p = 1 - p;
        }
        this.data.value = this.startValue + p * (this.endValue - this.startValue);
        this.data.parametricValue = argP;
    }
    __calcTimeout() {
        this.data.timeout.value = this.data.timeout.startValue + (1 - this.data.timeout.startValue) * (performance.now() - this.data.timeout.startTime) / this.timeout;
    }
    __calcInTimeout() {
        this.data.inTimeout.value = this.data.inTimeout.startValue + (1 - this.data.inTimeout.startValue) * (performance.now() - this.data.inTimeout.startTime) / this.inTimeout;
    }
    __calcOutTimeout() {
        this.data.outTimeout.value = this.data.outTimeout.startValue + (1 - this.data.outTimeout.startValue) * (performance.now() - this.data.outTimeout.startTime) / this.outTimeout;
    }    
    __func(argType) {
        switch(argType.toLowerCase()) {
            case "linear": {return function(x) {return x;}}
            case "easeinsine": {return function(x) {return 1 - Math.cos((x * Math.PI) / 2);}}
            case "easeoutsine": {return function(x) {return Math.sin((x * Math.PI) / 2);}}
            case "easeinoutsine": {return function(x) {return -(Math.cos(Math.PI * x) - 1) / 2;}}
            case "easeincubic": {return function(x) {return x * x * x;}}
            case "easeoutcubic": {return function(x) {return 1 - Math.pow(1 - x, 3);}}
            case "easeinoutcubic": {return function(x) {return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;}}
            case "easeinquint": {return function(x) {return x * x * x * x * x;}}
            case "easeoutquint": {return function(x) {return 1 - Math.pow(1 - x, 5);}}
            case "easeinoutquint": {return function(x) {return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;}}
            case "easeincirc": {return function(x) {return 1 - Math.sqrt(1 - Math.pow(x, 2));}}
            case "easeoutcirc": {return function(x) {return Math.sqrt(1 - Math.pow(x - 1, 2));}}
            case "easeinoutcirc": {return function(x) {return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;}}
            case "easeinelastic": {return function(x) {const c4 = (2 * Math.PI) / 3; return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);}}
            case "easeoutelastic": {return function(x) {const c4 = (2 * Math.PI) / 3; return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;}}
            case "easeinoutelastic": {return function(x) {const c5 = (2 * Math.PI) / 4.5; return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;}}
            case "easeinquad": {return function(x) {return x * x;}}
            case "easeoutquad": {return function(x) {return 1 - (1 - x) * (1 - x);}}
            case "easeinoutquad": {return function(x) {return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;}}
            case "easeinquart": {return function(x) {return x * x * x * x;}}
            case "easeoutquart": {return function(x) {return 1 - Math.pow(1 - x, 4);}}
            case "easeinoutquart": {return function(x) {return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;}}
            case "easeinexpo": {return function(x) {return x === 0 ? 0 : Math.pow(2, 10 * x - 10);}}
            case "easeoutexpo": {return function(x) {return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);}}
            case "easeinoutexpo": {return function(x) {return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;}}
            case "easeinback": {return function(x) {const c1 = 1.70158; const c3 = c1 + 1; return c3 * x * x * x - c1 * x * x;}}
            case "easeoutback": {return function(x) {const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);}}
            case "easeinoutback": {return function(x) {const c1 = 1.70158; const c2 = c1 * 1.525; return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;}}
            case "easeinbounce": {return function(x) {
                const easeOutBounce = (x) => {
                    const n1 = 7.5625;
                    const d1 = 2.75;
                    if (x < 1 / d1) {
                        return n1 * x * x;
                    } else if (x < 2 / d1) {
                        return n1 * (x -= 1.5 / d1) * x + 0.75;
                    } else if (x < 2.5 / d1) {
                        return n1 * (x -= 2.25 / d1) * x + 0.9375;
                    } else {
                        return n1 * (x -= 2.625 / d1) * x + 0.984375;
                    }            
                }
                return 1 - easeOutBounce(1 - x);            
            }}
            case "easeoutbounce": {return function(x) {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (x < 1 / d1) {
                    return n1 * x * x;
                } else if (x < 2 / d1) {
                    return n1 * (x -= 1.5 / d1) * x + 0.75;
                } else if (x < 2.5 / d1) {
                    return n1 * (x -= 2.25 / d1) * x + 0.9375;
                } else {
                    return n1 * (x -= 2.625 / d1) * x + 0.984375;
                }            
            }}
            case "easeinoutbounce": {return function(x) {
                const easeOutBounce = (x) => {
                    const n1 = 7.5625;
                    const d1 = 2.75;
                    if (x < 1 / d1) {
                        return n1 * x * x;
                    } else if (x < 2 / d1) {
                        return n1 * (x -= 1.5 / d1) * x + 0.75;
                    } else if (x < 2.5 / d1) {
                        return n1 * (x -= 2.25 / d1) * x + 0.9375;
                    } else {
                        return n1 * (x -= 2.625 / d1) * x + 0.984375;
                    }            
                }
                return x < 0.5 ? (1 - easeOutBounce(1 - 2 * x)) / 2 : (1 + easeOutBounce(2 * x - 1)) / 2;
            }}
            default: {return function(x) {return x;}}
        }
    }
}
Object.defineProperties(WebPageEaseNode.prototype, {
    'type': {
        get() {return this.__getValue(this.input.type);},
        set(argValue) {this.input.type = argValue;},
    },
    'startValue': {
        get() {return this.__getValue(this.input.startValue);},
        set(argValue) {this.input.startValue = argValue;},
    },
    'endValue': {
        get() {return this.__getValue(this.input.endValue);},
        set(argValue) {this.input.endValue = argValue;},
    },
    'duration': {
        get() {return this.__getValue(this.input.duration);},
        set(argValue) {this.input.duration = argValue;},
    },
    'timeout': {
        get() {return this.__getValue(this.input.timeout);},
        set(argValue) {this.input.timeout = argValue;},
    },
    'inTimeout': {
        get() {return this.__getValue(this.input.inTimeout);},
        set(argValue) {this.input.inTimeout = argValue;},
    },
    'outTimeout': {
        get() {return this.__getValue(this.input.outTimeout);},
        set(argValue) {this.input.outTimeout = argValue;},
    },
    'count': {
        get() {return this.__getValue(this.input.count);},
        set(argValue) {this.input.count = argValue;},
    },
    'reverse': {
        get() {return this.__getValue(this.input.reverse);},
        set(argValue) {this.input.reverse = argValue;},
    },
    'enable': {
        get() {return this.__getValue(this.input.enable);},
        set(argValue) {this.input.enable = argValue;},
    },
    'value': {
        get() {return this.data.value;},
    },
    'status': {
        get() {return this.__status();},
    },
    'iteration': {
        get() {return this.data.iteration.number;},
    },
});

export {WebPageEaseNode};
