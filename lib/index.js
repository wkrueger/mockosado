"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scopes = {
    execution: Symbol(),
    test: Symbol(),
    local: Symbol()
};
const MODULE_NOT_FOUND = Symbol();
class InjectorContext {
    constructor(scope = exports.Scopes.execution) {
        this.scope = scope;
        this.modules = {};
        this.moduleTokens = {};
    }
    register(token, mod) {
        const existingToken = this.moduleTokens[token.name];
        if (existingToken) {
            if (existingToken === token)
                return;
            throw Error("Attemting to register 2 overlapping modules.");
        }
        this.modules[token.name] = mod;
        this.moduleTokens[token.name] = token;
    }
    load(token) {
        const found = this.modules[token.name];
        if (found === undefined) {
            return MODULE_NOT_FOUND;
        }
        else
            return found;
    }
}
const runtimeCtx = new InjectorContext(exports.Scopes.execution);
const testCtx = new InjectorContext(exports.Scopes.test);
let contextStack = [];
function setScope(sc) {
    if (sc === exports.Scopes.execution) {
        contextStack = [runtimeCtx];
    }
    else if (sc === exports.Scopes.test) {
        contextStack = [testCtx, runtimeCtx];
    }
}
exports.setScope = setScope;
setScope(exports.Scopes.execution);
const TokenBrand = Symbol();
class ModuleToken {
    constructor(name) {
        this.name = name;
        this.brand = TokenBrand;
        this.scope = exports.Scopes.execution;
    }
    cloneForScope(impl, scope) {
        const out = new ModuleToken(this.name);
        out.scope = scope;
        return out;
    }
}
exports.ModuleToken = ModuleToken;
function createToken(identifier, _impl, scope = exports.Scopes.execution) {
    const out = new ModuleToken(identifier);
    out.scope = scope;
    return out;
}
exports.createToken = createToken;
function registerModule(token, mod) {
    for (let x = 0; x < contextStack.length; x++) {
        const ctx = contextStack[x];
        if (ctx.scope === token.scope) {
            return ctx.register(token, mod);
        }
    }
    throw Error("no scope for module");
}
exports.registerModule = registerModule;
function loadModule(token, scope) {
    let _contextStack = contextStack;
    if (scope)
        _contextStack = contextStack.filter(x => x.scope === scope);
    for (let x = 0; x < _contextStack.length; x++) {
        const ctx = _contextStack[x];
        const tryLoad = ctx.load(token);
        if (tryLoad === MODULE_NOT_FOUND)
            continue;
        else
            return tryLoad;
    }
    throw Error(`Injector: Module for ${token.name} not found`);
}
exports.loadModule = loadModule;
//# sourceMappingURL=index.js.map