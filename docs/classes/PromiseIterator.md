[**ts-fluent-iterators-async**](../README.md)

---

[ts-fluent-iterators-async](../README.md) / PromiseIterator

# Class: PromiseIterator\<A\>

Iterator yielding `Promise` objects with a Fluent interface.

## Type Parameters

• **A**

The type of elements being iterated.

## Implements

- `Iterator`\<`Promise`\<`A`\>\>
- `Iterable`\<`Promise`\<`A`\>\>

## Constructors

### new PromiseIterator()

> **new PromiseIterator**\<`A`\>(`iter`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Creates an [PromiseIterator](PromiseIterator.md) by wrapping an `Iterator<Promise<A>>`

#### Parameters

##### iter

`Iterator`\<`Promise`\<`A`\>\>

The `Iterator` being wrapped into a `PromiseIterator`

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

## Methods

### \[iterator\]()

> **\[iterator\]**(): `Iterator`\<`Promise`\<`A`\>\>

Used to make this [PromiseIterator](PromiseIterator.md) being seen as an
`Iterable<Promise<A>>`. This allows them to be used in APIs expecting an
`Iterable<Promise<A>>`

#### Returns

`Iterator`\<`Promise`\<`A`\>\>

#### Implementation of

`Iterable.[iterator]`

---

### all()

> **all**(`predicate`): `Promise`\<`boolean`\>

Returns a Promise resolving to `true` if the [predicate](../type-aliases/EventualPredicate.md) argument evalatues to true for all
items of this [PromiseIterator](PromiseIterator.md), or resolving to false
otherwsie.

#### Parameters

##### predicate

[`EventualPredicate`](../type-aliases/EventualPredicate.md)\<`A`\>

The predicate being evaluated

#### Returns

`Promise`\<`boolean`\>

#### Example

```ts
await toPromiseIterator([1, 2]).all(x => x > 0); // true
await toPromiseIterator([1, 2]).all(x => x >= 2); // false
await PromiseIterator.empty().all(_ => false); // true;
```

---

### allSettled()

> **allSettled**(): `Promise`\<`PromiseSettledResult`\<`A`\>[]\>

Fluent version of `Promise.allSettled`

#### Returns

`Promise`\<`PromiseSettledResult`\<`A`\>[]\>

---

### any()

> **any**(): `Promise`\<`undefined` \| `A`\>

Fluent version of `Promise.any`

#### Returns

`Promise`\<`undefined` \| `A`\>

---

### append()

> **append**(`items`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Returns a new [PromiseIterator](PromiseIterator.md) that is the result of appending its argument to this [PromiseIterator](PromiseIterator.md)

#### Parameters

##### items

An `Iterator` or `Iterable` whose items are appended to this [PromiseIterator](PromiseIterator.md).

`Iterator`\<`Promise`\<`A`\>\> | `Iterable`\<`Promise`\<`A`\>\>

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

#### Example

```ts
toPromiseIterator([1, 2, 3]).append([4, 5, 6]);
// yields Promise(1), ..., Promise(6)
```

---

### apply()

> **apply**\<`B`\>(`mapper`): [`Eventually`](../type-aliases/Eventually.md)\<`B`\>

Returns the resulf of applying the Mapper to the wrapped iterator.
This method allows to use an Iterator function in a fluent way.

#### Type Parameters

• **B** = `A`

#### Parameters

##### mapper

`Mapper`\<`Iterator`\<`Promise`\<`A`\>\>, [`Eventually`](../type-aliases/Eventually.md)\<`B`\>\>

#### Returns

[`Eventually`](../type-aliases/Eventually.md)\<`B`\>

#### Example

```ts
function sumOfIterator(Iterator<number>: iter) {
   let sum = 0;
   for (;;) {
      const item = iter.next();
      if (item.done) return sum;
      sum += item.value;
   }
}

iterator([1,2,3]).apply(sumOfiterator);
// returns 6
```

---

### collect()

> **collect**(): `Promise`\<`A`[]\>

Collects items into an array.

#### Returns

`Promise`\<`A`[]\>

a `Promise` of an `Array` consisting of the elements of this [PromiseIterator](PromiseIterator.md)

#### Example

```ts
const iter = toPromiseIterator([1, 2, 3]);
const data = await iter.collect();
// data is [1,2,3]
```

#### Remarks

This is equivalent to `Promise.all`

---

### collectTo()

> **collectTo**\<`B`\>(`collector`): `Promise`\<`B`\>

Collects items from the [PromiseIterator](PromiseIterator.md) into an [EventualCollector](../interfaces/EventualCollector.md).

#### Type Parameters

• **B**

The result type of the `EventualCollector`.

#### Parameters

##### collector

[`EventualCollector`](../interfaces/EventualCollector.md)\<`A`, `B`\>

The `EventualCollector` into which to collect the items

#### Returns

`Promise`\<`B`\>

A `Promise` of the he result of the `collector`

#### Example

```ts
const collector = new ArrayCollector<string>();
const iter = toPromiseIterator([1, 2, 3]);
const data = await iter.collectTo(collector);
// data is [1,2,3]
```

---

### collectToMap()

> **collectToMap**\<`K`\>(`mapper`, `collisionHandler`?): `Promise`\<`Map`\<`K`, `A`\>\>

Collects items into a `Map` by mapping values into keys.

#### Type Parameters

• **K**

The type of the keys of the `Map`

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `K`\>

Maps the values into keys

##### collisionHandler?

`CollisionHandler`\<`K`, `A`\>

Specifies how to handle the collision. Default is to ignore collision.

#### Returns

`Promise`\<`Map`\<`K`, `A`\>\>

a `Promise` of a `Map` whose keys are the result of applying the `mapper` to the values of this [PromiseIterator](PromiseIterator.md) and the values are iterated items.

#### Example

```ts
const iter = toPromiseIterator('foo', 'bar', 'foobar');
const data = await iter.collectToMap(s => s.length);
// data is Map {3 => "foo", 6 => "foobar"}
```

---

### collectToMap2()

> **collectToMap2**\<`K`, `V`\>(`mapper`, `collisionHandler`?): `Promise`\<`Map`\<`K`, `V`\>\>

Collects items into a `Map` by mapping values into keys and new value

#### Type Parameters

• **K**

The type of the keys of the `Map`

• **V**

The type of the values of the `Map`

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, \[`K`, `V`\]\>

Maps the values into [key, values] pairs

##### collisionHandler?

`CollisionHandler`\<`K`, `V`\>

Specifies how to handle the collision. Default is to ignore collision.

#### Returns

`Promise`\<`Map`\<`K`, `V`\>\>

a `Promise` of a `Map` whose entries are the result of applying the `mapper` to the values of this [PromiseIterator](PromiseIterator.md).

#### Example

```ts
const iter = toPromiseIterator(['foo', 'bar', 'foobar']);
const data = await iter.collectToMap2(s => [s, s.length]);
// data is Map { "foo" => 3, "bar" => 3, "foobar" => 6 }
```

---

### collectToObject()

> **collectToObject**(`mapper`, `collisionHander`?): `Promise`\<`Record`\<`string`, `A`\>\>

Collects items into a `Record` by mapping values into keys.

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `string`\>

Maps the values into keys

##### collisionHander?

`CollisionHandler`\<`string`, `A`\>

#### Returns

`Promise`\<`Record`\<`string`, `A`\>\>

a `Record` whose keys are the result of applying the `mapper` to the values of this FluentIterator and the values are iterated items.

#### Example

```ts
const iter = iterator('foo', 'bar', 'foobar');
const data = iter.collectToObject(s => s.toUpperCase());
// data is { FOO: "foo", BAR: "bar", FOOBAR: "foobar" }
```

---

### collectToObject2()

> **collectToObject2**\<`V`\>(`mapper`, `collisionHandler`?): `Promise`\<`Record`\<`string`, `V`\>\>

Collects items into a `Record` by mapping values into keys and new value

#### Type Parameters

• **V**

The type of the values of the `Map`

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, \[`string`, `V`\]\>

Maps the values into [key, values] pairs

##### collisionHandler?

`CollisionHandler`\<`string`, `V`\>

Specifies how to handle the collision. Default is to ignore collision.

#### Returns

`Promise`\<`Record`\<`string`, `V`\>\>

a `Promise` of a `Record` whose entries are the result of applying the `mapper` to the values of this [PromiseIterator](PromiseIterator.md).

#### Example

```ts
const iter = toPromiseIterator(['foo', 'bar', 'foobar']);
const data = await iter.collectToObject2(s => [s, s.length]);
// data is { foo: 3, bar: 3, foobar: 6 }
```

---

### collectToSet()

> **collectToSet**(): `Promise`\<`Set`\<`A`\>\>

Collects items into a `Set`.

#### Returns

`Promise`\<`Set`\<`A`\>\>

a `Promise` of a `Set` consisting of the elements of this [PromiseIterator](PromiseIterator.md)

#### Example

```ts
const iter = toPromiseIterator([1, 2, 3, 1, 2, 3]);
const data = await iter.collectToSet();
// data is Set { 1,2,3 }
```

---

### concat()

> **concat**(...`iterables`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Returns a new [PromiseIterator](PromiseIterator.md) that is the result of apepending all its argument to this [PromiseIterator](PromiseIterator.md)

#### Parameters

##### iterables

...(`Iterator`\<`Promise`\<`A`\>\> \| `Iterable`\<`Promise`\<`A`\>\>)[]

An `Array of `Iterator`or`Iterable` whose items are appended to this FluentIterator.

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

#### Example

```ts
toPromiseIterator([1, 2, 3]).concat([4, 5, 6], [7, 8, 9]);
// yields Promise(1), ... Promise(4),, ... , Promise(7), ...
```

---

### contains()

> **contains**(`predicate`): `Promise`\<`boolean`\>

Returns true if this [PromiseIterator](PromiseIterator.md) yields an
element for which the [predicate](../type-aliases/EventualPredicate.md)
evaluates to true.

#### Parameters

##### predicate

[`EventualPredicate`](../type-aliases/EventualPredicate.md)\<`A`\>

The predicate to evaluate.

#### Returns

`Promise`\<`boolean`\>

true if this [PromiseIterator](PromiseIterator.md) yields an
element for which the [predicate](../type-aliases/EventualPredicate.md)
evaluates to true, false otherwise.

---

### count()

> **count**(): `Promise`\<`number`\>

Returns the number of items in this [PromiseIterator](PromiseIterator.md).

#### Returns

`Promise`\<`number`\>

#### Example

```ts
await toPromiseIterator([1, 2]).count(); // 2
await PromiseIterator.empty().count();
0;
```

---

### distinct()

> **distinct**\<`K`\>(`mapper`?): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

Returns a new [AsyncFluentIterator](AsyncFluentIterator.md) consisting of distinct elements from this iterator.

#### Type Parameters

• **K** = `A`

#### Parameters

##### mapper?

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `K`\>

Used to determine distinctness of elements. Default to <code>identity</code>

#### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

#### Example

```ts
await promiseIterator(toPromise[1,2,2,3,1,4])).distinct().collect();
[1,2,3,4]

await promiseIterator (toPromise[1,2,2,3,1,4]), x => x %2).distinct().collect();
[1,2]
```

---

### enumerate()

> **enumerate**(`start`): [`PromiseIterator`](PromiseIterator.md)\<\[`A`, `number`\]\>

Returns a new [PromiseIterator](PromiseIterator.md) that yields pairs of elements
consisting of the elements yielded by this
@{link PromiseIterator} and their index in the iteration.

#### Parameters

##### start

`number` = `0`

The starting index

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<\[`A`, `number`\]\>

#### Example

```ts
const iter = toPromiseiterator(['a', 'b', 'c']);
const enumerated = iter.enumerate(10);
// enumerated will yield Promise(["a", 10]), Promise(["b", 11]), Promise(["c", 12])
```

---

### filter()

> **filter**(`predicate`): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

Returns a new [AsyncFluentIterator](AsyncFluentIterator.md) consisting of elements for which the `predicate` evaluates to true.

#### Parameters

##### predicate

[`EventualPredicate`](../type-aliases/EventualPredicate.md)\<`A`\>

the predicate on which the evaluate the items.

#### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

a new [AsyncFluentIterator](AsyncFluentIterator.md) consisting of elements of this [AsyncFluentIterator](AsyncFluentIterator.md) for which the `predicate` evaluates to true.

#### Example

```ts
toPromiseiterator([1, 8, 2, 3, 4, 6]).filter(x => x % 2 === 1);
// asynchronously yields 1, 2
```

---

### filterMap()

> **filterMap**\<`B`\>(`mapper`): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`B`\>

Returns a new [AsyncFluentIterator](AsyncFluentIterator.md) consisting of applying the
Mapper to all elements of this [PromiseIterator](PromiseIterator.md) and
filtering those for which the [EventualMapper](../type-aliases/EventualMapper.md) returned null or
undefined

#### Type Parameters

• **B**

The type of the elements of the returned [AsyncFluentIterator](AsyncFluentIterator.md)

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `undefined` \| `null` \| `B`\>

Transformation applied to elements of this [PromiseIterator](PromiseIterator.md)

#### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`B`\>

A new [AsyncFluentIterator](AsyncFluentIterator.md)

#### Remarks

```ts
iter.filterMap(mapper);
```

is equivalent to

```ts
iter.map(mapper).removeNull();
```

---

### first()

> **first**(): `Promise`\<`undefined` \| `A`\>

Returns the first element of this [PromiseIterator](PromiseIterator.md) or `undefined` if this [PromiseIterator](PromiseIterator.md) is empty.

#### Returns

`Promise`\<`undefined` \| `A`\>

The first element of this [PromiseIterator](PromiseIterator.md) or `undefined`.

---

### flatmap()

> **flatmap**\<`B`\>(`mapper`): [`PromiseIterator`](PromiseIterator.md)\<`B`\>

Returns a new [PromiseIterator](PromiseIterator.md) for [EventualMapper](../type-aliases/EventualMapper.md) that accept a `Promise` rather than an `Awaited` value.

#### Type Parameters

• **B**

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`Promise`\<`A`\>, `B`\>

[EventualMapper](../type-aliases/EventualMapper.md) accepting a `Promise<A>`

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`B`\>

#### Example

```ts
const iter = toPromiseIterator([1, 2]);
await iter.flatmap(async x => 2 * (await x));
yields: Promise(2), Promise(4);
```

---

### fold()

> **fold**\<`B`\>(`reducer`, `initialValue`): `Promise`\<`B`\>

Executes the [reducer](../type-aliases/EventualReducer.md) function on each element
of this [PromiseIterator](PromiseIterator.md), in order, passing in
the return value from the calculation on the preceding element. The
final result of running the reducer across all elements of the array
is a single value.

#### Type Parameters

• **B**

#### Parameters

##### reducer

[`EventualReducer`](../type-aliases/EventualReducer.md)\<`A`, `B`\>

The reducer to be applied at each iteration.

##### initialValue

`B`

The value of the accumulator to be used in the first call to `reducer`

#### Returns

`Promise`\<`B`\>

#### Param Type

B the type into which the elements are being folded to

#### Remarks

If the [PromiseIterator](PromiseIterator.md) is empty, `initialValue` is returned.

#### Example

```ts
To compute the sum of elements:
const sum = await toPromiseIterator([1,2,3])
   .fold((acc, x) => acc + x, 0)
// sum = 6
```

---

### forEach()

> **forEach**(`mapper`): `Promise`\<`void`\>

Applies the [mapper](../type-aliases/EventualMapper.md) to each element of this [PromiseIterator](PromiseIterator.md)

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `any`\>

the operation to be invoked on each element.

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await iter.forEach(console.log);
```

#### Remarks

The results of invoking the `mapper` are ignored unless it throws.

This is equivalent to

```
for (const v of iter) await mapper(await v);
```

---

### groupBy()

> **groupBy**\<`K`\>(`mapper`): `Promise`\<`Map`\<`K`, `A`[]\>\>

Returns a `Promise` of a `Map` where keys are the result of applying the parameter [mapper](../type-aliases/EventualMapper.md) to the elements of the
this [PromiseIterator](PromiseIterator.md) and the values are Arrays of
the elements that are mapped to the same key.

#### Type Parameters

• **K**

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `K`\>

The [EventualMapper](../type-aliases/EventualMapper.md) used to group items.

#### Returns

`Promise`\<`Map`\<`K`, `A`[]\>\>

#### Example

```ts
await toPromiseIterator([1, 2, 3]).groupBy(x => x % 2 === 0);
// Map { true => [2], false => [1, 3]}
```

---

### groupBy2()

> **groupBy2**\<`K`, `V`\>(`mapper`): `Promise`\<`Map`\<`K`, `V`[]\>\>

Returns a `Promise` of a `Map` where entries are the result of applying the parameter [mapper](../type-aliases/EventualMapper.md) to the elements of the
this [PromiseIterator](PromiseIterator.md),

#### Type Parameters

• **K**

• **V**

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, \[`K`, `V`\]\>

The [EventualMapper](../type-aliases/EventualMapper.md) used to group items.

#### Returns

`Promise`\<`Map`\<`K`, `V`[]\>\>

#### Example

```ts
await toPromiseIterator([1,2,3]).groupBy2(x => [x % 2 === 0, 2 * x];
// Map { true => [4], false => [2, 6]}
```

---

### includes()

> **includes**(`target`): `Promise`\<`boolean`\>

Returns true if this [PromiseIterator](PromiseIterator.md) yields an element equals to `target`

#### Parameters

##### target

[`Eventually`](../type-aliases/Eventually.md)\<`A`\>

value to look for

#### Returns

`Promise`\<`boolean`\>

A boolean promise resolving to true if this [AsyncFluentIterator](AsyncFluentIterator.md) yields an element equals to `target`, or resolving to false otherwise.
@

#### Remarks

```ts
iter.includes(target);
```

is equivalent to

```ts
iter.contains(x => x === target);
```

---

### join()

> **join**(`separator`?, `prefix`?, `suffix`?): `Promise`\<`string`\>

Joins items of this [PromiseIterator](PromiseIterator.md) into a string.

#### Parameters

##### separator?

`string`

string used to delimite elements

##### prefix?

`string`

string used to prefix the resulting string

##### suffix?

`string`

#### Returns

`Promise`\<`string`\>

#### Example

```ts
await toPromiseIterator([1, 2, 3]).join(',', '[', ']');
// "[1,2,3]"
```

#### Remarks

The items are converted into a string using string-interpolation.

---

### last()

> **last**(): `Promise`\<`undefined` \| `A`\>

Returns a Promise of the last element of this [PromiseIterator](PromiseIterator.md)

#### Returns

`Promise`\<`undefined` \| `A`\>

#### Example

```ts
await toPromiseIterator([1, 2]).last();
// 2

await PromiseIterator.empty().last();
// undefined
```

---

### map()

> **map**\<`B`\>(`mapper`): [`PromiseIterator`](PromiseIterator.md)\<`B`\>

Returns a new [PromiseIterator](PromiseIterator.md) consisting of applying the Mapper to all elements of this [PromiseIterator](PromiseIterator.md).

#### Type Parameters

• **B**

The type of the elements of the returned [PromiseIterator](PromiseIterator.md)

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `B`\>

Transformation applied to elements of this [PromiseIterator](PromiseIterator.md)

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`B`\>

A new [AsyncFluentIterator](AsyncFluentIterator.md)

#### Example

```ts
const iter = toPromiseIterator(['foo','bar',foobar'])
iter.map(s => s.length)
// asynchronously yields 3, 3, 6
```

---

### max()

> **max**(`comparator`?): `Promise`\<`undefined` \| `A`\>

Returns the maximum element according to the argument Comparator \| comparator.

#### Parameters

##### comparator?

`Comparator`\<`A`\>

#### Returns

`Promise`\<`undefined` \| `A`\>

#### Example

```ts
await toPromiseIterator([1, 2]).max();
// 2

await toPromiseIterator(['foo', 'foobar']).max((s1, s2) => s1.length - s2.length);
// 'foobar'

await PromiseIterator.empty().max(); // undefined
```

---

### min()

> **min**(`comparator`?): `Promise`\<`undefined` \| `A`\>

Returns the minimum element according to the argument Comparator \| comparator.

#### Parameters

##### comparator?

`Comparator`\<`A`\>

The {link Comparator} used to order the elements.

#### Returns

`Promise`\<`undefined` \| `A`\>

#### Example

```ts
await toPromiseIterator([1,2]).min();
// 1

await toPromiseIterator(['foo','foobar']).min(
   (s1,s2) => s1.length - s2.length
);
// 'foo'
(
await PrommiseIterator.empty().min();
// undefined
```

---

### minmax()

> **minmax**(`comparator`?): `Promise`\<`undefined` \| `MinMax`\<`A`\>\>

Returns the minimum and maximum element according to the argument Comparator \| comparator.

#### Parameters

##### comparator?

`Comparator`\<`A`\>

#### Returns

`Promise`\<`undefined` \| `MinMax`\<`A`\>\>

#### Example

```ts
await toPromiseIterator([1, 2]).minmax();
// { min: 1, max: 2}

await toPromiseIterator(['foo', 'foobar']).minmax((s1, s2) => s1.length - s2.length);
// { min: 'foo', max: 'foobar' }

await PromiseIterator.empty().minmax();
// undefined
```

---

### next()

> **next**(): `IteratorResult`\<`Promise`\<`A`\>, `any`\>

Used to make this [PromiseIterator](PromiseIterator.md) being seen as an
`Iterator<Promise<A?>`. This allows [PromiseIterator](PromiseIterator.md) objects to be
used in APIs expecting an `Iterator<Promise<A>>`

#### Returns

`IteratorResult`\<`Promise`\<`A`\>, `any`\>

#### Implementation of

`Iterator.next`

---

### partition()

> **partition**(`size`): `FluentIterator`\<`Promise`\<`A`\>[]\>

Returns a new [PromiseIterator](PromiseIterator.md) consiting of
partitions (arrays) of at most `size` elements.

#### Parameters

##### size

`number`

The size of the partitions.

#### Returns

`FluentIterator`\<`Promise`\<`A`\>[]\>

#### Example

```ts
toPromiseIterator([1, 2, 3, 4, 5]).partition(2);
// yields Promise([1, 2](, Promise([3, 4](, Promise([5])
```

#### Remarks

The last partition may contain less than `size` elements but is
never empty.

---

### prepend()

> **prepend**(`items`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Returns a new [PromiseIterator](PromiseIterator.md) that is the result of prepending its argument to this [PromiseIterator](PromiseIterator.md)

#### Parameters

##### items

An `Iterator` or `Iterable` whose items are prepended to this [PromiseIterator](PromiseIterator.md).

`Iterator`\<`Promise`\<`A`\>\> | `Iterable`\<`Promise`\<`A`\>\>

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

#### Example

```ts
toPromiseIterator([1, 2]).prepend([5, 6]);
// yields Promise(5), Promise(6), Promise(1), Promise(2)
```

---

### race()

> **race**(): `Promise`\<`undefined` \| `A`\>

Fluent version of `Promise.race`

#### Returns

`Promise`\<`undefined` \| `A`\>

---

### reduce()

> **reduce**(`reducer`, `initialValue`?): `Promise`\<`undefined` \| `A`\>

Special case of [PromiseIterator.fold](PromiseIterator.md#fold) where items being iteraded on and the accumulator are of the same type.

#### Parameters

##### reducer

[`EventualReducer`](../type-aliases/EventualReducer.md)\<`A`, `A`\>

The reducer to be applied at each iteration.

##### initialValue?

[`Eventually`](../type-aliases/Eventually.md)\<`A`\>

The value of the accumulator to be used in the first call to `reducer`. If omitted, the first element of this [PromiseIterator](PromiseIterator.md) is used.

#### Returns

`Promise`\<`undefined` \| `A`\>

#### Remarks

If the [PromiseIterator](PromiseIterator.md) is empty, `initialValue` is returned.

#### Example

```ts
To compute the sum of elements:
const sum = await toPromiseIterator([1,2,3])
   .reduce((acc, x) => acc + x)
// sum = 6
```

---

### removeNull()

> **removeNull**(): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

Returns a new [AsyncFluentIterator](AsyncFluentIterator.md) consisting of elements of this [AsyncFluentIterator](AsyncFluentIterator.md) that are not `null` nor `undefined`

#### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

a new [AsyncFluentIterator](AsyncFluentIterator.md) where all the `null` or `undefined` elements are removed.

---

### skip()

> **skip**(`n`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Returns a [PromiseIterator](PromiseIterator.md) skipping the first `n` elements of this [PromiseIterator](PromiseIterator.md) and then yielding the subsequent ones.

#### Parameters

##### n

`number`

The number of elements to skip

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

a [PromiseIterator](PromiseIterator.md) skpping the first `n` elements of this [PromiseIterator](PromiseIterator.md).

#### Remarks

If there are less than `n` elements in this [PromiseIterator](PromiseIterator.md), then an empty [PromiseIterator](PromiseIterator.md) is returned.

---

### skipWhile()

> **skipWhile**(`predicate`): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

Returns a new [AsyncFluentIterator](AsyncFluentIterator.md) that skips elements of this
[PromiseIterator](PromiseIterator.md) until the [predicate](../type-aliases/EventualPredicate.md)
evaluates to `true` and yields the subsequent ones.

#### Parameters

##### predicate

[`EventualPredicate`](../type-aliases/EventualPredicate.md)\<`A`\>

The predicate being evaluated

#### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

#### Example

```ts
toPromiseIterator([1, 2, 3]).skipWhile(x => x < 2); // asynchronously yields 2, 3
toPromiseiterator([1, 2, 3]).skipWhile(x => x > 2); // asynchronously yields 1, 2, 3
```

---

### some()

> **some**(`predicate`): `Promise`\<`boolean`\>

Returns a `Promise` resolving to `true` if the [predicate](../type-aliases/EventualPredicate.md) argument evalatues to true for
some items of this [PromiseIterator](PromiseIterator.md), or resolving to
false otherwsie.

#### Parameters

##### predicate

[`EventualPredicate`](../type-aliases/EventualPredicate.md)\<`A`\>

The predicate being evaluated

#### Returns

`Promise`\<`boolean`\>

#### Example

```ts
await toPromiseIterator([1, 2]).some(x => x > 1); // true
await toPromiseIterator([1, 2]).some(x => x > 2); // false
await PromiseIterator.empty().some(_ => true); // false;
```

---

### take()

> **take**(`n`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Returns a [PromiseIterator](PromiseIterator.md) yielding the first `n` elements of this [PromiseIterator](PromiseIterator.md).

#### Parameters

##### n

`number`

The number of elements to take

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

a [PromiseIterator](PromiseIterator.md) yielding the first `n` elements of this [PromiseIterator](PromiseIterator.md).

#### Remarks

If there are less than `n` elements in this [PromiseIterator](PromiseIterator.md), then only the available elements will be yielded.

---

### takeWhile()

> **takeWhile**(`predicate`): [`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

Returns a new [AsyncFluentIterator](AsyncFluentIterator.md) that yields elements of this [PromiseIterator](PromiseIterator.md) while the [predicate](../type-aliases/EventualPredicate.md) evaluates to `true`.

#### Parameters

##### predicate

[`EventualPredicate`](../type-aliases/EventualPredicate.md)\<`A`\>

The predicate being evaluated

#### Returns

[`AsyncFluentIterator`](AsyncFluentIterator.md)\<`A`\>

#### Example

```ts
toPromiseIterator([1, 2, 3]).takeWhile(x => x < 2); // async yields 1
toPromiseIterator([1, 2, 3]).takeWhile(x => x > 2); // empty async iterator
```

---

### tally()

> **tally**(): `Promise`\<`Map`\<`A`, `number`\>\>

Returns a `Promise` of a `Map` of the count of the occurences of each items of
this [PromiseIterator](PromiseIterator.md),

#### Returns

`Promise`\<`Map`\<`A`, `number`\>\>

#### Example

```ts
await toPromiseIterator([foo','bar','foo']).tally();
// Map { 'foo' => 2, bar => 1 }
```

---

### tap()

> **tap**(`mapper`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Returns a new [PromiseIterator](PromiseIterator.md) that
yields the same elements as this [PromiseIterator](PromiseIterator.md)
and executes the [mapper](../type-aliases/EventualMapper.md) on each element.

#### Parameters

##### mapper

[`EventualMapper`](../type-aliases/EventualMapper.md)\<`A`, `any`\>

the operation to be invoked on each element.

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

#### Remarks

This can be useful to see intermediate steps of complex [PromiseIterator](PromiseIterator.md). The results of invoking the `mapper` are ignored unless it throwws.

#### Example

```ts
const iter = toPromise([1, 2, 3]);
iter
  .tap(x => console.log(`before filter ${x}`))
  .filter(x => x % 2 === 0)
  .tap(x => console.log(`after filter: ${x}`))
  .collect();
// ouputs:
// before filter 1
// before filter 2
// after filter: 2
// before filter 3
// result : [ 2 ]
```

---

### transform()

> **transform**\<`B`\>(`mapper`): [`PromiseIterator`](PromiseIterator.md)\<`B`\>

Returns a new FluentIterator that is the result of transforming this FluentIterator.
This method allows to extends the class FluentIterator using `Iterator` transformation`

#### Type Parameters

• **B**

#### Parameters

##### mapper

`Mapper`\<`Iterator`\<`Promise`\<`A`\>\>, `Iterator`\<`Promise`\<`B`\>\>\>

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`B`\>

#### Example

```ts
function doublePromiseIterator(Iterator<Promise<number>>: iter) {
   for (;;) {
      const item = iter.next();
      if (item.done) break;
      yield item.value.then(v => 2 * v)
   }
}
await iterator([1,2,3]).toPromise().transform(doublePromiseIterator).collect()
// [2, 4, 6]
```

---

### zip()

> **zip**\<`B`\>(`other`): [`PromiseIterator`](PromiseIterator.md)\<\[`A`, `B`\]\>

Returns a new [PromiseIterator](PromiseIterator.md) that yields pairs of elements
yielded by each Iterators which are navigated in parallel.
The length of the new [PromiseIterator](PromiseIterator.md) is equal to the length the shorter iterator.

#### Type Parameters

• **B**

The type of elements of the `other` iterator.

#### Parameters

##### other

The iterator that is combined with this one.

`Iterator`\<`Promise`\<`B`\>\> | `Iterable`\<`Promise`\<`B`\>\>

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<\[`A`, `B`\]\>

#### Example

```ts
const iter = toPromiseIterator([1, 2, 3]);
const zipped = iter.zip(asyncIterator(['a', 'b']));
// zipped will yield Promise([1,"a"]), Promise([2,"b"])
```

---

### empty()

> `static` **empty**\<`A`\>(): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Creates an empty [PromiseIterator](PromiseIterator.md). The returned iterator will not yield any element.

#### Type Parameters

• **A** = `never`

the type of elements of the `PromiseIterator`

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

An empty [PromiseIterator](PromiseIterator.md)

---

### from()

> `static` **from**\<`A`\>(`generator`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Creates a [PromiseIterator](PromiseIterator.md) from an `IteratorGenerator<Promise<A>>`.

#### Type Parameters

• **A**

the type of elements

#### Parameters

##### generator

`IteratorGenerator`\<`Promise`\<`A`\>\>

Used to generate an `AsyncIterator` that will be wrapped into a `PromiseIterator`

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

A new `PromiseIterator`

---

### singleton()

> `static` **singleton**\<`A`\>(`a`): [`PromiseIterator`](PromiseIterator.md)\<`A`\>

Creates a singleton operator. The returned iterator will yield a single or no element.

-

#### Type Parameters

• **A**

the type of elements of the `PromiseIterator`.

- This is useful to use a fluent interface on class that are not fluent.

#### Parameters

##### a

[`Eventually`](../type-aliases/Eventually.md)\<`A`\>

#### Returns

[`PromiseIterator`](PromiseIterator.md)\<`A`\>

A `PromiseIterator` yielding at most one element.

#### Example

```ts
const str = await PromiseIterator.singleton('foobar').map(f).map(g).first();
*
*
```
