# Features

## Built in types

```
string
int
float
boolean
null
void
binary
```

## Built in constants
```
true
false
null
void
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

## Control flow structures
### If Statement

The use of '(' and ')' is optional

```
if (<EXPR>) <BLOCK>
if <EXPR>   <BLOCK>
if <EXPR>   <BLOCK> <ELSE> <BLOCK>
if <EXPR>   <BLOCK> <ELIF> <BLOCK>

if (x > 0 || x <= 1)
{ 
	// Do something
} elif (x > 2 && y < x)
{
	// Do something
} else {
	// Do something
}

OR

if x > 0 || x <= 1
{ 
	// Do something
} elif x > 2 && y < x
{
	// Do something
} else {
	// Do something
}
```

### For Statement

In development...

### While Statement

In development...

### Try Catch Statement

In development...

## Function declaration and recursion

Now we can declare complete functions in the language

```
<ARGS> = <ID> : <TYPES> , ...
fn <ID> ( <ARGS> ) : <RETURN_TYPE> <BLOCK>

fn fibonacci(n: int): int 
{
    if n <= 0 {
        return 0
    } elif n == 1 {
        return 1
    }

    return fibonacci(n - 1) + fibonacci(n - 2)
}

print(fibonacci(10))

```

## Function call

Repeats the same pattern as in other languages

```
<ARGS> = <EXPR> , ...
<ID> ( <ARGS> )

print(1, 2, 3, 4) // 1 2 3 4

new age: int = 17
print("Fernando is " + age + " years old") // Fernando is 17 years old
```

## Lambda

The type of a lambda defines the type of a return of something, argument type and variable type, instead of a lambda<T>, it only uses the T of that lambda's return

External variables are optional, if you don't want to call one, you don't need to pass the pipes.

```
<EXTERNAL_VARS> = | <ID>, ... |
<ARGS> = <ID> : <TYPES> , ...
fn | <EXTERNAL_VARS> | ( <ARGS> ) : <RETURN_TYPE> <BLOCK>

new x: int = 1

new lambda: int = fn |x|(y: int): int { // x is a external variable
    return PI * (x + y)
}

print(lambda(100))

fn testing(other: int): void
{
    print(other(100))
}

testing(lambda)
```