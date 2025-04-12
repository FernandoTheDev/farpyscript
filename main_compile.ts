import { Lexer } from "./src/frontend/Lexer.ts";
import { Token } from "./src/frontend/Token.ts";
import Parser from "./src/backend/Parser.ts";
import { Program } from "./src/backend/AST.ts";
import Runtime from "./src/runtime/Runtime.ts";
import Context from "./src/runtime/context/Context.ts";
import { define_env } from "./src/runtime/context/Context.ts";

const context: Context = define_env(new Context());
const source: string = `_SOURCE_`;

const lexer: Lexer = new Lexer("_FILENAME_", source);
const tokens: Token[] = lexer.tokenize();
const parser: Parser = new Parser(tokens);
const program: Program = parser.parse();

const runtime: Runtime = new Runtime(context);
runtime.evaluate(program);
