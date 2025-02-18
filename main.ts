import { Lexer } from "./src/frontend/Lexer.ts";
import { Token } from "./src/frontend/Token.ts";
import Parser from "./src/backend/Parser.ts";
import { Program } from "./src/backend/AST.ts";
import Runtime from "./src/runtime/Runtime.ts";
import Context from "./src/runtime/context/Context.ts";
import { parseArgs } from "@std/cli";
import { Colorize } from "./src/utils/Colorize.ts";
import { define_env } from "./src/runtime/context/Context.ts";

const parsedArgs = parseArgs(Deno.args, {
  alias: {
    h: "help",
    v: "version",
    r: "repl",
  },
  boolean: ["help", "version", "repl"],
});

const VERSION = "v0.1.0";

if (parsedArgs.help) {
  console.log(
    `${Colorize.bold("Usage:")}
  farpy [options] <file.farpy>

${Colorize.bold("Options:")}
  -h, --help      Show this help message.
  -v, --version   Shows version and runtime information.
  -r, --repl      Starts the interactive REPL.`,
  );
  Deno.exit(0);
}

if (parsedArgs.version) {
  console.log(
    Colorize.bold(
      `FarpyScript - ${Colorize.underline(Colorize.blue(VERSION))}`,
    ),
  );
  Deno.exit(0);
}

const context: Context = define_env(new Context());

if (parsedArgs.repl) {
  console.log(
    Colorize.bold(
      `FarpyScript ${Colorize.underline(Colorize.blue(VERSION))} - REPL`,
    ),
  );

  let inputBuffer = "";
  let balance = 0;
  while (true) {
    // Se já há conteúdo acumulado, usamos um prompt com padding proporcional ao balance.
    const promptSymbol = inputBuffer
      ? ".".repeat(Math.max((balance * 3) == 0 ? 3 : balance * 3, 1))
      : ">";
    const line: string = prompt(promptSymbol) ?? "";

    if (!inputBuffer && line.trim() === "exit") {
      console.log("Bye");
      break;
    }

    // Acumula a linha lida
    inputBuffer += line + "\n";

    // Atualiza o balance com base na linha atual
    for (const char of line) {
      if (char === "{") {
        balance++;
      } else if (char === "}") {
        balance--;
      }
    }

    // Evita que o balance fique negativo
    if (balance < 0) {
      balance = 0;
    }

    // Se ainda houver blocos abertos, continua a leitura
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
    // Reseta o buffer e o balance para o próximo bloco
    inputBuffer = "";
    balance = 0;
  }
  Deno.exit(0);
}

if (parsedArgs._.length < 1) {
  console.error("Error: No file specified.");
  console.error("Usage -h or --help to see usage.");
  Deno.exit(1);
}

const file: string = parsedArgs._[0] as string;

if (!file.endsWith(".farpy")) {
  console.error("Error: The file must have a .farpy extension");
  Deno.exit(1);
}

let source: string;
try {
  source = Deno.readTextFileSync(file);
} catch (error: any) {
  console.error("Error reading file:", error.message);
  Deno.exit(1);
}

const lexer: Lexer = new Lexer(file, source);
const tokens: Token[] = lexer.tokenize();
const parser: Parser = new Parser(tokens);
const program: Program = parser.parse();
const runtime: Runtime = new Runtime(context);
runtime.evaluate(program);
