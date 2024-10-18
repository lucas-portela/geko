# GeKo
What if we could connect pieces of code in a different way? Yes, no need to stop using OOP, but I think we can do more on top of that and the inspiration is genetics! 

## Genetika Kodo
**GeKo**  stands for *Genetika Kodo*, an mix of two Esperanto words that mean *genetic programming* or *genetic code* . With that said what makes GeKo "genetic"?

## Basics: Genetic Coding Style
In **GeKo** we have two classes, Kode and Gene. You can think of Kode as a Cell or some abstract thing that has a behaviour. The Kode behaviour is built by combining genes:

```typescript
imports {Kode, Gene} from "geko";

class Clock extends Gene {
  startTime: number;
  intervalTimeout: any;
  schedules: ((elapsed: number) => void)[] = [];

  constructor(public readonly interval: number) {
    super();
  }

  get time() {
    return (Date.now() - this._startTime) / 1000;
  }

  onInit() {
    this.startTime = Date.now();
    this.setupSchedule();
  }

  schedule(fn: (elapsed: number) => void) {
    this.schedules.push(fn);
  }

  setupSchedule() {
    this.intervalTimeout = setInterval(() => {
      this.schedules.forEach((fn) => fn());
    }, this.interval * 1000);
  }
}

class ClockLogger extends Gene {
  clock: Clock;

  onInit() {
    this.clock = this.kode.findOne(Clock);
    this.clock.schedule(() => {
      console.log("Elapsed time: ", this.clock.time);
    });
  }
}

const timer = new Kodo({genes: ()=>[
  new Clock(1),
  new ClockLogger()
]});

timer.init();
```

In the example above, we just implemented a Kode that will log the time every second. It would have been easier to just write vanilla JS code, 
but now we have componentizable functionality blocks that can be used in other Kodes to build more complex behaviours.

## Manipulating the Genome
Lets take our timer Kode that we just built and, as a mad scientist, just swap things in our own will because we can:
```typescript
// we can remove or even replace a gene as simple as this
timer
  .remove({gene: Clock})
  .add(()=>[new Clock(0.5)]);

timer.init();
```
Now instead of counting each second, our timer will count each half second :D

## Gene Life-Cycle
Everything that lives must die one day, so yes we have a life cycle for the **Gene**, you can just overwrite those methods:

- `onInit()`: setup your gene to  start working;
- `onFreeze()`: freeze your gene temporarily, but make sure it will be able to continue where it stoped;
- `onResume()`: unfreeze the thing and resume the job;
- `onKill()`: this is the end, free every resource, threads, etc. Make sure no trash is left back, now the only way this gene can run again is being born in a second instance;

## Kode Controls
As we saw, you can manipulate the genome of a kode, but you can also clone it and controls its life and time:
- `init(): boolean`: starts executing the Kode;
- `freeze(): boolean`: pauses the work, as soon as possible. But attention: it relies on your genes `onFreeze()` implementation to guarantee things are really stopped.
- `resume(): boolean`: just resumes where it paused;
- `kill(): boolean()`: completes the cycle of life, next time you call `init()`, every gene will be a new instance without any memory of its past life;
- `clone(): Kode`: what is life without replication? This method recplicates you Kode in a new instance but following the built result of every operation of adding or removing
a gene, so we can say this method also clones the mutations you made;



## More Later
I have a plent of ideias for this thing, feel free to send sugestions. Of course I expect to be able to play with emergent behaviour using **GeKo** and 
plan to also have tons of usefull Genes in a library so anyone can use them to create funny and elegant solutions S2.
