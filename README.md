# Typescript Fluent Iterators

Provides [fluent api](https://en.wikipedia.org/wiki/Fluent_interface)
operations on async iterators and promise iterators.

## Description

The library provides the common transformation, filtering and
aggregation operations on async iterators and promise iterators.

## Quick start guide

Install from [Node Package Manager](https://www.npmjs.com/): `npm i ts-fluent-iterators-async`

## Operations supported

- Item-by-item transformations:

  - [map](docs/classes/FluentIterator.md#map)
  - [enumerate](docs/classes/FluentIterator.md#enumerate)

- Group transformations like

  - [partition](docs/classes/FluentIterator.md#partition)
  - [tally](docs/classes/FluentIterator.md#tally)

- Extending operations like

  - [append](docs/classes/FluentIterator.md#append)
  - [prepend](docs/classes/FluentIterator.md#prepend)
  - [concat](docs/classes/FluentIterator.md#concat)

- Narrowing operations like

  - [filter](docs/classes/FluentIterator.md#filter)
  - [take](docs/classes/FluentIterator.md#take)
  - [takeWhile](docs/classes/FluentIterator.md#takewhile)
  - [skip](docs/classes/FluentIterator.md#skip)
  - [skipWhile](docs/classes/FluentIterator.md#skipwhile)
  - [first](docs/classes/FluentIterator.md#first)
  - [last](docs/classes/FluentIterator.md#last)

- Aggregating operations:

  - [collect](docs/classes/FluentIterator.md#collect)
  - [groupBy](docs/classes/FluentIterator.md#groupby)
  - [tally](docs/classes/FluentIterator.md#tally)
  - [collectToSet](docs/classes/FluentIterator.md#collecttoset)
  - [collectTo](docs/classes/FluentIterator.md#collectto)
  - [collectToMap](docs/classes/FluentIterator.md#collecttomap)
  - [collectToObject2](docs/classes/FluentIterator.md#collecttoobject)
  - [fold](docs/classes/FluentIterator.md#fold)
  - [reduce](docs/classes/FluentIterator.md#reduce)
  - [join](docs/classes/FluentIterator.md#join)
  - [count](docs/classes/FluentIterator.md#count)
  - [max](docs/classes/FluentIterator.md#max)
  - [min](docs/classes/FluentIterator.md#min)

- Logical aggregating operations:

  - [all](docs/classes/FluentIterator.md#all)
  - [some](docs/classes/FluentIterator.md#some)
  - [contains](docs/classes/FluentIterator.md#contains)
  - [includes](docs/classes/FluentIterator.md#includes)

- Execution operations:

  - [tap](docs/classes/FluentIterator.md#tap)
  - [forEach](docs/classes/FluentIterator.md#foreach)

- Promise specific operations:
  - [flatMap](docs/classes/PromiseIterator.md#flatmap)
  - [allSettled](docs/classes/PromiseIterator.md#allsettled)
  - [race](docs/classes/PromiseIterator.md#race)
  - [any](docs/classes/PromiseIterator.md#any)

## Usage

Click here for the [Full API Reference](docs/README.md).

## License

Licensed under [MIT](https://en.wikipedia.org/wiki/MIT_License).
