import { ImportStatement } from "../../backend/AST.ts";
import {
  ErrorReporter,
  ErrorReporter as _ErrorReporter,
} from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VALUE_VOID } from "../Values.ts";

export class ImportStatementRuntime {
  public static evaluate(
    stmt: ImportStatement,
    context: Context,
    _self: Runtime,
  ): RuntimeValue {
    const module = stmt.module;
    const alias = stmt.check === true ? stmt.alias : module;

    // Check if the module name already exists as a constant (or variable if needed)
    if (
      context.look_up_const(module.value) !==
        undefined /* || context.look_up_var(module.value) !== undefined */
    ) {
      // Verify if the alias also exists
      if (
        context.look_up_const(alias.value) !==
          undefined /* || context.look_up_var(alias.value) !== undefined */
      ) {
        if (alias.value === module.value) {
          ErrorReporter.showError(
            `The imported module has the same name as an existing variable or constant. To fix this, create an alias for the module.`,
            module.loc,
          );
        } else {
          ErrorReporter.showError(
            `You declared an alias with the name of an existing variable or constant.`,
            module.loc,
          );
        }
        Deno.exit();
      }
    }

    context.new_alias(alias, module);
    return VALUE_VOID({} as Loc);
  }
}
