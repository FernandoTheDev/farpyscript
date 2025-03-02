import { Program } from "./backend/AST.ts";
import Parser from "./backend/Parser.ts";
import { Lexer } from "./frontend/Lexer.ts";
import { Token } from "./frontend/Token.ts";
import Context, { define_env } from "./runtime/context/Context.ts";
import Runtime from "./runtime/Runtime.ts";
import { Colorize } from "./utils/Colorize.ts";

const VERSION = "v0.1.0";
const context: Context = define_env(new Context());

export function repl(): void {
  console.log(
    Colorize.bold(
      `Farpy ${Colorize.underline(Colorize.blue(VERSION))} - REPL`,
    ),
  );

  let inputBuffer = "";
  let balance = 0;
  while (true) {
    const promptSymbol = inputBuffer
      ? ".".repeat(Math.max((balance * 3) == 0 ? 3 : balance * 3, 1))
      : ">";
    const line: string = prompt(promptSymbol) ?? "";

    if (!inputBuffer && line.trim() === "exit") {
      console.log("Bye");
      break;
    }

    inputBuffer += line + "\n";

    for (const char of line) {
      if (char === "{") {
        balance++;
      } else if (char === "}") {
        balance--;
      }
    }

    if (balance < 0) {
      balance = 0;
    }

    if (balance > 0) continue;

    const code = inputBuffer.trim();
    if (code) {
      try {
        const lexer: Lexer = new Lexer("repl", code);
        const tokens: Token[] = lexer.tokenize();
        const parser: Parser = new Parser(tokens);
        const program: Program = parser.parse();
        const runtime: Runtime = new Runtime(context);
        runtime.evaluate(program);
      } catch (error: any) {
        console.log(error);
        console.error("Error processing code:", error);
      }
    }
    inputBuffer = "";
    balance = 0;
  }
  Deno.exit(0);
}
