declare module "@biowasm/aioli" {
  export default class Aioli {
    constructor(tools: string[]);
    mount(file: File): Promise<void>;
    exec(command: string): Promise<{ stdout: string }>;
  }
}