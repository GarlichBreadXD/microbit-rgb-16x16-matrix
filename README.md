# microbit-rgb-16x16-matrix

MakeCode extension + userscript that provides a virtual 16x16 RGB LED matrix for the micro:bit simulator (simulator-only).

This repository contains:

- A MakeCode (pxt) extension (src/ledMatrix.ts + pxt.json) that provides blocks to set individual pixels (hex color or RGB), fill the display, clear it, set brightness, and send the buffer to the simulator.
- A Tampermonkey userscript (userscript/tampermonkey.user.js) that listens for simulator output and draws a 16x16 RGB matrix in a floating overlay window. This userscript is optional but required if you want the simulator to show the larger RGB matrix visually.

Important: This only affects the online simulator display. It does not change micro:bit hardware.

Usage

1) Add the extension to MakeCode
   - Open https://makecode.microbit.org
   - Click "Advanced" → "Extensions" (bottom of the block categories)
   - In the extensions dialog, paste this repo URL: `https://github.com/GarlichBreadXD/microbit-rgb-16x16-matrix` and press Enter
   - The RGB16Matrix blocks will appear under the category named "RGB16Matrix"

2) Install the userscript (optional for the visual overlay)
   - Install Tampermonkey / Violentmonkey in your browser when you have access.
   - Add the script from `userscript/tampermonkey.user.js` (or copy-paste from the file in this repo).
   - The script runs on makecode.microbit.org and shows a small floating 16x16 display that updates when your program calls the `show()` block.

Example (blocks):
- Use `set pixel x y color` to set a pixel using a hex color string (e.g. "#ff00aa").
- Call `show()` to send the buffer to the simulator/script.

Notes
- The extension sends the pixel data via serial.writeString with a prefix `RGB16:` followed by 3*256 = 768 bytes as a hex string (1536 hex characters). The userscript listens for that and renders the matrix.
- If you can't install Tampermonkey now, you can still use the blocks and they will output the serial data in the simulator console; the visual overlay just needs the userscript later.

Files
- pxt.json - package metadata
- src/ledMatrix.ts - TypeScript blocks implementation
- userscript/tampermonkey.user.js - userscript to render the overlay
- README.md - this file

