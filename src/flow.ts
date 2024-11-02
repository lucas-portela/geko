import { Kodo } from "./kodo";
import { DeepFlowLogic, FlowLogic } from "./types";
import { $flat } from "./utils/logic";

export class FlowCursor {
  private _executionPromise: Promise<boolean>;
  private _executionResolver: (value: boolean) => void;
  private _isActive: boolean = true;

  constructor(public address: number) {
    this._executionPromise = new Promise((resolve) => {
      this._executionResolver = (value: boolean) => {
        this._isActive = false;
        resolve(value);
      };
    });
  }

  get isActive() {
    return this._isActive;
  }

  get result() {
    return this._executionPromise;
  }

  success() {
    this._executionResolver(true);
  }

  fail() {
    this._executionResolver(false);
  }
}

export class Flow {
  private _cursors: FlowCursor[] = [];
  private _flow: FlowLogic = [];
  private _isActive: boolean = false;

  constructor(deepFlow: DeepFlowLogic) {
    this._flow = $flat(deepFlow);
    this._flow.forEach((instruction, address) => {
      instruction.address = address;
    });
  }

  get flow() {
    return [...this._flow];
  }

  get isActive() {
    return this._isActive;
  }

  async run(cursor: FlowCursor = new FlowCursor(0)) {
    if (!this._isActive) {
      this._cursors = [];
      this._isActive = true;
    }
    this._cursors.push(cursor);

    while (true) {
      if (!cursor.isActive) break;
      if (cursor.address >= this._flow.length) {
        cursor.success();
        break;
      }
      const current = this._flow[cursor.address];
      if (current instanceof Kodo) {
        if (!(await current.run())) {
          cursor.fail();
          break;
        } else cursor.address++;
      } else if (current instanceof FlowControl) {
        const spawned: FlowCursor[] = [];
        const spawn = (address: number) => {
          const newCursor = new FlowCursor(address);
          spawned.push(newCursor);
          this.run(newCursor);
          return newCursor;
        };

        await current.eval(cursor, spawn);

        const result = await Promise.all(spawned.map((c) => c.result));

        if (result.find((result) => result === false)) {
          cursor.fail();
          break;
        }
      } else {
        cursor.fail();
        break;
      }
    }

    if (!this._cursors.find((c) => c.isActive)) this._isActive = false;
    return cursor.result;
  }
}

export class FlowControl {
  public address: number;

  constructor(
    private _evaluator: (
      cursor: FlowCursor,
      spawn?: (address: number) => FlowCursor
    ) => Promise<number>,
    public readonly comment?: string
  ) {}

  async eval(cursor: FlowCursor, spawn: (address: number) => FlowCursor) {
    cursor.address = await this._evaluator(cursor, spawn);
  }
}
