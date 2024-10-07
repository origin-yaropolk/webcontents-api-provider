// @ts-nocheck
/* eslint-disable no-multi-spaces, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unnecessary-type-constraint */
type Method<P extends unknown[], R extends unknown = unknown> = (...args: P) => R;
type PromisifyedMethod<P extends unknown[], R extends unknown = unknown> = Method<P, Promise<R>>;

type DecayPromiseAndMethod<R> =
	R extends Promise<infer T> ? DecayPromiseAndMethod<T> :
	R extends Method<infer P>  ? PromisifyMethod<R> :
	R;

type PromisifyMethod<M> =
	M extends Method<infer P, infer R> ? PromisifyedMethod<P, DecayPromiseAndMethod<R>> :
	never;

export type Promisify<T> = {
	[K in keyof T]:
		T[K] extends Method<infer P> ? PromisifyMethod<T[K]> :
		never;
};
/* eslint-enable no-multi-spaces */
