export const ColorExtractor = {
    /**
     * Converts RGB to OKLCH color string.
     * Implementation based on OKLCH standard math.
     */

    rgbToOklch(r, g, b) {
        // 1. Normalize RGB to [0, 1]
        r /= 255; g /= 255; b /= 255;

        // 2. Linearize sRGB
        const linearize = (c) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
        r = linearize(r); g = linearize(g); b = linearize(b);

        // 3. Convert to LMS
        const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
        const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
        const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

        // 4. Non-linear LMS
        const l_3 = Math.cbrt(l_);
        const m_3 = Math.cbrt(m_);
        const s_3 = Math.cbrt(s_);

        // 5. Convert to Lab
        const L = 0.2104542553 * l_3 + 0.7936177850 * m_3 - 0.0040720403 * s_3;
        const a = 1.9779984951 * l_3 - 2.4285922050 * m_3 + 0.4505937099 * s_3;
        const b_ = 0.0259040371 * l_3 + 0.7827717662 * m_3 - 0.8086757660 * s_3;

        // 6. Convert Lab to LCH
        const C = Math.sqrt(a * a + b_ * b_);
        let h = Math.atan2(b_, a) * (180 / Math.PI);
        if (h < 0) h += 360;

        // Formatting results
        return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`;
    },

    /**
     * Extracts an accent color from an image URL and returns it as an oklch string.
     * @param {string} imageUrl 
     * @returns {Promise<string>} oklch color string
     */
    async getAccentColor(imageUrl) {
        const DEFAULT_COLOR = 'oklch(0.623 0.214 259.415)'; // Default blue-ish

        if (!imageUrl) return DEFAULT_COLOR;

        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = 10;
                canvas.height = 10;
                ctx.drawImage(img, 0, 0, 10, 10);

                const data = ctx.getImageData(0, 0, 10, 10).data;
                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < data.length; i += 4) {
                    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    if (brightness < 20 || brightness > 235) continue;

                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }

                if (count === 0) {
                    resolve(DEFAULT_COLOR);
                    return;
                }

                const avgR = r / count;
                const avgG = g / count;
                const avgB = b / count;

                resolve(this.rgbToOklch(avgR, avgG, avgB));
            };

            img.onerror = () => resolve(DEFAULT_COLOR);
        });
    }
};
