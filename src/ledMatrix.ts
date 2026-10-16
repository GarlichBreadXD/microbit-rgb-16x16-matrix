// MakeCode extension: RGB 16x16 virtual matrix (simulator-only)
// Exposes blocks to set pixels and flush a 16x16 RGB buffer.

//% color=#aa00ff icon=""
namespace RGB16Matrix {
    const WIDTH = 16;
    const HEIGHT = 16;
    const PIXELS = WIDTH * HEIGHT;
    let buffer: number[] = new Array(PIXELS * 3);
    for (let i = 0; i < buffer.length; i++) buffer[i] = 0;
    let _brightness = 100; // percent 0-100

    function clamp(v: number, a: number, b: number) {
        if (v < a) return a;
        if (v > b) return b;
        return v;
    }

    function idx(x: number, y: number) {
        x = clamp(x, 0, WIDTH - 1);
        y = clamp(y, 0, HEIGHT - 1);
        return (y * WIDTH + x) * 3;
    }

    //% blockId=rgb16_set_pixel block="set pixel x %x y %y color %color"
    //% x.min=0 x.max=15 y.min=0 y.max=15
    //% color.defl="#ff0000"
    export function setPixel(x: number, y: number, color: string): void {
        const c = parseHexColor(color);
        const i = idx(x, y);
        buffer[i] = c.r;
        buffer[i + 1] = c.g;
        buffer[i + 2] = c.b;
    }

    //% blockId=rgb16_set_pixel_rgb block="set pixel x %x y %y r %r g %g b %b"
    //% x.min=0 x.max=15 y.min=0 y.max=15
    //% r.min=0 r.max=255 g.min=0 g.max=255 b.min=0 b.max=255
    export function setPixelRGB(x: number, y: number, r: number, g: number, b: number): void {
        const i = idx(x, y);
        buffer[i] = clamp(r|0, 0, 255);
        buffer[i + 1] = clamp(g|0, 0, 255);
        buffer[i + 2] = clamp(b|0, 0, 255);
    }

    //% blockId=rgb16_fill block="fill color %color"
    //% color.defl="#0000ff"
    export function fill(color: string): void {
        const c = parseHexColor(color);
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                const i = idx(x, y);
                buffer[i] = c.r;
                buffer[i + 1] = c.g;
                buffer[i + 2] = c.b;
            }
        }
    }

    //% blockId=rgb16_clear block="clear"
    export function clear(): void {
        for (let i = 0; i < buffer.length; i++) buffer[i] = 0;
    }

    //% blockId=rgb16_brightness block="brightness %level %%"
    //% level.min=0 level.max=100
    export function brightness(level: number): void {
        _brightness = clamp(level|0, 0, 100);
    }

    //% blockId=rgb16_show block="show"
    export function show(): void {
        // Apply brightness scaling and serialize as hex
        let parts: string[] = [];
        const scale = _brightness / 100;
        for (let i = 0; i < buffer.length; i++) {
            const v = Math.round(buffer[i] * scale) | 0;
            const h = v.toString(16);
            parts.push((h.length == 1 ? "0" + h : h));
        }
        const payload = "RGB16:" + parts.join("");
        // Send via serial so a userscript can pick it up in the browser simulator
        serial.writeString(payload);
    }

    //% blockId=rgb16_sendblock block="sendBuffer"
    export function sendBuffer(): void {
        show();
    }

    function parseHexColor(s: string): { r: number, g: number, b: number } {
        if (!s) return { r: 0, g: 0, b: 0 };
        // Accept formats: "#rrggbb" or "rrggbb" or "#rgb"
        s = s.trim();
        if (s.charAt(0) == '#') s = s.slice(1);
        if (s.length == 3) {
            const r = parseInt(s.charAt(0) + s.charAt(0), 16);
            const g = parseInt(s.charAt(1) + s.charAt(1), 16);
            const b = parseInt(s.charAt(2) + s.charAt(2), 16);
            return { r: r, g: g, b: b };
        } else if (s.length == 6) {
            const r = parseInt(s.slice(0, 2), 16);
            const g = parseInt(s.slice(2, 4), 16);
            const b = parseInt(s.slice(4, 6), 16);
            return { r: r, g: g, b: b };
        }
        return { r: 0, g: 0, b: 0 };
    }
}
