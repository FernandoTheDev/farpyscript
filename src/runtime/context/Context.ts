import { AST_IDENTIFIER, Identifier } from "../../backend/AST.ts";
import {
  ArgsValue,
  FunctionNativeDeclarationValue,
  FunctionValue,
  NATIVE_FN,
  RuntimeValue,
  TypesNative,
  VALUE_BOOL,
  VALUE_NULL,
  VALUE_VOID,
  VarDeclarationValue,
} from "../Values.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import IoModule from "../modules/IoModule.ts";
import MathModule from "../modules/MathModule.ts";
import UtilsModule from "../modules/UtilsModule.ts";
import MapModule from "../modules/MapModules.ts";

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

  context.new_module(
    AST_IDENTIFIER("math", loc),
    new Map()
      .set("PI", MathModule.PI())
      .set("fibonacci", MathModule.fibonacci(context)),
  );

  context.new_module(
    AST_IDENTIFIER("io", loc),
    new Map()
      .set("readline", IoModule.readline(context))
      .set("format", IoModule.format(context)),
  );

  context.new_module(
    AST_IDENTIFIER("utils", loc),
    new Map()
      .set("toInt", UtilsModule.toInt(context)),
  );

  context.new_module(
    AST_IDENTIFIER("map", loc),
    new Map()
      .set("Map", MapModule.Map(context)),
  );

  return context;
}

export default class Context {
  private parent?: Context;
  private variables: Map<string, VarDeclarationValue> = new Map();
  private modules: Map<string, Map<string, RuntimeValue>> = new Map();
  private alias: Map<string, string> = new Map();
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

  public new_module(
    module: Identifier,
    value: Map<string, RuntimeValue>,
  ): RuntimeValue {
    if (this.constants.has(module.value)) {
      ErrorReporter.showError(
        `Module redeclaration '${module.value}'.`,
        module.loc,
      );
      Deno.exit();
    }

    this.modules.set(module.value, value);
    return VALUE_VOID(module.loc);
  }

  public new_alias(
    alias: Identifier,
    module: Identifier,
  ): RuntimeValue {
    if (!this.modules.has(module.value)) {
      ErrorReporter.showError(
        `Module is not exist '${module.value}'.`,
        module.loc,
      );
      Deno.exit();
    }

    if (this.alias.has(alias.value)) {
      ErrorReporter.showError(
        `Alias ​​already exists '${alias.value}'.`,
        alias.loc,
      );
      Deno.exit();
    }

    this.alias.set(alias.value, module.value);
    return VALUE_VOID(alias.loc);
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

  public look_up_alias(
    alias: Identifier,
  ): Map<string, RuntimeValue> | undefined {
    const alias_get = this.alias.get(alias.value);

    return this.modules.get(alias_get ?? "") ||
      this.parent?.look_up_module(alias_get ?? "") || undefined;
  }

  private look_up_module(
    module: string,
  ): Map<string, RuntimeValue> | undefined {
    return this.modules.get(module) ||
      this.parent?.look_up_module(module) || undefined;
  }

  public look_up_function(
    name: string,
  ): FunctionValue | FunctionNativeDeclarationValue | undefined {
    return this.functions.get(name) ||
      this.parent?.look_up_function(name) ||
      undefined;
  }
}
