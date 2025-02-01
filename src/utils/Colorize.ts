export class Colorize {
    // Mapeamento de estilos e cores
    private styles: Record<string, string> = {
        reset: "\x1b[0m",
        bold: "\x1b[1m",
        italic: "\x1b[3m",
        underline: "\x1b[4m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m",
    };

    // Aplica estilos e cores
    public style(text: string, ...styles: string[]): string {
        const appliedStyles = styles
            .map((style) => this.styles[style] || "")
            .join("");
        return `${appliedStyles}${text}${this.styles.reset}`;
    }

    // Métodos específicos para facilitar o uso
    public bold(text: string): string {
        return this.style(text, "bold");
    }

    public italic(text: string): string {
        return this.style(text, "italic");
    }

    public underline(text: string): string {
        return this.style(text, "underline");
    }

    public red(text: string): string {
        return this.style(text, "red");
    }

    public green(text: string): string {
        return this.style(text, "green");
    }

    public yellow(text: string): string {
        return this.style(text, "yellow");
    }

    public blue(text: string): string {
        return this.style(text, "blue");
    }

    public cyan(text: string): string {
        return this.style(text, "cyan");
    }

    public magenta(text: string): string {
        return this.style(text, "magenta");
    }

    public gray(text: string): string {
        return this.style(text, "gray");
    }
}
