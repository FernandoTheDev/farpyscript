import { Keywords, Loc, NativeValue, Token, TokenType } from "./Token.ts";
import { ErrorReporter } from "../error/ErrorReporter.ts";

export class Lexer {
    protected line: number = 1;
    private source: string;
    private file: string;
    protected offset: number = 0; // Offset global
    protected lineOffset: number = 0; // Offset relativo à linha atual
    protected start: number = 0;
    private error: ErrorReporter;

    public constructor(file: string, source: string) {
        this.file = file;
        this.source = source;
        this.error = new ErrorReporter();
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.offset < this.source.length) {
            this.start = this.offset - this.lineOffset; // Ajusta o início para o offset local
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
                tokens.push(
                    this.createToken(
                        TokenType.PLUS,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === ",") {
                tokens.push(
                    this.createToken(
                        TokenType.COMMA,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === ";") {
                tokens.push(
                    this.createToken(
                        TokenType.SEMICOLON,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === ":") {
                tokens.push(
                    this.createToken(
                        TokenType.COLON,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
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
                        this.error.showError(
                            "Comentário de bloco não fechado",
                            this.getLocation(this.start, this.offset),
                        );
                        return [];
                    }
                    continue;
                } else {
                    // Trata como o caractere `/` normal.
                    tokens.push(
                        this.createToken(
                            TokenType.SLASH,
                            char,
                            this.getLocation(
                                this.start,
                                this.start + char.length,
                            ),
                        ),
                    );
                    continue;
                }
            }

            if (char === "-") {
                tokens.push(
                    this.createToken(
                        TokenType.MINUS,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === "*") {
                tokens.push(
                    this.createToken(
                        TokenType.ASTERISK,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === "%") {
                tokens.push(
                    this.createToken(
                        TokenType.PERCENT,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === "=") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.offset++;
                    tokens.push(
                        this.createToken(
                            TokenType.EQUALS_EQUALS,
                            "==",
                            this.getLocation(this.start, this.offset),
                        ),
                    );
                    continue;
                }
                tokens.push(
                    this.createToken(
                        TokenType.EQUALS,
                        "=",
                        this.getLocation(this.start, this.offset),
                    ),
                );
                continue;
            }

            if (char === ">") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.offset++;
                    tokens.push(
                        this.createToken(
                            TokenType.GREATER_THAN_OR_EQUALS,
                            ">=",
                            this.getLocation(this.start, this.offset),
                        ),
                    );
                    continue;
                }
                tokens.push(
                    this.createToken(
                        TokenType.GREATER_THAN,
                        ">",
                        this.getLocation(this.start, this.offset),
                    ),
                );
                continue;
            }

            if (char === "<") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.offset++;
                    tokens.push(
                        this.createToken(
                            TokenType.LESS_THAN_OR_EQUALS,
                            "<=",
                            this.getLocation(this.start, this.offset),
                        ),
                    );
                    continue;
                }
                tokens.push(
                    this.createToken(
                        TokenType.LESS_THAN,
                        "<",
                        this.getLocation(this.start, this.offset),
                    ),
                );
                continue;
            }

            if (char === "|") {
                this.offset++;
                if (this.source[this.offset] === "|") {
                    this.offset++;
                    tokens.push(
                        this.createToken(
                            TokenType.OR,
                            "||",
                            this.getLocation(this.start, this.offset),
                        ),
                    );
                    continue;
                }
            }

            if (char === "&") {
                this.offset++;
                if (this.source[this.offset] === "&") {
                    this.offset++;
                    tokens.push(
                        this.createToken(
                            TokenType.AND,
                            "&&",
                            this.getLocation(this.start, this.offset),
                        ),
                    );
                    continue;
                }
            }

            if (char === "!") {
                this.offset++;
                if (this.source[this.offset] === "=") {
                    this.offset++;
                    tokens.push(
                        this.createToken(
                            TokenType.NOT_EQUALS,
                            "!=",
                            this.getLocation(this.start, this.offset),
                        ),
                    );
                    continue;
                }
            }

            if (char === "(") {
                tokens.push(
                    this.createToken(
                        TokenType.LPAREN,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === ")") {
                tokens.push(
                    this.createToken(
                        TokenType.RPAREN,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === "{") {
                tokens.push(
                    this.createToken(
                        TokenType.LBRACE,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === "}") {
                tokens.push(
                    this.createToken(
                        TokenType.RBRACE,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            if (char === ".") {
                tokens.push(
                    this.createToken(
                        TokenType.DOT,
                        char,
                        this.getLocation(this.start, this.start + char.length),
                    ),
                );
                this.offset++;
                continue;
            }

            // Verifica se é uma string (erro de string não fechada)
            if (char === '"') {
                let value = "";
                this.offset++; // Pula o primeiro "

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
                    this.error.showError(
                        "String não fechada",
                        this.getLocation(
                            this.start,
                            this.start + value.length + 2,
                        ),
                    );
                    return [];
                }

                tokens.push(
                    this.createToken(
                        TokenType.STRING,
                        value,
                        this.getLocation(
                            this.start,
                            this.start + value.length + 2,
                        ),
                    ),
                );
                this.offset++; // Pula o segundo "
                continue;
            }

            // Verifica se é um número (inteiro ou float)
            if (this.isDigit(char)) {
                let number = "";

                while (
                    this.offset < this.source.length &&
                    this.isDigit(this.source[this.offset])
                ) {
                    number += this.source[this.offset];
                    this.offset++;
                }

                // Verifica se é um float
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

                tokens.push(
                    this.createToken(
                        TokenType.INT,
                        number,
                        this.getLocation(
                            this.start,
                            this.start + number.length,
                        ),
                    ),
                );
                continue;
            }

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
                    tokens.push(
                        this.createToken(
                            Keywords[id],
                            id,
                            this.getLocation(
                                this.start,
                                this.start + id.length,
                            ),
                        ),
                    );
                } else {
                    tokens.push(
                        this.createToken(
                            TokenType.IDENTIFIER,
                            id,
                            this.getLocation(
                                this.start,
                                this.start + id.length,
                            ),
                        ),
                    );
                }

                continue;
            }

            // Caso o caractere não seja válido, mostra erro
            this.error.showError(
                `Caractere inválido '${char}'`,
                this.getLocation(this.start, this.start + char.length),
            );
            return [];
        }

        tokens.push(
            this.createToken(
                TokenType.EOF,
                "\0",
                this.getLocation(
                    this.source.length,
                    this.source.length,
                ),
            ),
        );

        return tokens;
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
        loc: Loc,
    ): Token {
        return { kind, value, loc: loc };
    }

    private getLineText(line: number): string {
        const lines = this.source.split("\n");
        return lines[line - 1] || "";
    }
}
