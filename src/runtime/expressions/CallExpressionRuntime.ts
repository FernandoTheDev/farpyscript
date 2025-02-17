import Context from "../context/Context.ts";
import {
    FunctionNativeDeclarationValue,
    FunctionValue,
    LambdaValue,
    NativeFnValue as _NativeFnValue,
    RuntimeValue,
    TypesNative,
    VALUE_NULL,
} from "../Values.ts";
import { CallExpr } from "../../backend/AST.ts";
import Runtime from "../Runtime.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";

export default class CallExpressionRuntime {
    public static evaluate(
        stmt: CallExpr,
        context: Context,
        _self: Runtime,
    ): RuntimeValue {
        const fn = context.look_up_function(stmt.id.value);
        if (!fn) {
            const lambda = context.look_up_var(stmt.id.value) ??
                context.look_up_const(stmt.id.value);

            if (lambda !== undefined) {
                return this.evaluate_lambda(
                    stmt,
                    lambda.value as LambdaValue,
                    _self,
                );
            }

            ErrorReporter.showError(
                `Function does not exist '${stmt.id.value}'.`,
                stmt.loc,
            );
            Deno.exit();
        }

        if (fn.kind === "native-fn") {
            return this.evaluate_function_native(stmt, fn, _self);
        } else if (fn.kind === "function") {
            return this.evaluate_function(stmt, fn, _self);
        }

        ErrorReporter.showError(
            `Erro.`,
            stmt.loc,
        );
        Deno.exit(1);
    }

    private static evaluate_function_native(
        stmt: CallExpr,
        fn: FunctionNativeDeclarationValue,
        _self: Runtime,
    ): RuntimeValue {
        const args = stmt.args.map((arg) => _self.evaluate(arg));

        if (!fn.infinity) {
            if (stmt.args.length !== fn.args.length) {
                ErrorReporter.showError(
                    `The number of arguments passed does not match the expected number in the function.`,
                    stmt.loc,
                );
                Deno.exit();
            }

            for (let i = 0; i < args.length; i++) {
                const expectedParam = fn.args[i];
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
        }

        return fn.fn.call(args, fn.context);
    }

    private static evaluate_function(
        stmt: CallExpr,
        fn: FunctionValue,
        _self: Runtime,
    ): RuntimeValue {
        const args = stmt.args.map((arg) => _self.evaluate(arg));
        const newContext = new Context(fn.context);
        const runtime = new Runtime(newContext);
        const defaultReturn: RuntimeValue = VALUE_NULL(null, {} as Loc);

        // Validação e vinculação dos argumentos aos parâmetros
        for (let i = 0; i < args.length; i++) {
            const param = fn.args[i];
            const argValue = args[i];

            if (
                !(param.type as TypesNative[]).includes(
                    argValue.type as TypesNative,
                )
            ) {
                ErrorReporter.showError(
                    `Type mismatch: expected '${param.type}' but got '${argValue.type}'.`,
                    argValue.loc,
                );
                Deno.exit(1);
            }

            if (newContext.look_up_var(param.id!.value)) {
                newContext.assign_var(param.id!, {
                    types: param.type as TypesNative[],
                    value: argValue,
                });
            } else {
                newContext.new_var(param.id!, {
                    types: param.type as TypesNative[],
                    value: argValue,
                });
            }
        }

        // Execução do corpo da função
        for (const _stmt of fn.body) {
            const evaluated = runtime.evaluate(_stmt);

            if (evaluated.ret) return evaluated;
            if (_stmt.kind === "ReturnStatement") return evaluated;
            if (_stmt.kind === "IfStatement" && evaluated.ret) return evaluated;
        }

        return defaultReturn;
    }

    private static evaluate_lambda(
        stmt: CallExpr,
        fn: LambdaValue,
        _self: Runtime,
    ): RuntimeValue {
        const args = stmt.args.map((arg) => _self.evaluate(arg));
        const newContext = new Context(fn.context);
        const runtime = new Runtime(newContext);
        const defaultReturn: RuntimeValue = VALUE_NULL(null, {} as Loc);

        // Verifica se alguma variável externa conflita com os parâmetros
        for (const extVar of fn.externalVars) {
            if (
                fn.args.some((param) => param.id!.value === extVar.value)
            ) {
                ErrorReporter.showError(
                    `External variable '${extVar.value}' cannot be used as a parameter in lambda.`,
                    extVar.loc,
                );
                Deno.exit(1);
            }
        }

        for (const extVar of fn.externalVars) {
            const extValue = fn.context.look_up_var(extVar.value) ??
                fn.context.look_up_const(extVar.value);
            if (!extValue) {
                ErrorReporter.showError(
                    `External variable '${extVar.value}' was not found in the lambda definition context.`,
                    extVar.loc,
                );
                Deno.exit(1);
            }
            newContext.new_var(extVar, extValue);
        }

        // Valida o número de argumentos passados
        if (stmt.args.length !== fn.args.length) {
            ErrorReporter.showError(
                `The number of arguments passed does not match the expected number in the lambda.`,
                stmt.loc,
            );
            Deno.exit();
        }

        // Vincula os argumentos aos parâmetros
        for (let i = 0; i < args.length; i++) {
            const param = fn.args[i];
            const argValue = args[i];

            if (
                !(param.type as TypesNative[]).includes(
                    argValue.type as TypesNative,
                )
            ) {
                ErrorReporter.showError(
                    `Type mismatch in lambda: expected '${param.type}' but got '${argValue.type}'.`,
                    argValue.loc,
                );
                Deno.exit(1);
            }

            if (newContext.look_up_var(param.id!.value)) {
                newContext.assign_var(param.id!, {
                    types: param.type as TypesNative[],
                    value: argValue,
                });
            } else {
                newContext.new_var(param.id!, {
                    types: param.type as TypesNative[],
                    value: argValue,
                });
            }
        }

        // Execução do corpo da lambda
        for (const _stmt of fn.body) {
            const evaluated = runtime.evaluate(_stmt);
            if (evaluated.ret) return evaluated;
            if (_stmt.kind === "ReturnStatement") return evaluated;
            if (_stmt.kind === "IfStatement" && evaluated.ret) return evaluated;
        }

        return defaultReturn;
    }
}
