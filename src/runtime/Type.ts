import { IntValue, RuntimeValue } from "./Values.ts";

export default abstract class Type {
  abstract length(): IntValue;
  abstract at(i: IntValue): RuntimeValue;
}
