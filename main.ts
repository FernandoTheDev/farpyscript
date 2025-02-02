import { Lexer } from "./src/frontend/Lexer.ts";
import { Loc, Token } from "./src/frontend/Token.ts";
import Parser from "./src/backend/Parser.ts";
import { AST_IDENTIFIER, Program } from "./src/backend/AST.ts";
import Runtime from "./src/runtime/Runtime.ts";
import Context from "./src/runtime/context/Context.ts";
import {
    VALUE_BOOL,
    VALUE_FLOAT,
    VarDeclarationValue,
} from "./src/runtime/Values.ts";

const args: string[] = Deno.args;
const context: Context = new Context();

// Let's define some language constants, ignoring good practices, this is just for testing {{
const loc = {} as Loc;

// true
context.new_var(
    AST_IDENTIFIER("true", loc),
    { types: ["bool"], value: VALUE_BOOL(true, loc) } as VarDeclarationValue,
    true,
);

// false
context.new_var(
    AST_IDENTIFIER("false", loc),
    { types: ["bool"], value: VALUE_BOOL(false, loc) } as VarDeclarationValue,
    true,
);

// PI
context.new_var(
    AST_IDENTIFIER("PI", loc),
    {
        types: ["float"],
        value: VALUE_FLOAT(Math.PI, loc),
    } as VarDeclarationValue,
    true,
);

// }}

if (args.length < 1) {
    console.log("FarpyScript - Repl v0.0.1");

    while (true) {
        const input: string = prompt(">") ?? "";

        if (!input) {
            continue;
        }

        if (input.includes("exit")) {
            console.log("Bye");
            break;
        }

        const lexer: Lexer = new Lexer("repl", input);
        const tokens: Token[] = lexer.tokenize();
        // console.log(tokens);

        const parser: Parser = new Parser(tokens);
        const program: Program = parser.parse();
        // console.log(program);

        const runtime: Runtime = new Runtime(context);
        console.log(runtime.evaluate(program).value);
    }
    Deno.exit();
}

const file: string = args[0] ?? "";
const source: string = Deno.readTextFileSync(file);

if (!source) {
    console.log("Erro ao ler arquivo.");
    Deno.exit();
}

const lexer: Lexer = new Lexer(file, source);
const tokens: Token[] = lexer.tokenize();
// console.log(tokens);

const parser: Parser = new Parser(tokens);
const program: Program = parser.parse();
// console.log(program);

const runtime: Runtime = new Runtime(context);
console.log(runtime.evaluate(program));
