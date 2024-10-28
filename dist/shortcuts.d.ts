import { Gene } from "./gene";
export declare const gene: <InputType, OutputType>(lifeCycle: Partial<Pick<Gene<InputType, OutputType>, "onInit" | "onFreeze" | "onResume" | "onKill">>) => Gene<InputType, OutputType>;
