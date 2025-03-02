// import { Stmt } from "../../backend/AST.ts";
import { LambdaExpr } from "../../backend/AST.ts";
// import { ErrorReporter } from "../../error/ErrorReporter.ts";
// import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import {
  ArgsValue,
  LambdaValue,
  RuntimeValue,
  TypesNative,
} from "../Values.ts";

export class LambdaExpressionRuntime {
  public static evaluate(
    stmt: LambdaExpr,
    context: Context,
    _self: Runtime,
  ): RuntimeValue {
    const lambdaValue = {
      kind: "lambda",
      type: stmt.type as TypesNative[],
      args: stmt.args as ArgsValue[],
      context: new Context(context),
      body: stmt.body,
      externalVars: stmt.externalVars,
      loc: stmt.loc,
    } as LambdaValue;

    return lambdaValue;
  }
}
