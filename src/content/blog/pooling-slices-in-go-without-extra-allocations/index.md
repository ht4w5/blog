---
title: "Pooling slices in Go without extra allocations"
date: 2026-11-20
description: "Reusing slices with sync.Pool in Go, and why pooling a slice value allocates on every put."
tags: ["Go", "optimization"]
draft: false
---

Sometimes in Go we reuse allocated slices with [sync.Pool](https://pkg.go.dev/sync#Pool) to reduce GC pressure. What might feel intuitive to write (at least to me as a beginner) is something like this:

```go
var slicePool = sync.Pool{
	New: func() any {
		return make([]byte, 10)
	},
}

func getSlice() []byte {
	return slicePool.Get().([]byte)
}

func putSlice(s []byte) {
	slicePool.Put(s)
}
```

However this is actually sub-optimal and triggers an allocation every time we put a slice in the pool.

## Interface assignment allocation

In the previous example, when we call `slicePool.Put(s)`, the value of `s` is assigned to an `any` or `interface{}` type[^1] in [sync.Pool.Put](https://pkg.go.dev/sync#Pool.Put). Since the slice header is almost always larger than a word and its value is escaping to the pool, the header is allocated and copied to the heap and the interface type stores a pointer to it. (`getSlice` also creates an `interface{}` with the slice header value but since it does not escape, the value is put on the stack.) The allocated slice header is never reused because we're not maintaining a reference to it when getting slices. Therefore every get-put cycle creates a new allocation, diminishing the effects of slice reuse.

An example:

```go
package main

import (
	"fmt"
	"testing"
)

var iface any // Package level so value escapes.

func main() {
	buf := make([]byte, 4)

	fmt.Println(testing.AllocsPerRun(1000, func() { iface = buf }))
}
```
```
1
```

## The better approach

A pointer to the slice header should be used instead because pointers can be put into an `interface{}` without an allocation[^2]. A straightforward example:

```go
var slicePtrPool = sync.Pool{
	New: func() any {
		b := make([]byte, 10)
		return &b
	},
}

func getPtrSlice() *[]byte {
	return slicePtrPool.Get().(*[]byte)
}

func putPtrSlice(s *[]byte) {
	slicePtrPool.Put(s)
}
```

In this approach, an extra slice header is allocated on the heap with each slice, but it is always reused because the pool tracks the pointer to it.

Note that we don't need to do this with maps, channels or functions because they are already pointers.

## A common pattern

It's awkward to work with slice pointers, so in practice I usually don't pool slices. Instead, I like to pool structs that own a slice:

```go
const (
	chunkSize    = 1 << 16 // 64KB
)

var chunkPool = sync.Pool{
	New: func() any {
		return &chunk{
			b: make([]byte, chunkSize),
		}
	},
}

type chunk struct {
	b        []byte
	useCount int
}
```

The pool tracks pointers to `chunk` and we can access the slice naturally with `chunk.b`.

## See also

- https://golang.design/under-the-hood/en/part2lang/ch04type/interface: cases of interface boxing decisions.
- https://victoriametrics.com/blog/go-sync-pool: Go `sync.Pool` mechanics.

[^1]: `any` is an alias for `interface{}` and is equivalent to `interface{}` in all ways. See https://pkg.go.dev/builtin#any.
[^2]: See https://github.com/golang/go/blob/7b2881024c95a11ddb86663a616340aa3a88b67f/src/sync/example_pool_test.go#L17.
