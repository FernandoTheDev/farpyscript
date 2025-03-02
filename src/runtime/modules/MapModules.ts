import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import { NativeValue } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import {
  ArgsValue,
  FunctionNativeDeclarationValue,
  MapValue,
  NATIVE_FN,
  TypesNative,
} from "../Values.ts";

export default class MapModule {
  public static Map(context: Context): FunctionNativeDeclarationValue {
    return {
      kind: "native-fn",
      infinity: false,
      args: [] as ArgsValue[],
      type: ["map"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((_args, _scope) => {
        return {
          type: "map",
          map: new Map<NativeValue, NativeValue>(),
          // ret: true,
        } as MapValue;
      }),
    } as FunctionNativeDeclarationValue;
  }
}
