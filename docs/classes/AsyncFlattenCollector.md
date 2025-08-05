[**ts-fluent-iterators-async**](../README.md)

---

[ts-fluent-iterators-async](../README.md) / AsyncFlattenCollector

# Class: AsyncFlattenCollector\<A\>

A `Collector` that accepts `Iterable<A>` or `Iterator<A>` and returns a `FluentIterator<A>` that consists of the concatenation of all the collected iterable objects.

## Example

```ts
const c = new AsyncFlattenCollector<number>();
await c.collect([1,2]);
await c.collect([3,4]);
await c.result.collect() : [1,2,3,4]
```

## Type Parameters

### A

`A`

the type of elements being iterated on.

## Implements

- [`AsyncCollector`](../interfaces/AsyncCollector.md)\<[`EventualIterable`](../type-aliases/EventualIterable.md)\<`A`\> \| [`EventualIterator`](../type-aliases/EventualIterator.md)\<`A`\>, [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>\>

## Accessors

### result

#### Get Signature

> **get** **result**(): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

Returns the aggregated object.

##### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

The aggregated object resulting from collecting all objects

#### Implementation of

[`AsyncCollector`](../interfaces/AsyncCollector.md).[`result`](../interfaces/AsyncCollector.md#result)

## Methods

### collect()

> **collect**(`a`): `Promise`\<`void`\>

Collects an element.

#### Parameters

##### a

The element being collected.

[`EventualIterable`](../type-aliases/EventualIterable.md)\<`A`\> | [`EventualIterator`](../type-aliases/EventualIterator.md)\<`A`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`AsyncCollector`](../interfaces/AsyncCollector.md).[`collect`](../interfaces/AsyncCollector.md#collect)
