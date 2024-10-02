
export interface TestObject {
    a: number;
    b: string;
    c: {
        a: string;
        b: number;
    }
}

export interface AnotherTestObject {
	a: number;
}

export interface WebApi {
    add(a: number, b: number): number;
    concat(a: string, b: number): string;
    objectConcat(o: TestObject): string;
	objectAdd(o: AnotherTestObject, a: number): number;
    stringOut(): string;
    objectReturn(): TestObject;
    cbTest(cb: (greet: string) => void): void;
	cbTestR(cb: (greet: string) => string): void;
}
