# GeKo

**GeKo** proposes a fresh approach to code composition. Imagine connecting pieces of code in a new way, not replacing object-oriented programming (OOP) but building on top of it, inspired by genetics!

## Genetika Kodo

**GeKo** stands for *Genetika Kodo*, derived from Esperanto words meaning *genetic programming* or *genetic code*. So, what makes GeKo "genetic"?

## Basics: Genetic Coding Style

In **GeKo**, we work with two primary classes: `Kodo` and `Gene`. You can think of a `Kodo` as a cell or an abstract structure that possesses behavior. This behavior is constructed by combining different genes:

```typescript
import {Kodo, Gene} from "geko";

export class Clock extends Gene<{}, { startTime: number; time: number }> {
  startTime: number;
  intervalTimeout: any;

  constructor(public readonly interval: number) {
    super();
  }

  setupSchedule() {
    this.intervalTimeout = setInterval(() => {
      if (!this.isActive || this.isFrozen) return;
      this.write("time", (Date.now() - this.startTime) / 1000);
    }, this.interval * 1000);
  }

  onInit() {
    this.setupSchedule();
  }

  onFreeze() {
    clearInterval(this.intervalTimeout);
  }

  onResume() {
    this.setupSchedule();
  }
}

export class Logger extends Gene<{ message: string | number }> {
  constructor() {
    super();
  }

  async onInit() {
    this.watch("message", (message) => {
      console.log(message);
    });
  }
}

const clockTime = new Wire<number>();

const timer = new Kodo({
  genes: () => [
    new Clock(1).output({ time: [clockTime] }),
    new Logger().input({ message: clockTime }),
  ],
});

timer.init();
```

In this example, we created a `Kodo` that logs the time every second. While it might be simpler to write this in plain JavaScript, the gene-based structure allows us to reuse these components in other `Kodo` instances, facilitating more complex behavior construction.

## Wiring

Every gene can receive input and produce output. They are connected via **wires**, as seen above, enabling the output of one gene to serve as the input for another. You can create a wire type and use it across multiple `Kodo` instances. Wire creation is straightforward:

```typescript
const wire = new Wire<WireType>();
```

## Manipulating the Genome

Let’s revisit our `timer` Kodo. Imagine, like a mad scientist, you want to replace or remove genes on a whim:

```typescript
// Remove or replace a gene easily
timer.kill();

timer
  .remove({gene: Clock})
  .add(() => [new Clock(0.5).output({ time: [clockTime] })]);

timer.init();
```

Now, instead of counting each second, the timer will count every half-second. 😄

## Gene Lifecycle

Like any living entity, genes in GeKo have a lifecycle. Override these methods to define their behavior:

- `onInit()`: Set up the gene to start working.
- `onFreeze()`: Temporarily pause the gene's work, allowing it to resume from where it left off.
- `onResume()`: Resume the gene's activity after freezing.
- `onKill()`: End the gene’s life, freeing all resources. After `onKill()`, the gene can only operate in a new instance. Note that `onFreeze()` is always called before `onKill()`.

## Kodo Controls

In addition to modifying a `Kodo`'s genome, you can control its lifecycle and create clones:

- `init(): boolean`: Starts the `Kodo`.
- `freeze(): boolean`: Pauses activity, relying on each gene's `onFreeze()` method to ensure complete stoppage.
- `resume(): boolean`: Resumes activity from where it was paused.
- `kill(): boolean`: Terminates the `Kodo`, creating fresh instances of all genes upon reinitialization.
- `clone(): Kodo`: Creates a new instance of the `Kodo`, replicating all previous gene additions and removals, including mutations.

## Introducing Flow and Shortcuts

With shortcuts you can achieve the same results with a more concise and isolated syntax:

```typescript
const Timer = $kodo<
  { label: string; interval: number; duration: number },
  { time: number }
>(({ input, output }) => {
  const time = $wire<number>().pipe(output.time);

  return [
    new Clock().input({ interval: input.interval }).output({ time: [time] }),
    new Logger().input({
      message: $str(
        input?.label,
        $transform(time, (value) => value.toFixed(1) + "s")
      ).sync(time),
    }),
    new Expiration().input({ time, expiresIn: input.duration }),
  ];
});

const testFlow = $flow(
  $repeat($num(4), (i) => [
    $if(
      () => i.value < 2,
      Timer({
        label: $str("Solo Timer (i:", i, "):"),
        interval: $num(1),
        duration: $num(5),
      }),
      $else(
        $split(
          $thread(
            Timer({
              label: $str("\nTimer A:"),
              interval: $num(1),
              duration: $num(5),
            }),
            Timer({
              label: $str("Timer B:"),
              interval: $num(1),
              duration: $num(5),
            })
          ),
          $thread(
            Timer({
              label: $str("Timer C:"),
              interval: $num(0.2),
              duration: $num(10),
            })
          )
        )
      )
    ),
  ]),
  $thread(
    Timer({
      label: $str("Timer D:"),
      interval: $num(0.1),
      duration: $num(5),
    })
  )
);

await testFlow.run();
```

Here, we use a `Timer` factory to declare inputs and outputs with type parameters, creating an independent timer with its own clock. Thanks to these shortcuts, you can create `Kodo` factories that interact with the external world safely while maintaining isolation. 

This example also introduces **Flows** for orchestrating multiple `Kodo` executions. 

## More to Come

GeKo has a lot of potential! Feel free to share your suggestions. I’m especially excited about exploring emergent behavior and plan to add a library of useful genes so anyone can create unique and elegant solutions. ❤️