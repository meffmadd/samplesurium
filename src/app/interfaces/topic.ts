import { BriefExample } from "./briefexample";

export interface Topic {
    id: number,
    title: string,
    examples: BriefExample[]
}
