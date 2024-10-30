import { Flow } from "./flow";
import { Gene } from "./gene";
import { Kodo } from "./kodo";
import { FlowLogic, InputWiring, OutputWiring } from "./types";
import {
  Wire,
  WireMultiplexer,
  NamedWireMultiplexer,
  WireTransformer,
  ComputedWire,
} from "./wire";

export const $kodo = <InputType, OutputType>(
  fn: (params: {
    input: InputWiring<InputType>;
    output: OutputWiring<OutputType>;
  }) => Gene[]
) => {
  return (input?: InputWiring<InputType>, output?: OutputWiring<OutputType>) =>
    new Kodo({ genes: () => fn({ input: input ?? {}, output: output ?? {} }) });
};

export const $gene = <InputType, OutputType>(
  lifeCycle: Partial<
    Pick<
      Gene<InputType, OutputType>,
      "onInit" | "onFreeze" | "onResume" | "onKill"
    >
  >
) => {
  const g = new Gene<InputType, OutputType>();
  for (let key in lifeCycle) {
    (g as any)[key] = (lifeCycle as any)[key];
  }
  return g;
};

export const $wire = <ValueType>(value?: ValueType) => new Wire(value);

export const $plex = <ValueType>(wires: (Wire<ValueType> | ValueType)[]) =>
  new WireMultiplexer(wires);

export const $named = <NamedTypes extends Record<string, any>>(wires: {
  [key in keyof NamedTypes]?: Wire<NamedTypes[key] | NamedTypes[key]>;
}) => new NamedWireMultiplexer(wires);

export const $transform = <ValueType, TransformedType>(
  wire: Wire<ValueType>,
  transformer: (value: ValueType) => TransformedType
) => new WireTransformer(wire, transformer);

export const $exp = <ValueType>(compute: () => ValueType): Wire<ValueType> =>
  new ComputedWire<ValueType>(compute);

export const $flow = (...logic: FlowLogic | FlowLogic[]) => new Flow(logic);
