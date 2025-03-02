import { Identifier } from "../../backend/AST.ts";
import { ErrorReporter } from "../../error/ErrorReporter.ts";
import { Loc } from "../../frontend/Token.ts";
import Runtime from "../Runtime.ts";
import Type from "../Type.ts";
import { VALUE_BOOL, VALUE_VOID, VoidValue } from "../Values.ts";
import { BooleanValue } from "../Values.ts";
import {
  IntValue,
  MapValue,
  StringValue,
  VALUE_INT,
  VALUE_STRING,
} from "../Values.ts";

export default class MapType extends Type {
  public constructor(
    private expr: MapValue,
    private self: Runtime,
  ) {
    super();
  }

  public length(): IntValue {
    return VALUE_INT(this.expr.map.size, this.expr.loc);
  }

  public at(i: IntValue): StringValue {
    const value = this.expr.map.get(i.value);
    return VALUE_STRING(String(value ?? "null"), this.expr.loc);
  }

  public has(i: IntValue | StringValue | Identifier): BooleanValue {
    const key = i.kind == "Identifier"
      ? this.self.evaluate(i as Identifier).value
      : i.value;

    const value = this.expr.map.has(key);
    return VALUE_BOOL(Boolean(value ?? false), this.expr.loc);
  }

  public get(
    i: IntValue | StringValue | Identifier,
  ): StringValue | IntValue | VoidValue {
    const key = i.kind == "Identifier"
      ? this.self.evaluate(i as Identifier).value
      : i.value;

    if (!this.expr.map.has(key)) {
      return VALUE_VOID({} as Loc);
      // ErrorReporter.showError(
      //   `Key '${key}' does not exist in the map.`,
      //   this.expr.loc,
      // );
      // Deno.exit();
    }

    const value = this.expr.map.get(key);

    if (typeof value === "number") {
      return VALUE_INT(value, this.expr.loc);
    } else if (typeof value === "string") {
      return VALUE_STRING(value, this.expr.loc);
    } else {
      ErrorReporter.showError(
        `Invalid value type for key '${key}'.`,
        this.expr.loc,
      );
      Deno.exit();
    }
  }

  public set(i: IntValue | StringValue | Identifier, newValue: any): any {
    const key = i.kind == "Identifier"
      ? this.self.evaluate(i as Identifier).value
      : i.value;

    if (newValue && typeof newValue === "object" && "kind" in newValue) {
      newValue = this.self.evaluate(newValue);
    }

    this.expr.map.set(key, newValue.value);
    return newValue;
  }
}
