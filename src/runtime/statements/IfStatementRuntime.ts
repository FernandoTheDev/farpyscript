import { IfStatement, Stmt } from "../../backend/AST.ts";
import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue } from "../Values.ts";

export class IfStatementRuntime {
    public static evaluate(
        stmt: IfStatement,
        _context: Context,
        _self: Runtime,
    ): RuntimeValue {
        // console.log(_self.evaluate(stmt.condition as Stmt));
        // console.log(stmt);

        // Deno.exit();

        // console.log(_self.evaluate(stmt.condition as Stmt).value == true);
        let value: RuntimeValue = _self.evaluate(stmt.value as Stmt);

        if (_self.evaluate(stmt.condition as Stmt).value == true) {
            for (let i = 0; i < stmt.primary.length; i++) {
                const stmt_ = stmt.primary[i];
                const evaluated = _self.evaluate(stmt_ as Stmt);

                if (stmt_.kind == "ReturnStatement") {
                    evaluated.ret = true;
                    value = evaluated;
                    return evaluated;
                }
            }
        } else {
            // console.log("Else");
        }

        return value;
    }
}
