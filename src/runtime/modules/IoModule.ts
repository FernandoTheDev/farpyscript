import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import {
  ArgsValue,
  FunctionNativeDeclarationValue,
  NATIVE_FN,
  TypesNative,
  VALUE_STRING,
} from "../Values.ts";

export default class IoModule {
  public static readline(context: Context): FunctionNativeDeclarationValue {
    return {
      kind: "native-fn",
      infinity: false,
      args: [{ type: ["string"] }] as ArgsValue[],
      type: ["string"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((args, _scope) => {
        return VALUE_STRING(prompt(args[0].value as string) ?? "", args[0].loc);
      }),
    } as FunctionNativeDeclarationValue;
  }

  public static format(context: Context): FunctionNativeDeclarationValue {
    return {
      kind: "native-fn",
      infinity: false,
      args: [{ type: ["string"] }] as ArgsValue[],
      type: ["string"] as TypesNative[],
      context: new Context(context, true),
      fn: NATIVE_FN((args, scope) => {
        const input = args[0].value!.toString();
        let output = "";
        let i = 0;

        // Helper functions for validating identifiers
        function isLetter(char: string): boolean {
          return (char >= "A" && char <= "Z") || (char >= "a" && char <= "z");
        }
        function isDigit(char: string): boolean {
          return char >= "0" && char <= "9";
        }
        function isLetterOrDigit(char: string): boolean {
          return isLetter(char) || isDigit(char);
        }

        while (i < input.length) {
          if (input[i] === "{") {
            i++; // '{'
            if (i >= input.length) {
              ErrorReporter.showError(
                "Incomplete match: expected identifier after '{'",
                args[0].loc,
              );
              Deno.exit();
            }
            let id = "";
            if (!isLetter(input[i]) && input[i] !== "_") {
              ErrorReporter.showError(
                "Invalid identifier: must start with a letter or underscore",
                args[0].loc,
              );
              Deno.exit();
            }
            while (
              i < input.length &&
              (isLetterOrDigit(input[i]) || input[i] === "_")
            ) {
              id += input[i];
              i++;
            }
            if (i >= input.length || input[i] !== "}") {
              ErrorReporter.showError(
                `Incomplete match: expected closing '}' for identifier ${id}`,
                args[0].loc,
              );
              Deno.exit();
            }
            i++; // '}'

            const variable = scope.look_up_var(id);
            const constant = scope.look_up_const(id);
            if (variable === undefined && constant === undefined) {
              ErrorReporter.showError(
                `Variable '${id}' is not defined in the current scope`,
                args[0].loc,
              );
              Deno.exit();
            }

            const value = variable !== undefined
              ? variable.value
              : constant!.value;
            output += value.value!.toString();
          } else {
            output += input[i];
            i++;
          }
        }

        return VALUE_STRING(output, args[0].loc);
      }),
    } as FunctionNativeDeclarationValue;
  }
}
