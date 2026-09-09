/**
 * Parser and generator utilities for all W3C CSS basic-shape functions.
 * Conforms to W3C CSS Shapes Module Level 1 & Level 2 and Baseline 2025:
 * polygon(), circle(), ellipse(), inset(), rect(), xywh(), path()
 */

/**
 * Parses a CSS polygon() string into structured point objects.
 * Supports %, px, rem, or unitless coordinates.
 * @param {string} input 
 * @returns {Array<{x: number, y: number, xUnit: string, yUnit: string}>}
 */
export function parsePolygon(input) {
    if (!input || typeof input !== 'string') return [];

    let cleaned = input.trim();
    const polyMatch = cleaned.match(/polygon\s*\((.*)\)/is);
    if (polyMatch) {
        cleaned = polyMatch[1];
    }

    const rawPairs = cleaned.split(',').map(s => s.trim()).filter(Boolean);
    const points = [];

    for (const pair of rawPairs) {
        const parts = pair.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            const xVal = parseValueWithUnit(parts[0]);
            const yVal = parseValueWithUnit(parts[1]);
            if (xVal !== null && yVal !== null) {
                points.push({
                    x: xVal.value,
                    xUnit: xVal.unit || '%',
                    y: yVal.value,
                    yUnit: yVal.unit || '%'
                });
            }
        }
    }

    return points;
}

/**
 * Parses a CSS circle() string: circle([<radius>]? [at <position>]?)
 * e.g. "circle(40% at 50% 50%)" or "circle(50px at 50px 50px)"
 * @param {string} input 
 * @returns {{type: 'circle', r: number, cx: number, cy: number, rUnit: string, cxUnit: string, cyUnit: string}}
 */
function extractAtPosition(inner, defaultRadius = '40%') {
    let rStr = defaultRadius;
    let atStr = '50% 50%';

    if (inner.includes('at')) {
        const [rPart, atPart] = inner.split(/\bat\b/i).map(s => s.trim());
        if (rPart) rStr = rPart;
        if (atPart) atStr = atPart;
    } else {
        rStr = inner;
    }

    const atParts = atStr.split(/\s+/).filter(Boolean);
    const cxParsed = parseValueWithUnit(atParts[0]) || { value: 50, unit: '%' };
    const cyParsed = parseValueWithUnit(atParts[1]) || { value: 50, unit: '%' };

    return { rStr, cxParsed, cyParsed };
}

export function parseCircle(input) {
    const defaultCircle = { type: 'circle', r: 40, cx: 50, cy: 50, rUnit: '%', cxUnit: '%', cyUnit: '%' };
    if (!input || typeof input !== 'string') return defaultCircle;

    const match = input.match(/circle\s*\((.*)\)/is);
    if (!match) return defaultCircle;

    const inner = match[1].trim();
    if (!inner) return defaultCircle;

    const { rStr, cxParsed, cyParsed } = extractAtPosition(inner, '40%');
    const rParsed = parseValueWithUnit(rStr) || { value: 40, unit: '%' };

    return {
        type: 'circle',
        r: rParsed.value,
        rUnit: rParsed.unit || '%',
        cx: cxParsed.value,
        cxUnit: cxParsed.unit || '%',
        cy: cyParsed.value,
        cyUnit: cyParsed.unit || '%'
    };
}

/**
 * Formats a circle object back to CSS circle(...)
 * @param {{r: number, cx: number, cy: number, rUnit?: string, cxUnit?: string, cyUnit?: string}} c 
 * @returns {string}
 */
export function formatCircle(c) {
    const ru = c.rUnit || '%';
    const cxu = c.cxUnit || '%';
    const cyu = c.cyUnit || '%';
    return `circle(${formatNumber(c.r)}${ru} at ${formatNumber(c.cx)}${cxu} ${formatNumber(c.cy)}${cyu})`;
}

