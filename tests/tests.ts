import * as assert from "@std/assert";
import { Lexer } from "../src/frontend/Lexer.ts";
import { Token } from "../src/frontend/Token.ts";
import Parser from "../src/backend/Parser.ts";
import { Program } from "../src/backend/AST.ts";
import Runtime from "../src/runtime/Runtime.ts";
import Context, { define_env } from "../src/runtime/context/Context.ts";
import {
  RuntimeValue,
  VALUE_BOOL,
  VALUE_FLOAT,
  VALUE_INT,
  VALUE_NULL,
  VALUE_VOID,
} from "../src/runtime/Values.ts";

function evaluate_code(code: string): RuntimeValue {
  const lexer: Lexer = new Lexer("test", code);
  const tokens: Token[] = lexer.tokenize();
  const parser: Parser = new Parser(tokens);
  const program: Program = parser.parse();
  const runtime: Runtime = new Runtime(define_env(new Context()));
  return runtime.evaluate(program);
}

Deno.test(
  {
    name: "Check True Constant",
    fn() {
      const code = "true";
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_BOOL(true, evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Check False Constant",
    fn() {
      const code = "false";
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_BOOL(false, evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Check Null Constant",
    fn() {
      const code = "null";
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_NULL(null, evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Check Binary Value",
    fn() {
      const code = "0b10";
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_INT(2, evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Check Binary Expr",
    fn() {
      const code = "(2 ** 2 - (0b10 + PI)) + 1.1415926535897931";
      const evaluated = evaluate_code(code);
      const expected = VALUE_FLOAT(0, evaluated.loc);
      expected.ret = true;
      assert.assertEquals(
        evaluated,
        expected,
      );
    },
  },
);

Deno.test(
  {
    name: "Lambda Call",
    fn() {
      const code = `
      new sum: int = fn (x: int, y: int): int { return x + y }
      sum(10, 20)
      `;
      const evaluated = evaluate_code(code);
      const expected = VALUE_INT(30, evaluated.loc);
      expected.ret = true;
      assert.assertEquals(
        evaluated,
        expected,
      );
    },
  },
);

Deno.test(
  {
    name: "Lambda Call External Var",
    fn() {
      const code = `
      new x: int = 10
      new sum: int = fn |x|(y: int): int { return x + y }
      sum(20)
      `;
      const evaluated = evaluate_code(code);
      const expected = VALUE_INT(30, evaluated.loc);
      expected.ret = true;
      assert.assertEquals(
        evaluated,
        expected,
      );
    },
  },
);

Deno.test(
  {
    name: "Var Declaration Test",
    fn() {
      const code = "new x: int = 10";
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_INT(10, evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Var Assignment Test",
    fn() {
      const code = `
      new mut x: int = 10
      x = 20
      `;
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_INT(20, evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Function Declaration",
    fn() {
      const code = `
      fn a_function(): void { return void }`;
      const evaluated = evaluate_code(code);
      assert.assertEquals(evaluated, VALUE_VOID(evaluated.loc));
    },
  },
);

Deno.test(
  {
    name: "Function Call",
    fn() {
      const code = `
      fn sum(x: int, y: int): int
      {
          return x + y
      }
      sum(10, 20)
      `;
      const evaluated = evaluate_code(code);
      const expected = VALUE_INT(30, evaluated.loc);
      expected.ret = true;
      assert.assertEquals(evaluated, expected);
    },
  },
);
