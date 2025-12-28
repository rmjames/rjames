import { describe, it, expect } from 'vitest';
import { SVG_PATHS, EQ_CONFIG } from '../../../scripts/media/Constants.js';

describe('Constants', () => {
    it('should export SVG_PATHS with required keys', () => {
        expect(SVG_PATHS).toHaveProperty('PLAY');
        expect(SVG_PATHS).toHaveProperty('PAUSE');
        expect(SVG_PATHS).toHaveProperty('LIKE');
        expect(SVG_PATHS).toHaveProperty('LIKE_FILLED');
    });

    it('should export EQ_CONFIG as an array', () => {
        expect(Array.isArray(EQ_CONFIG)).toBe(true);
        expect(EQ_CONFIG.length).toBeGreaterThan(0);
    });

    it('should have correct structure for EQ_CONFIG items', () => {
        EQ_CONFIG.forEach(item => {
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('freq');
            expect(item).toHaveProperty('type');
        });
    });
});
