import { Loc, Token, TokenType } from "../frontend/Token.ts";
import { ErrorReporter } from "../error/ErrorReporter.ts";
import {
    AssignmentDeclaration,
    AST_BINARY,
    AST_FLOAT,
    AST_IDENTIFIER,
    AST_INT,
    AST_NULL,
    AST_STRING,
    BinaryExpr,
    BinaryLiteral,
    Expr,
    FloatLiteral,
    IntLiteral,
    Program,
    Stmt,
    VarDeclaration,
} from "./AST.ts";
import { TypesNative, TypesNativeArray } from "../runtime/Values.ts";

export default class Parser {
    private tokens: Token[];

    public constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private is_end(index: number = 0): boolean {
        return this.tokens[index] === undefined ||
            this.tokens[index].kind === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[0];
    }

    private next(): Token {
        return this.tokens[1] ??
            { kind: TokenType.EOF, value: "\0", loc: {} as Loc };
    }

    private eat(): Token {
        return this.tokens.shift() as Token;
    }

    private consume(type: TokenType | TokenType[], err: string): Token {
        const prev = this.eat();

        if (Array.isArray(type)) {
            if (type.some((t) => t === prev.kind)) {
                return prev;
            }
        } else {
            if (type === prev.kind) {
                return prev;
            }
        }

        ErrorReporter.showError(err, prev.loc);
        return {} as Token;
    }

    public parse(): Program {
        const program: Program = {
            kind: "Program",
            type: "null",
            value: null,
            body: [],
            loc: this.getLocationFromTokens(
                this.tokens[0],
                this.tokens[this.tokens.length - 1],
            ),
        };

        while (!this.is_end()) {
            program.body?.push(this.parse_stmt());
        }

        return program;
    }

    private parse_stmt(): Stmt {
        return this.parse_expr();
    }

    private parse_expr(): Expr {
        return this.parse_binary_expr();
    }

    private parse_and_expr(): Expr {
        let left: Expr = this.parse_additive_expr();

        while (this.peek().value === "&&" || this.peek().value === "||") {
            const operatorToken = this.eat();
            const operator: string = operatorToken.value?.toString() ?? "ERROR";
            const right: Expr = this.parse_mul_expr();
            let type: TypesNative = "int";

            if (left.type == "int" && right.type == "int") type = "int";
            if (left.type == "float" || right.type == "float") type = "float";
            if (left.type == "string" || right.type == "string") {
                type = "string";
            }

            left = {
                kind: "BinaryExpr",
                type: type,
                left,
                right,
                operator,
                loc: this.getLocationFromTokens(left.loc, right.loc),
            } as BinaryExpr;
        }

        return left;
    }

    private parse_additive_expr(): Expr {
        let left: Expr = this.parse_mul_expr();

        while (this.peek().value === "+" || this.peek().value === "-") {
            const operatorToken = this.eat();
            const operator: string = operatorToken.value?.toString() ?? "ERROR";
            const right: Expr = this.parse_mul_expr();
            let type: TypesNative = "int";

            if (left.type == "int" && right.type == "int") type = "int";
            if (left.type == "float" || right.type == "float") type = "float";
            if (left.type == "string" || right.type == "string") {
                type = "string";
            }

            left = {
                kind: "BinaryExpr",
                type: type,
                left,
                right,
                operator,
                loc: this.getLocationFromTokens(left.loc, right.loc),
            } as BinaryExpr;
        }

        return left;
    }

    private parse_mul_expr(): Expr {
        let left: Expr = this.parse_primary_expr();

        if (typeof this.peek().value == "undefined") {
            return left;
        }

        while (
            this.peek().value === "/" ||
            this.peek().value === "*" ||
            this.peek().value === "**" ||
            this.peek().value === "%"
        ) {
            const operatorToken = this.eat();
            const operator: string = operatorToken.value?.toString() ?? "ERROR";
            const right: Expr = this.parse_mul_expr();
            let type: TypesNative = "int";

            if (left.type == "int" && right.type == "int") type = "int";
            if (left.type == "float" || right.type == "float") type = "float";
            if (left.type == "string" || right.type == "string") {
                type = "string";
            }

            left = {
                kind: "BinaryExpr",
                type: type,
                left,
                right,
                operator,
                loc: this.getLocationFromTokens(left.loc, right.loc),
            } as BinaryExpr;
        }

        return left;
    }

    private parse_binary_expr(): Expr {
        let left: Expr = this.parse_and_expr();

        while (
            this.peek().kind === TokenType.EQUALS_EQUALS ||
            this.peek().kind === TokenType.NOT_EQUALS ||
            this.peek().kind === TokenType.GREATER_THAN ||
            this.peek().kind === TokenType.LESS_THAN ||
            this.peek().kind === TokenType.GREATER_THAN_OR_EQUALS ||
            this.peek().kind === TokenType.LESS_THAN_OR_EQUALS
        ) {
            const operatorToken = this.eat();
            const operator: string = operatorToken.value?.toString() ?? "ERROR";
            const right: Expr = this.parse_additive_expr();

            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
                loc: this.getLocationFromTokens(left.loc, right.loc),
            } as BinaryExpr;
        }

