import { describe, it, expect } from 'vitest';
import { es } from './es';
import { en } from './en';

describe('i18n — TUBERS translations', () => {
  it('Spanish translation for category.tubers is "Tubérculos"', () => {
    expect(es['category.tubers']).toBe('Tubérculos');
  });

  it('English translation for category.tubers is "Tubers"', () => {
    expect(en['category.tubers']).toBe('Tubers');
  });
});

describe('i18n — TUBERS nudge translations', () => {
  it('Spanish has tubersExcess nudge title', () => {
    expect(es['nudge.title.tubersExcess']).toBeDefined();
    expect(typeof es['nudge.title.tubersExcess']).toBe('string');
  });

  it('Spanish has tubersExcess nudge body', () => {
    expect(es['nudge.body.tubersExcess']).toBeDefined();
    expect(typeof es['nudge.body.tubersExcess']).toBe('string');
  });

  it('English has tubersExcess nudge title', () => {
    expect(en['nudge.title.tubersExcess']).toBeDefined();
    expect(typeof en['nudge.title.tubersExcess']).toBe('string');
  });

  it('English has tubersExcess nudge body', () => {
    expect(en['nudge.body.tubersExcess']).toBeDefined();
    expect(typeof en['nudge.body.tubersExcess']).toBe('string');
  });
});
