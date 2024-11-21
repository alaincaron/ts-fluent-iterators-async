[**ts-fluent-iterators**](../README.md) • **Docs**

---

[ts-fluent-iterators](../README.md) / AsyncArrayGenerator

# Interface: AsyncArrayGenerator\<E\>

An interface used to asynchronously generate arrays from `length` and `seed`

## Type Parameters

• **E**

the type of the objects in the generated `Array`

## Properties

### length

> **length**: `number`

The number of items to generate.

---

### seed

> **seed**: [`AsyncIteratorLike`](../type-aliases/AsyncIteratorLike.md)\<`E`\>

Generates the entry in the array.
