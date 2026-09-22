---
title: "Test"
date: 2026-09-23
description: "Test description."
tags: ["site"]
draft: false
---

Test.

## Code examples

```go
package user

import (
	"fmt"
	"net/mail"
	"uuid"
)

type User struct {
	id    uuid.UUID
	email string
}

func NewUser(email string) (u User, err error) {
	_, err = mail.ParseAddress(email)
	if err != nil {
		err = fmt.Errorf("invalid email %q: %w", email, err)
		return
	}
	u.id = uuid.NewV7()
	u.email = email
	return
}

func (u *User) ID() uuid.UUID { return u.id }
func (u *User) Email() string { return u.email }
```

```json
{
  "Rx": 2050882821,
  "Tx": 518592203,
  "Misses": 12888398,
  "Wraps": 868,
  "Collisions": 0,
  "Corruptions": 0,
  "Vacuums": 98,
  "Allocated": 1006632960
}
```

## Images

![cat](Untitled.png)
