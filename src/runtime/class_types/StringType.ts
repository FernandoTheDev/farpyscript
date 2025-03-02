import { ErrorReporter } from "../../error/ErrorReporter.ts";
import Runtime from "../Runtime.ts";
import Type from "../Type.ts";
import { IntValue, StringValue, VALUE_INT, VALUE_STRING } from "../Values.ts";

export default class StringType extends Type {
  public constructor(
    private expr: StringValue,
    private self: Runtime,
  ) {
    super();
  }

  public length(): IntValue {
    return VALUE_INT(this.expr.value.length, this.expr.loc);
  }

  public at(i: any): StringValue {
    const value = this.self.evaluate(i);

    if (value.type != "int") {
      ErrorReporter.showError(
        "The value passed in at() must be an integer.",
        value.loc,
      );
      Deno.exit();
    }

    return VALUE_STRING(
      this.expr.value[value.value as number],
      this.expr.loc,
    );
  }
}
