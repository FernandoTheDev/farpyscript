export type TypesNative =
    | "string"
    | "int"
    | "bool"
    | "null"
    | "float"
    | "binary";

export interface RuntimeValue {
    kind: TypesNative;
    value?: any;
}

export interface NullValue extends RuntimeValue {
    kind: "null";
    value: null;
}

export function VALUE_NULL(n: null = null): NullValue {
    return { kind: "null", value: n };
}

export interface IntValue extends RuntimeValue {
    kind: "int";
    value: number;
}

export function VALUE_INT(n: number = 0): IntValue {
    return { kind: "int", value: n };
}

export interface FloatValue extends RuntimeValue {
    kind: "float";
    value: number;
}

export function VALUE_FLOAT(n: number = 0): FloatValue {
    return { kind: "float", value: n };
}

export interface StringValue extends RuntimeValue {
    kind: "string";
    value: string;
}

export function VALUE_STRING(n: string = "error"): StringValue {
    return { kind: "string", value: n };
}

export interface BooleanValue extends RuntimeValue {
    kind: "bool";
    value: boolean;
}

export function VALUE_BOOL(n: boolean = false): BooleanValue {
    return { kind: "bool", value: n };
}
