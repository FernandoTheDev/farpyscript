# Features

## Parser

Now the language has a simple parser, which handles declarations, types, unit values, binary expressions and much more in the future.

## Binary Expr

```
10 - 10
10 ** 2
2 - -2 // 2 - (-2) in math
10 * (9 - (2 ** 3))
90 / 9
10 % 3
10 - x
```

## Natives Types

```
string "Fernando"
int 17
bool // in developement
null null
float 0.1
binary 0b1001 // It has a parser to validate
```

## Declarations

### VarDeclaration

```
new <MUT> <NAME>: <T> = <EXPR>
```

Examples:

```
new x = 10 // Error, type is not declared
new x: int = 10 // constant, ok
new mut x: int = 20 // mutable, ok

new x: string = "Fernando"

new x: binary = 0b1000101 // OK
new x: binary = 0b1000102 // ERROR: Invalid binary
new x: binary = 00b01 // ERROR: Invalid binary

new balance: float = 1512.21
```