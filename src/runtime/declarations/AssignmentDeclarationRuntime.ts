import { AssignmentDeclaration as AD } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, TypesNative } from "../Values.ts";

export default class AssignmentDeclarationRuntime {
    public static evaluate(
        stmt: AD,
        context: Context,
        self: Runtime,
    ): RuntimeValue {
        const var_ = context.look_up_var(stmt.id.value);

        if (var_) {
            const value: RuntimeValue = self.evaluate(stmt.value);
            if (self.validateType(value, var_.types as TypesNative[])) {
                context.assign_var(
                    stmt.id,
                    { types: var_.types, value: value },
                );
                return value;
            }
        }

        if (context.look_up_const(stmt.id.value)) {
            ErrorReporter.showError(
                `Constant redeclaration '${stmt.id.value}'.`,
                stmt.loc,
            );
            Deno.exit();
        }

        ErrorReporter.showError(
            `Variable does not exist, so it cannot be updated '${stmt.id.value}'.`,
            stmt.loc,
        );
        Deno.exit();
    }
}
