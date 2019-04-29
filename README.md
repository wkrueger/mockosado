# mockosado

Dependency interceptor.

# Usage

- Declare something that may be mocked in the future (i.e. for a test).

```ts
function createCow() {
  return {
    yet: "another animal placeholder"
  }
}
```

- Do not export the implementation, instead, hand it to the interceptor.
- Export a "token" for the module

```ts
import { createToken, registerModule } from 'mockosado'
export cowToken = createToken('cow', createCow)
registerModule(cowToken, createCow)
```

- The token does not carry the implementation, only its type signature
- Consume the module

```ts
import { loadModule } from "mockosado"
import { cowToken } from "./cow"
const createCow = loadModule(cowToken)
```

- Creating a mock implementation for cow

```ts
import { cowToken } from "./cow"
import { Scopes, registerModule, loadModule } from "mockosado"

const createCow = loadModule(cowToken, Scopes.execution /* optional */)

function createMockCow() {
  const productionCow = createCow()
  productionCow.moo = true
  return productionCow
}

// typechecks for similar signatures
const mockCowToken = cowToken.cloneForScope(createMockCow, Scopes.test)
registerModule(mockCowToken, createMockCow)
```

- Modules versions are grouped by name
- Scopes guarrantee that a desired version is loaded, regardless of loading order.
- Currently the only available scopes are "execution" and "test"

- Consuming the mock

```ts
import { setScope, Scopes, loadModule } from "mockosado"
setScope(Scopes.test)
import { mockCowToken } from "./mock-cow"
const mockCow = loadModule(mockCowToken)
```

- Consuming only the types

```ts
import { ModuleType } from "mockosado"
import { cowToken } from "./cow"

function consumesCow(cow: ModuleType<typeof cowToken>) {}
```

# Why this?

- Transparent module loading (does not get into node's)
- Use types to help ensuring implementations are being consumed through the injector, not directly imported
- "Tokens" ensure that the implementation is loaded before being consumed
- Scopes ensure a mock has loading priority over a non-mock, regardless of loading order
- Loading both implementations of an interface with little fuss
