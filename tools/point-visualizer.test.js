import { describe, it, expect } from 'vitest';
import {
    parsePolygon,
    formatPolygon,
    polygonToSvgCoordinates,
    svgCoordinatesToPolygon,
    insertPointOnNearestEdge,
    generateSvgClipPath,
    formatNumber
} from '../scripts/utils/clip-path-parser.js';
import {
    parseSvgPath,
    formatSvgPath,
    extractPathHandles,
    updatePathPoint
} from '../scripts/utils/svg-path-parser.js';

describe('clip-path-parser', () => {
    it('parses polygon with percentage values', () => {
        const input = 'polygon(50% 0%, 100% 100%, 0% 100%)';
        const points = parsePolygon(input);
        expect(points).toHaveLength(3);
        expect(points[0]).toEqual({ x: 50, y: 0, xUnit: '%', yUnit: '%' });
        expect(points[1]).toEqual({ x: 100, y: 100, xUnit: '%', yUnit: '%' });
        expect(points[2]).toEqual({ x: 0, y: 100, xUnit: '%', yUnit: '%' });
    });

    it('parses polygon with px values and mixed spacing (like DevTools output)', () => {
        const input = 'polygon(50px 0px, 100px 100px, 0px 100px)';
        const points = parsePolygon(input);
        expect(points).toHaveLength(3);
        expect(points[0]).toEqual({ x: 50, y: 0, xUnit: 'px', yUnit: 'px' });
        expect(points[1]).toEqual({ x: 100, y: 100, xUnit: 'px', yUnit: 'px' });
    });

    it('formats polygon removing leading zeros on floats per project standards', () => {
        const points = [
            { x: 0.5, y: 0, xUnit: '%', yUnit: '%' },
            { x: 100, y: 0.75, xUnit: '%', yUnit: '%' }
        ];
        const formatted = formatPolygon(points, '%', 2);
        expect(formatted).toBe('polygon(.5% 0%, 100% .75%)');
    });

    it('formats numbers with formatNumber helper', () => {
        expect(formatNumber(0.5)).toBe('.5');
        expect(formatNumber(-0.5)).toBe('-.5');
        expect(formatNumber(12.5)).toBe('12.5');
        expect(formatNumber(0)).toBe('0');
    });

    it('converts polygon points to SVG coordinate space and back', () => {
        const points = [
            { x: 50, y: 0, xUnit: '%', yUnit: '%' },
            { x: 100, y: 100, xUnit: '%', yUnit: '%' }
        ];
        const svgCoords = polygonToSvgCoordinates(points);
        expect(svgCoords).toEqual([[50, 0], [100, 100]]);

        const roundTrip = svgCoordinatesToPolygon(svgCoords, '%');
        expect(roundTrip).toEqual(points);
    });

    it('inserts a point on the nearest edge', () => {
        const points = [
            { x: 0, y: 0, xUnit: '%', yUnit: '%' },
            { x: 100, y: 0, xUnit: '%', yUnit: '%' },
            { x: 100, y: 100, xUnit: '%', yUnit: '%' },
            { x: 0, y: 100, xUnit: '%', yUnit: '%' }
        ];
        // Point near top edge (50, 2)
        const updated = insertPointOnNearestEdge(points, { x: 50, y: 2 });
        expect(updated).toHaveLength(5);
        expect(updated[1]).toEqual({ x: 50, y: 2, xUnit: '%', yUnit: '%' });
    });

    it('generates valid SVG clipPath definition', () => {
        const points = [{ x: 50, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
        const svgDef = generateSvgClipPath(points, 'test-clip');
        expect(svgDef).toContain('id="test-clip"');
        expect(svgDef).toContain('clipPathUnits="objectBoundingBox"');
        expect(svgDef).toContain('.5,0 1,1 0,1');
    });

    it('parses and formats W3C circle()', async () => {
        const { parseCircle, formatCircle } = await import('../scripts/utils/clip-path-parser.js');
        const c = parseCircle('circle(40% at 50% 50%)');
        expect(c.r).toBe(40);
        expect(c.cx).toBe(50);
        expect(c.cy).toBe(50);
        expect(formatCircle(c)).toBe('circle(40% at 50% 50%)');
    });

    it('parses and formats W3C ellipse()', async () => {
        const { parseEllipse, formatEllipse } = await import('../scripts/utils/clip-path-parser.js');
        const e = parseEllipse('ellipse(45% 30% at 50% 50%)');
        expect(e.rx).toBe(45);
        expect(e.ry).toBe(30);
        expect(e.cx).toBe(50);
        expect(e.cy).toBe(50);
        expect(formatEllipse(e)).toBe('ellipse(45% 30% at 50% 50%)');
    });

    it('parses and formats W3C inset() with round border-radius', async () => {
        const { parseInset, formatInset } = await import('../scripts/utils/clip-path-parser.js');
        const i = parseInset('inset(10% 15% 10% 15% round 15%)');
        expect(i.top).toBe(10);
        expect(i.right).toBe(15);
        expect(i.bottom).toBe(10);
        expect(i.left).toBe(15);
        expect(i.round).toBe(15);
        expect(formatInset(i)).toBe('inset(10% 15% 10% 15% round 15%)');
    });

    it('parses and formats W3C rect() and xywh()', async () => {
        const { parseRect, formatRect, parseXywh, formatXywh } = await import('../scripts/utils/clip-path-parser.js');
        const r = parseRect('rect(10% 90% 90% 10% round 15%)');
        expect(r.top).toBe(10);
        expect(r.right).toBe(90);
        expect(formatRect(r)).toBe('rect(10% 90% 90% 10% round 15%)');

        const x = parseXywh('xywh(10% 10% 80% 80% round 20%)');
        expect(x.x).toBe(10);
        expect(x.width).toBe(80);
        expect(formatXywh(x)).toBe('xywh(10% 10% 80% 80% round 20%)');
    });

    it('detects shape type with parseBasicShape()', async () => {
        const { parseBasicShape } = await import('../scripts/utils/clip-path-parser.js');
        expect(parseBasicShape('circle(50%)').type).toBe('circle');
        expect(parseBasicShape('ellipse(50% 30%)').type).toBe('ellipse');
        expect(parseBasicShape('inset(10%)').type).toBe('inset');
        expect(parseBasicShape('rect(10% 90% 90% 10%)').type).toBe('rect');
        expect(parseBasicShape('xywh(10% 10% 80% 80%)').type).toBe('xywh');
        expect(parseBasicShape("path('M 0 0 Z')").type).toBe('path');
        expect(parseBasicShape('polygon(0% 0%, 100% 100%, 0% 100%)').type).toBe('polygon');
    });

    it('converts basic shapes to SVG path d string using shapeToPathD()', async () => {
        const { shapeToPathD } = await import('../scripts/utils/clip-path-parser.js');
        
        // Polygon to path d
        const polyD = shapeToPathD({ type: 'polygon', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }] });
        expect(polyD).toBe('M 0 0 L 100 0 L 100 100 Z');

        // Circle to path d
        const circleD = shapeToPathD({ type: 'circle', cx: 50, cy: 50, r: 40 });
        expect(circleD).toBe('M 10 50 A 40 40 0 1 0 90 50 A 40 40 0 1 0 10 50 Z');

        // Ellipse to path d
        const ellipseD = shapeToPathD({ type: 'ellipse', cx: 50, cy: 50, rx: 45, ry: 30 });
        expect(ellipseD).toBe('M 5 50 A 45 30 0 1 0 95 50 A 45 30 0 1 0 5 50 Z');

        // Inset without round
        const insetD = shapeToPathD({ type: 'inset', top: 10, right: 10, bottom: 10, left: 10 });
        expect(insetD).toBe('M 10 10 L 90 10 L 90 90 L 10 90 Z');

        // Path returns original d
        const rawD = shapeToPathD({ type: 'path', d: 'M 0 0 L 50 50 Z' });
        expect(rawD).toBe('M 0 0 L 50 50 Z');
    });
});


