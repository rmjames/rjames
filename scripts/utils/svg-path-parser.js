/**
 * SVG Path `d` attribute tokenizer, parser, and serializer.
 * Conforms to W3C SVG 2 / Baseline 2025 standards.
 */

import { formatNumber } from './clip-path-parser.js';

/**
 * Expected argument count per command letter.
 */
const EXPECTED_ARG_COUNT = {
    M: 2, m: 2,
    L: 2, l: 2,
    H: 1, h: 1,
    V: 1, v: 1,
    C: 6, c: 6,
    S: 4, s: 4,
    Q: 4, q: 4,
    T: 2, t: 2,
    A: 7, a: 7,
    Z: 0, z: 0
};

/**
 * Tokenizes and parses an SVG path `d` string into an array of command objects.
 * Handles commas, whitespace, scientific notation, and concatenated signs (e.g. 10-20, .5.8).
 * @param {string} d 
 * @returns {Array<{command: string, args: number[]}>}
 */
export function parseSvgPath(d) {
    if (!d || typeof d !== 'string') return [];

    const commands = [];
    // Match command letter followed by any parameters until next command letter
    // Exclude 'e' and 'E' from command letters so scientific notation is preserved
    const segmentRegex = /([a-df-z])([^a-df-z]*)/gi;
    const numRegex = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;

    let match;
    while ((match = segmentRegex.exec(d)) !== null) {
        let cmd = match[1];
        const argStr = match[2];
        const args = [];
        let numMatch;
        while ((numMatch = numRegex.exec(argStr)) !== null) {
            args.push(parseFloat(numMatch[0]));
        }

        const expected = EXPECTED_ARG_COUNT[cmd] ?? 0;
        if (expected === 0) {
            commands.push({ command: cmd, args: [] });
        } else {
            let offset = 0;
            if (args.length === 0) {
                // Command with no args provided
                commands.push({ command: cmd, args: [] });
            } else {
                while (offset < args.length) {
                    const chunk = args.slice(offset, offset + expected);
                    commands.push({ command: cmd, args: chunk });
                    offset += expected;
                    // If M or m has extra argument tuples, implicit L or l follows
                    if (cmd === 'M') cmd = 'L';
                    else if (cmd === 'm') cmd = 'l';
                }
            }
        }
    }

    return commands;
}

/**
 * Serializes command objects back into a clean, formatted SVG path `d` string.
 * Uses project standard formatNumber to eliminate leading zeros on decimals.
 * @param {Array<{command: string, args: number[]}>} commands 
 * @param {number} [precision=2] 
 * @returns {string}
 */
export function formatSvgPath(commands, precision = 2) {
    if (!Array.isArray(commands) || commands.length === 0) return '';

    const factor = Math.pow(10, precision);

    return commands.map(item => {
        if (!item.args || item.args.length === 0) {
            return item.command;
        }
        const formattedArgs = item.args.map(arg => {
            const rounded = Math.round(arg * factor) / factor;
            return formatNumber(rounded);
        });
        return `${item.command} ${formattedArgs.join(' ')}`;
    }).join(' ');
}

/**
 * Extracts editable visual handles (anchors, control handles, and connecting lines) from parsed commands.
 * Converts any relative commands to an absolute visualization representation for editing.
 * @param {Array<{command: string, args: number[]}>} commands 
 * @returns {{
 *   anchors: Array<{id: string, cmdIndex: number, argIndex: number, x: number, y: number, type: 'anchor'}>,
 *   controls: Array<{id: string, cmdIndex: number, argIndex: number, x: number, y: number, anchorId: string, type: 'control'}>,
 *   handles: Array<{x1: number, y1: number, x2: number, y2: number}>
 * }}
 */
