import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, brighten, darken, withAlpha } from './constants';

describe('color utilities', () => {
  describe('hexToRgb', () => {
    it('parses white', () => {
      expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    });

    it('parses black', () => {
      expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    });

    it('parses orange', () => {
      expect(hexToRgb('#E67E22')).toEqual([230, 126, 34]);
    });
  });

  describe('rgbToHex', () => {
    it('converts white', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('converts black', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('round-trips with hexToRgb', () => {
      const hex = '#e67e22';
      const [r, g, b] = hexToRgb(hex);
      expect(rgbToHex(r, g, b)).toBe(hex);
    });
  });

  describe('brighten', () => {
    it('brightens black towards white', () => {
      const result = brighten('#000000', 0.5);
      const [r, g, b] = hexToRgb(result);
      expect(r).toBe(128);
      expect(g).toBe(128);
      expect(b).toBe(128);
    });

    it('returns same color at 0 amount', () => {
      expect(brighten('#E67E22', 0)).toBe('#e67e22');
    });

    it('returns white at 1.0 amount', () => {
      expect(brighten('#E67E22', 1)).toBe('#ffffff');
    });
  });

  describe('darken', () => {
    it('darkens white towards black', () => {
      const result = darken('#ffffff', 0.5);
      const [r, g, b] = hexToRgb(result);
      expect(r).toBe(128);
      expect(g).toBe(128);
      expect(b).toBe(128);
    });

    it('returns same color at 0 amount', () => {
      expect(darken('#E67E22', 0)).toBe('#e67e22');
    });

    it('returns black at 1.0 amount', () => {
      expect(darken('#E67E22', 1)).toBe('#000000');
    });
  });

  describe('withAlpha', () => {
    it('produces rgba string', () => {
      expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
    });

    it('handles full opacity', () => {
      expect(withAlpha('#00ff00', 1)).toBe('rgba(0,255,0,1)');
    });
  });
});
