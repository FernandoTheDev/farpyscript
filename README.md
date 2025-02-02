# FarpyScript

<div align="center">
 <img src="/images/logo.png" width="300" height="300">
</div>

[![Version](https://img.shields.io/badge/version-0.0.1--alpha-blue.svg)](https://github.com/your-username/farpyscript)

FarpyScript is an experimental interpreted programming language focused on security, developed as an open-source educational project.

## Current Version

- **Version**: 0.0.1  
- **Status**: Early development  
- **Last update**: January 2025  

## Overview

FarpyScript was born out of curiosity about the inner workings of programming languages. The project aims to provide hands-on experience in interpreter development, being built completely from scratch.

Partially inspired by the [guide-to-interpreters-series](https://github.com/tlaceby/guide-to-interpreters-series) project, FarpyScript implements a recursive descent parser, ideal for educational purposes and small-scale projects.

## Instalation

```bash
git clone https://github.com/FernandoTheDev/farpyscript
cd farpyscript
```

Repl:
```bash
deno run -A main.ts
```

File:
```bash
deno run -A main.ts <FILE>.fscript
```

In the future, binary with path will come

## Development Status

### Implemented ✅

- Lexer (Lexical Analyzer)  
- Verbose error handling system  
- Parser (Syntax Analyzer) 
- Type System  
  - Mutable and immutable variables  
  - Strong typing  
  - Variable redeclaration  
 - Built-in constants  

### In Progress 🚧

 
- Type System  
  - Complex types (objects, arrays, vectors)  
- Language Features  
  - Function declaration and calls  
  - Recursion  
  - Control flow structures (if, for, while, try/catch)  
- Native Libraries  
  - I/O  
  - Math  
  - HTTP  
  - Built-in constants  

## Architecture

The interpreter follows a recursive descent parser architecture, chosen for its:  
- Simplicity of implementation  
- Ease of understanding  
- Suitability for educational purposes  

## How to Contribute

Your contributions are welcome! To contribute:  

1. Fork the repository  
2. Create a branch for your feature (`git checkout -b feature/NewFeature`)  
3. Commit your changes (`git commit -m 'Add new feature'`)  
4. Push to the branch (`git push origin feature/NewFeature`)  
5. Open a Pull Request  

All PRs will be reviewed by the main maintainer (fernandothedev).  

## License

MIT License  

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

📝 **Note**: This is an experimental project under active development. Contributions and feedback are always welcome!