export function extractPathHandles(commands) {
    const anchors = [];
    const controls = [];
    const handles = [];

    let currentX = 0;
    let currentY = 0;

    commands.forEach((cmdObj, cmdIndex) => {
        const cmd = cmdObj.command;
        const args = cmdObj.args;
        if (!args || args.length === 0) return;

        const isRelative = cmd === cmd.toLowerCase();
        const type = cmd.toUpperCase();

        if (type === 'M' || type === 'L') {
            const x = isRelative ? currentX + args[0] : args[0];
            const y = isRelative ? currentY + args[1] : args[1];
            anchors.push({
                id: `a-${cmdIndex}-0`,
                cmdIndex,
                argIndex: 0,
                x,
                y,
                type: 'anchor'
            });
            currentX = x;
            currentY = y;
        } else if (type === 'H') {
            const x = isRelative ? currentX + args[0] : args[0];
            anchors.push({
                id: `a-${cmdIndex}-0`,
                cmdIndex,
                argIndex: 0,
                x,
                y: currentY,
                type: 'anchor'
            });
            currentX = x;
        } else if (type === 'V') {
            const y = isRelative ? currentY + args[0] : args[0];
            anchors.push({
                id: `a-${cmdIndex}-0`,
                cmdIndex,
                argIndex: 0,
                x: currentX,
                y,
                type: 'anchor'
            });
            currentY = y;
        } else if (type === 'C') {
            // C cp1x cp1y, cp2x cp2y, x y
            const cp1x = isRelative ? currentX + args[0] : args[0];
            const cp1y = isRelative ? currentY + args[1] : args[1];
            const cp2x = isRelative ? currentX + args[2] : args[2];
            const cp2y = isRelative ? currentY + args[3] : args[3];
            const ax = isRelative ? currentX + args[4] : args[4];
            const ay = isRelative ? currentY + args[5] : args[5];

            const anchorId = `a-${cmdIndex}-4`;

            controls.push({
                id: `c-${cmdIndex}-0`,
                cmdIndex,
                argIndex: 0,
                x: cp1x,
                y: cp1y,
                anchorId: `prev`,
                type: 'control'
            });
            handles.push({ x1: currentX, y1: currentY, x2: cp1x, y2: cp1y });

            controls.push({
                id: `c-${cmdIndex}-2`,
                cmdIndex,
                argIndex: 2,
                x: cp2x,
                y: cp2y,
                anchorId,
                type: 'control'
            });
            handles.push({ x1: ax, y1: ay, x2: cp2x, y2: cp2y });

            anchors.push({
                id: anchorId,
                cmdIndex,
                argIndex: 4,
                x: ax,
                y: ay,
                type: 'anchor'
            });

            currentX = ax;
            currentY = ay;
        } else if (type === 'S') {
            // S cp2x cp2y, x y
            const cp2x = isRelative ? currentX + args[0] : args[0];
            const cp2y = isRelative ? currentY + args[1] : args[1];
            const ax = isRelative ? currentX + args[2] : args[2];
            const ay = isRelative ? currentY + args[3] : args[3];

            const anchorId = `a-${cmdIndex}-2`;
            controls.push({
                id: `c-${cmdIndex}-0`,
                cmdIndex,
                argIndex: 0,
                x: cp2x,
                y: cp2y,
                anchorId,
                type: 'control'
            });
            handles.push({ x1: ax, y1: ay, x2: cp2x, y2: cp2y });

            anchors.push({
                id: anchorId,
                cmdIndex,
                argIndex: 2,
                x: ax,
                y: ay,
                type: 'anchor'
            });
            currentX = ax;
            currentY = ay;
        } else if (type === 'Q') {
            // Q cpx cpy, x y
            const cpx = isRelative ? currentX + args[0] : args[0];
            const cpy = isRelative ? currentY + args[1] : args[1];
            const ax = isRelative ? currentX + args[2] : args[2];
            const ay = isRelative ? currentY + args[3] : args[3];

            const anchorId = `a-${cmdIndex}-2`;
            controls.push({
                id: `c-${cmdIndex}-0`,
                cmdIndex,
                argIndex: 0,
                x: cpx,
                y: cpy,
                anchorId,
                type: 'control'
            });
            handles.push({ x1: currentX, y1: currentY, x2: cpx, y2: cpy });
            handles.push({ x1: ax, y1: ay, x2: cpx, y2: cpy });

            anchors.push({
                id: anchorId,
                cmdIndex,
                argIndex: 2,
                x: ax,
                y: ay,
                type: 'anchor'
            });
            currentX = ax;
            currentY = ay;
        } else if (type === 'A') {
            // A rx ry x-axis-rotation large-arc sweep x y
            const ax = isRelative ? currentX + args[5] : args[5];
            const ay = isRelative ? currentY + args[6] : args[6];
            anchors.push({
                id: `a-${cmdIndex}-5`,
                cmdIndex,
                argIndex: 5,
                x: ax,
                y: ay,
                type: 'anchor'
            });
            currentX = ax;
            currentY = ay;
        }
    });

    return { anchors, controls, handles };
}

/**
 * Updates a point in the command set when dragged.
 * @param {Array<{command: string, args: number[]}>} commands 
 * @param {number} cmdIndex 
 * @param {number} argIndex 
 * @param {number} newX 
 * @param {number} newY 
 */
export function updatePathPoint(commands, cmdIndex, argIndex, newX, newY) {
    if (!commands[cmdIndex] || !commands[cmdIndex].args) return;
    const cmd = commands[cmdIndex].command;
    const type = cmd.toUpperCase();

    if (type === 'H') {
        commands[cmdIndex].args[0] = newX;
    } else if (type === 'V') {
        commands[cmdIndex].args[0] = newY;
    } else {
        commands[cmdIndex].args[argIndex] = newX;
        commands[cmdIndex].args[argIndex + 1] = newY;
    }
}

/**
 * Standard presets for SVG paths.
 */
export const SVG_PATH_PRESETS = {
    tabShape: {
        name: 'Tab Silhouette (Attachment)',
        d: 'M 0 100 L 0 25 C 0 10 10 0 25 0 L 65 0 C 72 0 78 4 82 10 L 100 100 Z'
    },
    heart: {
        name: 'Heart',
        d: 'M 50 85 C 20 65 5 45 5 25 C 5 10 18 0 32 0 C 40 0 47 5 50 12 C 53 5 60 0 68 0 C 82 0 95 10 95 25 C 95 45 80 65 50 85 Z'
    },
    cloud: {
        name: 'Cloud',
        d: 'M 25 80 L 75 80 C 88 80 98 70 98 57 C 98 45 89 36 78 35 C 76 20 62 10 47 10 C 34 10 23 18 19 30 C 9 32 2 41 2 52 C 2 67 12 80 25 80 Z'
    },
    star: {
        name: 'Star',
        d: 'M 50 5 L 63 35 L 95 38 L 71 58 L 78 90 L 50 73 L 22 90 L 29 58 L 5 38 L 37 35 Z'
    },
    shield: {
        name: 'Shield / Badge',
        d: 'M 50 5 L 90 20 L 90 55 C 90 75 72 90 50 98 C 28 90 10 75 10 55 L 10 20 Z'
    },
    wave: {
        name: 'Smooth Wave',
        d: 'M 0 50 C 25 20 25 80 50 50 C 75 20 75 80 100 50 L 100 100 L 0 100 Z'
    },
    speechBubble: {
        name: 'Speech Bubble',
        d: 'M 10 10 L 90 10 C 95 10 98 13 98 18 L 98 62 C 98 67 95 70 90 70 L 40 70 L 20 90 L 25 70 L 10 70 C 5 70 2 67 2 62 L 2 18 C 2 13 5 10 10 10 Z'
    }
};
