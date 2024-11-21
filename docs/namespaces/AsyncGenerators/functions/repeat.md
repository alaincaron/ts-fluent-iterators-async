[**ts-fluent-iterators**](../../../README.md) • **Docs**

---

[ts-fluent-iterators](../../../README.md) / [AsyncGenerators](../README.md) / repeat

# Function: repeat()

> **repeat**\<`T`\>(`f`, `count`?): `AsyncIterableIterator`\<`T`\>

Returns an iterator resulting from applying f on all elements of the range [0,`count`]
from `start` (inclusively) to `end` (exclusively) by increment of `step`.

## Type Parameters

• **T**

## Parameters

• **f**: [`EventualMapper`](../../../type-aliases/EventualMapper.md)\<`number`, `T`\>

The function to apply on each element of the range.

• **count?**: `number`

the numbe of times f should be invoked.

## Returns

`AsyncIterableIterator`\<`T`\>

A new iterator resulting from apply f on all elements in the [`start`,`end`[ range by increment of `step`.

## Example

```ts
repeat(x => x * 2, 10);
// yields 0, 2, 4, ..., 18
```

## Remarks

```ts
for (await const v of repeat(f, count)) yield v;
```

is equivalent to

```ts
for (await const v of range(0, count, 1)) yield await f(v);
```
