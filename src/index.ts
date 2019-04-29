export const Scopes = {
  execution: Symbol(),
  test: Symbol(),
  local: Symbol()
}

const MODULE_NOT_FOUND = Symbol()

class InjectorContext {
  constructor(public scope = Scopes.execution) {}
  modules: Record<string, any> = {}
  moduleTokens: Record<string, any> = {}

  register(token: ModuleToken<any>, mod: any) {
    const existingToken = this.moduleTokens[token.name]
    if (existingToken) {
      if (existingToken === token) return
      throw Error("Attemting to register 2 overlapping modules.")
    }
    this.modules[token.name] = mod
    this.moduleTokens[token.name] = token
  }

  load(token: ModuleToken<any>) {
    const found = this.modules[token.name]
    if (found === undefined) {
      return MODULE_NOT_FOUND
    } else return found
  }
}

const runtimeCtx = new InjectorContext(Scopes.execution)
const testCtx = new InjectorContext(Scopes.test)

let contextStack = [] as InjectorContext[]

type Scope = typeof Scopes[keyof typeof Scopes]

export function setScope(sc: Scope) {
  if (sc === Scopes.execution) {
    contextStack = [runtimeCtx]
  } else if (sc === Scopes.test) {
    contextStack = [testCtx, runtimeCtx]
  }
}
setScope(Scopes.execution)

const TokenBrand = Symbol()

export class ModuleToken<T> {
  brand = TokenBrand
  scope = Scopes.execution
  constructor(public name: string) {}

  cloneForScope(impl: T, scope: Scope) {
    const out = new ModuleToken(this.name)
    out.scope = scope
    return out
  }
}

export function createToken<T>(identifier: string, _impl: T, scope = Scopes.execution) {
  const out = new ModuleToken<T>(identifier)
  out.scope = scope
  return out
}

export function registerModule(token: ModuleToken<any>, mod: any) {
  for (let x = 0; x < contextStack.length; x++) {
    const ctx = contextStack[x]
    if (ctx.scope === token.scope) {
      return ctx.register(token, mod)
    }
  }
  throw Error("no scope for module")
}

export function loadModule<T>(token: ModuleToken<T>, scope?: Scope): T {
  let _contextStack = contextStack
  if (scope) _contextStack = contextStack.filter(x => x.scope === scope)
  for (let x = 0; x < _contextStack.length; x++) {
    const ctx = _contextStack[x]
    const tryLoad = ctx.load(token)
    if (tryLoad === MODULE_NOT_FOUND) continue
    else return tryLoad
  }
  throw Error(`Injector: Module for ${token.name} not found`)
}

export type ModuleType<Token> = Token extends ModuleToken<infer R> ? R : never
