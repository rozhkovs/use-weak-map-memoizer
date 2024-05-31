import {useState} from 'react';
import {EMPTY_ARRAY} from 'default-values';

const UNDEFINED_CACHE_KEY = Symbol();

type Deps = ReadonlyArray<unknown>;
type CacheKey = string | number | boolean | bigint | symbol;

type AnyFunc = (...args: unknown[]) => unknown;
type MapValue = {
  deps: ReadonlyArray<unknown>;
  value: unknown;
};

// https://github.com/facebook/react/blob/6d3110b4d95a8594b0cbe437c9d71d3e2f2ba2d4/packages/react-reconciler/src/ReactFiberHooks.js#L447
function areDepsEqual(nextDeps: Deps, prevDeps: Deps): boolean {
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(prevDeps[i], nextDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}

export interface WeakMemoizerApi {
  memo<ReturnT>(creator: () => ReturnT): ReturnT;
  memo<ReturnT, CacheKeyT extends CacheKey = CacheKey>(
    key: CacheKeyT,
    creator: () => ReturnT,
  ): ReturnT;
  memo<ReturnT, CacheKeyT extends CacheKey = CacheKey>(
    key: CacheKeyT,
    deps: Deps,
    creator: () => ReturnT,
  ): ReturnT;

  callback<CallbackT extends AnyFunc>(callback: CallbackT): CallbackT;
  callback<CallbackT extends AnyFunc, CacheKeyT extends CacheKey = CacheKey>(
    key: CacheKeyT,
    callback: CallbackT,
  ): CallbackT;
  callback<CallbackT extends AnyFunc, CacheKeyT extends CacheKey = CacheKey>(
    key: CacheKeyT,
    deps: Deps,
    callback: CallbackT,
  ): CallbackT;
}

export interface WeakMemoizer {
  <WeakKeyT extends object>(key: WeakKeyT): WeakMemoizerApi;
}

export const createWeakMapMemoizer = () => {
  const weekMap = new WeakMap<object, Map<CacheKey, MapValue>>();

  const memoFn = (weakKey: object, cacheKey: CacheKey, deps: Deps, creator: () => unknown) => {
    let map = weekMap.get(weakKey);
    if (!map) {
      map = new Map();
      weekMap.set(weakKey, map);
    }

    const record = map.get(cacheKey);
    if (!record) {
      const value = creator();
      map.set(cacheKey, {deps, value});

      return value;
    }

    const {value: prevValue, deps: prevDeps} = record;
    if (areDepsEqual(prevDeps, deps)) {
      return prevValue;
    }

    record.deps = deps;
    record.value = creator();

    return record.value;
  };

  const memoFnUniversal = (isCallback: boolean, weakKey: object, ...args: unknown[]) => {
    // TODO add validate args for __DEV__ mode

    const wrapCreator = (creatorOrCallback: AnyFunc) => () =>
      isCallback ? creatorOrCallback : creatorOrCallback();

    if (args.length === 1) {
      return memoFn(weakKey, UNDEFINED_CACHE_KEY, EMPTY_ARRAY, wrapCreator(args[0] as AnyFunc));
    } else if (args.length === 2) {
      return memoFn(weakKey, args[0] as CacheKey, EMPTY_ARRAY, wrapCreator(args[1] as AnyFunc));
    } else {
      return memoFn(weakKey, args[0] as CacheKey, args[1] as Deps, wrapCreator(args[2] as AnyFunc));
    }
  };

  return (weakKey: object) => {
    return {
      memo: (...args: unknown[]) => memoFnUniversal(false, weakKey, ...args),
      callback: (...args: unknown[]) => memoFnUniversal(true, weakKey, ...args),
    };
  };
};

const useWeakMapMemoizer = (): WeakMemoizer => {
  return useState(createWeakMapMemoizer)[0];
};

export default useWeakMapMemoizer;
