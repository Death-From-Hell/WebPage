// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageGraphNode
// ----------------------------------------------

import {WebPageError} from './WebPage.js';
import {WebPageBaseNode} from './WebPageBaseNode.js';

class WebPageGraphNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "clear", defaultValue: false},
        );
        Object.assign(this.data, {
            graph: new Map(),
            sortedGraph: []
        });
    }
    __update() {
        if(this.enable) {
            this.__setup();
            this.draw();
            this.__cleanup();
        }
    }
    sort() {
        for(const [key, value] of this.data.graph) {
            const node = value.node;
            const parentNodes = node.__getParentNodes();
            for(const parentNode of parentNodes) {
                this.data.graph.get(parentNode.id)?.children.add(node);
            }
        }
//         this.showGraph();
        this.data.sortedGraph = [];
        const f1 = (e) => {
            switch(e.stage) {
                case 0:
                {
                    e.stage = 1;
                    for(const node of e.children) {
                        f1(this.data.graph.get(node.id));
                    }
                    e.stage = 2;
                    this.data.sortedGraph.unshift(e.node);
                    break;
                }
                case 1:
                {
                    WebPageError("Cycle between nodes.");
                }
                case 2:
                {
                    return;
                }
            }
        }
        for(const [key, value] of this.data.graph) {
            f1(value);
        }
        for(const node of this.data.sortedGraph) {
            if(WebPageGraphNode.prototype.isPrototypeOf(node)) {
                node.sort();
            }
        }
    }
    showGraph() {
        for(const [key, value] of this.data.graph) {
            console.log({id: key, name: value.node.name, children: Array.from(value.children).map(e => e.name).join()});
        }            
    }
    showSortedGraph() {
        for(const node of this.data.sortedGraph) {
            console.log({id: node.id, name: node.name, constructor: node.constructor.name});
        }
    }
    draw() {
        if(this.clear) {
            this.root.clear("color", "depth", "stencil");
        }
        for(const node of this.data.sortedGraph) {
            if(node.__update) {
                node.__update();
            }
        }
    }
    node(argName, argParams = {}) {
        const nameNode =  "WebPage" + argName[0].toUpperCase() + argName.substring(1) + "Node";
        if(!this.root.data.importedNodes.has(nameNode)) {
            WebPageError(`Node description not loaded '${argName}'.`);
        }
        const node = this.root.data.importedNodes.get(nameNode);
        const instance = new node(argParams, {
            id: this.root.__uniqueId(),
            root: this.root,
            graph: this,
            gl: this.gl
        });
        this.data.graph.set(instance.id, {
            node: instance,
            children: new Set(),
            stage: 0
        });
        return instance;
    }
}
Object.defineProperties(WebPageGraphNode.prototype, {
    "clear": {
        get() {return this.__getValue(this.input.clear);},
        set(value) {this.input.clear = value;}
    },
});

export {WebPageGraphNode};
