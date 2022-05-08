// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageEventNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';
import {Vec3} from './WebPageMath.js';

class WebPageEventNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "cullFace", defaultValue: "none"},
        );
        Object.assign(this.data, {
            object: new Map(),
            objects: [],
            objectsId: [],
            eventClick: {
                down: new Map(),
                up: new Map(),
            },
            eventDblclick: {
                down: new Map(),
                up: new Map(),
            },
            eventMousemove: {
                down: new Map(),
                up: new Map(),
            },
            eventContextmenu: {
                down: new Map(),
                up: new Map(),
            },
            eventMousedown: {
                down: new Map(),
                up: new Map(),
            },
            eventMouseup: {
                down: new Map(),
                up: new Map(),
            },
            eventMouseover: {
                down: new Map(),
                up: new Map(),
            },
            eventMouseout: {
                down: new Map(),
                up: new Map(),
            },
            eventWheel: {
                down: new Map(),
                up: new Map(),
            },
            eventTouchStart: {
                down: new Map(),
                up: new Map(),
            },
            eventTouchMove: {
                down: new Map(),
                up: new Map(),
            },
            eventTouchEnd: {
                down: new Map(),
                up: new Map(),
            },
            eventTouchCancel: {
                down: new Map(),
                up: new Map(),
            },
            eventTouchClick: {
                down: new Map(),
                up: new Map(),
            },
            style: new Map(),
            aElement: document.createElement("a"),
            touch: {
                start: false,
                move: false,
                x: undefined,
                y: undefined
            }
        });
        this.__init();
    }
    addEventListener(argData) {
        let eventData;
        switch(argData.event.toLowerCase()) {
            case "click":
                eventData = this.data.eventClick;
                break;
            case "dblclick":
                eventData = this.data.eventDblclick;
                break;
            case "mousemove":
                eventData = this.data.eventMousemove;
                break;
            case "contextmenu":
                eventData = this.data.eventContextmenu;
                break;
            case "mousedown":
                eventData = this.data.eventMousedown;
                break;
            case "mouseup":
                eventData = this.data.eventMouseup;
                break;
            case "mouseover":
                eventData = this.data.eventMouseover;
                break;
            case "mouseout":
                eventData = this.data.eventMouseout;
                break;
            case "wheel":
                eventData = this.data.eventWheel;
                break;
            case "touchstart":
                eventData = this.data.eventTouchStart;
                break;
            case "touchmove":
                eventData = this.data.eventTouchMove;
                break;
            case "touchend":
                eventData = this.data.eventTouchEnd;
                break;
            case "touchcancel":
                eventData = this.data.eventTouchCancel;
                break;
            case "touchclick":
                eventData = this.data.eventTouchClick;
                break;
            default:
                return false;
        }
        let eventSubdata;
        if(argData.phase.toLowerCase() === "down") {
            eventSubdata = eventData.down;
        } else {
            eventSubdata = eventData.up;
        }
        const id = argData.objectId;
        const func = argData.func 
        const setFunc = (id) => {
            if(!eventSubdata.has(id)) {
                eventSubdata.set(id, new Set());
            }
            eventSubdata.get(id).add(func);
        }
        if(typeof id === "object") {
            for(const element of Array.from(id)) {
                setFunc(element);
            }
        } else {
            setFunc(id);
        }
        return true;
    }
    setData(argData) {
        this.data.object.set(argData.id, {maybeDelete: false, data: argData.data});
    }
    style(argData) {
        const id = argData.objectId;
        const cursor = argData.cursor;
        const setFunc = (id) => {
            if(!eventSubdata.has(id)) {
                eventSubdata.set(id, new Set());
            }
            eventSubdata.get(id).add(func);
        }
        if(typeof id === "object") {
            for(const element of Array.from(id)) {
                this.data.style.set(element, {cursor: cursor});
            }
        } else {
            this.data.style.set(id, {cursor: cursor});
        }
    }
    link(argData) {
        let target;
        if(["_blank", "_self", "_parent", "_top"].includes(argData.target)) {
            target = argData.target;
        } else {
            target = "_self";
        }
        this.data.aElement.target = target;
        this.data.aElement.href = argData.url;
        this.data.aElement.click();
    }
    __init() {
        this.gl.canvas.addEventListener("click", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "click",
                objects: objects,
                eventData: this.data.eventClick,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("dblclick", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "dblclick",
                objects: objects,
                eventData: this.data.eventDblclick,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("mousemove", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords).sort((a, b) => b.z - a.z);
            const objectsId = objects.map(function(e) {return e.id;});
            const overObjects = [];
            const outObjects = [];
            for(const object of objects) {
                if(!this.data.objectsId.includes(object.id)) {
                    overObjects.push(object);
                }
            }
            for(const object of this.data.objects) {
                if(!objectsId.includes(object.id)) {
                    outObjects.push(object);
                }
            }
            let styleCursor = "default";
            for(const object of objects) {
                if(this.data.style.has(object.id)) {
                    styleCursor = this.data.style.get(object.id).cursor;
                }
            }
            if(window.getComputedStyle(this.gl.canvas)["cursor"] != styleCursor) {
                this.gl.canvas.style.cursor = styleCursor;
            }
            this.__run({
                originalEvent: e,
                event: "mousemove",
                objects: objects,
                eventData: this.data.eventMousemove,
                position: position,
            });
            this.__run({
                originalEvent: e,
                event: "mouseout",
                objects: outObjects,
                eventData: this.data.eventMouseout,
                position: position,
            });
            this.__run({
                originalEvent: e,
                event: "mouseover",
                objects: overObjects,
                eventData: this.data.eventMouseover,
                position: position,
            });
            this.data.objects = objects;
            this.data.objectsId = objectsId;
        }, false);
        this.gl.canvas.addEventListener("contextmenu", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "contextmenu",
                objects: objects,
                eventData: this.data.eventContextmenu,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("mousedown", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "mousedown",
                objects: objects,
                eventData: this.data.eventMousedown,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("mouseup", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "mouseup",
                objects: objects,
                eventData: this.data.eventMouseup,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("wheel", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "wheel",
                objects: objects,
                eventData: this.data.eventWheel,
                position: position,
                properties: {
                    deltaY: e.deltaY
                }
            });
        }, false);
        this.gl.canvas.addEventListener("touchstart", (e) => {
            e.preventDefault();
            const position = this.__getTouchPosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.data.touch.x = event.changedTouches[0].clientX;
            this.data.touch.y = event.changedTouches[0].clientY;
            this.data.touch.start = true;
            this.data.touch.move = false;
            this.__run({
                originalEvent: e,
                event: "touchstart",
                objects: objects,
                eventData: this.data.eventTouchStart,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("touchmove", (e) => {
            e.preventDefault();
            const position = this.__getTouchPosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            const x = event.changedTouches[0].clientX;
            const y = event.changedTouches[0].clientY;
            this.data.touch.move = true;
            this.__run({
                originalEvent: e,
                event: "touchmove",
                objects: objects,
                eventData: this.data.eventTouchMove,
                position: position,
                properties: {
                    deltaX: x - this.data.touch.x,
                    deltaY: y - this.data.touch.y,
                }
            });
            this.data.touch.x = x;
            this.data.touch.y = y;
        }, false);
        this.gl.canvas.addEventListener("touchend", (e) => {
            e.preventDefault();
            const position = this.__getTouchPosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
                originalEvent: e,
                event: "touchend",
                objects: objects,
                eventData: this.data.eventTouchEnd,
                position: position,
            });
            if(!this.data.touch.move) {
                this.__run({
                    originalEvent: e,
                    event: "touchclick",
                    objects: objects,
                    eventData: this.data.eventTouchClick,
                    position: position,
                });
            }
            this.data.touch.start = false;
            this.data.touch.move = false;
        }, false);
        this.gl.canvas.addEventListener("touchcancel", (e) => {
            e.preventDefault();
            const position = this.__getTouchPosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.data.touch.x = event.changedTouches[0].clientX;
            this.data.touch.y = event.changedTouches[0].clientY;
            this.__run({
                originalEvent: e,
                event: "touchcancel",
                objects: objects,
                eventData: this.data.eventTouchCancel,
                position: position,
            });
//             this.data.touch.start = false;
//             this.data.touch.move = false;
        }, false);
    }
    __run(argData) {
        /*
        if((argData.event == "mouseover" || argData.event == "mouseout") && argData.objects.length > 0) {
            console.dir(argData.event, argData.objects);
        }
        */
        const objects = argData.objects;
        const eventData = argData.eventData;
        const position = argData.position;
        objects.sort(function(a, b) {
            return a.z - b.z;
        });
        let stopProp = false;
        for(const object of objects) {
            if(eventData.down.has(object.id)) {
                const set = eventData.down.get(object.id);
                const eventObject = {
                    originalEvent: argData.originalEvent,
                    event: argData.event,
                    objectId: object.id,
                    phase: "down",
                    u: object.u,
                    v: object.v,
                    canvasX: position.x,
                    canvasY: position.y,
                    coordX: object.x,
                    coordY: object.y,
                    coordZ: object.z,
                    stopPropagation: () => {stopProp = true;},
                };
                if(argData.hasOwnProperty("properties")) {
                    Object.assign(eventObject, argData.properties);
                }
                for(const func of set) {
                    func.call(this, eventObject);
                }
            }
            if(stopProp) {
                break;
            }
        }
        if(!stopProp) {
            objects.sort(function(a, b) {
                return b.z - a.z;
            });
            for(const object of objects) {
                if(eventData.up.has(object.id)) {
                    const set = eventData.up.get(object.id);
                    const eventObject = {
                        originalEvent: argData.originalEvent,
                        event: argData.event,
                        objectId: object.id,
                        phase: "up",
                        u: object.u,
                        v: object.v,
                        canvasX: position.x,
                        canvasY: position.y,
                        coordX: object.x,
                        coordY: object.y,
                        coordZ: object.z,
                        stopPropagation: () => {stopProp = true;},
                    };
                    if(argData.hasOwnProperty("properties")) {
                        Object.assign(eventObject, argData.properties);
                    }
                    for(const func of set) {
                        func.call(this, eventObject);
                    }
                }
                if(stopProp) {
                    break;
                }
            }
        }
    }
    __update() {
        this.__clear();
    }
    __clear() {
        for(const [key, value] of this.data.object) {
            if(value.maybeDelete) {
                this.data.object.delete(key);
            }
        }
        this.data.object.forEach((value) => {
            value.maybeDelete = true;
        });
    }
    __getMousePosition(event, swapY = false) {
        const rect = event.target.getBoundingClientRect();
        if(swapY === true) {
            return {
                x: event.clientX - rect.left,
                y: event.target.height - (event.clientY - rect.top)
            };
        } else {
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }
    }
    __getTouchPosition(event, swapY = false) {
        const touch = event.changedTouches[0];
        const target = touch.target;
        const rect = target.getBoundingClientRect();
        if(swapY === true) {
            return {
                x: touch.clientX - rect.left,
                y: target.height - (touch.clientY - rect.top)
            };
        } else {
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }
    }
    __getCoords(argMousePosition) {
        const x = 2 * argMousePosition.x / this.gl.canvas.width - 1;
        const y = 2 * argMousePosition.y / this.gl.canvas.height - 1;
        return {x: x, y: y};
    }
    __getObjects(coords) {
        const x = coords.x;
        const y = coords.y;
        const objects = [];
        for(const [key, object] of this.data.object) {
            const data = object.data;
            let res = this.__checkTriangle({
                type: 1,
                x: coords.x,
                y: coords.y,
                v0: data.t1.v0,
                v1: data.t1.v1,
                v2: data.t1.v2,
            });
            if(res) {
                objects.push({id: key, u: res.u, v: res.v, x: res.x, y: res.y, z: res.z});
                continue;
            }
            res = this.__checkTriangle({
                type: 2,
                x: coords.x,
                y: coords.y,
                v0: data.t2.v0,
                v1: data.t2.v1,
                v2: data.t2.v2,
            });
            if(res) {
                objects.push({id: key, u: res.u, v: res.v, x: res.x, y: res.y, z: res.z});
            }
        }
        return objects;
    }
    __checkTriangle(argData) {
        const epsilon =1e-8;
        const originZ = -10;
        const origin = [argData.x, argData.y, originZ];
        const T = Vec3.subtract(origin, argData.v0);
        const D = Vec3.normalize([argData.x, argData.y, 1e8]);
        const E1 = Vec3.subtract(argData.v1, argData.v0);
        const E2 = Vec3.subtract(argData.v2, argData.v0);
        const P = Vec3.cross(D, E2);
        const Q = Vec3.cross(T, E1);
        const det = Vec3.dot(P, E1);
        if(Math.abs(det) < epsilon) {
            return false;
        }
        switch(this.cullFace.toLowerCase()) {
            case "front":
                if(det < 0) {
                    return false;
                }
                break;
            case "back":
                if(det > 0) {
                    return false;
                }
                break;
        };
        let u = Vec3.dot(P, T) / det;
        let v = Vec3.dot(Q, D) / det;
        const t = Vec3.dot(Q, E2) / det;
        if(u < 0 || v < 0 || u + v > 1) {
            return false;
        }
        if(argData.type == 2) {
            u = 1 - u;
            v = 1 - v;
        }
        const p = Vec3.add(origin, Vec3.scale(D, t));
        return {u: u, v: v, t: t, x: p[0], y: p[1], z: p[2]};
    }
}
Object.defineProperties(WebPageEventNode.prototype, {
    "cullFace": {
        get() {return this.__getValue(this.input.cullFace);},
        set(value) {this.input.cullFace = value;}
    },
});

export {WebPageEventNode};
