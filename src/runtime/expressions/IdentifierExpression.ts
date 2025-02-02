import Context from "../context/Context.ts";
import { RuntimeValue, VALUE_NULL } from "../Values.ts";
import { Identifier } from "../../backend/AST.ts";
import Runtime from "../Runtime.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";

export default class IdentifierExpressionRuntime {
    public static evaluate(
        stmt: Identifier,
        context: Context,
        _self: Runtime,
    ): RuntimeValue {
        if (context.look_up_var(stmt.value) != undefined) {
            return context.look_up_var(stmt.value)?.value ??
                VALUE_NULL(null, stmt.loc);
        } else if (context.look_up_const(stmt.value) != undefined) {
            return context.look_up_const(stmt.value)?.value ??
                VALUE_NULL(null, stmt.loc);
        }
        ErrorReporter.showError(
            `Variable does not exist ${stmt.value}`,
            stmt.loc,
        );
        Deno.exit();
    }
}