/**
 * Parses a CSS ellipse() string: ellipse([<rx> <ry>]? [at <position>]?)
 * e.g. "ellipse(45% 30% at 50% 50%)"
 * @param {string} input 
 * @returns {{type: 'ellipse', rx: number, ry: number, cx: number, cy: number, rxUnit: string, ryUnit: string, cxUnit: string, cyUnit: string}}
 */
export function parseEllipse(input) {
    const defaultEllipse = { type: 'ellipse', rx: 45, ry: 30, cx: 50, cy: 50, rxUnit: '%', ryUnit: '%', cxUnit: '%', cyUnit: '%' };
    if (!input || typeof input !== 'string') return defaultEllipse;

    const match = input.match(/ellipse\s*\((.*)\)/is);
    if (!match) return defaultEllipse;

    const inner = match[1].trim();
    if (!inner) return defaultEllipse;

    const { rStr, cxParsed, cyParsed } = extractAtPosition(inner, '45% 30%');
    const rParts = rStr.split(/\s+/).filter(Boolean);
    const rxParsed = parseValueWithUnit(rParts[0]) || { value: 45, unit: '%' };
    const ryParsed = parseValueWithUnit(rParts[1]) || { value: 30, unit: '%' };

    return {
        type: 'ellipse',
        rx: rxParsed.value,
        rxUnit: rxParsed.unit || '%',
        ry: ryParsed.value,
        ryUnit: ryParsed.unit || '%',
        cx: cxParsed.value,
        cxUnit: cxParsed.unit || '%',
        cy: cyParsed.value,
        cyUnit: cyParsed.unit || '%'
    };
}

/**
 * Formats an ellipse object back to CSS ellipse(...)
 * @param {{rx: number, ry: number, cx: number, cy: number, rxUnit?: string, ryUnit?: string, cxUnit?: string, cyUnit?: string}} e 
 * @returns {string}
 */
export function formatEllipse(e) {
    const rxu = e.rxUnit || '%';
    const ryu = e.ryUnit || '%';
    const cxu = e.cxUnit || '%';
    const cyu = e.cyUnit || '%';
    return `ellipse(${formatNumber(e.rx)}${rxu} ${formatNumber(e.ry)}${ryu} at ${formatNumber(e.cx)}${cxu} ${formatNumber(e.cy)}${cyu})`;
}

function extractRoundPart(inner) {
    let offsetsStr = inner;
    let roundVal = null;
    let roundUnit = '%';

    if (inner.includes('round')) {
        const [oPart, rPart] = inner.split(/\bround\b/i).map(s => s.trim());
        offsetsStr = oPart;
        const rParsed = parseValueWithUnit(rPart);
        if (rParsed) {
            roundVal = rParsed.value;
            roundUnit = rParsed.unit || '%';
        }
    }

    return { offsetsStr, roundVal, roundUnit };
}

function formatRoundPart(round, roundUnit = '%') {
    return round ? ` round ${formatNumber(round)}${roundUnit}` : '';
}

/**
 * Parses a CSS inset() string: inset(<shape-arg>{1,4} [round <radius>]?)
 * e.g. "inset(10% 15% 10% 15% round 15px)" or "inset(10%)"
 * @param {string} input 
 * @returns {{type: 'inset', top: number, right: number, bottom: number, left: number, round?: number, unit: string, roundUnit: string}}
 */
