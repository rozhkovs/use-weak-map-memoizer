[LICENSE]: https://github.com/rozhkovs/use-weak-map-memoizer/blob/HEAD/LICENSE
[AUTHOR]: https://github.com/rozhkovs

# 🧐 useWeakMapMemoizer 🧐

<p>
  <a href="https://github.com/rozhkovs/use-weak-map-memoizer/blob/HEAD/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Use Weak Map Memoizer is released under the MIT license." />
  </a>
  <a href="https://github.com/rozhkovs/use-weak-map-memoizer/actions/workflows/tests.yml">
    <img src="https://github.com/rozhkovs/use-weak-map-memoizer/actions/workflows/tests.yml/badge.svg" alt="Use Weak Map Memoizer passed the testing" />
  </a>
  <a href="https://www.npmjs.com/package/use-weak-map-memoizer">
    <img src="https://img.shields.io/npm/v/use-weak-map-memoizer?color=brightgreen&label=npm%20package" alt="Current npm package version." />
  </a>
</p>

Provides React-like interface for memorizing values and callbacks
without binding the order of calls. Based on WeakMap.

## Navigation
- [Installation](#Installation)
- [Example](#Example)
- [Use case](#Use-case)
  - [Mapping](#Mapping)
  - [Closure](#Closure)
- [API](#API)
- [Important tips](#Important-tips)
  - [Use cache key](#Use-cache-key)
  - [Only primitive types for cache key](#Only-primitive-types-for-cache-key)
- [Author](#-Author)
- [Was it helpful?](#-Was-it-helpful)
- [License](#-License)


## Installation
```shell
yarn add use-weak-map-memoizer
# or
npm install use-weak-map-memoizer 
```

## Example
```javascript
const MyListComponent = ({ list }) => {
  const wkmap = useWeakMapMemoizer(); // #1
  const selectItem = useCallback((item) => {/* some logic */}, [/* deps */])
  const addItem = useCallback((item) => {/* some logic */}, [/* deps */])
  
  return list.map(item => {
    const cache = wkmap(item); // #2
    const mappedItem = cache.memo(1, [], () => ({ ...item /*, some new fields */ })); // #3
    const onPress = cache.callback(2, [selectItem], () => selectItem(mappedItem)); // #4
    const onDoublePress = cache.callback(3, [addItem], () => addItem(mappedItem));
    
    return (
      <MyMemoizedItemComponent
        item={mappedItem}
        onPress={onPress}
        onDoublePress={onDoublePress}
      />
    )
  })
}
```
### What's going on here?
1. Initialize the memoizer
2. Get the object for caching by reference key
3. Similar to the working principle of `useMemo`.
   1. `1` is the caching key within the `item` object
   2. `[]` is an array of dependencies. It would be possible to omit this parameter
   3. `() => {}` — the creator function.
4. The principle of operation is similar to p. 3, but only an analogy for `useCallback`

## Use case

### Mapping
It is convenient to memorize the results of mapping based on a reference.

```javascript
const { list } = props;
const wkmap = useWeakMapMemoizer();

return list.map(item => {
  const mappedItem = wkmap(item).memo(() => ({...item, /*, some new fields */}))
  return <MyMemoizedComponent item={mappedItem} />
})
```

### Closure
It is convenient to make closures in iterative components

```javascript
const { list } = props;
const wkmap = useWeakMapMemoizer();
const addItem = useCallback((item) => {/* some logic */}, [/* deps */])

return list.map(item => {
  const onClick = wkmap(item).callback(1, [addItem], () => addItem(item))
  return <MyMemoizedComponent item={mappedItem} onClick={onClick}  />
})
```

You can come up with your own situations when it is convenient for you!

## API

**In short:**
```javascript
const wkmap = useWeakMapMemoizer(); // or createWeakMapMemoizer()

wkmap(obj).memo(creator)
wkmap(obj).memo(cacheKey, creator)
wkmap(obj).memo(cacheKey, deps, creator)

wkmap(obj).callback(callback)
wkmap(obj).callback(cacheKey, callback)
wkmap(obj).callback(cacheKey, deps, callback)
```

⚠️ By default, deps is an empty array. 

That is, memoization will not compare dependencies and return
a memorized result relative the reference object and cache key.
This behavior differs from `useMemo` and `useCallback`



## Important tips

### Use cache key
If you need to memorize several results relative the same object, use the caching key.

```javascript
const onPress = wkmap(obj).callback(1, [], () => { /* some logic */ }); // cacheKey is 1
const onDoublePress = wkmap(obj).callback(2, [], () => { /* some logic */ }); // cacheKey is 2
```

### Only primitive types for cache key
You don't need to use reference types in caching keys, instead pass them to `map(cacheKeyObj)`


## 👨‍💻 Author
[Sergey Rozhkov][AUTHOR]

## 🎯 Was it helpful?

Do you like it and find it helpful? You can help this project in the following way:
- ⭐ Put the star.
- 💡 Suggest your ideas.
- 😉 Open a founded issue.

## 📄 License

useWeakMapMemoizer is MIT licensed, as found in the [LICENSE] file.
