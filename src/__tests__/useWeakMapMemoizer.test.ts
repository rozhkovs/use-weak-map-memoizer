import {renderHook} from '@testing-library/react-hooks';
import useWeakMapMemoizer, {WeakMemoizer} from '../useWeakMapMemoizer';

const PRIMITIVES = Object.freeze([
  -0,
  0,
  1,
  -1,
  3.14,
  -3.14,
  Infinity,
  -Infinity,
  NaN,
  '',
  'hello',
  '123',
  'true',
  true,
  false,
  null,
  undefined,
  Symbol(),
  BigInt(123),
]);

const REFERENCES1 = Object.freeze([{}, [], function () {}, () => {}]);

describe('memo', () => {
  let wkmap: WeakMemoizer;
  let wkmapKey1: object;
  let wkmapKey2: object;

  const cacheKey1 = 'cacheKey1';
  const cacheKey2 = 'cacheKey2';

  const wkmap1 = () => wkmap(wkmapKey1);
  const wkmap2 = () => wkmap(wkmapKey2);

  const creatorMock = jest.fn();

  beforeEach(() => {
    wkmap = renderHook(() => useWeakMapMemoizer()).result.current;
    creatorMock.mockClear().mockImplementation(() => ({}));
    wkmapKey1 = {};
    wkmapKey2 = {};
  });

  describe('One argument', () => {
    test('Function call check', () => {
      const returnResult = {};
      const creatorMock = jest.fn().mockReturnValueOnce(returnResult);

      const result = wkmap1().memo(creatorMock);

      expect(creatorMock).toBeCalledTimes(1);
      expect(returnResult).toBe(result);
    });
    test('The function should not be called again', () => {
      wkmap1().memo(creatorMock);
      wkmap1().memo(creatorMock);

      expect(creatorMock).toBeCalledTimes(1);
    });
    test('Checking the memoization', () => {
      const item1_1 = wkmap1().memo(() => ({}));
      const item1_2 = wkmap1().memo(() => ({}));

      const item2_1 = wkmap2().memo(() => ({}));
      const item2_2 = wkmap2().memo(() => ({}));

      expect(item1_1).toBe(item1_2);
      expect(item2_1).toBe(item2_2);
      expect(item1_2).not.toBe(item2_2);
    });
  });

  describe('Two arguments', () => {
    test('Identical cache keys should return the same result', () => {
      const item1 = wkmap1().memo(cacheKey1, () => ({}));
      const item2 = wkmap1().memo(cacheKey1, () => ({}));

      expect(item1).toBe(item2);
    });
    test('Different cache keys should return different results', () => {
      const item1 = wkmap1().memo(cacheKey1, () => ({}));
      const item2 = wkmap1().memo(cacheKey2, () => ({}));

      expect(item1).not.toBe(item2);
    });
    test('Cache keys should be independent of WeakMap keys', () => {
      const item1 = wkmap1().memo(cacheKey1, () => ({}));
      const item2 = wkmap2().memo(cacheKey1, () => ({}));

      expect(item1).not.toBe(item2);
    });
  });

  describe('Three arguments', () => {
    test('The result should be the same if dependencies have not changed', () => {
      const item1 = wkmap1().memo(cacheKey1, [], creatorMock);
      const item2 = wkmap1().memo(cacheKey1, [], creatorMock);

      const item3 = wkmap1().memo(cacheKey1, [...PRIMITIVES, ...REFERENCES1], creatorMock);
      const item4 = wkmap1().memo(cacheKey1, [...PRIMITIVES, ...REFERENCES1], creatorMock);

      expect(item1).toBe(item2);
      expect(item3).toBe(item4);
      expect(item2).toBe(item4);
    });
    test('The result should be different if dependencies have changed', () => {
      const values = [
        0,
        -0,
        1,
        -1,
        3.14,
        -3.14,
        Infinity,
        -Infinity,
        NaN,
        true,
        false,
        null,
        undefined,
        Symbol(),
        Symbol(),
        1,
        '1',
        {},
        {},
        [],
        [],
        () => {},
        () => {},
        function () {},
        function () {},
      ];

      let prev = wkmap1().memo(cacheKey1, [values[0]], creatorMock);
      for (let i = 1; i < values.length; i++) {
        const current = wkmap1().memo(cacheKey1, [values[i]], creatorMock);

        expect(current).not.toBe(prev);

        prev = current;
      }
    });
  });
});

// TODO add tests for callback
