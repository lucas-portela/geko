import { WireListener } from "./types";

export class Wire<ValueType> {
  private _listeners: WireListener<ValueType>[] = [];

  get value() {
    return this._value;
  }

  set value(value: ValueType) {
    this._value = value;
    this._listeners.forEach((listener) => listener(this._value));
  }

  constructor(private _value?: ValueType) {}

  wait(timeout?: number) {
    return new Promise<ValueType>((resolve) => {
      if (this.value !== undefined) resolve(this.value);
      else {
        let timeoutSchedule: any;
        const listener = (value: ValueType) => {
          if (timeout) clearTimeout(timeoutSchedule);
          this.detach(listener);
          resolve(value);
        };
        this.attach(listener);
        if (timeout)
          timeoutSchedule = setTimeout(() => {
            this.detach(listener);
            resolve(null);
          }, timeout);
      }
    });
  }

  attach(listener: WireListener<ValueType>) {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
      return true;
    }
    return false;
  }

  detach(listener: WireListener<ValueType>) {
    const index = this._listeners.indexOf(listener);
    if (index > -1) {
      this._listeners.splice(index, 1);
      return true;
    }
    return false;
  }
}
