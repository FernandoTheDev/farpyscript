# Features

## Constants
```
true
false
null
PI // Will be moved to a Math module
```

## Pipes when typing a variable
```
new <ID>: <TYPES> = <EXPR>

new x: int | float = 2 ** PI
```

## Redeclaration of variables
```
ERROR
new x: bool = true
x = false // ERROR: Constant redeclaration 'x'.

new mut x: int = "Str" // ERROR: Invalid type from value of variable

new mut x: int = 10
x = 0b10 // ERROR: Invalid type from value of variable, expected int receive binary

OK
new mut x: int | float = 100
x = PI
```

## Native binary value

It is now possible to represent binary directly

```
new myBynary: bynary = 0b100 // OK
new myBynary: bynary = 0b102 // ERROR: Invalid binary
new myBynary: bynary = 00b10 // ERROR: Invalid binary
```