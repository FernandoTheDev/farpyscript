import { Colorize } from "../utils/Colorize.ts";
import { Loc } from "../frontend/Token.ts";

export class ErrorReporter {
    public static showError(message: string, loc: Loc): void {
        this.displayErrorHeader(message, loc);
        this.displayLineWithError(
            loc.line,
            loc.line_string,
            loc.start,
            loc.end,
        );
    }

    private static displayErrorHeader(message: string, loc: Loc): void {
        console.error(
            Colorize.bold(
                `${Colorize.red("error")}: ${Colorize.bold(message)}`,
            ),
        );
        console.error(
            `${Colorize.bold(Colorize.blue(" ---->"))} ${
                Colorize.bold(`${loc.file}:${loc.line}:${loc.start + 1}`)
            }`,
        );
    }

    private static displayLineWithError(
        lineNumber: number,
        lineContent: string,
        start: number,
        end: number,
    ): void {
        const markerLength = Math.max(end - start, 1);

        console.error(
            `${
                Colorize.bold(Colorize.blue(`${lineNumber} |`))
            }      ${lineContent}`,
        );

        console.error(
            Colorize.bold(Colorize.blue("  |")) +
                " ".repeat(start + 6) +
                Colorize.bold(Colorize.red("^".repeat(markerLength))),
        );
    }
}
