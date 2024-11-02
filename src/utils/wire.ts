import { $plex, $transform, $wire } from "../shortcuts";
import { WireListener } from "../types";
import { Wire } from "../wire";

export const $str = (...wires: (Wire<any> | string | number | undefined)[]) =>
  $transform($plex(wires), (values) =>
    (values ?? [])
      .map((value) =>
        value !== undefined && value !== null ? value.toString() : ""
      )
      .join("")
  );

export const $num = (wireNumber: Wire<number> | number) => {
  if (!($wire instanceof Wire)) wireNumber = $wire(wireNumber as number);
  return $transform(wireNumber as Wire<any>, (value) => parseFloat(value));
};

export const $bool = (value: boolean) => $wire(value);

export const $priority = <ValueType>(
  priority: number,
  listener: WireListener<ValueType>
) => {
  listener.priority = priority;
  return listener;
};

export const $first = <ValueType>(listener: WireListener<ValueType>) => {
  listener.priority = Number.MIN_SAFE_INTEGER;
  return listener;
};

export const $last = <ValueType>(listener: WireListener<ValueType>) => {
  listener.priority = Number.MAX_SAFE_INTEGER;
  return listener;
};
