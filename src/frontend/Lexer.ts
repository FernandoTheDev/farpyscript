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

            if (char === "+") {
                this.createToken(
                    TokenType.PLUS,
                    char,
                );
                continue;
            }

            if (char === ",") {
                this.createToken(
                    TokenType.COMMA,
                    char,
                );
                continue;
            }

            if (char === ";") {
                this.createToken(
                    TokenType.SEMICOLON,
                    char,
                );
                continue;
            }

            if (char === ":") {
                this.createToken(
                    TokenType.COLON,
                    char,
                );
                continue;
            }

            if (char === "/") {
                this.offset++;
                if (this.source[this.offset] === "/") {
                    this.offset++;
                    while (
                        this.offset < this.source.length &&
                        this.source[this.offset] !== "\n"
                    ) {
                        this.offset++;
                    }
                    continue;
                } else if (this.source[this.offset] === "*") {
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
                        return [];
                    }
                    continue;
                } else {
                    // Normal slash
                    this.createToken(
                        TokenType.SLASH,
                        char,
                        false,
                    );
                    continue;
                }
            }

            if (char === "-") {
                this.createToken(
                    TokenType.MINUS,
                    char,
                );
                continue;
            }

            /** TODO: Fix the bug
             * EX: 2**2 // ERROR
             * EX: 2 ** 2 // OK
             */
            if (char === "*") {
                this.offset++;
                // EXPONENTIATION
                if (this.source[this.offset] === "*") {
                    this.createToken(
                        TokenType.EXPONENTIATION,
                        "**",
                    );
                    continue;
                }
                this.createToken(
                    TokenType.ASTERISK,
                    char,
                );
                continue;
            }

            if (char === "%") {
                this.createToken(
                    TokenType.PERCENT,
                    char,
                );
                continue;
            }

            if (char === "=") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.createToken(
                        TokenType.EQUALS_EQUALS,
                        "==",
                    );
                    continue;
                }

                this.createToken(
                    TokenType.EQUALS,
                    "=",
                    false,
                );
                continue;
            }

            if (char === ">") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.createToken(
                        TokenType.GREATER_THAN_OR_EQUALS,
                        ">=",
                    );
                    continue;
                }

                this.createToken(
                    TokenType.GREATER_THAN,
                    ">",
                    false,
                );
                continue;
            }

            if (char === "<") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.createToken(
                        TokenType.LESS_THAN_OR_EQUALS,
                        "<=",
                    );
                    continue;
                }

                this.createToken(
                    TokenType.LESS_THAN,
                    "<",
                    false,
                );
                continue;
            }

            if (char === "|") {
                this.offset++;
                if (this.source[this.offset] === "|") {
                    this.createToken(
                        TokenType.OR,
                        "||",
                    );
                    continue;
                }
                this.createToken(
                    TokenType.PIPE,
                    "|",
                );
                continue;
            }

            if (char === "&") {
                this.offset++;
                if (this.source[this.offset] === "&") {
                    this.createToken(
                        TokenType.AND,
                        "&&",
                    );
                    continue;
                }
            }

            if (char === "!") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.createToken(
                        TokenType.NOT_EQUALS,
                        "!=",
                    );
                    continue;
                }
            }

            if (char === "(") {
                this.createToken(
                    TokenType.LPAREN,
                    char,
                );
                continue;
            }

            if (char === ")") {
                this.createToken(
                    TokenType.RPAREN,
                    char,
                );
                continue;
            }

            if (char === "{") {
                this.createToken(
                    TokenType.LBRACE,
                    char,
                );
                continue;
            }

            if (char === "}") {
                this.createToken(
                    TokenType.RBRACE,
                    char,
                );
                continue;
            }

            if (char === ".") {
                this.createToken(
                    TokenType.DOT,
                    char,
                );
                continue;
            }

            // Checks if it is a string (unclosed string error)
            if (char === '"') {
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
                    return [];
                }

                this.createToken(
                    TokenType.STRING,
                    value,
                );
                continue;
            }

            // Check if it is a number (int, float or binary)
            if (this.isDigit(char)) {
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
                    continue;
                }

                if (number.includes("b")) {
                    this.createToken(
                        TokenType.BINARY,
                        number,
                        false,
                    );
                    continue;
                }

                this.createToken(
                    TokenType.INT,
                    Number(number),
                    false,
                );
                continue;
            }

            // Fernand0
            // print
            if (this.isAlphaNumeric(char)) {
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
                    continue;
                }

                // if (id.toLowerCase() == "true" || id.toLowerCase() == "false") {
                //     this.createToken(
                //         TokenType.BOOL,
                //         id,
                //     );
                //     continue;
                // }

                // if (id.toLowerCase() == "null") {
                //     this.createToken(
                //         TokenType.NULL,
                //         id,
                //     );
                //     continue;
                // }

                this.createToken(
                    TokenType.IDENTIFIER,
                    id,
                    false,
                );
                continue;
            }

            // If the character is not valid, it shows an error
            ErrorReporter.showError(
                `Invalid char '${char}'`,
                this.getLocation(this.start, this.start + char.length),
            );
            return [];
        }

        this.createToken(
            TokenType.EOF,
            "\0",
        );

        return this.tokens;
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
