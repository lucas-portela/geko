# GeKo
What if we could connect pieces of code in a different way? Yes, no need to stop using OOP, but I think we can do more on top of that and the inspiration is genetics! 

## Genetika Kodo
**GeKo**  stands for *Genetika Kodo*, an mix of two Esperanto words that mean *genetic programming* or *genetic code* . With that said what makes GeKo "genetic"?

## Basics: Genetic Coding Style
In **GeKo** we have two classes, Kodo and Gene. You can think of Kodo as a Cell or some abstract thing that has a behaviour. The Kodo behaviour is built by combining genes:

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

  onResume(): void {
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

In the example above, we just implemented a Kodo that will log the time every second. It would have been easier to just write vanilla JS code, 
but now we have componentizable functionality blocks that can be used in other Kodos to build more complex behaviours.

## Wiring
All genes are capable of receiving input and generating outputs. They can be bounded via wires, as seen in the previous example, allowing for one gene output to be used as other gene input. You can create any type of wire and event use it and multiple Kodos. The creation of a wire is simple:
```typescript
const wire = new Wire<WireType>();
```

## Manipulating the Genome
Lets take our timer Kodo that we just built and, as a mad scientist, just swap things in our own will because we can:
```typescript
// we can remove or even replace a gene as simple as this
timer.kill();

timer
  .remove({gene: Clock})
  .add(()=>[new Clock(0.5).output({ time: [clockTime] })]);

timer.init();
```
Now instead of counting each second, our timer will count each half second :D



## Gene Life-Cycle
Everything that lives must die one day, so yes we have a life cycle for the **Gene**, you can just overwrite those methods:

- `onInit()`: setup your gene to  start working;
- `onFreeze()`: freeze your gene temporarily, but make sure it will be able to continue where it stoped;
- `onResume()`: unfreeze the thing and resume the job;
- `onKill()`: this is the end, free every resource, threads, etc. Make sure no trash is left back, now the only way this gene can run again is being born in a second instance. Also, `onFreeze()` will always be called before `onKill()`;

## Kodo Controls
As we saw, you can manipulate the genome of a kodo, but you can also clone it and controls its life and time:
- `init(): boolean`: starts executing the Kodo;
- `freeze(): boolean`: pauses the work, as soon as possible. But attention: it relies on your genes `onFreeze()` implementation to guarantee things are really stopped.
- `resume(): boolean`: just resumes where it paused;
- `kill(): boolean`: completes the cycle of life, next time you call `init()`, every gene will be a new instance without any memory of its past life;
- `clone(): Kodo`: what is life without replication? This method recplicates you Kodo in a new instance but following the built result of every operation of adding or removing
a gene, so we can say this method also clones the mutations you made;

## Introducing GeKo v3.0: Added Flow and Shortcuts !!!
All that was done above and even more, can be achieved in a more isolated and shorter way:
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
        input.label,
        $transform(time, (v) => v.toFixed(1)),
        "s"
      ).sync(time),
    }),
    new Expiration().input({ time, expiresIn: input.duration }),
  ];
});

const testFlow = $flow(
  $repeat(
    $num(4),
    (i)=>[
      $if(()=>i.value<2,
        Timer({
          label: $str("Solo Timer (i:", i, "):"),
          interval: $num(1),
          duration: $num(5),
        })
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
      )
    ])
  ),
  $thread(
    Timer({
      label: $str("Timer D:"),
      interval: $num(0.1),
      duration: $num(5),
    })
  )
);

testFLow.run()
```
Here we a `Timer` factory that declares inputs and outputs using Generic parameters and builds a fully functional timer, with its own internal clock! This way we can "instantiate" multiple independent versions of the Timer Kodo.

Using shortcuts, your Kodo factories will be ready to receive fully typed Wires to interact with the external world
and still be safely isolated :D

This example also showcases the use o FLows to orchestrate the execution of multiple Kodos. We also have a lot of new things to explain, and I will write a better doc later to cover everything.

## More Later
I have a plent of ideias for this thing, feel free to send sugestions. Of course I expect to be able to play with emergent behaviour using **GeKo** and 
plan to also have tons of usefull Genes in a library so anyone can use them to create funny and elegant solutions S2.
