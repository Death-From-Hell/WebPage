// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//               WebPageVideoNode
// ----------------------------------------------

import {WebPageBaseNode} from './WebPageBaseNode.js';

class WebPageVideoNode extends WebPageBaseNode {
    constructor(argObject = {}, argDataVar = {}) {
        super(argObject, argDataVar);
        this.__loadInputVar(argObject,
            {name: "src"},
            {name: "crossOrigin", defaultValue: "anonymous"},
            {name: "autoplay", defaultValue: true},
            {name: "startTime", defaultValue: 0},
            {name: "currentTime"},
            {name: "loop", defaultValue: true},
            {name: "muted", defaultValue: true},
            {name: "volume", defaultValue: 1},
        );
        this.data.video = document.createElement("video");
    }
    create() {
        return new Promise((resolve, reject) => {
            this.video.addEventListener("canplaythrough", () => {
                if(this.autoplay) {
                    this.play();
                }
                resolve(this);
            }, false);
            this.video.addEventListener("error", () => {
                reject(new Error(`Ошибка загрузки видеофайла ${this.src}`));
            }, false);
            this.video.src = this.src;
            this.video.crossOrigin = this.crossOrigin;
            this.video.autoplay = this.autoplay;
            this.video.currentTime = this.startTime;
            this.video.loop = this.loop;
            this.video.muted = this.muted;
            this.video.volume = this.volume;
            this.video.preload = "auto";
            
            this.video.addEventListener("ended", () => this.trigger("ended"), false);
            this.video.addEventListener("error", () => this.trigger("error"), false);
            this.video.addEventListener("load", () => this.trigger("load"), false);
            this.video.addEventListener("pause", () => this.trigger("pause"), false);
            this.video.addEventListener("play", () => this.trigger("play"), false);
            this.video.addEventListener("seeked", () => this.trigger("seeked"), false);
        });
    }
    play() {
        this.video.play();
    }
    pause() {
        this.video.pause();
    }
    load() {
        this.video.load();
    }
    stop() {
        this.video.pause();
        this.video.currentTime = 0;
    }
    __update() {
        this.__setup();
        const loop = this.loop;
        if(this.video.loop != loop) {
            this.video.loop = loop;
        }
        const muted = this.muted;
        if(this.video.muted != muted) {
            this.video.muted = muted;
        }
        const volume = this.volume;
        if(this.video.volume != volume) {
            this.video.volume = volume;
        }
        const currentTime = this.currentTime;
        if(currentTime !== undefined) {
            this.video.currentTime = currentTime;
        }
        this.__cleanup();
    }
}
Object.defineProperties(WebPageVideoNode.prototype, {
    "src": {
        get() {return this.__getValue(this.input.src);},
        set(value) {this.input.src = value; this.video.src = this.input.src;}
    },
    "crossOrigin": {
        get() {return this.__getValue(this.input.crossOrigin);},
        set(value) {this.input.crossOrigin = value;}
    },
    "autoplay": {
        get() {return this.__getValue(this.input.autoplay);},
        set(value) {this.input.autoplay = value;}
    },
    "startTime": {
        get() {return this.__getValue(this.input.startTime);},
        set(value) {this.input.startTime = value;}
    },
    "currentTime": {
        get() {return this.__getValue(this.input.currentTime);},
        set(value) {this.video.currentTime = value;}
    },
    "loop": {
        get() {return this.__getValue(this.input.loop);},
        set(value) {this.input.loop = value; this.video.loop = this.input.loop;}
    },
    "muted": {
        get() {return this.__getValue(this.input.muted);},
        set(value) {this.input.muted = value; this.video.muted = this.input.muted;}
    },
    "volume": {
        get() {return this.__getValue(this.input.volume);},
        set(value) {this.input.volume = value; this.video.volume = this.input.volume;}
    },
    "video": {
        get() {return this.data.video;},
    },
    "width": {
        get() {return this.data.video.videoWidth;},
    },
    "height": {
        get() {return this.data.video.videoHeight;},
    },
    'duration': {
        get() {return this.video.duration;},
    },
    'ended': {
        get() {return this.video.ended;},
    },
    'paused': {
        get() {return this.video.paused;},
    },
});

export {WebPageVideoNode};
