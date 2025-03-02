import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import {
  ArgsValue,
  FunctionNativeDeclarationValue,
  NATIVE_FN,
  TypesNative,
  VALUE_INT,
} from "../Values.ts";

export default class UtilsModule {
  public static toInt(context: Context): FunctionNativeDeclarationValue {
    return {
      kind: "native-fn",
      infinity: false,
      args: [{ type: ["string", "bool", "float", "int"] }] as ArgsValue[],
      type: ["int"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((args, _scope) => {
        return VALUE_INT(Math.round(Number(args[0].value)), args[0].loc);
      }),
    } as FunctionNativeDeclarationValue;
  }
}
