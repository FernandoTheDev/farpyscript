import { Identifier } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VALUE_NULL } from "../Values.ts";

export class IdentifierExpressionRuntime {
  public static evaluate(
    stmt: Identifier,
    context: Context,
    _self: Runtime,
  ): RuntimeValue {
    const var_exists = context.look_up_var(stmt.value);
    const const_exists = context.look_up_const(stmt.value);

    if (var_exists != undefined) {
      return var_exists?.value ??
        VALUE_NULL(null, stmt.loc);
    } else if (const_exists != undefined) {
      return const_exists?.value ??
        VALUE_NULL(null, stmt.loc);
    }
    ErrorReporter.showError(
      `Variable does not exist ${stmt.value}`,
      stmt.loc,
    );
    Deno.exit();
  }
}
