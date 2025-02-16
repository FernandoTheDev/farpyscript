import {
    AssignmentDeclaration,
    BinaryExpr,
    BinaryLiteral,
    CallExpr,
    DecrementExpr,
    FunctionDeclaration,
    Identifier,
    IfStatement,
    IncrementExpr,
    Program,
    Stmt,
    VarDeclaration,
} from "../backend/AST.ts";
import { ErrorReporter } from "../error/ErrorReporter.ts";
import {
    BooleanValue,
    FloatValue,
    IntValue,
    NullValue,
    RuntimeValue,
    VALUE_BOOL,
    VALUE_FLOAT,
    VALUE_INT,
    VALUE_NULL,
    VALUE_STRING,
} from "./Values.ts";
import VarDeclarationRuntime from "./declarations/VarDeclarationRuntime.ts";
import Context from "./context/Context.ts";
import { IdentifierExpressionRuntime } from "./expressions/IdentifierExpression.ts";
import AssignmentDeclarationRuntime from "./declarations/AssignmentDeclarationRuntime.ts";
import { TypesNative } from "./Values.ts";
import CallExpressionRuntime from "./expressions/CallExpressionRuntime.ts";
import { DecrementExpressionRuntime } from "./expressions/DecrementExpressionRuntime.ts";
import { IncrementExpressionRuntime } from "./expressions/IncrementExprssionRuntime.ts";
import FunctionDeclarationRuntime from "./declarations/FunctionDeclarationRuntime.ts";
import { IfStatementRuntime } from "./statements/IfStatementRuntime.ts";
export default class Runtime {
    private context: Context;

    public constructor(context: Context) {
        this.context = context;
    }

    public evaluate(stmt: Stmt): RuntimeValue {
        // console.log(stmt);
        switch (stmt.kind) {
            case "Program":
                return this.evaluate_program(stmt as Program);
            case "IntLiteral":
                return VALUE_INT(stmt.value, stmt.loc);
            case "FloatLiteral":
                return VALUE_FLOAT(stmt.value, stmt.loc);
            case "BinaryLiteral":
                return this.evaluate_binary_literal(stmt as BinaryLiteral);
            case "NullLiteral":
                return VALUE_NULL(null, stmt.loc);
            case "StringLiteral":
                return VALUE_STRING(stmt.value, stmt.loc);
            case "BinaryExpr":
                return this.evaluate_binary_expr(stmt as BinaryExpr);
            case "ReturnStatement":
                return this.evaluate(stmt.value);
            case "VarDeclaration":
                return VarDeclarationRuntime.evaluate(
                    stmt as VarDeclaration,
                    this.context,
                    this,
                );
            case "FunctionDeclaration":
                return FunctionDeclarationRuntime.evaluate(
                    stmt as FunctionDeclaration,
                    this.context,
                    this,
                );
            case "CallExpr":
                return CallExpressionRuntime.evaluate(
                    stmt as CallExpr,
                    this.context,
                    this,
                );
            case "AssignmentDeclaration":
                return AssignmentDeclarationRuntime.evaluate(
                    stmt as AssignmentDeclaration,
                    this.context,
                    this,
                );
            case "Identifier":
                return IdentifierExpressionRuntime.evaluate(
                    stmt as Identifier,
                    this.context,
                    this,
                );
            case "DecrementExpr":
                return DecrementExpressionRuntime.evaluate(
                    stmt as DecrementExpr,
                    this.context,
                    this,
                );
            case "IncrementExpr":
                return IncrementExpressionRuntime.evaluate(
                    stmt as IncrementExpr,
                    this.context,
                    this,
                );
            case "IfStatement":
                return IfStatementRuntime.evaluate(
                    stmt as IfStatement,
                    this.context,
                    this,
                );
            default:
                ErrorReporter.showError(
                    `Node undefined ${stmt.kind}`,
                    stmt.loc,
                );
                Deno.exit();
        }
    }

    private evaluate_program(program: Program): RuntimeValue {
        let lastEval: RuntimeValue = {
            type: "null",
            value: null,
        } as NullValue;

        if (program.body == undefined) {
            return lastEval;
        }

        for (const statement of program.body) {
            lastEval = this.evaluate(statement);
            // console.log(lastEval);
        }

        return lastEval as RuntimeValue;
    }

