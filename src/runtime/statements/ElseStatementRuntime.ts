import { ElseStatement, Stmt } from "../../backend/AST.ts";
import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VALUE_VOID } from "../Values.ts";

export class ElseStatementRuntime {
    public static evaluate(
        stmt: ElseStatement,
        _context: Context,
        _self: Runtime,
    ): RuntimeValue {
        for (let i = 0; i < stmt.primary.length; i++) {
            const stmt_ = stmt.primary[i];
            const evaluated = _self.evaluate(stmt_ as Stmt);

            if (evaluated.ret || stmt_.kind == "ReturnStatement") {
                return evaluated;
            }
        }

        return VALUE_VOID({} as Loc);
    }
}
