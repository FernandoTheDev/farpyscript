import { AST_IDENTIFIER, Identifier } from "../../backend/AST.ts";
import {
  ArgsValue,
  FunctionNativeDeclarationValue,
  FunctionValue,
  NATIVE_FN,
  TypesNative,
  VALUE_BOOL,
  VALUE_FLOAT,
  VALUE_INT,
  VALUE_NULL,
  VALUE_STRING,
  VALUE_VOID,
  VarDeclarationValue,
} from "../Values.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";

export function define_env(context: Context): Context {
  const loc = {} as Loc;

  // true
  context.new_var(
    AST_IDENTIFIER("true", loc),
    { types: ["bool"], value: VALUE_BOOL(true, loc) } as VarDeclarationValue,
    true,
  );

  // false
  context.new_var(
    AST_IDENTIFIER("false", loc),
    { types: ["bool"], value: VALUE_BOOL(false, loc) } as VarDeclarationValue,
    true,
  );

  // null
  context.new_var(
    AST_IDENTIFIER("null", loc),
    { types: ["null"], value: VALUE_NULL(null, loc) } as VarDeclarationValue,
    true,
  );

  // void
  context.new_var(
    AST_IDENTIFIER("void", loc),
    { types: ["void"], value: VALUE_VOID(loc) } as VarDeclarationValue,
    true,
  );

  // Runtime version
  context.new_var(
    AST_IDENTIFIER("RUNTIME_VERSION", loc),
    {
      types: ["string"],
      value: VALUE_STRING("0.1.0", loc),
    } as VarDeclarationValue,
    true,
  );

  // PI
  context.new_var(
    AST_IDENTIFIER("PI", loc),
    {
      types: ["float"],
      value: VALUE_FLOAT(Math.PI, loc),
    } as VarDeclarationValue,
    true,
  );

  // print(x, y, ...)
  context.new_function(
    AST_IDENTIFIER("print", loc),
    {
      kind: "native-fn",
      infinity: true,
      args: [] as ArgsValue[],
      type: ["null"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((args, _scope) => {
        for (const arg of args) {
          console.log(arg.value);
        }
        return VALUE_NULL(null, loc);
      }),
    } as FunctionNativeDeclarationValue,
  );

  // sum(x, y)
  // context.new_function(
  //   AST_IDENTIFIER("sum", loc),
  //   {
  //     kind: "native-fn",
  //     infinity: false,
  //     args: [
  //       { type: ["int", "float"] },
  //       { type: ["int", "float"] },
  //     ] as ArgsValue[],
  //     type: ["int", "float"] as TypesNative[],
  //     context: new Context(context, true),
  //     fn: NATIVE_FN((args, _scope) => {
  //       const r = Number(args[0]?.value) + Number(args[1]?.value);
  //       return VALUE_INT(r, loc);
  //     }),
  //   } as FunctionNativeDeclarationValue,
  // );

  // fib(x)
  context.new_function(
    AST_IDENTIFIER("fib", loc),
    {
      kind: "native-fn",
      infinity: false,
      args: [{ type: ["int"] }] as ArgsValue[],
      type: ["int"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((args, _scope) => {
        const fib = (n: number): number => {
          if (n <= 1) return n;
          return fib(n - 1) + fib(n - 2);
        };
        const n = Number(args[0]?.value);
        return VALUE_INT(fib(n), loc);
      }),
    } as FunctionNativeDeclarationValue,
  );

  return context;
}

export default class Context {
  private parent?: Context;
  private variables: Map<string, VarDeclarationValue> = new Map();
  private functions: Map<
    string,
    FunctionValue | FunctionNativeDeclarationValue
  > = new Map();
  private constants: Map<string, VarDeclarationValue> = new Map();

  public constructor(parent?: Context, private is_function: boolean = false) {
    this.parent = parent;
  }

  // Add new variable or constant
  public new_var(
    var_name: Identifier,
    value: VarDeclarationValue,
    is_constant: boolean = false,
  ): VarDeclarationValue {
    if (this.constants.has(var_name.value)) {
      ErrorReporter.showError(
        `Constant redeclaration '${var_name.value}'.`,
        var_name.loc,
      );
      Deno.exit();
    }

    if (this.variables.has(var_name.value)) {
      ErrorReporter.showError(
        `Undue variable redeclaration '${var_name.value}'.`,
        var_name.loc,
      );
      Deno.exit();
    }

    if (is_constant) {
      this.constants.set(var_name.value, value);
    } else {
      this.variables.set(var_name.value, value);
    }

    return value;
  }

  public new_function(
    name: Identifier,
    value: FunctionValue | FunctionNativeDeclarationValue,
  ): FunctionValue | FunctionNativeDeclarationValue {
    if (this.functions.has(name.value)) {
      ErrorReporter.showError(
        `Undue function redeclaration '${name.value}'.`,
        name.loc,
      );
      Deno.exit();
    }

    this.functions.set(name.value, value);
    return value;
  }

  public update_function(
    name: Identifier,
    value: FunctionValue | FunctionNativeDeclarationValue,
  ): FunctionValue | FunctionNativeDeclarationValue {
    if (!this.functions.has(name.value)) {
      ErrorReporter.showError(
        `Function does not exist '${name.value}'.`,
        name.loc,
      );
      Deno.exit();
    }

    this.functions.set(name.value, value);
    return value;
  }

  // Assign value to existing variable
  public assign_var(
    var_name: Identifier,
    value: VarDeclarationValue,
  ): VarDeclarationValue {
    if (this.variables.has(var_name.value)) {
      this.variables.set(var_name.value, value);
      return value;
    }

    if (this.parent) {
      return this.parent.assign_var(var_name, value);
    }

    ErrorReporter.showError(
      `Variable does not exist '${var_name.value}'.`,
      var_name.loc,
    );
    Deno.exit();
  }

  public look_up_var(var_name: string): VarDeclarationValue | undefined {
    return this.variables.get(var_name) ||
      this.parent?.variables.get(var_name) || undefined;
  }

  public look_up_const(var_name: string): VarDeclarationValue | undefined {
    return this.constants.get(var_name) ||
      this.parent?.look_up_const(var_name) || undefined;
  }

  public look_up_function(
    name: string,
  ): FunctionValue | FunctionNativeDeclarationValue | undefined {
    return this.functions.get(name) ||
      this.parent?.look_up_function(name) ||
      undefined;
  }
}
