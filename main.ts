import { Lexer } from "./src/frontend/Lexer.ts";
import { Token } from "./src/frontend/Token.ts";
import Parser from "./src/backend/Parser.ts";
import { Program } from "./src/backend/AST.ts";

const args: string[] = Deno.args;

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
        console.log(program);
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
console.log(program);
