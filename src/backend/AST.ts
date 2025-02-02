import { Loc } from "../frontend/Token.ts";
import { TypesNative } from "../runtime/Values.ts";

export type NodeType =
    | "Program"
    | "VarDeclaration"
    | "AssignmentDeclaration"
    | "Identifier"
    | "IntLiteral"
    | "FloatLiteral"
    | "BinaryLiteral"
    | "StringLiteral"
    | "NullLiteral"
    | "BinaryExpr";

export interface Stmt {
    kind: NodeType;
    type: TypesNative | TypesNative[];
    // deno-lint-ignore no-explicit-any
    value: any;
    loc: Loc;
}

export interface Expr extends Stmt {}

export interface Program extends Stmt {
    kind: "Program";
    type: "null";
    body?: Stmt[];
}

export interface BinaryExpr extends Expr {
    kind: "BinaryExpr";
    left: Expr;
    right: Expr;
    operator: string;
}

export interface Identifier extends Expr {
    kind: "Identifier";
    value: string;
}

export function AST_IDENTIFIER(id: string = "err", loc: Loc): Identifier {
    return {
        kind: "Identifier",
        type: "id",
        value: id,
        loc: loc,
    } as Identifier;
}

export interface StringLiteral extends Expr {
    kind: "StringLiteral";
    value: string;
}

export function AST_STRING(str: string = "err", loc: Loc): StringLiteral {
    return {
        kind: "StringLiteral",
        type: "string",
        value: str,
        loc: loc,
    } as StringLiteral;
}

export interface IntLiteral extends Expr {
    kind: "IntLiteral";
    value: number;
}

export function AST_INT(n: number = 0, loc: Loc): IntLiteral {
    return {
        kind: "IntLiteral",
        type: "int",
        value: n,
        loc: loc,
    } as IntLiteral;
}

export interface FloatLiteral extends Expr {
    kind: "FloatLiteral";
    value: number;
}

export function AST_FLOAT(n: number = 0, loc: Loc): FloatLiteral {
    return {
        kind: "FloatLiteral",
        type: "float",
        value: n,
        loc: loc,
    } as FloatLiteral;
}

export interface BinaryLiteral extends Expr {
    kind: "BinaryLiteral";
    value: string;
}

export function AST_BINARY(n: string = "0b0", loc: Loc): BinaryLiteral {
    return {
        kind: "BinaryLiteral",
        type: "binary",
        value: n,
        loc: loc,
    } as BinaryLiteral;
}

export interface NullLiteral extends Expr {
    kind: "NullLiteral";
    value: null;
}

export function AST_NULL(loc: Loc): NullLiteral {
    return {
        kind: "NullLiteral",
        type: "null",
        value: null,
        loc: loc,
    } as NullLiteral;
}

// Declarations {{

// new age: int = 17 | new mut name: string = "Fernando"
export interface VarDeclaration extends Stmt {
    kind: "VarDeclaration";
    type: TypesNative | TypesNative[]; // Type of variable
    id: Identifier;
    value: Stmt;
    constant: boolean;
}

// name = "Trump"
export interface AssignmentDeclaration extends Stmt {
    kind: "AssignmentDeclaration";
    type: TypesNative; // Type of variable
    id: Identifier;
    value: Stmt;
}

// }}
