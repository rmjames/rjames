import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ColorExtractor } from '../../../scripts/media/ColorExtractor.js';

describe('ColorExtractor', () => {
    describe('rgbToOklch', () => {
        it('should convert black correctly', () => {
            // roughly
            const result = ColorExtractor.rgbToOklch(0, 0, 0);
            expect(result).toMatch(/oklch\(0\.000 0\.000 .*\)/);
        });

        it('should convert white correctly', () => {
            const result = ColorExtractor.rgbToOklch(255, 255, 255);
            expect(result).toMatch(/oklch\(1\.000 0\.000 .*\)/);
        });
    });

    describe('getAccentColor', () => {
        let originalImage;
        let mockContext;
        let mockGetContext;

        beforeEach(() => {
            // Mock Canvas Context
            mockContext = {
                drawImage: vi.fn(),
                getImageData: vi.fn().mockReturnValue({
                    data: new Uint8ClampedArray(400) // 10x10 * 4
                })
            };

            mockGetContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

            // Mock Image
            originalImage = global.Image;
            global.Image = class {
                constructor() {
                    this.onload = null;
                    this.onerror = null;
                    this.src = '';
                    setTimeout(() => {
                        if (this.src === 'error.jpg') {
                            if (this.onerror) this.onerror();
                        } else {
                            if (this.onload) this.onload();
                        }
                    }, 0);
                }
            };
        });

        afterEach(() => {
            global.Image = originalImage;
            mockGetContext.mockRestore();
        });

        it('should return default color if no imageUrl provided', async () => {
            const color = await ColorExtractor.getAccentColor(null);
            expect(color).toBe('oklch(0.623 0.214 259.415)');
        });

        it('should return default color on image error', async () => {
            const color = await ColorExtractor.getAccentColor('error.jpg');
            expect(color).toBe('oklch(0.623 0.214 259.415)');
        });

        it('should calculate color from image data', async () => {
            // Mock image data to be all red
            const redPixel = [255, 0, 0, 255];
            const data = new Uint8ClampedArray(400); // 100 pixels * 4
            for (let i = 0; i < 400; i += 4) {
                data[i] = redPixel[0];
                data[i+1] = redPixel[1];
                data[i+2] = redPixel[2];
                data[i+3] = redPixel[3];
            }

            mockContext.getImageData.mockReturnValue({ data });

            const color = await ColorExtractor.getAccentColor('test.jpg');
            // We expect a valid oklch string
            expect(color).toContain('oklch(');
            expect(mockContext.drawImage).toHaveBeenCalled();
        });

        it('should ignore very dark or very bright pixels', async () => {
             // Mock image data: half black (dark), half white (bright)
             // brightness calculation: (r+g+b)/3
             // Black: 0 < 20 (ignored)
             // White: 255 > 235 (ignored)
             // So count should be 0 -> returns default color

             const data = new Uint8ClampedArray(400);
             for (let i = 0; i < 200; i += 4) { // Black
                 data[i] = 0; data[i+1] = 0; data[i+2] = 0; data[i+3] = 255;
             }
             for (let i = 200; i < 400; i += 4) { // White
                data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255;
            }

            mockContext.getImageData.mockReturnValue({ data });

            const color = await ColorExtractor.getAccentColor('contrast.jpg');
            expect(color).toBe('oklch(0.623 0.214 259.415)');
        });
    });
});
