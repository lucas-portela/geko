import { plex, transform } from "./shortcuts";
import { Wire, WireMultiplexer, WireTransformer } from "./wire";

export const string = (...wires: (Wire<any> | string | undefined)[]) =>
  transform(plex(wires), (values) =>
    (values ?? [])
      .map((value) =>
        value !== undefined && value !== null ? value.toString() : ""
      )
      .join("")
  );