        return left;
    }

    private parse_primary_expr(): Expr {
        const token = this.peek();

        switch (token.kind) {
            case TokenType.IDENTIFIER: {
                if (this.next().kind == TokenType.EQUALS) { // =
                    return this.parse_assignment_declaration();
                }
                this.eat(); // ID
                return AST_IDENTIFIER(token.value as string, token.loc);
            }
            case TokenType.INT: {
                this.eat();
                return AST_INT(token.value as number, token.loc);
            }
            case TokenType.FLOAT: {
                this.eat();
                return AST_FLOAT(token.value as number, token.loc);
            }
            case TokenType.BINARY:
                return this.parseBinaryLiteral();
            case TokenType.MINUS: {
                return this.parseNegativeValue();
            }
            case TokenType.STRING: {
                const str = this.eat();
                return AST_STRING(str.value as string, str.loc);
            }
            case TokenType.NULL: {
                this.eat();
                return AST_NULL(token.loc);
            }
            case TokenType.LPAREN: {
                const startToken = this.eat();
                const value: Expr = this.parse_expr();
                const endToken = this.consume(
                    TokenType.RPAREN,
                    "Expected closing parenthesis.",
                );
                return {
                    ...value,
                    loc: this.getLocationFromTokens(startToken, endToken),
                };
            }
            case TokenType.NEW:
                return this.parse_var_declaration();
            default:
                ErrorReporter.showError(
                    "Unexpected token found during parsing!",
                    token.loc,
                );
                Deno.exit(1);
        }
    }

    private parseBinaryLiteral(): BinaryLiteral {
        const token: Token = this.eat();
        if (/^0b[01]+$/.test(token.value as string) == false) {
            ErrorReporter.showError("Invalid binary value.", token.loc);
            Deno.exit();
        }
        return AST_BINARY(token.value as string, token.loc);
    }

    // new x: <T> = EXPR
    // new mut y: <T> = x
    private parse_var_declaration(): VarDeclaration {
        const startToken = this.eat(); // new
        let is_const: boolean = true;
        const types: TypesNative[] = [];

        if (this.peek().kind === TokenType.MUT) {
            this.eat();
            is_const = false;
        }

        const idToken = this.consume(
            TokenType.IDENTIFIER,
            "The name must be an IDENTIFIER.",
        );

        this.consume(TokenType.COLON, "Expected ':'."); // :

        // new
        while (this.peek().kind !== TokenType.EQUALS) {
            const type_tk: Token = this.consume(
                TokenType.IDENTIFIER,
                "The type of the variable was expected but was not passed.",
            );
            const type: TypesNative = type_tk.value as TypesNative;

            if (!TypesNativeArray.includes(type)) {
                ErrorReporter.showError("Invalid type.", type_tk.loc);
                Deno.exit();
            }

            types.push(type);

            if (this.peek().kind == TokenType.PIPE) {
                this.eat(); // |
                if (this.peek().kind == TokenType.EQUALS) {
                    ErrorReporter.showError(
                        "'=' is not expected after '|'",
                        this.peek().loc,
                    );
                    Deno.exit();
                }
                continue;
            }
        }

        this.consume(TokenType.EQUALS, "Expected '='.");
        const value = this.parse_expr();
        if (value.kind != "Identifier") this.validateType(value, types);

        return {
            kind: "VarDeclaration",
            type: types,
            id: AST_IDENTIFIER(idToken.value as string, idToken.loc),
            value,
            constant: is_const,
            loc: this.getLocationFromTokens(startToken, value.loc),
        } as VarDeclaration;
    }

    private parse_assignment_declaration(): AssignmentDeclaration {
        const idToken = this.consume(
            TokenType.IDENTIFIER,
            "The name must be an IDENTIFIER.",
        );

        this.consume(TokenType.EQUALS, "Expected '='.");
        const value = this.parse_expr();

        return {
            kind: "AssignmentDeclaration",
            type: value.type,
            id: AST_IDENTIFIER(idToken.value as string, idToken.loc),
            value,
            loc: this.getLocationFromTokens(idToken, value.loc),
        } as AssignmentDeclaration;
    }

    private parseNegativeValue(): IntLiteral | FloatLiteral {
        if (
            this.next().kind === TokenType.INT ||
            this.next().kind === TokenType.FLOAT
        ) {
            this.eat(); // -
            const numToken = this.eat();
            if (numToken.kind == TokenType.INT) {
                return AST_INT(-Number(numToken.value), numToken.loc);
            }
            // Fallback for Float
            return AST_FLOAT(-Number(numToken.value), numToken.loc);
        }

        ErrorReporter.showError(
            "Unexpected token found during parsing!",
            this.next().loc,
        );
        Deno.exit(1);
    }

    private validateType(value: Stmt, type: TypesNative[]): boolean {
        if (!type.includes(value.type as TypesNative)) {
            ErrorReporter.showError(
                `The expected type does not match the type of the value. Expected one of ${
                    type.join(", ")
                } and received ${value.type}.`,
                value.loc,
            );
            Deno.exit(1);
        }
        return true;
    }

    private getLocationFromTokens(start: Token | Loc, end: Token | Loc): Loc {
        return {
            file: "file" in start ? start.file : start.loc.file,
            line: "line" in start ? start.line : start.loc.line,
            start: "start" in start ? start.start : start.loc.start,
            end: "end" in end ? end.end : end.loc.end,
            line_string: "line_string" in start
                ? start.line_string
                : start.loc.line_string,
        };
    }
}
