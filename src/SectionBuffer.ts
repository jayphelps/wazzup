import * as wasm from './wasm';
import { ByteArray } from './ByteArray';

export class SectionBuffer {
  bytes = new ByteArray();

  constructor(public id: wasm.Section) {}

  write(index: number, offset?: number) {
    this.bytes.writeU32LEB128(index, offset);
    return this;
  }

  writeString(str: string) {
    this.bytes.writeString(str);
    return this;
  }
}
