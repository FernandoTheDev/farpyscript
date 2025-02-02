import { VarDeclaration as VD } from "../../backend/AST.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import { RuntimeValue, VarDeclarationValue } from "../Values.ts";

export default class VarDeclarationRuntime {
    public static evaluate(
        stmt: VD,
        context: Context,
        self: Runtime,
    ): RuntimeValue {
        const value: RuntimeValue = self.evaluate(stmt.value);
        context.new_var(
            stmt.id,
            {
                types: stmt.type,
                value: value,
            } as VarDeclarationValue,
            stmt.constant,
        );
        return value;
    }
}