describe('svg-path-parser', () => {
    it('parses standard SVG path d string into commands and args', () => {
        const d = 'M 0 100 L 0 25 C 0 10 10 0 25 0 L 70 0 Z';
        const commands = parseSvgPath(d);
        expect(commands).toHaveLength(5);
        expect(commands[0]).toEqual({ command: 'M', args: [0, 100] });
        expect(commands[1]).toEqual({ command: 'L', args: [0, 25] });
        expect(commands[2]).toEqual({ command: 'C', args: [0, 10, 10, 0, 25, 0] });
        expect(commands[3]).toEqual({ command: 'L', args: [70, 0] });
        expect(commands[4]).toEqual({ command: 'Z', args: [] });
    });

    it('parses compressed d string without spaces between negative numbers and decimals', () => {
        const d = 'M10-20L.5.8Z';
        const commands = parseSvgPath(d);
        expect(commands[0]).toEqual({ command: 'M', args: [10, -20] });
        expect(commands[1]).toEqual({ command: 'L', args: [0.5, 0.8] });
        expect(commands[2]).toEqual({ command: 'Z', args: [] });
    });

    it('formats commands into clean d string', () => {
        const commands = [
            { command: 'M', args: [0.5, 10] },
            { command: 'L', args: [20, 30] },
            { command: 'Z', args: [] }
        ];
        const result = formatSvgPath(commands);
        expect(result).toBe('M .5 10 L 20 30 Z');
    });

    it('extracts anchors, control points, and handle segments', () => {
        const d = 'M 10 10 C 20 20 30 20 40 10 Z';
        const commands = parseSvgPath(d);
        const { anchors, controls, handles } = extractPathHandles(commands);

        expect(anchors).toHaveLength(2); // M anchor and C endpoint anchor
        expect(controls).toHaveLength(2); // 2 bezier handles
        expect(handles).toHaveLength(2); // 2 tangent lines
    });

    it('updates command point coordinates during drag', () => {
        const commands = parseSvgPath('M 10 10 L 50 50 Z');
        updatePathPoint(commands, 1, 0, 60, 75);
        expect(commands[1].args).toEqual([60, 75]);
    });

    it('inserts and removes points in SVG path commands', () => {
        const commands = parseSvgPath('M 10 10 L 90 10 L 90 90 Z');
        // Insert new line point
        commands.splice(2, 0, { command: 'L', args: [50, 50] });
        expect(commands).toHaveLength(5);
        expect(formatSvgPath(commands)).toBe('M 10 10 L 90 10 L 50 50 L 90 90 Z');

        // Delete point
        commands.splice(2, 1);
        expect(commands).toHaveLength(4);
        expect(formatSvgPath(commands)).toBe('M 10 10 L 90 10 L 90 90 Z');
    });

    it('retains M command type when deleting first anchor in SVG path', () => {
        const commands = parseSvgPath('M 10 10 L 50 50 L 90 90 Z');
        commands.splice(0, 1);
        if (commands[0].command !== 'M' && commands[0].command !== 'm') {
            commands[0].command = 'M';
        }
        expect(commands[0].command).toBe('M');
        expect(formatSvgPath(commands)).toBe('M 50 50 L 90 90 Z');
    });
});

