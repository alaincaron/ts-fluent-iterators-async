[**ts-fluent-iterators**](../../../README.md) • **Docs**

---

[ts-fluent-iterators](../../../README.md) / [AsyncGenerators](../README.md) / loop

# Function: loop()

> **loop**\<`T`\>(`f`, `start`?, `end`?, `step`?): `AsyncIterableIterator`\<`T`\>

Returns an `AsyncIterableIterator` resulting from applying f on all elements of the range
from `start` (inclusively) to `end` (exclusively) by increment of `step`.

## Type Parameters

• **T**

## Parameters

• **f**: [`EventualMapper`](../../../type-aliases/EventualMapper.md)\<`number`, `T`\>

The function to apply on each element of the range.

• **start?**: `number`

the start of the range. Defaults to 0.

• **end?**: `number`

the end of the range. Defaults to infinity.

• **step?**: `number`

increment in the range. Defaults to 1 if `end` > `start`, -1 otherwise.

## Returns

`AsyncIterableIterator`\<`T`\>

A new iterator resulting from apply f on all elements in the [`start`,`end`[ range by increment of `step`.

## Example

```ts
loop(x => 2 * x, 1, 100, 2);
// yields 2, 6, 10, ..., 198
```

## Remarks

```ts
for (await const v of loop(f, start, end, step)) yield v;
```

is equivalent to

```ts
for (await const v of range(start, end, step)) yield await f(v);
```
