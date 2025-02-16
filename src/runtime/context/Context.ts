import { Identifier } from "../../backend/AST.ts";
import {
    FunctionNativeDeclarationValue,
    FunctionValue,
    NativeFnValue,
    RuntimeValue,
    VALUE_NULL,
    VarDeclarationValue,
} from "../Values.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";

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
