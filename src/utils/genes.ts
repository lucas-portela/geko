import { Gene } from "../gene";
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

export const $finish = () => new Finish();
