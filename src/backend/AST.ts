import { Loc, Token } from "../frontend/Token.ts";
import { TypesNative } from "../runtime/Values.ts";

export type NodeType =
    | "Program"
    | "CallExpr"
    | "FunctionDeclaration"
    | "LambdaExpr"
    | "ReturnStatement"
    | "IfStatement"
    | "BlockStmt"
    | "ReturnStatement"
    | "VarDeclaration"
    | "AssignmentDeclaration"
    | "Identifier"
    | "IntLiteral"
    | "FloatLiteral"
    | "BinaryLiteral"
    | "StringLiteral"
    | "NullLiteral"
    | "IncrementExpr"
    | "DecrementExpr"
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

export interface IncrementExpr extends Expr {
    kind: "IncrementExpr";
    value: Expr;
}

export interface DecrementExpr extends Expr {
    kind: "DecrementExpr";
    value: Expr;
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

// <ARGS> = <ID> : <TYPES> , ....
// fn <ID> (<ARGS>): <R_TYPE> <BLOCK>
// fn main(x: int, y: binary:float): int|float { return x * y }
export interface FunctionDeclaration extends Stmt {
    kind: "FunctionDeclaration";
    type: TypesNative | TypesNative[]; // Type of return
    args: { id: Identifier; type: TypesNative | TypesNative[] }; // Args
    id: Identifier; // name of function
    block: Stmt[];
}

// }}

// Expressions {{

// print(n, z, x, y, ...)
export interface CallExpr extends Expr {
    kind: "CallExpr";
    type: TypesNative; // Type of return
    id: Identifier;
    args: Expr[];
}

export interface LambdaExpr extends Expr {
    kind: "LambdaExpr";
    externalVars: Identifier[]; // Variables captured from the outer scope
    args: { id: Identifier; type: TypesNative | TypesNative[] }[];
    type: TypesNative | TypesNative[];
    body: Stmt[];
}

// }}

// Statements {{

export interface ReturnStatement extends Stmt {
    kind: "ReturnStatement";
    type: TypesNative | TypesNative[]; // Type of return
    value: Expr;
}

export interface IfStatement extends Stmt {
    kind: "IfStatement";
    type: TypesNative | TypesNative[]; // Type of return if exists
    value: Expr | Expr[] | Stmt; // Value of return if exists
    condition: Expr | Expr[];
    primary: Stmt[]; // if () {}
    secondary: Stmt[]; // else {} | else if {}
}

export interface BlockStmt extends Stmt {
    kind: "BlockStmt";
    body: Stmt[]; // Lista de declarações dentro do bloco
    endToken: Token; // Token de fechamento, útil para informações de localização
}

// }}
