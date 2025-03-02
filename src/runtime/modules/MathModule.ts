import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import {
  ArgsValue,
  FunctionNativeDeclarationValue,
  NATIVE_FN,
  TypesNative,
  VALUE_FLOAT,
  VALUE_INT,
  VarDeclarationValue,
} from "../Values.ts";

export default class MathModule {
  public static fibonacci(context: Context): FunctionNativeDeclarationValue {
    return {
      kind: "native-fn",
      infinity: false,
      args: [{ type: ["int"] }] as ArgsValue[],
      type: ["int"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((args, _scope) => {
        const map: Map<number, number> = new Map();
        const fib = (n: number) => { // O(n)
          if (map.has(n)) {
            return map.get(n)!;
          }
          if (n <= 1) return n;
          map.set(n, fib(n - 1) + fib(n - 2));
          return map.get(n)!;
        };
        return VALUE_INT(fib(Number(args[0]?.value)), {} as Loc);
      }),
    } as FunctionNativeDeclarationValue;
  }

  public static PI(): VarDeclarationValue {
    return {
      types: ["float"],
      value: VALUE_FLOAT(Math.PI, {} as Loc),
    } as VarDeclarationValue;
  }
}
