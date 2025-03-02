import { BreakStatement } from "../../backend/AST.ts";
import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VALUE_VOID } from "../Values.ts";

export class BreakStatementRuntime {
  public static evaluate(
    _stmt: BreakStatement,
    _context: Context,
    _self: Runtime,
  ): RuntimeValue {
    const value = VALUE_VOID({} as Loc);
    value.ret = true;
    return value;
  }
}
