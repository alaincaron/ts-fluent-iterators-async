[**ts-fluent-iterators**](../README.md) • **Docs**

---

[ts-fluent-iterators](../README.md) / AsyncLazy

# Class: AsyncLazy\<T\>

Represents a lazy-evaluated value that is computed only when needed.
Lazy

## Type Parameters

• **T**

The type of the value.

## Methods

### map()

> **map**\<`R`\>(`mapper`): [`AsyncLazy`](AsyncLazy.md)\<`R`\>

Maps the computed value to a new value using the provided function.

#### Type Parameters

• **R**

#### Parameters

• **mapper**: [`EventualMapper`](../type-aliases/EventualMapper.md)\<`T`, `R`\>

The function to apply to the computed value.

#### Returns

[`AsyncLazy`](AsyncLazy.md)\<`R`\>

A new instance of Lazy with the transformed value.

#### Param Type

R - The type of the result after applying the function.

---

### value()

> **value**(): `Promise`\<`T`\>

Evaluates and returns the computed value, calculating it only when necessary.

#### Returns

`Promise`\<`T`\>

The computed value.

---

### create()

> `static` **create**\<`T`\>(`provider`): [`AsyncLazy`](AsyncLazy.md)\<`T`\>

Static method to create an instance of `Lazy`.

#### Type Parameters

• **T**

The type of the value.

#### Parameters

• **provider**: [`EventualProvider`](../type-aliases/EventualProvider.md)\<`T` \| `Try`\<`T`\>\>

The function representing the lazy provider.

#### Returns

[`AsyncLazy`](AsyncLazy.md)\<`T`\>

An instance of Lazy.
