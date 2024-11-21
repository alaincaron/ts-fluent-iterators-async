[**ts-fluent-iterators**](../../../README.md) • **Docs**

---

[ts-fluent-iterators](../../../README.md) / [AsyncGenerators](../README.md) / range

# Function: range()

> **range**(`start`?, `end`?, `step`?): `AsyncIterableIterator`\<`number`\>

Returns an `AsyncIterableiterator` from `start` (inclusively) to `end` (exclusively) by increment of `step`.

## Parameters

• **start?**: `number`

the start of the range. Defaults to 0.

• **end?**: `number`

the end of the range. Defaults to infinity.

• **step?**: `number`

increment in the range. Defaults to 1 if `end` > `start`, -1 otherwise.

## Returns

`AsyncIterableIterator`\<`number`\>

A new iterator for the range [`start`,`end`[ by increment of `step`.

## Example

```ts
range(1, 100, 2);
// yields 1, 3, 5, 7, ..., 99
```
