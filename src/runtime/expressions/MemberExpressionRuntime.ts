import { MemberExpr } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VALUE_NULL } from "../Values.ts";

export class MemberExpressionRuntime {
  public static evaluate(
    stmt: MemberExpr,
    context: Context,
    _self: Runtime,
  ): RuntimeValue {
    const var_exists = context.look_up_var(stmt.id.value as string) ??
      context.look_up_const(stmt.id.value as string);
    const module_exists = context.look_up_alias(stmt.id);

    if (module_exists !== undefined) {
      return this.evaluate_module_member(stmt, module_exists);
    }

    if (var_exists == undefined) {
      ErrorReporter.showError(
        `Variable does not exist '${stmt.id.value}'`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    if (var_exists.value.kind != "object") {
      ErrorReporter.showError(
        `You are trying to access a member of a variable, which is neither an object nor a module.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    // When objects exist in the language, this area must check whether the member exists.
    return VALUE_NULL(null, stmt.loc);
  }

  private static evaluate_module_member(
    stmt: MemberExpr,
    module: Map<string, RuntimeValue>,
  ): RuntimeValue {
    const constant = module.get(stmt.member.value);

    if (constant == undefined) {
      ErrorReporter.showError(
        `Constant does not exist '${stmt.member.value}' in module '${stmt.id.value}'.`,
        stmt.member.loc,
      );
      Deno.exit();
    }

    return constant.value as RuntimeValue;
  }
}
