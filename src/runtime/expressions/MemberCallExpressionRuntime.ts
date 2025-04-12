import { MemberCallExpr } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import MapType from "../class_types/MapType.ts";
import StringType from "../class_types/StringType.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { MapValue, RuntimeValue, StringValue, TypesNative } from "../Values.ts";

export class MemberCallExpressionRuntime {
  public static evaluate(
    stmt: MemberCallExpr,
    context: Context,
    _self: Runtime,
  ): RuntimeValue {
    // console.log("Runtime:", expr);

    // @ts-ignore
    const module_exists = context.look_up_alias(stmt.id);

    if (module_exists !== undefined) {
      return this.evaluate_module_call(stmt, _self, module_exists);
    }

    // console.log(stmt.id);
    const expr: RuntimeValue = _self.evaluate(stmt.id);
    // console.debug(stmt);
    // console.debug(var_exists);

    // if (var_exists == undefined) {
    //   ErrorReporter.showError(
    //     `Variable does not exist '${stmt.id.value}'.`,
    //     stmt.id.loc,
    //   );
    //   Deno.exit();
    // }

    const classType = this.check_class_type(stmt.loc, _self, expr!);
    // @ts-ignore: Exists
    const method = classType[stmt.member.id.value];

    console.debug("Debug", stmt);

    if (typeof method !== "function") {
      ErrorReporter.showError(
        `You are trying to call an attribute that does not exist in the type of this variable '${stmt.id.value}'.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    const args = stmt.member.args;

    if (args.length != method.length) {
      ErrorReporter.showError(
        `Number of arguments do not match, you passed '${args.length}' and expected '${method.length}'.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    // I will add a decorator later to recognize type errors in case of an argument with an invalid type.
    return method.apply(classType, args);
  }

  private static evaluate_module_call(
    stmt: MemberCallExpr,
    self: Runtime,
    module: Map<string, RuntimeValue>,
  ): RuntimeValue {
    const func = module
      .get(stmt.member.id.value);

    if (!func) {
      ErrorReporter.showError(
        `Function does not exist '${stmt.member.id.value}'`,
        stmt.member.id.loc,
      );
      Deno.exit();
    }

    if (func.kind !== "native-fn") {
      ErrorReporter.showError(
        `Not is a function '${stmt.member.id.value}'`,
        stmt.member.id.loc,
      );
      Deno.exit();
    }

    // @ts-ignore: Args from FunctionDeclarationValue
    if (stmt.member.args.length != func.args.length) {
      ErrorReporter.showError(
        // @ts-ignore: Args from FunctionDeclarationValue
        `Number of arguments do not match, you passed '${stmt.member.args.length}' and expected '${func.args.length}'.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    const args = stmt.member.args.map((arg) => self.evaluate(arg));

    for (let i = 0; i < args.length; i++) {
      // @ts-ignore: Args from FunctionDeclarationValue
      const expectedParam = func.args[i];
      const passedArg = args[i];

      if (
        !(expectedParam.type as TypesNative[]).includes(
          passedArg.type as TypesNative,
        )
      ) {
        ErrorReporter.showError(
          `Type mismatch: expected '${expectedParam.type}' but got '${passedArg.type}'.`,
          passedArg.loc,
        );
        Deno.exit(1);
      }
    }

    // @ts-ignore: All keys from FunctionDeclarationValue
    return func.fn.call(args, func.context);
  }

  private static check_class_type(
    stmt_loc: Loc,
    self: Runtime,
    type: any,
  ) {
    switch (type.type!) {
      case "string":
        return new StringType(type as StringValue, self);
      case "map":
        return new MapType(type as MapValue, self);
      default: {
        ErrorReporter.showError(
          `The Type of the value of this variable is not recognized '${type
            .type!}'.`,
          stmt_loc,
        );
        Deno.exit();
      }
    }
  }
}
