import { Gene } from "../gene";
import { Wire } from "../wire";

export class Finish extends Gene<{ when: any }> {
  onInit(): void {
    this.watch("when", (when) => {
      if (when) this.kodo.finish();
    });
  }

  onReady(): void {
    if (this.read("when")) this.kodo.finish();
  }
}

export const $finish = (when: Wire<any>) => new Finish().input({ when });
