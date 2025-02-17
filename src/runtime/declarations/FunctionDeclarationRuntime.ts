import { FunctionDeclaration } from "../../backend/AST.ts";
import { Loc } from "../../frontend/Token.ts";
import Context from "../context/Context.ts";
import Runtime from "../Runtime.ts";
import {
    ArgsValue,
    FunctionValue,
    RuntimeValue,
    VALUE_VOID,
} from "../Values.ts";

/**
 * export interface FunctionValue extends RuntimeValue {
     kind: "function";
     id: Identifier;
     type: TypesNative[];
     context: Context;
     args: ArgsValue[];
     body: Stmt[];
 }
 */

export default class FunctionDeclarationRuntime {
    public static evaluate(
        stmt: FunctionDeclaration,
        context: Context,
        _self: Runtime,
    ): RuntimeValue {
        const func: FunctionValue = {
            kind: "function",
            id: stmt.id,
            type: stmt.type,
            context: new Context(context, true),
            args: stmt.args as unknown as ArgsValue[],
            body: stmt.block,
        } as FunctionValue;

        context.new_function(stmt.id, func);
        func.context = new Context(context, true); // Atualiza o contexto agora com a função
        context.update_function(stmt.id, func);
        return VALUE_VOID({} as Loc);
    }
}
