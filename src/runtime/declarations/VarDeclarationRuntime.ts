import { VarDeclaration as VD } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, TypesNative, VarDeclarationValue } from "../Values.ts";

export default class VarDeclarationRuntime {
  public static evaluate(
    stmt: VD,
    context: Context,
    self: Runtime,
  ): RuntimeValue {
    // console.log(stmt);

    if (
      context.look_up_alias(stmt.id) != undefined
    ) {
      ErrorReporter.showError(
        `Your variable or constant has the same name as a module's alias, correct it.`,
        stmt.id.loc,
      );
      Deno.exit();
    }

    const value: RuntimeValue = self.evaluate(stmt.value);
    value.ret = false;

    if (!self.validateType(value, stmt.type as TypesNative[])) {
      return value;
    }

    context.new_var(
      stmt.id,
      {
        types: stmt.type,
        value: value,
      } as VarDeclarationValue,
      stmt.constant,
    );

    return value;
  }
}
