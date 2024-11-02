import { Gene } from "../gene";
import { Wire } from "../wire";
import { $last } from "./wire";

export class Finish extends Gene<{ when: any }> {
  onInit(): void {
    this.watch(
      "when",
      $last((when) => {
        if (when) this.kodo.finish();
      })
    );
  }
}

export const $finish = (when: Wire<any>) => new Finish().input({ when });
