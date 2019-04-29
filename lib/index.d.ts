export declare const Scopes: {
    execution: symbol;
    test: symbol;
    local: symbol;
};
declare type Scope = typeof Scopes[keyof typeof Scopes];
export declare function setScope(sc: Scope): void;
export declare class ModuleToken<T> {
    name: string;
    brand: symbol;
    scope: symbol;
    constructor(name: string);
    cloneForScope(impl: T, scope: Scope): ModuleToken<{}>;
}
export declare function createToken<T>(identifier: string, _impl: T, scope?: symbol): ModuleToken<T>;
export declare function registerModule(token: ModuleToken<any>, mod: any): void;
export declare function loadModule<T>(token: ModuleToken<T>, scope?: Scope): T;
export declare type ModuleType<Token> = Token extends ModuleToken<infer R> ? R : never;
export {};
