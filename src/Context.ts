import {Lotus} from "../../lib/lotus/Lotus";

export default interface Context {
    stdin: Lotus.stdin,
    stdout: Lotus.stdout,
    stderr: Lotus.stderr
    fileName: string,
    procId: number,
    env: {
        [name: string]: string
    },
    argv: string[],
    user: string

    exit(code: number): void,
}
