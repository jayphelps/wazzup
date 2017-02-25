import * as fs from 'fs';
import * as tmp from 'tmp';
import { execSync } from 'child_process';

const wabtPath = __dirname + '/../../third-party/wabt/out/';

export function wasm2wast(input: ArrayBuffer): string {
  // remove newline that wabt adds at the end of wast files
  return wabt('wasm2wast', input)
    .toString('utf8')
    .slice(0, -1);
}

export function wast2wasm(input: string): Uint8Array {
  const result = wabt('wast2wasm', input);
  return new Uint8Array(result);
}

export function wabt(cmd: string, input: string | ArrayBuffer): Buffer {
  // Can't use /dev/stdin cause wasm2wast
  // doesn't support it due to it using fseek
  // but we can still use /dev/stdout
  const file = fileFor(input);
  return execSync(`${wabtPath}${cmd} ${file.name} -o /dev/stdout`);
}

function fileFor(value: string | ArrayBuffer) {
  const file = tmp.fileSync() as { name: string };
  fs.writeFileSync(file.name, new Buffer(value as any));
  return file;
}
