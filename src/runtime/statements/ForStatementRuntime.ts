import { Expr, ForStatement, Stmt } from "../../backend/AST.ts";
import { ErrorReporter as _ErrorReporter } from "../../error/ErrorReporter.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue } from "../Values.ts";

export class ForStatementRuntime {
  public static evaluate(
    stmt: ForStatement,
    _context: Context,
    self: Runtime,
  ): RuntimeValue {
    self.evaluate(stmt.init);
    const returnValue = self.evaluate(stmt.value as Expr);

    while (self.evaluate(stmt.test).value == true) {
      for (let i = 0; i < stmt.body.length; i++) {
        const currentStmt = stmt.body[i];
        const evaluated = self.evaluate(currentStmt as Stmt);

        if (evaluated.ret || currentStmt.kind === "ReturnStatement") {
          return evaluated;
        }

        if (evaluated.ret || currentStmt.kind === "BreakStatement") {
          return returnValue;
        }
      }

      self.evaluate(stmt.update);
    }

    return returnValue;
  }
}
