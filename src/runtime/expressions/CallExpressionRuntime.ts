import Context from "../context/Context.ts";
import {
    FunctionValue,
    NativeFnValue as _NativeFnValue,
    RuntimeValue,
    TypesNative,
    VALUE_NULL,
} from "../Values.ts";
import { CallExpr, Identifier } from "../../backend/AST.ts";
import Runtime from "../Runtime.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";

export default class CallExpressionRuntime {
    public static evaluate(
        stmt: CallExpr,
        context: Context,
        _self: Runtime,
    ): RuntimeValue {
        if (context.look_up_function(stmt.id.value) == undefined) {
            ErrorReporter.showError(
                `Function does not exist '${stmt.id.value}'.`,
                stmt.loc,
            );
            Deno.exit();
        }

        const name: Identifier = stmt.id;
        const fn = context.look_up_function(name.value);

        if (!fn) {
            ErrorReporter.showError(
                `Function does not exists '${name.value}'.`,
                name.loc,
            );
            Deno.exit();
        }

        const declare: FunctionValue = (fn as unknown) as FunctionValue;
        const newContext = new Context(declare.context);
        const runtime = new Runtime(newContext);
        const args = stmt.args.map((arg) => _self.evaluate(arg));

        const value: RuntimeValue = VALUE_NULL(null, {} as Loc);

        if (fn.kind == "native-fn") {
            if (!fn.infinity) {
                if (stmt.args.length != fn.args.length) {
                    ErrorReporter.showError(
                        `The number of arguments passed does not match the expected number in the function.`,
                        stmt.loc,
                    );
                    Deno.exit();
                }

                for (let i = 0; i < args.length; i++) {
                    const arg_func = fn.args[i];
                    const arg_call = args[i];

                    if (
                        !(arg_func.type as TypesNative[]).includes(
                            arg_call.type as TypesNative,
                        )
                    ) {
                        ErrorReporter.showError(
                            `Type mismatch: expected '${arg_func.type}' but got '${arg_call.type}'.`,
                            arg_call.loc,
                        );
                        Deno.exit(1);
                    }
                }
            }

            return fn.fn.call(args, fn.context);
        }

        for (let i = 0; i < args.length; i++) {
            const arg_func = fn.args[i];
            const arg_call = args[i];

            if (
                !(arg_func.type as TypesNative[]).includes(
                    arg_call.type as TypesNative,
                )
            ) {
                ErrorReporter.showError(
                    `Type mismatch: expected '${arg_func.type}' but got '${arg_call.type}'.`,
                    arg_call.loc,
                );
                Deno.exit(1);
            }

            if (newContext.look_up_var(arg_func.id!.value)) {
                newContext.assign_var(arg_func.id!, {
                    types: arg_func.type as TypesNative[],
                    value: arg_call,
                });
            } else {
                newContext.new_var(arg_func.id!, {
                    types: arg_func.type as TypesNative[],
                    value: arg_call,
                });
            }
        }

        for (let i = 0; i < fn.body.length; i++) {
            const _stmt = fn.body[i];
            const evaluated = runtime.evaluate(_stmt);

            if (evaluated.ret) {
                return evaluated;
            }

            if (_stmt.kind == "ReturnStatement") {
                return evaluated;
            }

            if (_stmt.kind == "IfStatement") {
                if (evaluated.ret) {
                    return evaluated;
                }
            }
        }

        return value;
    }
}
