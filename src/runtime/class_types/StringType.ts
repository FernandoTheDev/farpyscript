import Type from "../Type.ts";
import { IntValue, StringValue, VALUE_INT, VALUE_STRING } from "../Values.ts";

export default class StringType extends Type {
  public constructor(
    private expr: StringValue,
  ) {
    super();
  }

  public length(): IntValue {
    return VALUE_INT(this.expr.value.length, this.expr.loc);
  }

  public at(i: IntValue): StringValue {
    return VALUE_STRING(this.expr.value[i.value], this.expr.loc);
  }
}
