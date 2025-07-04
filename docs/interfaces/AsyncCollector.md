[**ts-fluent-iterators-async**](../README.md)

---

[ts-fluent-iterators-async](../README.md) / AsyncCollector

# Interface: AsyncCollector\<A, B\>

An `AsyncCollector` is an object that asynchronously collects elements of type `A` and aggregates them into an object of type `B`.

## Type Parameters

### A

`A`

the type of elements being collected.

### B

`B`

the type of the aggregated object.

## Accessors

### result

#### Get Signature

> **get** **result**(): `B`

Returns the aggregated object.

##### Returns

`B`

The aggregated object resulting from collecting all objects

## Methods

### collect()

> **collect**(`a`): `Promise`\<`void`\>

Collects an element.

#### Parameters

##### a

`A`

The element being collected.

#### Returns

`Promise`\<`void`\>
