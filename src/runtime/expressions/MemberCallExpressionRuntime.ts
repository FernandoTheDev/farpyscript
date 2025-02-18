import { MemberCallExpr } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import StringType from "../class_types/StringType.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, StringValue, VarDeclarationValue } from "../Values.ts";

export class MemberCallExpressionRuntime {
  public static evaluate(
    stmt: MemberCallExpr,
    context: Context,
    _self: Runtime,
  ): RuntimeValue {
    const var_exists = context.look_up_var(stmt.id.value as string) ??
      context.look_up_const(stmt.id.value as string);

    if (var_exists == undefined) {
      ErrorReporter.showError(
        `Variable does not exist '${stmt.id.value}'`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    const classType = this.check_class_type(stmt.loc, var_exists!);
    // @ts-ignore: We are checking if the method exists in the class only
    const method = classType[stmt.member.id.value];

    if (typeof method !== "function") {
      ErrorReporter.showError(
        `You are trying to call an attribute that does not exist in the type of this variable '${stmt.id.value}'.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    if (stmt.member.args.length != method.length) {
      ErrorReporter.showError(
        `Number of arguments do not match, you passed '${stmt.member.args.length}' and expected '${method.length}'.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    // I will add a decorator later to recognize type errors in case of an argument with an invalid type.
    return method.apply(classType, stmt.member.args);
  }

  private static check_class_type(
    stmt_loc: Loc,
    variable: VarDeclarationValue,
  ) {
    switch (variable.value.type!) {
      case "string":
        return new StringType(variable.value as StringValue);
      default: {
        ErrorReporter.showError(
          `The Type of the value of this variable is not recognized '${variable
            .value.type!}'.`,
          stmt_loc,
        );
        Deno.exit();
      }
    }
  }
}
