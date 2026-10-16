// ==UserScript==
// @name         micro:bit RGB 16x16 simulator overlay
// @namespace    https://github.com/GarlichBreadXD/microbit-rgb-16x16-matrix
// @version      0.1
// @description  Show a 16x16 RGB LED matrix overlay for the MakeCode micro:bit simulator (simulator-only). Listens for serial messages starting with "RGB16:".
// @author       GarlichBreadXD
// @match        https://makecode.microbit.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PREFIX = 'RGB16:';
    const WIDTH = 16;
    const HEIGHT = 16;

    // Create floating panel
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.zIndex = '999999';
    panel.style.background = 'rgba(0,0,0,0.6)';
    panel.style.borderRadius = '8px';
    panel.style.padding = '8px';
    panel.style.color = '#fff';
    panel.style.fontFamily = 'sans-serif';
    panel.style.width = 'auto';
    panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';

    const title = document.createElement('div');
    title.textContent = 'RGB 16x16';
    title.style.marginBottom = '6px';
    title.style.fontSize = '12px';
    panel.appendChild(title);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let scale = 12; // pixels
    canvas.width = WIDTH * scale;
    canvas.height = HEIGHT * scale;
    canvas.style.display = 'block';
    canvas.style.background = '#111';
    canvas.style.borderRadius = '4px';
    panel.appendChild(canvas);

    const controls = document.createElement('div');
    controls.style.marginTop = '6px';
    controls.style.display = 'flex';
    controls.style.gap = '6px';
    controls.style.alignItems = 'center';

    const scaleLabel = document.createElement('label');
    scaleLabel.style.fontSize = '11px';
    scaleLabel.textContent = 'scale';
    controls.appendChild(scaleLabel);

    const scaleInput = document.createElement('input');
    scaleInput.type = 'range';
    scaleInput.min = '4';
    scaleInput.max = '24';
    scaleInput.value = String(scale);
    scaleInput.addEventListener('input', () => {
        scale = parseInt(scaleInput.value, 10) || 12;
        canvas.width = WIDTH * scale;
        canvas.height = HEIGHT * scale;
        drawGrid(latestPixels);
    });
    controls.appendChild(scaleInput);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'clear';
    clearBtn.style.fontSize = '11px';
    clearBtn.addEventListener('click', () => {
        latestPixels = new Uint8ClampedArray(WIDTH * HEIGHT * 3);
        drawGrid(latestPixels);
    });
    controls.appendChild(clearBtn);

    panel.appendChild(controls);
    document.body.appendChild(panel);

    let latestPixels = new Uint8ClampedArray(WIDTH * HEIGHT * 3);

    function hexToBytes(hex: string): Uint8ClampedArray {
        const bytes = new Uint8ClampedArray(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16) || 0;
        }
        return bytes;
    }

    function drawGrid(pixels: Uint8ClampedArray) {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const i = (y * WIDTH + x) * 3;
                const r = pixels[i] || 0;
                const g = pixels[i + 1] || 0;
                const b = pixels[i + 2] || 0;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x * scale, y * scale, scale - 1, scale - 1);
            }
        }
    }

    // Listen for postMessage events from the simulator iframe.
    window.addEventListener('message', (ev) => {
        try {
            const d = ev.data;
            if (!d) return;
            // Case 1: data is a string starting with prefix
            if (typeof d === 'string') {
                if (d.indexOf(PREFIX) === 0) {
                    const hex = d.slice(PREFIX.length);
                    const bytes = hexToBytes(hex);
                    if (bytes.length >= WIDTH * HEIGHT * 3) {
                        latestPixels = bytes.slice(0, WIDTH * HEIGHT * 3);
                        drawGrid(latestPixels);
                    }
                }
                return;
            }
            // Case 2: data is an object (MakeCode simulator often posts objects)
            if (typeof d === 'object') {
                // Try common fields
                if (d.type === 'serial' && typeof d.data === 'string') {
                    const s = d.data;
                    if (s.indexOf(PREFIX) === 0) {
                        const hex = s.slice(PREFIX.length);
                        const bytes = hexToBytes(hex);
                        if (bytes.length >= WIDTH * HEIGHT * 3) {
                            latestPixels = bytes.slice(0, WIDTH * HEIGHT * 3);
                            drawGrid(latestPixels);
                        }
                    }
                } else if (d.event && typeof d.event === 'string') {
                    // sometimes nested
                    const s = d.event;
                    if (s.indexOf(PREFIX) === 0) {
                        const hex = s.slice(PREFIX.length);
                        const bytes = hexToBytes(hex);
                        if (bytes.length >= WIDTH * HEIGHT * 3) {
                            latestPixels = bytes.slice(0, WIDTH * HEIGHT * 3);
                            drawGrid(latestPixels);
                        }
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }, false);

    // Initial clear
    drawGrid(latestPixels);
})();
