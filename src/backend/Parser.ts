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
    BlockStmt,
    CallExpr,
    Expr,
    FloatLiteral,
    FunctionDeclaration,
    Identifier,
    IfStatement,
    IntLiteral,
    LambdaExpr,
    NullLiteral,
    Program,
    Stmt,
    VarDeclaration,
} from "./AST.ts";
import {
    TypesNative,
    TypesNativeArray,
    VALUE_STRING,
} from "../runtime/Values.ts";
import { DecrementExpr, IncrementExpr } from "./AST.ts";
import { ReturnStatement } from "./AST.ts";

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

    // private parse_and_expr(): Expr {
    //     let left: Expr = this.parse_additive_expr();

    //     while (this.peek().value === "&&" || this.peek().value === "||") {
    //         const operatorToken = this.eat();
    //         const operator: string = operatorToken.value?.toString() ?? "ERROR";
    //         const right: Expr = this.parse_mul_expr();
    //         let type: TypesNative = "int";

    //         if (left.type == "int" && right.type == "int") type = "int";
    //         if (left.type == "float" || right.type == "float") type = "float";
    //         if (left.type == "string" || right.type == "string") {
    //             type = "string";
    //         }

    //         left = {
    //             kind: "BinaryExpr",
    //             type: type,
    //             left,
    //             right,
    //             operator,
    //             loc: this.getLocationFromTokens(left.loc, right.loc),
    //         } as BinaryExpr;
    //     }

    //     return left;
    // }

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
            this.peek().value === "%" ||
            this.peek().value === "%%"
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
        let left: Expr = this.parse_additive_expr();

        while (
            this.peek().kind === TokenType.EQUALS_EQUALS ||
            this.peek().kind === TokenType.NOT_EQUALS ||
            this.peek().kind === TokenType.GREATER_THAN ||
            this.peek().kind === TokenType.LESS_THAN ||
            this.peek().kind === TokenType.GREATER_THAN_OR_EQUALS ||
            this.peek().kind === TokenType.LESS_THAN_OR_EQUALS ||
            this.peek().kind === TokenType.AND ||
            this.peek().kind === TokenType.OR
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
            case TokenType.IDENTIFIER:
                return this.parse_identifier();
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
            case TokenType.FN:
                return this.parse_function_or_lambda();
            case TokenType.RETURN:
                return this.parse_return_stmt();
            case TokenType.IF:
                return this.parse_if_statement();
            default:
                ErrorReporter.showError(
                    "Unexpected token found during parsing!",
                    token.loc,
                );
                Deno.exit(1);
        }
    }

    private parse_if_statement(): IfStatement {
        const startToken: Token = this.eat(); // if
        const expr = this.parse_expr();
        this.consume(TokenType.LBRACE, "Era esperado um '{' após a expressão."); // {
        let value: NullLiteral | Expr | Stmt = AST_NULL({} as Loc);
        const block: Stmt[] = [];

        while (
            this.is_end() == false && this.peek().kind !== TokenType.RBRACE
        ) {
            const expr_ = this.parse_expr();

            if (this.peek().kind == TokenType.RETURN) {
                value = expr_;
            }

            block.push(expr_);
        }

        let endToken: Token = this.consume(
            TokenType.RBRACE,
            "Era esperado um '}' após o bloco de código.",
        ); // }

        // if (this.peek().kind == "")

        return {
            kind: "IfStatement",
            type: value.type,
            value: value,
            condition: expr,
            primary: block,
            secondary: [] as Stmt[],
            loc: this.getLocationFromTokens(startToken.loc, endToken.loc),
        } as IfStatement;
    }

    private parse_return_stmt(): ReturnStatement {
        const startToken: Token = this.eat();
        const value: Expr = this.parse_expr();

        // console.log(value);
        // console.log(this.peek());

        return {
            kind: "ReturnStatement",
            value: value,
            loc: this.getLocationFromTokens(startToken.loc, value.loc),
        } as ReturnStatement;
    }

    // <ARGS> = <ID> : <TYPES> , ....
    // fn <ID> (<ARGS>): <R_TYPE> <BLOCK>
    // fn main(x: int, y: binary:float): int|float { return x * y }
    // Método que decide se é função nomeada ou lambda, depois de consumir 'fn'
    private parse_function_or_lambda(): FunctionDeclaration | LambdaExpr {
        const startToken: Token = this.eat(); // Consumes 'fn'

        // If next token is a pipe, it's a lambda (anonymous function)
        if (this.peek().kind !== TokenType.IDENTIFIER) {
            return this.parse_lambda_function(startToken);
        } else {
            // Otherwise, expect an identifier for the function name
            const idToken: Token = this.consume(
                TokenType.IDENTIFIER,
                "Function name must be an IDENTIFIER",
            );
            return this.parse_named_function(startToken, idToken);
        }
    }

    // Parse a named function (regular function declaration)
    private parse_named_function(
        startToken: Token,
        idToken: Token,
    ): FunctionDeclaration {
        const id: Identifier = AST_IDENTIFIER(
            idToken.value as string,
            idToken.loc,
        );

        // Parse function arguments using a helper
        const args = this.parse_function_arguments();

        // Parse return type(s)
        this.consume(
            TokenType.COLON,
            "Expected ':' after parameters for return type.",
        );
        const returnTypes: TypesNative[] = [];
        const firstReturnTypeToken = this.consume(
            TokenType.IDENTIFIER,
            "Expected return type.",
        );
        returnTypes.push(firstReturnTypeToken.value as TypesNative);
        while (this.peek().kind === TokenType.PIPE) {
            this.eat(); // Consume '|'
            const typeToken = this.consume(
                TokenType.IDENTIFIER,
                "Expected type after '|'.",
            );
            returnTypes.push(typeToken.value as TypesNative);
        }
        // Validate return types
        returnTypes.forEach((type) => {
            if (!TypesNativeArray.includes(type.toString())) {
                ErrorReporter.showError(
                    `Invalid return type '${type}'.`,
                    firstReturnTypeToken.loc,
                );
                Deno.exit(1);
            }
            if (type === "void" && returnTypes.length > 1) {
                ErrorReporter.showError(
                    "'void' cannot be used in a union.",
                    firstReturnTypeToken.loc,
                );
                Deno.exit(1);
            }
        });

        // Parse function body (with return type checking inside)
        const block = this.parse_function_body(
            returnTypes.length === 1 ? returnTypes[0] : returnTypes,
        );
        const endToken: Token = block.endToken;

        return {
            kind: "FunctionDeclaration",
            id: id,
            args: args,
            type: returnTypes.length === 1 ? returnTypes[0] : returnTypes,
            block: block.body, // Assumes that parse_function_body returns a BlockStmt with property 'body'
            loc: this.getLocationFromTokens(startToken.loc, endToken.loc),
        } as unknown as FunctionDeclaration;
    }

    // Helper para parsear a lista de argumentos de função/lambda
    private parse_function_arguments(): {
        id: Identifier;
        type: TypesNative | TypesNative[];
    }[] {
        const args: { id: Identifier; type: TypesNative | TypesNative[] }[] =
            [];
        this.consume(
            TokenType.LPAREN,
            "Expected '(' after function name or lambda capture list.",
        );

        while (this.peek().kind !== TokenType.RPAREN) {
            const argToken: Token = this.consume(
                TokenType.IDENTIFIER,
                "Expected IDENTIFIER for argument name.",
            );
            const argId: Identifier = AST_IDENTIFIER(
                argToken.value as string,
                argToken.loc,
            );

            this.consume(TokenType.COLON, "Expected ':' after argument name.");

            // Parse argument type (supporting union types)
            const argTypes: TypesNative[] = [];
            const firstTypeToken = this.consume(
                TokenType.IDENTIFIER,
                "Expected type for argument.",
            );
            argTypes.push(firstTypeToken.value as TypesNative);

            while (this.peek().kind === TokenType.PIPE) {
                this.eat(); // Consume '|'
                const typeToken = this.consume(
                    TokenType.IDENTIFIER,
                    "Expected type after '|'.",
                );
                argTypes.push(typeToken.value as TypesNative);
            }

            // Validate the argument types
            argTypes.forEach((type) => {
                if (
                    !TypesNativeArray.includes(type.toString()) ||
                    type === "void"
                ) {
                    ErrorReporter.showError(
                        `Invalid type '${type}'.`,
                        firstTypeToken.loc,
                    );
                    Deno.exit(1);
                }
            });

            args.push({
                id: argId,
                type: argTypes.length === 1 ? argTypes[0] : argTypes,
            });

            // Expect a comma or closing parenthesis
            if (this.peek().kind === TokenType.COMMA) {
                this.eat();
            } else if (this.peek().kind !== TokenType.RPAREN) {
                ErrorReporter.showError(
                    "Expected ',' or ')' after argument.",
                    this.peek().loc,
                );
                Deno.exit(1);
            }
        }

        this.consume(TokenType.RPAREN, "Expected ')' after arguments.");
        return args;
    }

    // Parse a lambda function (anonymous function with external variable capture)
    // The 'startToken' is the token 'fn' already consumed.
    private parse_lambda_function(startToken: Token): LambdaExpr {
        // The lambda starts with a pipe for external variable capture list.
        const externalVars: Identifier[] = [];
        if (this.peek().kind == TokenType.PIPE) {
            this.consume(
                TokenType.PIPE,
                "Expected '|' to start external variables capture list.",
            );

            // The capture list may be empty. If not, parse comma-separated identifiers.
            if (this.peek().kind !== TokenType.PIPE) {
                while (this.peek().kind !== TokenType.PIPE) {
                    const varToken = this.consume(
                        TokenType.IDENTIFIER,
                        "Expected identifier for external variable.",
                    );
                    externalVars.push(
                        AST_IDENTIFIER(varToken.value as string, varToken.loc),
                    );

                    if (this.peek().kind === TokenType.COMMA) {
                        this.eat(); // Consume comma
                    } else if (this.peek().kind !== TokenType.PIPE) {
                        ErrorReporter.showError(
                            "Expected ',' or '|' after external variable.",
                            this.peek().loc,
                        );
                        Deno.exit(1);
                    }
                }
            }
            this.consume(
                TokenType.PIPE,
                "Expected '|' to end external variables capture list.",
            );
        }

        // Optionally parse lambda arguments if present
        let args: { id: Identifier; type: TypesNative | TypesNative[] }[] = [];
        if (this.peek().kind === TokenType.LPAREN) {
            args = this.parse_function_arguments();
        }

        // Parse return type(s) – expect a colon
        console.log(this.peek());
        this.consume(
            TokenType.COLON,
            "Expected ':' after lambda arguments for return type.",
        );
        const returnTypes: TypesNative[] = [];
        const firstReturnTypeToken = this.consume(
            TokenType.IDENTIFIER,
            "Expected return type.",
        );
        returnTypes.push(firstReturnTypeToken.value as TypesNative);
        while (this.peek().kind === TokenType.PIPE) {
            this.eat(); // Consume '|'
            const typeToken = this.consume(
                TokenType.IDENTIFIER,
                "Expected type after '|'.",
            );
            returnTypes.push(typeToken.value as TypesNative);
        }
        // Validate return types
        returnTypes.forEach((type) => {
            if (!TypesNativeArray.includes(type.toString())) {
                ErrorReporter.showError(
                    `Invalid return type '${type}'.`,
                    firstReturnTypeToken.loc,
                );
                Deno.exit(1);
            }
            if (type === "void" && returnTypes.length > 1) {
                ErrorReporter.showError(
                    "'void' cannot be used in a union.",
                    firstReturnTypeToken.loc,
                );
                Deno.exit(1);
            }
        });

        // Parse lambda body
        const block = this.parse_function_body(
            returnTypes.length === 1 ? returnTypes[0] : returnTypes,
        );

        return {
            kind: "LambdaExpr",
            externalVars: externalVars,
            args: args,
            type: returnTypes.length === 1 ? returnTypes[0] : returnTypes,
            body: block.body,
            loc: this.getLocationFromTokens(startToken.loc, block.endToken.loc),
        } as unknown as LambdaExpr;
    }

    // Example of parse_function_body that checks return statements against expected types
    private parse_function_body(
        expectedReturnTypes: TypesNative | TypesNative[],
    ): BlockStmt {
        const startToken: Token = this.consume(
            TokenType.LBRACE,
            "Expected '{' at the beginning of function body.",
        );
        const bodyStatements: Stmt[] = [];

        while (this.peek().kind !== TokenType.RBRACE && !this.is_end()) {
            const stmt = this.parse_stmt();

            // If a ReturnStatement is found, check its return type.
            if (stmt.kind === "ReturnStatement") {
                const retStmt = stmt as ReturnStatement;
                // If no expression is returned, consider type 'void'
                const retExpr = retStmt.value;
                const inferredType: TypesNative = retExpr
                    ? retExpr.type as TypesNative
                    : "void";

                // Normalize expectedReturnTypes to an array for comparison.
                const expectedTypes: TypesNative[] =
                    Array.isArray(expectedReturnTypes)
                        ? expectedReturnTypes
                        : [expectedReturnTypes];

                if (
                    !expectedTypes.includes(inferredType) &&
                    inferredType != "id"
                ) {
                    ErrorReporter.showError(
                        `Return type '${inferredType}' does not match declared return type. Expected one of: ${
                            expectedTypes.join(
                                ", ",
                            )
                        }.`,
                        stmt.loc,
                    );
                    Deno.exit(1);
                }
            }

            bodyStatements.push(stmt);
        }

        const endToken: Token = this.consume(
            TokenType.RBRACE,
            "Expected '}' after function body.",
        );

        return {
            kind: "BlockStmt",
            body: bodyStatements,
            loc: this.getLocationFromTokens(startToken.loc, endToken.loc),
            endToken: endToken, // Used for location information
        } as unknown as BlockStmt;
    }

    private parse_identifier():
        | Identifier
        | CallExpr
        | AssignmentDeclaration
        | IncrementExpr
        | DecrementExpr {
        const token = this.peek();

        if (this.next().kind == TokenType.EQUALS) { // <ID> = <EXPR>
            return this.parse_assignment_declaration();
        }

        if (this.next().kind == TokenType.LPAREN) { // <ID>()
            return this.parse_call_expr();
        }

        if (this.next().kind == TokenType.INCREMENT) { // <ID>++
            this.eat(); // ID
            this.eat(); // ++
            return {
                kind: "IncrementExpr",
                value: AST_IDENTIFIER(token.value as string, token.loc),
                loc: token.loc,
            } as IncrementExpr;
        }

        if (this.next().kind == TokenType.DECREMENT) { // <ID>--
            this.eat(); // ID
            this.eat(); // --
            return {
                kind: "DecrementExpr",
                value: AST_IDENTIFIER(token.value as string, token.loc),
                loc: token.loc,
            } as DecrementExpr;
        }

        if (this.next().kind == TokenType.DOT) { // <ID>.<ID>
            // TODO: MemberExpr
        }

        this.eat(); // ID
        return AST_IDENTIFIER(token.value as string, token.loc);
    }

    private parse_call_expr(): CallExpr {
        const id: Token = this.consume(
            TokenType.IDENTIFIER,
            "Expected IDENTIFIER in function call name.",
        );

        this.consume(
            TokenType.LPAREN,
            "Expected (.",
        );

        // Parse Args
        const args: Expr[] = this.parse_args();

        const endToken: Token = this.consume(
            TokenType.RPAREN,
            "Expected ).",
        );

        if (this.peek().kind == TokenType.SEMICOLON) {
            this.eat(); // remove ; if exists
        }

        return {
            kind: "CallExpr",
            type: "id",
            id: {
                kind: "Identifier",
                type: "id",
                value: id.value,
                loc: id.loc,
            },
            args: args,
            loc: this.getLocationFromTokens(id.loc, endToken.loc),
        } as CallExpr;
    }

    private parse_args(): Expr[] {
        const args: Expr[] = [];

        while (this.peek().kind !== TokenType.RPAREN) {
            const value = this.parse_expr();

            if (this.peek().kind == TokenType.COMMA) {
                args.push(value);
                this.eat(); // ,

                if (
                    this.next().kind == TokenType.LBRACE ||
                    this.next().kind == TokenType.SEMICOLON
                ) {
                    ErrorReporter.showError(
                        `Expected EXPR after ','`,
                        this.peek().loc,
                    );
                    Deno.exit();
                }

                continue;
            }

            if (this.peek().kind == TokenType.RPAREN) {
                args.push(value);
                break;
            }

            ErrorReporter.showError(
                `Expected , receive ${this.peek().value}`,
                this.peek().loc,
            );
            Deno.exit();
        }

        return args;
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

            if (!TypesNativeArray.includes(type as string)) {
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
        if (
            value.kind != "Identifier" && value.kind != "IncrementExpr" &&
            value.kind != "DecrementExpr"
        ) this.validateType(value, types);

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
        if (!type.includes(value.type as TypesNative) && value.type !== "id") {
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