export function parseInset(input) {
    const defaultInset = { type: 'inset', top: 10, right: 10, bottom: 10, left: 10, round: 10, unit: '%', roundUnit: '%' };
    if (!input || typeof input !== 'string') return defaultInset;

    const match = input.match(/inset\s*\((.*)\)/is);
    if (!match) return defaultInset;

    const inner = match[1].trim();
    if (!inner) return defaultInset;

    const { offsetsStr, roundVal, roundUnit } = extractRoundPart(inner);
    const parts = offsetsStr.split(/\s+/).filter(Boolean).map(parseValueWithUnit).filter(Boolean);
    let top = 10, right = 10, bottom = 10, left = 10, unit = '%';

    if (parts.length === 1) {
        top = right = bottom = left = parts[0].value;
        unit = parts[0].unit || '%';
    } else if (parts.length === 2) {
        top = bottom = parts[0].value;
        right = left = parts[1].value;
        unit = parts[0].unit || '%';
    } else if (parts.length === 3) {
        top = parts[0].value;
        right = left = parts[1].value;
        bottom = parts[2].value;
        unit = parts[0].unit || '%';
    } else if (parts.length >= 4) {
        top = parts[0].value;
        right = parts[1].value;
        bottom = parts[2].value;
        left = parts[3].value;
        unit = parts[0].unit || '%';
    }

    return {
        type: 'inset',
        top,
        right,
        bottom,
        left,
        round: roundVal !== null ? roundVal : 10,
        unit,
        roundUnit
    };
}

/**
 * Formats an inset object to CSS inset(...)
 * @param {{top: number, right: number, bottom: number, left: number, round?: number, unit?: string, roundUnit?: string}} i 
 * @returns {string}
 */
export function formatInset(i) {
    const u = i.unit || '%';
    const t = `${formatNumber(i.top)}${u}`;
    const r = `${formatNumber(i.right)}${u}`;
    const b = `${formatNumber(i.bottom)}${u}`;
    const l = `${formatNumber(i.left)}${u}`;
    return `inset(${t} ${r} ${b} ${l}${formatRoundPart(i.round, i.roundUnit)})`;
}

/**
 * Parses a CSS rect() string: rect(<top> <right> <bottom> <left> [round <radius>]?)
 * W3C CSS Shapes Module Level 2
 * @param {string} input 
 * @returns {{type: 'rect', top: number, right: number, bottom: number, left: number, round?: number, unit: string, roundUnit: string}}
 */
export function parseRect(input) {
    const defaultRect = { type: 'rect', top: 10, right: 90, bottom: 90, left: 10, round: 10, unit: '%', roundUnit: '%' };
    if (!input || typeof input !== 'string') return defaultRect;

    const match = input.match(/rect\s*\((.*)\)/is);
    if (!match) return defaultRect;

    const inner = match[1].trim();
    const { offsetsStr, roundVal, roundUnit } = extractRoundPart(inner);
    const parts = offsetsStr.split(/\s+/).filter(Boolean).map(parseValueWithUnit).filter(Boolean);
    if (parts.length >= 4) {
        return {
            type: 'rect',
            top: parts[0].value,
            right: parts[1].value,
            bottom: parts[2].value,
            left: parts[3].value,
            round: roundVal !== null ? roundVal : 10,
            unit: parts[0].unit || '%',
            roundUnit
        };
    }
    return defaultRect;
}

/**
 * Formats a rect object to CSS rect(...)
 * @param {{top: number, right: number, bottom: number, left: number, round?: number, unit?: string, roundUnit?: string}} r 
 * @returns {string}
 */
export function formatRect(r) {
    const u = r.unit || '%';
    return `rect(${formatNumber(r.top)}${u} ${formatNumber(r.right)}${u} ${formatNumber(r.bottom)}${u} ${formatNumber(r.left)}${u}${formatRoundPart(r.round, r.roundUnit)})`;
}

/**
 * Parses a CSS xywh() string: xywh(<x> <y> <width> <height> [round <radius>]?)
 * W3C CSS Shapes Module Level 2 & Baseline 2024
 * @param {string} input 
 * @returns {{type: 'xywh', x: number, y: number, width: number, height: number, round?: number, unit: string, roundUnit: string}}
 */
