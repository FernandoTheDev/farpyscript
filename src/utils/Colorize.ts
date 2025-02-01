export class Colorize {
    // Mapeamento de estilos e cores
    private static styles: Record<string, string> = {
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
    public static style(text: string, ...styles: string[]): string {
        const appliedStyles = styles
            .map((style) => this.styles[style] || "")
            .join("");
        return `${appliedStyles}${text}${this.styles.reset}`;
    }

    // Métodos específicos para facilitar o uso
    public static bold(text: string): string {
        return this.style(text, "bold");
    }

    public static italic(text: string): string {
        return this.style(text, "italic");
    }

    public static underline(text: string): string {
        return this.style(text, "underline");
    }

    public static red(text: string): string {
        return this.style(text, "red");
    }

    public static green(text: string): string {
        return this.style(text, "green");
    }

    public static yellow(text: string): string {
        return this.style(text, "yellow");
    }

    public static blue(text: string): string {
        return this.style(text, "blue");
    }

    public static cyan(text: string): string {
        return this.style(text, "cyan");
    }

    public static magenta(text: string): string {
        return this.style(text, "magenta");
    }

    public static gray(text: string): string {
        return this.style(text, "gray");
    }
}
