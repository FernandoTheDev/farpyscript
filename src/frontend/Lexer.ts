import { Keywords, Loc, NativeValue, Token, TokenType } from "./Token.ts";
import { ErrorReporter } from "../error/ErrorReporter.ts";

export class Lexer {
    private source: string;
    private file: string;
    protected line: number = 1;
    protected offset: number = 0; // Offset global
    protected lineOffset: number = 0; // Offset relative to current line
    protected start: number = 0;
    protected tokens: Token[] = [];
    private static SINGLE_CHAR_TOKENS: { [key: string]: TokenType } = {
        "+": TokenType.PLUS,
        "-": TokenType.MINUS,
        "*": TokenType.ASTERISK,
        "/": TokenType.SLASH,
        ">": TokenType.GREATER_THAN,
        "<": TokenType.LESS_THAN,
        ",": TokenType.COMMA,
        ";": TokenType.SEMICOLON,
        ":": TokenType.COLON,
        "(": TokenType.LPAREN,
        ")": TokenType.RPAREN,
        "{": TokenType.LBRACE,
        "}": TokenType.RBRACE,
        ".": TokenType.DOT,
        "%": TokenType.PERCENT,
        "|": TokenType.PIPE,
        "=": TokenType.EQUALS,
    };
    private static MULTI_CHAR_TOKENS: { [key: string]: TokenType } = {
        "++": TokenType.INCREMENT,
        "--": TokenType.DECREMENT,
        "**": TokenType.EXPONENTIATION,
        "%%": TokenType.REMAINDER,
        "==": TokenType.EQUALS_EQUALS,
        ">=": TokenType.GREATER_THAN_OR_EQUALS,
        "<=": TokenType.LESS_THAN_OR_EQUALS,
        "&&": TokenType.AND,
        "||": TokenType.OR,
        "!=": TokenType.NOT_EQUALS,
    };

    public constructor(file: string, source: string) {
        this.file = file;
        this.source = source;
    }

    public tokenize(): Token[] {
        while (this.offset < this.source.length) {
            this.start = this.offset - this.lineOffset; // Sets start to local offset
            const char = this.source[this.offset];

            if (char === "\n") {
                this.line++;
                this.offset++;
                this.lineOffset = this.offset;
                continue;
            }

            if (char.trim() === "") {
                this.offset++;
                continue;
            }

            const muti = char.concat(this.source[this.offset + 1]);
            const multiTokenType = Lexer
                .MULTI_CHAR_TOKENS[
                    muti
                ];

            if (multiTokenType) {
                this.offset++; // skip second char
                this.createToken(multiTokenType, muti);
                continue;
            }

            const singleTokenType = Lexer.SINGLE_CHAR_TOKENS[char];

            if (singleTokenType) {
                this.createToken(singleTokenType, char);
                continue;
            }

            if (char === "/") {
                this.lexing_comment();
                continue;
            }

            // Checks if it is a string (unclosed string error)
            if (char === '"') {
                this.lexing_string();
                continue;
            }

            // Check if it is a number (int, float or binary)
            if (this.isDigit(char)) {
                this.lexing_digit();
                continue;
            }

            // Fernand0
            // print
            if (this.isAlphaNumeric(char)) {
                this.lexing_alphanumeric();
                continue;
            }

            // If the character is not valid, it shows an error
            ErrorReporter.showError(
                `Invalid char '${char}'`,
                this.getLocation(this.start, this.start + char.length),
            );
            Deno.exit(1);
        }

        this.createToken(
            TokenType.EOF,
            "\0",
        );

        return this.tokens;
    }

    private lexing_alphanumeric(): void {
        let id = "";

        while (
            this.offset < this.source.length &&
            this.isAlphaNumeric(this.source[this.offset])
        ) {
            id += this.source[this.offset];
            this.offset++;
        }

        if (Keywords[id] !== undefined) {
            this.createToken(
                Keywords[id],
                id,
            );
        } else {
            this.createToken(
                TokenType.IDENTIFIER,
                id,
                false,
            );
        }
    }

    private lexing_digit(): void {
        let number = "";

        while (
            this.offset < this.source.length &&
            this.isDigit(this.source[this.offset])
        ) {
            number += this.source[this.offset];
            this.offset++;
        }

        // Check if is a float
        if (this.source[this.offset] === ".") {
            number += this.source[this.offset];
            this.offset++;
            while (
                this.offset < this.source.length &&
                this.isDigit(this.source[this.offset])
            ) {
                number += this.source[this.offset];
                this.offset++;
            }
        }

        // Check if is a binary
        if (this.source[this.offset] === "b") {
            number += this.source[this.offset];
            this.offset++;
            while (
                this.offset < this.source.length &&
                this.isDigit(this.source[this.offset])
            ) {
                number += this.source[this.offset];
                this.offset++;
            }
        }

        if (number.includes(".")) {
            this.createToken(
                TokenType.FLOAT,
                Number(number),
                false,
            );
            return;
        }

        if (number.includes("b")) {
            this.createToken(
                TokenType.BINARY,
                number,
                false,
            );
            return;
        }

        this.createToken(
            TokenType.INT,
            Number(number),
            false,
        );
    }

    private lexing_string(): void {
        let value = "";
        this.offset++; // jump "

        while (
            this.offset < this.source.length &&
            this.source[this.offset] !== '"'
        ) {
            if (this.source[this.offset] == "\n") {
                break;
            }
            value += this.source[this.offset];
            this.offset++;
        }

        if (this.source[this.offset] !== '"') {
            ErrorReporter.showError(
                "String not closed.",
                this.getLocation(
                    this.start,
                    this.start + value.length + 1,
                ),
            );
            Deno.exit(1);
        }

        this.createToken(
            TokenType.STRING,
            value,
        );
    }

    private lexing_comment(): void {
        this.offset++;

        if (this.source[this.offset] === "/") {
            this.offset++;
            while (
                this.offset < this.source.length &&
                this.source[this.offset] !== "\n"
            ) {
                this.offset++;
            }
            return;
        }

        if (this.source[this.offset] === "*") {
            this.offset++;
            while (
                this.offset < this.source.length &&
                !(this.source[this.offset] === "*" &&
                    this.source[this.offset + 1] === "/")
            ) {
                if (this.source[this.offset] === "\n") {
                    this.line++;
                    this.lineOffset = this.offset + 1;
                }
                this.offset++;
            }
            if (this.offset < this.source.length) {
                this.offset += 2;
            } else {
                ErrorReporter.showError(
                    "Unclosed block comment",
                    this.getLocation(this.start, this.offset),
                );
                Deno.exit(1);
            }
            return;
        }

        ErrorReporter.showError(
            "Unexpected character after '/'",
            this.getLocation(this.start, this.offset),
        );
        Deno.exit(1);
    }

    private isAlphaNumeric(token: string): boolean {
        return /^[a-z0-9_]+$/i.test(token);
    }

    private isDigit(char: string): boolean {
        return /^[0-9]$/.test(char);
    }

    private getLocation(start: number, end: number): Loc {
        return {
            file: this.file,
            line: this.line,
            start,
            end,
            line_string: this.getLineText(this.line),
        };
    }

    private createToken(
        kind: TokenType,
        value: NativeValue,
        jump: boolean = true,
    ): Token {
        const token: Token = {
            kind,
            value,
            loc: this.getLocation(
                this.start,
                this.start + (String(value).length ?? 0),
            ),
        };
        this.tokens.push(token);
        if (jump) this.offset++;
        return token;
    }

    private getLineText(line: number): string {
        const lines = this.source.split("\n");
        return lines[line - 1] || "";
    }
}