export function parseXywh(input) {
    const defaultXywh = { type: 'xywh', x: 10, y: 10, width: 80, height: 80, round: 10, unit: '%', roundUnit: '%' };
    if (!input || typeof input !== 'string') return defaultXywh;

    const match = input.match(/xywh\s*\((.*)\)/is);
    if (!match) return defaultXywh;

    const inner = match[1].trim();
    const { offsetsStr: coordsStr, roundVal, roundUnit } = extractRoundPart(inner);
    const parts = coordsStr.split(/\s+/).filter(Boolean).map(parseValueWithUnit).filter(Boolean);
    if (parts.length >= 4) {
        return {
            type: 'xywh',
            x: parts[0].value,
            y: parts[1].value,
            width: parts[2].value,
            height: parts[3].value,
            round: roundVal !== null ? roundVal : 10,
            unit: parts[0].unit || '%',
            roundUnit
        };
    }
    return defaultXywh;
}

/**
 * Formats an xywh object to CSS xywh(...)
 * @param {{x: number, y: number, width: number, height: number, round?: number, unit?: string, roundUnit?: string}} x 
 * @returns {string}
 */
export function formatXywh(x) {
    const u = x.unit || '%';
    return `xywh(${formatNumber(x.x)}${u} ${formatNumber(x.y)}${u} ${formatNumber(x.width)}${u} ${formatNumber(x.height)}${u}${formatRoundPart(x.round, x.roundUnit)})`;
}

/**
 * Detects and parses any W3C basic shape from string.
 * @param {string} input 
 * @returns {{type: string, [key: string]: any}}
 */
