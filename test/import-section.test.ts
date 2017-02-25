import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Import Section', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds function imports', () => {
    const type1 = module.addFunctionType([wasm.Type.i32], wasm.Type.i32);
    module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Function, type1);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32) (result i32)))
      |   (import "env1" "foo" (func (;0;) (type 0))))
    `);

    const type2 = module.addFunctionType([wasm.Type.i64, wasm.Type.i32], wasm.Type.i32);
    module.addImport('foo2', 'env2', 'foo', wasm.ExternalKind.Function, type2);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32) (result i32)))
      |   (type (;1;) (func (param i64 i32) (result i32)))
      |   (import "env1" "foo" (func (;0;) (type 0)))
      |   (import "env2" "foo" (func (;1;) (type 1))))
    `);
  });

  test.skip('adds table imports', () => {
    const table1 = module.addTable([]);
    module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Table, table1);
    assertModule(module, `
      | (module
      |   (type (;0;) (func (param i32) (result i32)))
      |   (import "env1" "foo" (table 0 anyfunc)))
    `);
  });

  test.skip('adds a single memory import', () => {
    module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Memory, wasm.Type.none);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (memory (;0;) 1)))
    `);
  });

  // wasm MVP does not yet allow multiple memories, though the binary
  // format was designed to allow it so we prepare for it
  /*
  test('adds multiple memory imports', () => {
    module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Memory, wasm.Type.none);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (memory (;0;) 1)))
    `);

    module.addImport('bar1', 'env2', 'bar', wasm.ExternalKind.Memory, wasm.Type.none);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (memory (;0;) 1)))
      |   (import "env2" "foo" (memory (;1;) 1))))
    `);
  });
  */

  test.skip('throws if they import multiple memories', () => {
    expect(() => {
      module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Memory, wasm.Type.none);
      module.addImport('bar1', 'env2', 'bar', wasm.ExternalKind.Memory, wasm.Type.none);
    }).toThrowError('You can only have a single memory in wasm MVP');
  });

  test('adds global imports', () => {
    module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Global, wasm.Type.i32);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (global (;0;) i32)))
    `);

    module.addImport('bar1', 'env2', 'bar', wasm.ExternalKind.Global, wasm.Type.i64);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (global (;0;) i32))
      |   (import "env2" "bar" (global (;1;) i64)))
    `);
  });

  test('adds global imports', () => {
    module.addImport('foo1', 'env1', 'foo', wasm.ExternalKind.Global, wasm.Type.i32);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (global (;0;) i32)))
    `);

    module.addImport('bar1', 'env2', 'bar', wasm.ExternalKind.Global, wasm.Type.i64);
    assertModule(module, `
      | (module
      |   (import "env1" "foo" (global (;0;) i32))
      |   (import "env2" "bar" (global (;1;) i64)))
    `);
  });
});
