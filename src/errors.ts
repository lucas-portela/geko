export class WritingLockedWireError extends Error {
  constructor() {
    super("Can't write value, wire is locked!");
  }
}

export class WritingReadOnlyWireError extends Error {
  constructor() {
    super("Can't write value, wire is readonly!");
  }
}