export function parseBasicShape(input) {
    if (!input || typeof input !== 'string') return { type: 'polygon', points: [] };
    const trimmed = input.trim();
    if (trimmed.startsWith('circle')) return parseCircle(trimmed);
    if (trimmed.startsWith('ellipse')) return parseEllipse(trimmed);
    if (trimmed.startsWith('inset')) return parseInset(trimmed);
    if (trimmed.startsWith('rect')) return parseRect(trimmed);
    if (trimmed.startsWith('xywh')) return parseXywh(trimmed);
    if (trimmed.startsWith('path')) {
        const m = trimmed.match(/path\s*\(\s*['"]?(.*?)['"]?\s*\)/is);
        return { type: 'path', d: m ? m[1] : '' };
    }
    return { type: 'polygon', points: parsePolygon(trimmed) };
}

/**
 * Helper to parse a number and unit from a string like "50%", "100px", "0.5", "0"
 * @param {string} str 
 * @returns {{value: number, unit: string} | null}
 */
export function parseValueWithUnit(str) {
    if (!str) return null;
    const match = str.trim().match(/^(-?\d*\.?\d+)(%|px|rem|ch|vw|vh|vmin|vmax)?$/);
    if (!match) return null;
    const value = parseFloat(match[1]);
    if (Number.isNaN(value)) return null;
    return {
        value,
        unit: match[2] || ''
    };
}

/**
 * Formats points into a clean CSS polygon() string.
 * @param {Array<{x: number, y: number, xUnit?: string, yUnit?: string}>} points 
 * @param {string} [overrideUnit] 
 * @param {number} [precision=1] 
 * @returns {string}
 */
export function formatPolygon(points, overrideUnit = null, precision = 1) {
    if (!Array.isArray(points) || points.length === 0) return 'polygon()';

    const formattedPoints = points.map(pt => {
        const xu = overrideUnit !== null ? overrideUnit : (pt.xUnit || '%');
        const yu = overrideUnit !== null ? overrideUnit : (pt.yUnit || '%');

        const xRounded = roundToPrecision(pt.x, precision);
        const yRounded = roundToPrecision(pt.y, precision);

        const xStr = formatNumber(xRounded) + xu;
        const yStr = formatNumber(yRounded) + yu;
        return `${xStr} ${yStr}`;
    });

    return `polygon(${formattedPoints.join(', ')})`;
}

/**
 * Formats a number removing preceding zeros on decimals (e.g. 0.5 -> .5, -0.5 -> -.5).
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
    if (num === 0) return '0';
    let s = num.toString();
    if (s.startsWith('0.')) {
        s = s.slice(1);
    } else if (s.startsWith('-0.')) {
        s = '-' + s.slice(2);
    }
    return s;
}

function roundToPrecision(num, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}

/**
 * Converts polygon points to standard normalized SVG coordinates (0-100 viewBox).
 * @param {Array<{x: number, y: number, xUnit: string, yUnit: string}>} points 
 * @param {{width: number, height: number}} viewBox 
 * @returns {Array<[number, number]>}
 */
export function polygonToSvgCoordinates(points, viewBox = { width: 100, height: 100 }) {
    return points.map(pt => {
        let x = pt.x;
        let y = pt.y;

        if (pt.xUnit === 'px') {
            x = (pt.x / viewBox.width) * 100;
        }
        if (pt.yUnit === 'px') {
            y = (pt.y / viewBox.height) * 100;
        }

        return [x, y];
    });
}

/**
 * Converts SVG coordinate points (0-100) back to polygon points with requested unit.
 * @param {Array<[number, number]>} svgPoints 
 * @param {string} [unit='%'] 
 * @param {{width: number, height: number}} viewBox 
 * @returns {Array<{x: number, y: number, xUnit: string, yUnit: string}>}
 */
export function svgCoordinatesToPolygon(svgPoints, unit = '%', viewBox = { width: 100, height: 100 }) {
    return svgPoints.map(([x, y]) => {
        let finalX = x;
        let finalY = y;
        if (unit === 'px') {
            finalX = (x / 100) * viewBox.width;
            finalY = (y / 100) * viewBox.height;
        }
        return {
            x: finalX,
            y: finalY,
            xUnit: unit,
            yUnit: unit
        };
    });
}

/**
 * Inserts a new point onto the polygon along the closest line segment.
 * @param {Array<{x: number, y: number, xUnit: string, yUnit: string}>} points 
 * @param {{x: number, y: number, xUnit?: string, yUnit?: string}} newPt 
 * @returns {Array<{x: number, y: number, xUnit: string, yUnit: string}>}
 */
export function insertPointOnNearestEdge(points, newPt) {
    if (!points || points.length < 2) return [...(points || []), newPt];

    let bestDist = Infinity;
    let bestIndex = points.length;

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];

        const dist = distToSegmentSquared(newPt.x, newPt.y, p1.x, p1.y, p2.x, p2.y);
        if (dist < bestDist) {
            bestDist = dist;
            bestIndex = i + 1;
        }
    }

    const next = [...points];
    next.splice(bestIndex, 0, {
        x: newPt.x,
        y: newPt.y,
        xUnit: newPt.xUnit || points[0].xUnit || '%',
        yUnit: newPt.yUnit || points[0].yUnit || '%'
    });
    return next;
}

function distToSegmentSquared(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return (px - projX) * (px - projX) + (py - projY) * (py - projY);
}

/**
 * Preset shapes for quick prototyping and inspiration across all W3C shapes.
 */
export const CLIP_PATH_PRESETS = {
    // Polygon Presets
    tab: {
        name: 'Tab Silhouette',
        value: 'polygon(0% 25%, 25% 0%, 70% 0%, 100% 100%, 0% 100%)'
    },
    slantedCard: {
        name: 'Slanted Card',
        value: 'polygon(0% 0%, 90% 0%, 100% 100%, 10% 100%)'
    },
    chevron: {
        name: 'Chevron',
        value: 'polygon(100% 0%, 75% 50%, 100% 100%, 25% 100%, 0% 50%, 25% 0%)'
    },
    hexagon: {
        name: 'Hexagon',
        value: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
    },
    octagon: {
        name: 'Octagon',
        value: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
    },
    star: {
        name: 'Star',
        value: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
    },
    messageBubble: {
        name: 'Message Bubble',
        value: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)'
    },
    ticket: {
        name: 'Ticket Cutout',
        value: 'polygon(0% 0%, 100% 0%, 100% 40%, 90% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, 10% 50%, 0% 40%)'
    },
    triangle: {
        name: 'Triangle',
        value: 'polygon(50% 0%, 0% 100%, 100% 100%)'
    },
    trapezoid: {
        name: 'Trapezoid',
        value: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
    },
    pentagon: {
        name: 'Pentagon',
        value: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
    },
    rhombus: {
        name: 'Rhombus',
        value: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
    },
    // Circle Presets
    circleCenter: {
        name: 'Circle (Center)',
        value: 'circle(40% at 50% 50%)'
    },
    circleCorner: {
        name: 'Circle (Corner Spot)',
        value: 'circle(50% at 0% 0%)'
    },
    // Ellipse Presets
    ellipseCenter: {
        name: 'Ellipse (Horizontal)',
        value: 'ellipse(45% 30% at 50% 50%)'
    },
    ellipsePill: {
        name: 'Ellipse (Vertical)',
        value: 'ellipse(30% 45% at 50% 50%)'
    },
    // Inset Presets
    insetCard: {
        name: 'Inset Card (Round 15%)',
        value: 'inset(10% 15% 10% 15% round 15%)'
    },
    insetChamfer: {
        name: 'Inset Square (Round 25%)',
        value: 'inset(10% round 25%)'
    },
    // Rect Presets (W3C Shapes 2)
    rectFrame: {
        name: 'Rect Frame',
        value: 'rect(10% 90% 90% 10% round 15%)'
    },
    // XYWH Presets (W3C Shapes 2 / Baseline 2024)
    xywhBadge: {
        name: 'XYWH Badge',
        value: 'xywh(10% 10% 80% 80% round 20%)'
    },
    // Path Preset
    pathTab: {
        name: 'Path Tab Silhouette',
        value: "path('M 0 100 L 0 25 C 0 10 10 0 25 0 L 65 0 C 72 0 78 4 82 10 L 100 100 Z')"
    }
};

