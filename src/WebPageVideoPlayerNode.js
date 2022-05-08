// ----------------------------------------------
//         Copyright 2022 Leonid Petrunya
//              All rights reserved
// ----------------------------------------------
//            WebPageVideoPlayerNode
// ----------------------------------------------

import {WebPageBaseNode} from "./WebPageBaseNode.js";
import {Mat4} from "./WebPageMath.js";
 
class WebPageVideoPlayerNode extends WebPageBaseNode {
    constructor(argParams = {}, argVars = {}) {
        super(argParams, argVars);
        this.__loadInputVar(argParams,
            {name: "src"},
            {name: "top", defaultValue: 0},
            {name: "left", defaultValue: 0},
            {name: "center", defaultValue: false},
            {name: "margin", defaultValue: 10},
            {name: "maxWidth", defaultValue: () => window.innerWidth},
            {name: "maxHeight", defaultValue: () => window.innerHeight},
            {name: "eventNode"},
        );
        Object.assign(this.data, {
            width: undefined,
            height: undefined
        });
    }
    async init() {
        const config = {
            mouseTimeout: 2000,
            touchTimeout: 5000,
            controlContainer: {
                height: 50,
            },
            timeLine: {
                height: 12,
                padding: 12,
                bar: {
                    height: 4,
                    style: "#555555"
                },
                pointer: {
                    radius: 6,
                    style: "#e6e6e6",
                },
            },
            volumeControl: {
                width: 60,
                height: 36,
                padding: 6,
                bar: {
                    height: 4,
                    style: "#555555",
                },
                pointer: {
                    radius: 6,
                    style: "#e6e6e6",
                },
            },
            click: {
                timeout: 300,
            }
        };
        const runtime = {
            growScale: 1,
            shrinkScale: 1,
            video: {
                width: undefined,
                height: undefined,
            },
            controlContainer: {
                enable: false,
                time: undefined,
                timeout: undefined,
            },
            volumeControl: {
                change: false,
            },
            timeLine: {
                seeking: false,
            },
            timeLineTitle: {
                enable: false,
                xPos: undefined,
            },
            click: {
                enable: false,
                timer: undefined
            }
        }
        function setEnableControl(timeout) {
            runtime.controlContainer.enable = true;
            runtime.controlContainer.time = performance.now();
            runtime.controlContainer.timeout = timeout;
        }
        function fancyTimeFormat(duration)
        {   
            // Hours, minutes and seconds
            var hrs = ~~(duration / 3600);
            var mins = ~~((duration % 3600) / 60);
            var secs = ~~duration % 60;

            // Output like "1:01" or "4:03:59" or "123:03:59"
            var ret = "";

            if (hrs > 0) {
                ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
            }

            ret += "" + mins + ":" + (secs < 10 ? "0" : "");
            ret += "" + secs;
            return ret;
        }
        const toggleFullscreen = () => {
            if (!document.fullscreenElement && document.fullscreenEnabled) {
                this.gl.canvas.requestFullscreen().catch(err => {
                    console.warn(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
        const nodes = [
            "graph",
            "ease",
            "function",
            "video",
            "texture",
            "drawTexture",
            "drawRegion",
            "canvas",
            "adjustment",
            "rect",
            "text",
            "transformForest",        
        ];
        if(!this.__isNode(this.eventNode)) {
            nodes.push("event");
        }
        await this.root.importNode(...nodes);
        
        this.data.graph = this.root.node("Graph", {
            name: "Graph",
            clear: false
        });
        
        this.data.eventNode = this.__isNode(this.eventNode) ? this.eventNode : this.data.graph.node("Event", {
            name: "Event",
            cullFace: "back",
        });
        
        const easeNodeFadeOut = this.data.graph.node("Ease", {
            name: "Ease Fade Out",
            type: "easeoutquint",
            startValue: 1,
            endValue: 0,
            duration: 500,
            timeout: 0,
            inTimeout: 0,
            count: 1
        });
        
        const playButton = this.data.graph.node("Canvas", {
            name: "Play Button",
            width: 36,
            height: 36,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                this.context.strokeStyle = "rgba(255,255,255,1)";
                const path = new Path2D("M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z");
                this.context.fill(path);
            },
            update: false
        });
        const replayButton = this.data.graph.node("Canvas", {
            name: "Replay Button",
            width: 36,
            height: 36,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                this.context.strokeStyle = "rgba(255,255,255,1)";
                const path = new Path2D("M 18,11 V 7 l -5,5 5,5 v -4 c 3.3,0 6,2.7 6,6 0,3.3 -2.7,6 -6,6 -3.3,0 -6,-2.7 -6,-6 h -2 c 0,4.4 3.6,8 8,8 4.4,0 8,-3.6 8,-8 0,-4.4 -3.6,-8 -8,-8 z");
                this.context.fill(path);
            },
            update: false
        });
        const pauseButton = this.data.graph.node("Canvas", {
            name: "Pause Button",
            width: 36,
            height: 36,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                this.context.strokeStyle = "rgba(255,255,255,1)";
                const path = new Path2D("M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z");      
                this.context.fill(path);
            },
            update: false
        });
        const unmuteButton = this.data.graph.node("Canvas", {
            name: "Unmute Button",
            width: 36,
            height: 36,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                this.context.strokeStyle = "rgba(255,255,255,1)";
                const path = new Path2D("M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z");      
                this.context.fill(path);
            },
            update: false
        });
        const muteButton = this.data.graph.node("Canvas", {
            name: "Mute Button",
            width: 36,
            height: 36,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                const path = new Path2D("m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z");
                this.context.fill(path);
            },
            update: false
        });
        const fullscreenButton = this.data.graph.node("Canvas", {
            name: "Fullscreen Button",
            width: 24,
            height: 24,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                const path = new Path2D("M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z");
                this.context.fill(path);
            },
            update: false
        });
        const fullscreenExitButton = this.data.graph.node("Canvas", {
            name: "Fullscreen Exit Button",
            width: 24,
            height: 24,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                this.context.clearRect(0,0,this.width,this.height);
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                this.context.fillStyle = "#e6e6e6";
                const path = new Path2D("M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z");
                this.context.fill(path);
            },
            update: false
        });
        
        // *** Video Start ***
        const videoNode = await this.data.graph.node("Video", {
            name: "Video Node",
            src: this.src,
        }).load();
        const videoTexture = this.data.graph.node("Texture", {
            name: "Video Texture",
            sourceNode: videoNode,
            instantLoad: true,
            mipmap: true,
            update: () => videoNode.video.seeking ? false : true
        });
        const calcRuntimeValues = this.data.graph.node("Function", {
            name: "Calc Runtime Values",
            code: () => {
                if(document.fullscreenElement) {
                    runtime.shrinkScale = Math.min(window.innerWidth / videoTexture.width, window.innerHeight / videoTexture.height);
                    runtime.growScale = 1;
                } else {
                    const aWidth = this.maxWidth - 2 * this.margin;
                    const aHeight = this.maxHeight - 2 * this.margin;
                    if(videoTexture.width > aWidth || videoTexture.height > aHeight) {
                        runtime.growScale = Math.min(aWidth / videoTexture.width, aHeight / videoTexture.height);
                    } else {
                        runtime.growScale = 1;
                    }
                    runtime.shrinkScale = 1;
                    this.width = videoTexture.width * runtime.growScale;
                    this.height = videoTexture.height * runtime.growScale;
                }
                if(performance.now() - runtime.controlContainer.time > runtime.controlContainer.timeout) {
                    runtime.controlContainer.enable = false;
                    runtime.timeLineTitle.enable = false;
                    runtime.timeLine.seeking = false;
                }
            },
            instantCall: true,
            parentNodes: [videoTexture]
        });
        const playOrPause = () => {
            if(videoNode.video.paused) {
                videoNode.video.play(); easeNodeFadeOut.start();
            } else {
                videoNode.video.pause(); easeNodeFadeOut.clear();
            }
        }
        document.addEventListener("keydown", (e) => {
            if(e.keyCode === 37) {
                videoNode.video.currentTime = Math.max(0, videoNode.video.currentTime - 5);
            }
            if(e.keyCode === 39) {
                videoNode.video.currentTime = Math.min(videoNode.video.duration, videoNode.video.currentTime + 5);
            }
            if(e.keyCode === 32) {
                playOrPause();
            }
        }, false);
        // *** Video End ***
        
        // *** Big Play Button Start ***
        const bigPlayButton = this.data.graph.node("Canvas", {
            name: "Big Play Button",
            width: 72,
            height: 72,
            instantDraw: false,
            minFilter: "linear",
            code: function() {
                // Clear
                this.context.clearRect(0,0,this.width,this.height);
                // Background
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                // Circle
                this.context.fillStyle = "rgba(255,255,255,0.4)";
                this.context.beginPath();
                this.context.arc(36, 36, 36, 0, Math.PI * 2);
                this.context.fill();
                // Symbol
                this.context.fillStyle = "rgba(0,0,0,0.4)";
                this.context.strokeStyle = "rgba(255,255,255,1)";
                const path = new Path2D("M 25,52 38,44 38,28 25,20 z M 38,44 51,36 51,36 38,28 z");
                this.context.fill(path);
            },
        });
        const bigPlayButtonAdjustment = this.data.graph.node("Adjustment", {
            name: "Big Play Button Adjustment",
            textureNode: bigPlayButton,
            alpha: () => easeNodeFadeOut.value
        });
        // *** Big Play Button End ***

        // *** Background Container Start ***
        const bgContainer = this.data.graph.node("Rect", {
            name: "Background Container",
            width: () => window.innerWidth,
            height: () => window.innerHeight,
            color: [0,0,0,1],
            instantDraw: true,
        });
        // *** Background Container End ***
        
        // *** Volume Control Start ***
        const volumeControl = await this.data.graph.node("Canvas", {
            name: "Volume Control",
            width: config.volumeControl.width,
            height: config.volumeControl.height,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                const cfg = config.volumeControl;
                const barWidth = this.width - cfg.padding * 2;
                // Clear
                this.context.clearRect(0, 0, this.width, this.height);
                // Background
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0, 0, this.width, this.height);
                // Bar
                this.context.fillStyle = cfg.bar.style;
                this.context.fillRect(cfg.padding, (this.height - cfg.bar.height) / 2, barWidth, cfg.bar.height);
                // Pointer
                const progressWidth = videoNode.video.volume * barWidth; 
                this.context.fillStyle = cfg.pointer.style;
                this.context.fillRect(cfg.padding, (this.height - cfg.bar.height) / 2, progressWidth, cfg.bar.height);
                this.context.beginPath();
                this.context.arc(cfg.padding + progressWidth, this.height / 2, cfg.pointer.radius, 0, Math.PI * 2);
                this.context.fill();
            },
            parentNodes: [calcRuntimeValues],
            update: true
        });
        const setVolume = (u) => {
            const m = config.volumeControl.padding / volumeControl.width;
            const v = 2 * u * m + u - m;
            const v1 = Math.min(Math.max(0, v), 1);
            videoNode.video.volume = v1;
        }
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {if(e.originalEvent.button === 0) {setVolume(e.u); runtime.volumeControl.change = true;} e.stopPropagation();},
            event: "mousedown",
            objectId: [volumeControl.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {setVolume(e.u); runtime.volumeControl.change = true; e.stopPropagation();},
            event: "touchclick",
            objectId: [volumeControl.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                if(runtime.volumeControl.change) {
                    setEnableControl(config.mouseTimeout);
                    setVolume(e.u);
                }
                e.stopPropagation();
            },
            event: "mousemove",
            objectId: [volumeControl.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                setEnableControl(config.touchTimeout);
                setVolume(e.u);
                e.stopPropagation();
            },
            event: "touchmove",
            objectId: [volumeControl.id]
        });
        this.data.eventNode.style({
            cursor: "pointer",
            objectId: volumeControl.id
        });
        // *** Volume Control End ***

        // *** Time Line Start ***
        const timeLine = await this.data.graph.node("Canvas", {
            name: "Time Line",
            width: () => document.fullscreenElement ? window.innerWidth : this.width,
//             width: () => this.width,
            height: config.timeLine.height,
            instantDraw: true,
            minFilter: "linear",
            code: function() {
                const video = videoNode.video;
                const cfg = config.timeLine;
                const w = this.width - 2 * cfg.padding;
                // Clear
                this.context.clearRect(0,0,this.width,this.height);
                // Background
                this.context.fillStyle = "rgba(0,0,0,0)";
                this.context.fillRect(0,0,this.width,this.height);
                // Bar
                this.context.fillStyle = cfg.bar.style;
                this.context.fillRect(cfg.padding, (cfg.height - cfg.bar.height) / 2, w, cfg.bar.height);
                // Loading Bar
                const inc = w / video.duration;
                this.context.fillStyle = '#e6e6e6';
                for (let i = 0; i < video.seekable.length; i++) {
                    const x1 = video.seekable.start(i) * inc;
                    const x2 = video.seekable.end(i) * inc;
                    this.context.fillRect(cfg.padding + x1, (cfg.height - cfg.bar.height) / 2, x2 - x1, cfg.bar.height);
                }
                // Pointer
                const pX = videoNode.video.currentTime / videoNode.video.duration * w + cfg.padding;
                const pY = this.height / 2;
                this.context.fillStyle = cfg.pointer.style;
                this.context.beginPath();
                this.context.arc(pX, pY, cfg.pointer.radius, 0, Math.PI * 2);
                this.context.fill();
            },
        });
        const calculateTime = (u) => {
            const duration = videoNode.video.duration;
            const m = config.timeLine.padding / timeLine.width * runtime.growScale;
            const v = (u * (1 + 2 * m) - m) * duration;
            return Math.min(Math.max(0, v), duration);
        }
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                setEnableControl(config.mouseTimeout);
                if(e.originalEvent.button === 0) {
                    videoNode.video.currentTime = calculateTime(e.u);
                    runtime.timeLine.seeking = true;
                }
                e.stopPropagation();
            },
            event: "mousedown",
            objectId: timeLine.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                setEnableControl(config.touchTimeout);
                const currentTime = calculateTime(e.u);
                videoNode.video.currentTime = currentTime;
                runtime.timeLine.seeking = true;
                runtime.timeLineTitle.enable = true;
                e.stopPropagation();
            },
            event: "touchclick",
            objectId: timeLine.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                setEnableControl(config.mouseTimeout);
                const currentTime = calculateTime(e.u);
                if(runtime.timeLine.seeking) {videoNode.video.currentTime = currentTime;}; e.stopPropagation();
            },
            event: "mousemove",
            objectId: timeLine.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                setEnableControl(config.touchTimeout);
                runtime.timeLineTitle.enable = true;
                const currentTime = calculateTime(e.u);
                videoNode.video.currentTime = currentTime;
                e.stopPropagation();
            },
            event: "touchmove",
            objectId: timeLine.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {runtime.timeLineTitle.enable = true;},
            event: "mouseover",
            objectId: timeLine.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {runtime.timeLineTitle.enable = false;},
            event: "mouseout",
            objectId: timeLine.id
        });
        this.data.eventNode.style({
            cursor: "pointer",
            objectId: timeLine.id
        });
        // *** Time Line End ***

        // *** Time Line Title Start ***
        const timeLineTitle = await this.data.graph.node("Text", {
            name: "Time Line Title",
            text: () => fancyTimeFormat(videoNode.video.currentTime),
            color: "#e6e6e6",
            backgroundColor: "rgba(0,0,0,0)",
            textBaseline: "alphabetic",
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            paddingBottom: 2,
        });
        // *** Time Line Title End ***

        // *** Time Info Start ***
        const timeInfo = await this.data.graph.node("Text", {
            name: "Time Info",
            text: () => fancyTimeFormat(videoNode.video.currentTime) + " / " + fancyTimeFormat(videoNode.video.duration),
            color: "#e6e6e6",
            backgroundColor: "rgba(0,0,0,0)",
            textBaseline: "alphabetic",
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            paddingBottom: 2,
            update: true,
        });
        // *** Time Info End ***

        document.addEventListener("mouseup", () => {runtime.timeLine.seeking = false; runtime.volumeControl.change = false;}, false);
        
        const tForest = this.data.graph.node("TransformForest", {
            name: "Transform Forest",
            instantCalculate: true,
            parentNodes: [calcRuntimeValues],
            forest: [
                {
                    type: "Translate",
                    name: "Translate Background Container",
                    z: 500
                },
                {
                    type: "Translate",
                    name: "Translate To Center",
                    x: () => document.fullscreenElement ? window.innerWidth / 2 : (this.center ? (this.left + this.maxWidth / 2) : (this.left + this.width / 2)),
                    y: () => document.fullscreenElement ? window.innerHeight / 2 : (this.top + this.height / 2),
                    children: [
                        {
                            type: "Scale",
                            name: "Scale Big Plat Button",
                            x: () => (2 - easeNodeFadeOut.value) * runtime.growScale,
                            y: () => (2 - easeNodeFadeOut.value) * runtime.growScale,
                            children: [
                                {
                                    type: "PivotPoint",
                                    name: "Pivot Point Big Play Button",
                                    objectNode: bigPlayButton,
                                    x: "center",
                                    y: "center",
                                }
                            ]
                        },
                        {
                            type: "Translate",
                            name: "Translate Video",
                            z: 100,
                            children: [
                                {
                                    type: "Scale",
                                    name: "Scale Video",
                                    x: () => runtime.growScale * runtime.shrinkScale,
                                    y: () => runtime.growScale * runtime.shrinkScale,
                                    children: [
                                        {
                                            type: "PivotPoint",
                                            name: "Pivot Point Video",
                                            objectNode: videoTexture,
                                            x: "center",
                                            y: "center",
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "Translate",
                            name: "Translate Control Container",
                            x: () => document.fullscreenElement ? -window.innerWidth / 2 : -this.width / 2,
                            y: () => document.fullscreenElement ? window.innerHeight / 2 : this.height / 2,
//                             y: () => document.fullscreenElement ? window.innerHeight / 2 : this.height / 2,
                            z: 10,
                            children: [
                                {
                                    type: "PivotPoint",
                                    name: "Pivot Point Control Container",
//                                     objectNode: controlContainer,
//                                     x: "left",
//                                     y: "bottom",
                                    x: 0,
                                    y: config.controlContainer.height,
                                    children: [
                                        {
                                            type: "PivotPoint",
                                            name: "Pivot Point Time Line",
                                            objectNode: timeLine,
                                            x: "left",
                                            y: "bottom",
                                            children: [
                                                {
                                                    type: "Translate",
                                                    name: "Translate Time Line Title",
//                                                     x: () => runtime.timeLineTitle.xPos,
                                                    x: () => timeLine.width * videoNode.video.currentTime / videoNode.video.duration,
                                                    children: [
                                                        {
                                                            type: "PivotPoint",
                                                            name: "Pivot Point Time Line Title",
                                                            objectNode: timeLineTitle,
                                                            x: "center",
                                                            y: "bottom",
                                                        },
                                                    ]
                                                },
                                            ]
                                        },
                                        {
                                            type: "Translate",
                                            name: "Translate Button 1",
                                            x: 12,
                                            y: 7,
                                            z: -10,
                                        },
                                        {
                                            type: "Translate",
                                            name: "Translate Button 2",
                                            x: 60,
                                            y: 7,
                                            z: -10,
                                        },
                                        {
                                            type: "Translate",
                                            name: "Translate Volume Control",
                                            x: 108,
                                            y: 7,
                                            z: -10,
                                        },
                                        {
                                            type: "Translate",
                                            name: "Translate Time Info",
                                            x: 180,
                                            y: 16,
                                            z: -10,
                                        },
                                        {
                                            type: "Translate",
                                            name: "Translate Button 3",
                                            x: () => (document.fullscreenElement ? window.innerWidth : this.width) - 48,
                                            y: 10,
                                            z: -10,
                                            children: [
                                                {
                                                    type: "Scale",
                                                    name: "Scale Button 3",
                                                    x: 1.25,
                                                    y: 1.25,
                                                }
                                            ]
                                        },
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        });
        
        const drawBgContainer = this.data.graph.node("DrawTexture", {
            name: "Draw Background Container",
            textureNode: bgContainer,
            transformMatrix: () => tForest.matrix("Translate Background Container"),
            instantDraw: true,
            enable: () => document.fullscreenElement,
            eventNode: this.data.eventNode,
            objectId: bgContainer.id,
            parentNodes: [tForest],
        });
        const drawVideo = this.data.graph.node("DrawTexture", {
            name: "Draw Video",
            textureNode: videoTexture,
            instantDraw: false,
            transformMatrix: () => tForest.matrix("Pivot Point Video"),
            eventNode: this.data.eventNode,
            objectId: videoTexture.id,
            parentNodes: [drawBgContainer, tForest],
        });
        const drawBigPlayButton = this.data.graph.node("DrawTexture", {
            name: "Draw Big Play Button",
            textureNode: bigPlayButtonAdjustment,
            transformMatrix: () => tForest.matrix("Pivot Point Big Play Button"),
            enable: () => easeNodeFadeOut.value > 0 && runtime.controlContainer.enable,
            parentNodes: [drawVideo, tForest],
        });
        
        // *** Control Container Start ***
        const controlContainer = this.data.graph.node("DrawRegion", {
            name: "Control Container",
            width: () => document.fullscreenElement ? window.innerWidth : this.width,
            height: config.controlContainer.height,
            transformMatrix: () => tForest.matrix("Pivot Point Control Container"),
            eventNode: this.data.eventNode,
            instantDraw: true,
            parentNodes: [drawVideo, tForest],
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {e.stopPropagation();},
            event: "mousedown",
            objectId: controlContainer.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {e.stopPropagation();},
            event: "touchclick",
            objectId: controlContainer.id
        });
        // *** Control Container End ***
        
        const drawVolumeControl = this.data.graph.node("DrawTexture", {
            name: "Draw Volume Control",
            textureNode: volumeControl,
            transformMatrix: () => tForest.matrix("Translate Volume Control"),
            instantDraw: true,
            enable: () => runtime.controlContainer.enable,
            eventNode: this.data.eventNode,
            objectId: volumeControl.id,
            parentNodes: [controlContainer, tForest],
        });
        const drawTimeLine = this.data.graph.node("DrawTexture", {
            name: "Draw Time Line",
            textureNode: timeLine,
            transformMatrix: () => tForest.matrix("Pivot Point Time Line"),
            instantDraw: true,
            enable: () => runtime.controlContainer.enable,
            eventNode: this.data.eventNode,
            objectId: timeLine.id,
            parentNodes: [controlContainer, tForest],
        });
        const drawTimeInfo = this.data.graph.node("DrawTexture", {
            name: "Draw Time Info",
            textureNode: timeInfo,
            transformMatrix: () => tForest.matrix("Translate Time Info"),
            instantDraw: true,
            enable: () => runtime.controlContainer.enable,
            parentNodes: [controlContainer, tForest],
        });
        const drawTimeLineTitle = this.data.graph.node("DrawTexture", {
            name: "Draw Time Line Title",
            textureNode: timeLineTitle,
            transformMatrix: () => tForest.matrix("Pivot Point Time Line Title"),
            instantDraw: true,
            enable: () => runtime.controlContainer.enable && runtime.timeLineTitle.enable,
            parentNodes: [controlContainer, tForest],
        });
        // *** Buttons Start ***
        const drawButton1 = this.data.graph.node("DrawTexture", {
            name: "Draw Button 1",
            textureNode: () => {
                if(videoNode.video.ended) {
                    return replayButton;
                } else {
                    return videoNode.video.paused ? playButton : pauseButton;
                }
            },
            transformMatrix: () => tForest.matrix("Translate Button 1"),
            instantDraw: true,
            eventNode: this.data.eventNode,
            objectId: () => videoNode.video.paused ? pauseButton.id : playButton.id,
            enable: () => runtime.controlContainer.enable,
            parentNodes: [controlContainer, tForest],
        });
        const drawButton2 = this.data.graph.node("DrawTexture", {
            name: "Draw Button 2",
            textureNode: () => videoNode.video.muted ? muteButton : unmuteButton,
            transformMatrix: () => tForest.matrix("Translate Button 2"),
            instantDraw: true,
            eventNode: this.data.eventNode,
            objectId: () => videoNode.video.muted ? muteButton.id : unmuteButton.id,
            enable: () => runtime.controlContainer.enable,
            parentNodes: [controlContainer, tForest]
        });
        const drawButton3 = this.data.graph.node("DrawTexture", {
            name: "Draw Button 3",
            textureNode: () => document.fullscreenElement ? fullscreenExitButton : fullscreenButton,
            transformMatrix: () => tForest.matrix("Scale Button 3"),
            instantDraw: true,
            eventNode: this.data.eventNode,
            objectId: () => document.fullscreenElement ? fullscreenButton.id : fullscreenExitButton.id,
            enable: () => runtime.controlContainer.enable,
            parentNodes: [controlContainer, tForest],
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {if(e.originalEvent.button === 0) {videoNode.video.play(); easeNodeFadeOut.start();} e.stopPropagation();},
            event: "mousedown",
            objectId: pauseButton.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {videoNode.video.play(); easeNodeFadeOut.start(); e.stopPropagation();},
            event: "touchclick",
            objectId: pauseButton.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {if(e.originalEvent.button === 0) {videoNode.video.pause(); easeNodeFadeOut.clear();} e.stopPropagation();},
            event: "mousedown",
            objectId: [playButton.id, replayButton.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {videoNode.video.pause(); easeNodeFadeOut.clear(); e.stopPropagation();},
            event: "touchclick",
            objectId: [playButton.id, replayButton.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {toggleFullscreen(); e.stopPropagation();},
            event: "mousedown",
            objectId: [fullscreenButton.id, fullscreenExitButton.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {toggleFullscreen(); e.stopPropagation();},
            event: "touchclick",
            objectId: [fullscreenButton.id, fullscreenExitButton.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {if(e.originalEvent.button === 0) {videoNode.video.muted = true;} e.stopPropagation();},
            event: "mousedown",
            objectId: unmuteButton.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {videoNode.video.muted = true; e.stopPropagation();},
            event: "touchclick",
            objectId: unmuteButton.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {if(e.originalEvent.button === 0) {videoNode.video.muted = false;} e.stopPropagation();},
            event: "mousedown",
            objectId: muteButton.id
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {videoNode.video.muted = false; e.stopPropagation();},
            event: "touchclick",
            objectId: muteButton.id
        });
        this.data.eventNode.style({
            cursor: "pointer",
            objectId: [pauseButton.id, playButton.id, muteButton.id, unmuteButton.id, fullscreenButton.id, fullscreenExitButton.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {setEnableControl(config.mouseTimeout);},
            event: "mousemove",
            objectId: [bgContainer.id, videoTexture.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {setEnableControl(config.touchTimeout);},
            event: "touchmove",
            objectId: [bgContainer.id, videoTexture.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {
                if(e.originalEvent.button === 0) {
                    runtime.click.timer = setTimeout(function() {if(runtime.click.enable) playOrPause();}, config.click.timeout);
                    runtime.click.enable = true;
                }
                e.stopPropagation();
            },
            event: "mousedown",
            objectId: [bgContainer.id, videoTexture.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {playOrPause(); e.stopPropagation();},
            event: "touchclick",
            objectId: [bgContainer.id, videoTexture.id]
        });
        this.data.eventNode.addEventListener({
            phase: "down",
            func: (e) => {clearTimeout(runtime.click.timer); runtime.click.enable = false; toggleFullscreen(); e.stopPropagation();},
            event: "dblclick",
            objectId: [bgContainer.id, videoTexture.id]
        });
        // *** Buttons End ***        

        this.data.graph.sort();
//         this.data.graph.showSortedGraph();
        return this;
    }
    __update() {
        if(this.enable) {
            this.__setup();
            this.update();
            this.__cleanup();
        }
    }
    update() {
        this.data.graph.__update();
    }
}
Object.defineProperties(WebPageVideoPlayerNode.prototype, {
    "src": {
        get() {return this.__getValue(this.input.src);},
        set(value) {this.input.src = value;}
    },
    "top": {
        get() {return this.__getValue(this.input.top);},
        set(value) {this.input.top = value;}
    },
    "left": {
        get() {return this.__getValue(this.input.left);},
        set(value) {this.input.left = value;}
    },
    "center": {
        get() {return this.__getValue(this.input.center);},
        set(value) {this.input.center = value;}
    },
    "margin": {
        get() {return this.__getValue(this.input.margin);},
        set(value) {this.input.margin = value;}
    },
    "maxWidth": {
        get() {return this.__getValue(this.input.maxWidth);},
        set(value) {this.input.maxWidth = value;}
    },
    "maxHeight": {
        get() {return this.__getValue(this.input.maxHeight);},
        set(value) {this.input.maxHeight = value;}
    },
    "eventNode": {
        get() {return this.__getValue(this.input.eventNode);},
        set(value) {this.input.eventNode = value;}
    },
    "width": {
        get() {return this.data.width;},
        set(value) {this.data.width = value;}
    },
    "height": {
        get() {return this.data.height;},
        set(value) {this.data.height = value;}
    },
});

export {WebPageVideoPlayerNode};
