import { Loc, NativeValue } from "../frontend/Token.ts";

export type TypesNative =
    | "string"
    | "id"
    | "int"
    | "bool"
    | "null"
    | "float"
    | "binary";

export const TypesNativeArray: string[] = [
    "string",
    "id",
    "int",
    "bool",
    "null",
    "float",
    "binary",
];

export interface RuntimeValue {
    type?: TypesNative;
    value: NativeValue;
    loc: Loc;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: null;
}

export function VALUE_NULL(n: null = null, loc: Loc): NullValue {
    return { type: "null", value: n, loc: loc };
}

export interface IntValue extends RuntimeValue {
    type: "int";
    value: number;
}

export function VALUE_INT(n: number = 0, loc: Loc): IntValue {
    return { type: "int", value: n, loc: loc };
}

export interface FloatValue extends RuntimeValue {
    type: "float";
    value: number;
}

export function VALUE_FLOAT(n: number = 0, loc: Loc): FloatValue {
    return { type: "float", value: n, loc: loc };
}

export interface StringValue extends RuntimeValue {
    type: "string";
    value: string;
}

export function VALUE_STRING(n: string = "error", loc: Loc): StringValue {
    return { type: "string", value: n, loc: loc };
}

export interface BooleanValue extends RuntimeValue {
    type: "bool";
    value: boolean;
}

export function VALUE_BOOL(n: boolean = false, loc: Loc): BooleanValue {
    return { type: "bool", value: n, loc: loc };
}

export interface VarDeclarationValue {
    types: TypesNative[];
    value: RuntimeValue;
}