/**
 * Generates an SVG <clipPath> definition with objectBoundingBox for responsive vector masks.
 * @param {Array<{x: number, y: number}>} points In 0-100 or % scale
 * @param {string} [id='custom-clip'] 
 * @returns {string}
 */
export function generateSvgClipPath(points, id = 'custom-clip') {
    const ptsStr = points.map(pt => {
        const xNorm = roundToPrecision(pt.x / 100, 3);
        const yNorm = roundToPrecision(pt.y / 100, 3);
        return `${formatNumber(xNorm)},${formatNumber(yNorm)}`;
    }).join(' ');

    return `<svg width="0" height="0" class="clip-defs" aria-hidden="true">
  <defs>
    <clipPath id="${id}" clipPathUnits="objectBoundingBox">
      <polygon points="${ptsStr}" />
    </clipPath>
  </defs>
</svg>`;
}

/**
 * Converts any structured W3C basic shape object into a standard SVG path `d` attribute string.
 * @param {{type: string, [key: string]: any}} shapeData 
 * @param {number} [precision=1]
 * @returns {string}
 */
export function shapeToPathD(shapeData, precision = 1) {
    if (!shapeData || !shapeData.type) return '';

    if (shapeData.type === 'path') {
        return shapeData.d || '';
    }

    if (shapeData.type === 'polygon') {
        const pts = shapeData.points || [];
        if (pts.length === 0) return '';
        const coords = pts.map(p => `${formatNumber(roundToPrecision(p.x, precision))} ${formatNumber(roundToPrecision(p.y, precision))}`);
        return `M ${coords.join(' L ')} Z`;
    }

    if (shapeData.type === 'circle') {
        const cx = roundToPrecision(shapeData.cx ?? 50, precision);
        const cy = roundToPrecision(shapeData.cy ?? 50, precision);
        const r = roundToPrecision(shapeData.r ?? 40, precision);
        const left = formatNumber(cx - r);
        const right = formatNumber(cx + r);
        const top = formatNumber(cy);
        const rStr = formatNumber(r);
        return `M ${left} ${top} A ${rStr} ${rStr} 0 1 0 ${right} ${top} A ${rStr} ${rStr} 0 1 0 ${left} ${top} Z`;
    }

    if (shapeData.type === 'ellipse') {
        const cx = roundToPrecision(shapeData.cx ?? 50, precision);
        const cy = roundToPrecision(shapeData.cy ?? 50, precision);
        const rx = roundToPrecision(shapeData.rx ?? 45, precision);
        const ry = roundToPrecision(shapeData.ry ?? 30, precision);
        const left = formatNumber(cx - rx);
        const right = formatNumber(cx + rx);
        const top = formatNumber(cy);
        const rxStr = formatNumber(rx);
        const ryStr = formatNumber(ry);
        return `M ${left} ${top} A ${rxStr} ${ryStr} 0 1 0 ${right} ${top} A ${rxStr} ${ryStr} 0 1 0 ${left} ${top} Z`;
    }

    let left = 0;
    let top = 0;
    let right = 100;
    let bottom = 100;
    let roundVal = 0;

    if (shapeData.type === 'inset') {
        top = roundToPrecision(shapeData.top ?? 10, precision);
        right = roundToPrecision(100 - (shapeData.right ?? 10), precision);
        bottom = roundToPrecision(100 - (shapeData.bottom ?? 10), precision);
        left = roundToPrecision(shapeData.left ?? 10, precision);
        roundVal = shapeData.round ? roundToPrecision(shapeData.round, precision) : 0;
    } else if (shapeData.type === 'rect') {
        top = roundToPrecision(shapeData.top ?? 10, precision);
        right = roundToPrecision(shapeData.right ?? 90, precision);
        bottom = roundToPrecision(shapeData.bottom ?? 90, precision);
        left = roundToPrecision(shapeData.left ?? 10, precision);
        roundVal = shapeData.round ? roundToPrecision(shapeData.round, precision) : 0;
    } else if (shapeData.type === 'xywh') {
        left = roundToPrecision(shapeData.x ?? 10, precision);
        top = roundToPrecision(shapeData.y ?? 10, precision);
        const w = roundToPrecision(shapeData.width ?? shapeData.w ?? 80, precision);
        const h = roundToPrecision(shapeData.height ?? shapeData.h ?? 80, precision);
        right = roundToPrecision(left + w, precision);
        bottom = roundToPrecision(top + h, precision);
        roundVal = shapeData.round ? roundToPrecision(shapeData.round, precision) : 0;
    }

    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    const r = roundVal > 0 ? Math.min(roundVal, width / 2, height / 2) : 0;

    if (r > 0) {
        const rStr = formatNumber(r);
        return `M ${formatNumber(left + r)} ${formatNumber(top)} ` +
            `L ${formatNumber(right - r)} ${formatNumber(top)} ` +
            `A ${rStr} ${rStr} 0 0 1 ${formatNumber(right)} ${formatNumber(top + r)} ` +
            `L ${formatNumber(right)} ${formatNumber(bottom - r)} ` +
            `A ${rStr} ${rStr} 0 0 1 ${formatNumber(right - r)} ${formatNumber(bottom)} ` +
            `L ${formatNumber(left + r)} ${formatNumber(bottom)} ` +
            `A ${rStr} ${rStr} 0 0 1 ${formatNumber(left)} ${formatNumber(bottom - r)} ` +
            `L ${formatNumber(left)} ${formatNumber(top + r)} ` +
            `A ${rStr} ${rStr} 0 0 1 ${formatNumber(left + r)} ${formatNumber(top)} Z`;
    }

    return `M ${formatNumber(left)} ${formatNumber(top)} ` +
        `L ${formatNumber(right)} ${formatNumber(top)} ` +
        `L ${formatNumber(right)} ${formatNumber(bottom)} ` +
        `L ${formatNumber(left)} ${formatNumber(bottom)} Z`;
}

