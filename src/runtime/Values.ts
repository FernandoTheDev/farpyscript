import { Expr as _Expr, Identifier, Stmt } from "../backend/AST.ts";
import { Loc, NativeValue } from "../frontend/Token.ts";
import Context from "./context/Context.ts";

export type TypesNative =
    | "string"
    | "id"
    | "int"
    | "bool"
    | "null"
    | "float"
    | "native-fn"
    | "function"
    | "binary"
    | "void"
    | "lambda"
    | FunctionType;

export const TypesNativeArray: string[] = [
    "string",
    "id",
    "int",
    "bool",
    "null",
    "float",
    "native-fn",
    "function",
    "binary",
    "void",
    "lambda",
    "FunctionType",
];

export interface RuntimeValue {
    type?: TypesNative | TypesNative[];
    value: NativeValue;
    ret: boolean; // Para controle de fluxo
    loc: Loc;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: null;
}

export function VALUE_NULL(n: null = null, loc: Loc): NullValue {
    return { type: "null", value: n, loc: loc, ret: false };
}

export interface IntValue extends RuntimeValue {
    type: "int";
    value: number;
}

export function VALUE_INT(n: number = 0, loc: Loc): IntValue {
    return { type: "int", value: n, loc: loc, ret: false };
}

export interface FloatValue extends RuntimeValue {
    type: "float";
    value: number;
}

export function VALUE_FLOAT(n: number = 0, loc: Loc): FloatValue {
    return { type: "float", value: n, loc: loc, ret: false };
}

export interface StringValue extends RuntimeValue {
    type: "string";
    value: string;
}

export function VALUE_STRING(n: string = "error", loc: Loc): StringValue {
    return { type: "string", value: n, loc: loc, ret: false };
}

export interface BooleanValue extends RuntimeValue {
    type: "bool";
    value: boolean;
}

export function VALUE_BOOL(n: boolean = false, loc: Loc): BooleanValue {
    return { type: "bool", value: n, loc: loc, ret: false };
}

export interface VoidValue extends RuntimeValue {
    type: "void";
    value: "void";
}

export function VALUE_VOID(loc: Loc): VoidValue {
    return { type: "void", value: "void", loc: loc, ret: false };
}

export interface VarDeclarationValue {
    types: TypesNative[];
    value: RuntimeValue;
}

export type FunctionType = {
    params: TypesNative[];
    return: TypesNative;
};

export interface ArgsValue {
    type: TypesNative[] | TypesNative; // Lista dos tipos esperados para cada parâmetro fixo
    id?: Identifier; // Se definido, indica que a partir do último parâmetro todos devem ser deste tipo
}

export type FunctionCall = (
    args: RuntimeValue[],
    context: Context,
) => RuntimeValue;

export interface NativeFnValue extends RuntimeValue {
    kind: "native-fn";
    call: FunctionCall;
}

export function NATIVE_FN(call: FunctionCall) {
    return { kind: "native-fn", call } as NativeFnValue;
}

export interface FunctionNativeDeclarationValue extends RuntimeValue {
    kind: "native-fn";
    infinity: boolean;
    args: ArgsValue[];
    type: TypesNative[];
    context: Context;
    fn: NativeFnValue;
}

export interface FunctionValue extends RuntimeValue {
    kind: "function";
    id: Identifier;
    type: TypesNative[];
    context: Context;
    args: ArgsValue[];
    body: Stmt[];
}

export interface LambdaValue extends RuntimeValue {
    kind: "lambda";
    type: TypesNative[];
    context: Context;
    args: ArgsValue[];
    body: Stmt[];
    externalVars: Identifier[];
}
