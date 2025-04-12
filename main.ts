import { Lexer } from "./src/frontend/Lexer.ts";
import { Token } from "./src/frontend/Token.ts";
import Parser from "./src/backend/Parser.ts";
import { Program } from "./src/backend/AST.ts";
import Runtime from "./src/runtime/Runtime.ts";
import Context from "./src/runtime/context/Context.ts";
import { parseArgs } from "@std/cli";
import { Colorize } from "./src/utils/Colorize.ts";
import { define_env } from "./src/runtime/context/Context.ts";
import { repl } from "./src/repl.ts";

const parsedArgs = parseArgs(Deno.args, {
  alias: {
    h: "help",
    v: "version",
    r: "repl",
    o: "output",
  },
  boolean: ["help", "version", "repl", "compile"],
  string: ["output", "file"],
});

if (parsedArgs.compile) {
  // Compile UWU
  if (!parsedArgs.output || !parsedArgs.file) {
    console.error("Error: No file specified or output.");
    console.error("Usage --output <BINARY> and --file <FILE>.fp");
    Deno.exit(1);
  }

  const file = "main_compile.ts";
  const fileData: string = Deno.readTextFileSync(file);
  let fileDataTmp = "";

  let source: string;
  try {
    source = Deno.readTextFileSync(parsedArgs.file);
  } catch (error: any) {
    console.error("Error reading file:", error.message);
    Deno.exit(1);
  }

  fileDataTmp = fileData.replace(`_SOURCE_`, source);
  fileDataTmp = fileDataTmp.replace("_FILENAME_", parsedArgs.file);

  Deno.writeFileSync(file, (new TextEncoder()).encode(fileDataTmp));

  const command = new Deno.Command("deno", {
    args: ["compile", "-A", `-o=${parsedArgs.output}`, "main_compile.ts"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = command.outputSync();

  if (code === 0) {
    console.log(
      `${Colorize.green("✓")} Successfully compiled to ${
        Colorize.bold(parsedArgs.output)
      }`,
    );
  } else {
    console.error(`${Colorize.red("✗")} Compilation failed:`);
    console.error(new TextDecoder().decode(stderr));
  }

  Deno.writeFileSync(file, (new TextEncoder()).encode(fileData));
  Deno.exit(1);
}

const VERSION = "v0.1.0";

if (parsedArgs.help) {
  console.log(
    `${Colorize.bold("Usage:")}
  farpy [options] <file.farpy>

${Colorize.bold("Options:")}
  -h, --help               Show this help message.
  -v, --version            Shows version and runtime information.
  -r, --repl               Starts the interactive REPL.
  -c, --compile            Compile a .farpy/.fp file to an executable.
  -o, --output <filename>  Specify output filename for compilation.
  --file <filename>        Specify input file for compilation.`,
  );
  Deno.exit(0);
}

if (parsedArgs.version) {
  console.log(
    Colorize.bold(
      `Farpy - ${Colorize.underline(Colorize.blue(VERSION))}`,
    ),
  );
  Deno.exit(0);
}

const context: Context = define_env(new Context());

if (parsedArgs.repl) {
  repl();
  Deno.exit();
}

if (parsedArgs._.length < 1) {
  console.error("Error: No file specified.");
  console.error("Usage -h or --help to see usage.");
  Deno.exit(1);
}

const file: string = parsedArgs._[0] as string;

if (!file.endsWith(".farpy") && !file.endsWith(".fp")) {
  console.error("Error: The file must have a .farpy or .fp extension");
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
console.log(program);

const runtime: Runtime = new Runtime(context);
runtime.evaluate(program);
