import multiline from 'multiline-template';
import { ast } from '../../src';
import { wasm2wast, wast2wasm } from './wabt';

// Verifying binary data by hand isn't maintainable so
// instead this helper converts it to wast texture format
// using wabt and compares that, as well as snapshot testing
// of previous binary data
export function assertModule(module: ast.Module, expected) {
  const buffer = module.toBuffer();
  const actualWasm = new Uint8Array(buffer);
  const actualWast = wasm2wast(buffer);
  const expectedWast = multiline`${expected}`;
  const expectedWasm = wast2wasm(expectedWast);

  expect(actualWast).toEqual(expectedWast);
  expect(actualWasm).toEqual(expectedWasm);
  expect(module).toMatchSnapshot();
  expect(actualWasm).toMatchSnapshot();
}

