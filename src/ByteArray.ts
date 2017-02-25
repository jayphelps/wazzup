export class ByteArray {
  offset = 0;
  buffer = new ArrayBuffer(1024);
  view = new DataView(this.buffer);
  array = new Uint8Array(this.buffer);

  // Based on https://en.wikipedia.org/wiki/LEB128#Encode_unsigned_integer
  writeU32LEB128(value: number, offset = this.offset): ByteArray {
    const isAppending = offset === this.offset;
    const startOffset = offset;

    do {
      let byte = value & 0x7f;
      value >>= 7;

      if (value != 0) {
        // Mark this byte to show that more bytes will follow.
        byte |= 0x80;
      }

      this.view.setUint32(offset, byte, true);
      offset++;
    } while (value !== 0);

    if (isAppending) {
      this.offset += offset - startOffset;
    }

    return this;
  }

  writeU32(byte: number): ByteArray {
    this.view.setUint32(this.offset, byte, true);
    this.offset += 4;

    return this;
  }

  writeString(value: string): ByteArray {
    const { length } = value;
    this.writeU32LEB128(length);
    const { offset } = this;

    this.resize(offset + length);

    for (let i = 0; i < length; i++) {
      this.set(offset + i, value.charCodeAt(i));
    }

    this.offset += length;
    return this;
  }

  set(offset: number, value: number): ByteArray {
    this.array[offset] = value;
    return this;
  }

  resize(size: number): ByteArray {
    if (size > this.buffer.byteLength) {
      this.buffer = new ArrayBuffer(this.buffer.byteLength + size);
      this.view = new DataView(this.buffer);
      this.array = new Uint8Array(this.buffer);
    }

    return this;
  }

  copy(bytes: ByteArray): ByteArray {
    const buffer = bytes.buffer.slice(0, bytes.offset);
    const array = new Uint8Array(buffer);
    const sizeNeeded = (this.buffer.byteLength - this.offset) + this.offset;

    if (sizeNeeded > this.buffer.byteLength) {
      //this.resize(sizeNeeded + 1024);
      throw 'todo';
    }

    this.array.set(array, this.offset);
    this.offset += bytes.offset;

    return this;
  }
}
