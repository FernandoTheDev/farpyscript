import { Colorize } from "../utils/Colorize.ts";
import { Loc } from "../frontend/Token.ts";

export class ErrorReporter {
    private colorize: Colorize;

    constructor() {
        this.colorize = new Colorize();
    }

    public showError(message: string, loc: Loc): void {
        this.displayErrorHeader(message, loc);
        this.displayLineWithError(
            loc.line,
            loc.line_string,
            loc.start,
            loc.end,
        );
    }

    private displayErrorHeader(message: string, loc: Loc): void {
        console.error(
            this.colorize.bold(
                `${this.colorize.red("error")}: ${this.colorize.bold(message)}`,
            ),
        );
        console.error(
            `${this.colorize.bold(this.colorize.blue(" ---->"))} ${
                this.colorize.bold(`${loc.file}:${loc.line}:${loc.start + 1}`)
            }`,
        );
    }

    private displayLineWithError(
        lineNumber: number,
        lineContent: string,
        start: number,
        end: number,
    ): void {
        const markerLength = Math.max(end - start, 1);

        console.error(
            `${
                this.colorize.bold(this.colorize.blue(`${lineNumber} |`))
            }      ${lineContent}`,
        );

        console.error(
            this.colorize.bold(this.colorize.blue("  |")) +
                " ".repeat(start + 6) +
                this.colorize.bold(this.colorize.red("^".repeat(markerLength))),
        );
    }
}
