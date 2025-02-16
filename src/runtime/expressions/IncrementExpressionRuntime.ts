import { AST_IDENTIFIER, IncrementExpr } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import {
    RuntimeValue,
    VALUE_FLOAT,
    VALUE_INT,
    VarDeclarationValue,
} from "../Values.ts";

export class IncrementExpressionRuntime {
    public static evaluate(
        stmt: IncrementExpr,
        context: Context,
        _self: Runtime,
    ): RuntimeValue {
        const var_exists = context.look_up_var(stmt.value.value as string);

        if (var_exists == undefined) {
            ErrorReporter.showError(
                `Variable does not exist or is a constant '${stmt.value.value}'`,
                stmt.value.loc,
            );
            Deno.exit();
        }

        if (
            var_exists.value.type !== "float" && var_exists.value.type !== "int"
        ) {
            ErrorReporter.showError(
                `The variable type can only be int or float for this operation ${stmt.value.type}`,
                stmt.value.loc,
            );
            Deno.exit();
        }

        const result = (var_exists.value?.value as number ?? 0) + 1;

        const var_declaration: VarDeclarationValue = {
            types: var_exists.types,
            value: (var_exists.value.type == "float")
                ? VALUE_FLOAT(result, var_exists.value.loc)
                : VALUE_INT(result, var_exists.value.loc),
        };

        context.assign_var(
            AST_IDENTIFIER(stmt.value.value, stmt.value.loc),
            var_declaration,
        );
        return var_declaration.value;
    }
}
