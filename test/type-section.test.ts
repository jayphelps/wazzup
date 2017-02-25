import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Type Section', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds empty function types', () => {
    module.addFunctionType();
    assertModule(module, `
      | (module
      |   (type (;0;) (func)))
    `);

    module.addFunctionType();
    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (type (;1;) (func)))
    `);
  });

  test('adds function types with parameters', () => {
    module.addFunctionType([wasm.Type.i32]);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32))))
    `);

    module.addFunctionType([wasm.Type.i32, wasm.Type.i32]);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32)))
      |   (type (;1;) (func (param i32 i32))))
    `);
  });

  test('adds function types with parameters and a single return value', () => {
    module.addFunctionType([wasm.Type.i32], wasm.Type.i32);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32) (result i32))))
    `);
  });

  // wasm MVP does not yet allow multiple returns, though the binary
  // format was designed to allow it so we prepare for it
  /*
  test('adds function types with parameters and multiple return values', () => {
    module.addFunctionType([wasm.Type.i32], wasm.Type.i32);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32) (result i32))))
    `);

    module.addFunctionType([wasm.Type.i32, wasm.Type.i32], [wasm.Type.i32, wasm.Type.i32]);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32) (result i32))))
      |   (type (;0;) (func (param i32 i32) (result i32 i32))))
    `);
  });
  */

  test('throws if the function type has multiple return values', () => {
    expect(() => {
      module.addFunctionType([wasm.Type.i32, wasm.Type.i32], [wasm.Type.i32, wasm.Type.i32]);
    }).toThrowError('FunctionTypes can only have a single return value in wasm MVP');
  });
});