    private evaluate_binary_literal(stmt: BinaryLiteral): IntValue {
        if (!/^0b[01]+$/.test(stmt.value)) {
            throw new Error("Invalid binary format");
        }
        return VALUE_INT(parseInt(stmt.value.slice(2), 2), stmt.loc);
    }

    private evaluate_binary_expr(binary: BinaryExpr): RuntimeValue {
        const lhs: RuntimeValue = this.evaluate(binary.left);
        const rhs: RuntimeValue = this.evaluate(binary.right);

        if (lhs.type === "string" || rhs.type === "string") {
            if (binary.operator != "+") {
                ErrorReporter.showError(
                    "It is not possible to perform operations with strings, to concatenate use the '+' operator.",
                    binary.loc,
                );
                Deno.exit();
            }
            return VALUE_STRING(
                String(lhs.value) + String(rhs.value),
                binary.loc,
            );
        }

        const left = lhs as IntValue | FloatValue | BooleanValue;
        const right = rhs as IntValue | FloatValue | BooleanValue;

        switch (binary.operator) {
            case "&&": {
                if (left.type != "bool" && right.type != "bool") {
                    return VALUE_BOOL(false, binary.loc);
                }

                return VALUE_BOOL(
                    left.value == true && right.value == true,
                    binary.loc,
                );
            }
            case "||": {
                if (left.type != "bool" && right.type != "bool") {
                    return VALUE_BOOL(false, binary.loc);
                }

                return {
                    type: "bool",
                    value:
                        (left.value == true || right.value == true) as boolean,
                    loc: binary.loc,
                } as BooleanValue;
            }
            case "+":
                return {
                    type: left.type === "float" || right.type === "float"
                        ? "float"
                        : "int",
                    value: Number(left.value) + Number(right.value),
                } as IntValue | FloatValue;
            case "-":
                return {
                    type: left.type === "float" || right.type === "float"
                        ? "float"
                        : "int",
                    value: Number(left.value) - Number(right.value),
                } as IntValue | FloatValue;
            case "*":
                return {
                    type: left.type === "float" || right.type === "float"
                        ? "float"
                        : "int",
                    value: Number(left.value) * Number(right.value),
                } as IntValue | FloatValue;
            case "**":
                return {
                    type: left.type === "float" || right.type === "float"
                        ? "float"
                        : "int",
                    value: Number(left.value) ** Number(right.value),
                } as IntValue | FloatValue;
            case "/":
                if (Number(right.value) === 0) {
                    throw new Error("Division by zero is not allowed.");
                }
                return {
                    type: "float",
                    value: Number(left.value) / Number(right.value),
                } as FloatValue;
            case "%":
                return {
                    type: "int",
                    value: Number(left.value) % Number(right.value),
                } as IntValue;
            case "==":
                return {
                    type: "bool",
                    value: left.value === right.value,
                } as BooleanValue;
            case "!=":
                return {
                    type: "bool",
                    value: left.value !== right.value,
                } as BooleanValue;
            case ">":
                return {
                    type: "bool",
                    value: Number(left.value) > Number(right.value),
                } as BooleanValue;
            case "<":
                return {
                    type: "bool",
                    value: Number(left.value) < Number(right.value),
                } as BooleanValue;
            case ">=":
                return {
                    type: "bool",
                    value: Number(left.value) >= Number(right.value),
                } as BooleanValue;
            case "<=":
                return {
                    type: "bool",
                    value: Number(left.value) <= Number(right.value),
                } as BooleanValue;
            default:
                ErrorReporter.showError(
                    `Unknown operator ${binary.operator}`,
                    binary.loc,
                );
                Deno.exit();
        }
    }

    public validateType(
        value: Stmt | RuntimeValue,
        type: TypesNative[],
    ): boolean {
        if (!type.includes(value.type as TypesNative) && value.type !== "id") {
            ErrorReporter.showError(
                `The expected type does not match the type of the value. Expected one of ${
                    type.join(", ")
                } and received ${value.type}.`,
                value.loc,
            );
            Deno.exit(1);
        }
        return true;
    }
}
