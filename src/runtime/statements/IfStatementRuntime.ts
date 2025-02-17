import { ElifStatement, IfStatement, Stmt } from "../../backend/AST.ts";
import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VALUE_VOID } from "../Values.ts";

export class IfStatementRuntime {
    public static evaluate(
        stmt: IfStatement | ElifStatement,
        _context: Context,
        _self: Runtime,
    ): RuntimeValue {
        // console.log(stmt);

        if (_self.evaluate(stmt.condition as Stmt).value == true) {
            return this.execute(stmt.primary, _self);
        } else if (stmt.secondary.length > 0) {
            return this.execute(stmt.secondary, _self);
        }

        return VALUE_VOID({} as Loc);
    }

    private static execute(
        primaryOrSecondary: Stmt[],
        _self: Runtime,
    ): RuntimeValue {
        for (let i = 0; i < primaryOrSecondary.length; i++) {
            const stmt_ = primaryOrSecondary[i];
            const evaluated = _self.evaluate(stmt_ as Stmt);

            if (evaluated.ret || stmt_.kind == "ReturnStatement") {
                return evaluated;
            }
        }
        return VALUE_VOID({} as Loc);
    }
}
