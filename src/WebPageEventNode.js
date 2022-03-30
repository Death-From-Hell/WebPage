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
        if(!eventSubdata.has(id)) {
            eventSubdata.set(id, new Set());
        }
        const set = eventSubdata.get(id);
        const func = argData.func 
        set.add(func);
        return true;
    }
    __init() {
        this.gl.canvas.addEventListener("click", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
            this.__run({
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
                event: "dblclick",
                objects: objects,
                eventData: this.data.eventDblclick,
                position: position,
            });
        }, false);
        this.gl.canvas.addEventListener("mousemove", (e) => {
            const position = this.__getMousePosition(e, true);
            const coords = this.__getCoords(position);
            const objects = this.__getObjects(coords);
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
            this.__run({
                event: "mousemove",
                objects: objects,
                eventData: this.data.eventMousemove,
                position: position,
            });
            this.__run({
                event: "mouseout",
                objects: outObjects,
                eventData: this.data.eventMouseout,
                position: position,
            });
            this.__run({
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
                event: "wheel",
                objects: objects,
                eventData: this.data.eventWheel,
                position: position,
                properties: {
                    deltaY: e.deltaY
                }
            });
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
                    event: argData.event,
                    objectId: object.id,
                    phase: "down",
                    u: object.u,
                    v: object.v,
                    posX: position.x,
                    posY: position.y,
                    coordX: object.x,
                    coordY: object.y,
                    coordZ: object.z,
                    stopPropagation: () => {stopProp = true;},
                    cursor: (e) => {this.gl.canvas.style.cursor = e;}
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
                        objectId: object.id,
                        phase: "up",
                        u: object.u,
                        v: object.v,
                        posX: position.x,
                        posY: position.y,
                        coordX: object.x,
                        coordY: object.y,
                        coordZ: object.z,
                        stopPropagation: () => {stopProp = true;},
                        cursor: (e) => {this.gl.canvas.style.cursor = e;}
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
    setData(argData) {
        this.data.object.set(argData.id, {maybeDelete: false, data: argData.data});
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
