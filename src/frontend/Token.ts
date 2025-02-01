export enum TokenType {
    // Keywords
    NEW, // new x = EXPR
    MUT, // new mut x = EXPR
    IF, // if
    ELSE, // else
    FOR, // for
    WHILE, // while
    FN, // fn x() {}
    RETURN, // return EXPR
    IMPORT, // import x
    AS, // import x as y

    IDENTIFIER, // omg

    // Types
    STRING, // "omg"
    INT, // 10
    FLOAT, // 10.1
    BOOL, // true || false
    NULL, // null

    // Symbols
    EQUALS, // =
    PLUS, // +
    MINUS, // -
    SLASH, // /
    ASTERISK, // *
    PERCENT, // %
    EQUALS_EQUALS, // ==
    NOT_EQUALS, // !=
    GREATER_THAN, // >
    LESS_THAN, // <
    GREATER_THAN_OR_EQUALS, // >=
    LESS_THAN_OR_EQUALS, // <=
    AND, // &&
    OR, // ||
    COMMA, // ,
    COLON, // :
    SEMICOLON, // ;
    DOT, // .
    LPAREN, // (
    RPAREN, // )
    LBRACE, // {
    RBRACE, // }

    EOF, // EndOfFile
}

export type NativeValue = string | boolean | number | null;

export interface Loc {
    file: string;
    line: number;
    line_string: string;
    start: number;
    end: number;
}

export type Token = {
    kind?: TokenType;
    value?: NativeValue;
    loc: Loc;
};

export const Keywords: Record<string, TokenType> = {
    "new": TokenType.NEW,
    "mut": TokenType.MUT,
    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "fn": TokenType.FN,
    "return": TokenType.RETURN,
    "for": TokenType.FOR,
    "while": TokenType.WHILE,
    "import": TokenType.IMPORT,
    "as": TokenType.AS,
};
