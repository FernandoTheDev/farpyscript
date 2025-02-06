export enum TokenType {
    // Keywords
    NEW, // new x = EXPR 0
    MUT, // new mut x = EXPR 1
    IF, // if 2
    ELSE, // else 3
    FOR, // for 4
    WHILE, // while 5
    FN, // fn x() {} 6
    RETURN, // return EXPR 7
    IMPORT, // import x 8
    AS, // import x as y 9

    IDENTIFIER, // omg 10

    // Types
    STRING, // "omg" 11
    INT, // 10 12
    FLOAT, // 10.1 13
    NULL, // null 14

    // Especials
    BINARY, // 15

    // Symbols
    EQUALS, // = 16
    PLUS, // + 17
    INCREMENT, // ++ 18
    MINUS, // - 19
    DECREMENT, // -- 20
    SLASH, // / 21
    ASTERISK, // * 22
    EXPONENTIATION, // ** 23
    PERCENT, // % 24
    REMAINDER, // %% 25
    EQUALS_EQUALS, // == 26
    NOT_EQUALS, // != 27
    GREATER_THAN, // > 28
    LESS_THAN, // < 29
    GREATER_THAN_OR_EQUALS, // >= 30
    LESS_THAN_OR_EQUALS, // <= 31
    AND, // && 32
    OR, // || 33
    PIPE, // | // new x: <T> | <T> = <EXPR> 34
    COMMA, // , 35
    COLON, // : 36
    SEMICOLON, // ; 37
    DOT, // . 38
    LPAREN, // ( 39
    RPAREN, // ) 40
    LBRACE, // { 41
    RBRACE, // } 42

    EOF, // EndOfFile 43
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
    kind: TokenType;
    value: NativeValue; // It already comes with the typed value
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
    "null": TokenType.NULL,
};
