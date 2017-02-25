import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Code Section (aka function bodies)', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds codes from different functions', () => {
    const type1 = module.addFunctionType([], [wasm.Type.i32]);
    const body1 = [
      new ast.Const(1, wasm.Opcode.I32_CONST)
    ];

    module.addFunction('foo', type1, [], body1);

    assertModule(module, `
      | (module
      |   (type (;0;) (func (result i32)))
      |   (func (;0;) (type 0) (result i32)
      |     i32.const 1))
    `);

    const type2 = module.addFunctionType();
    const body2 = [
      new ast.Const(1, wasm.Opcode.I32_CONST),
      new ast.Drop()
    ];

    module.addFunction('bar', type2, [], body2);

    assertModule(module, `
      | (module
      |   (type (;0;) (func (result i32)))
      |   (type (;1;) (func))
      |   (func (;0;) (type 0) (result i32)
      |     i32.const 1)
      |   (func (;1;) (type 1)
      |     i32.const 1
      |     drop))
    `);
  });

  test('adds drop', () => {
    const type1 = module.addFunctionType([], []);
    const body1 = [
      new ast.Const(1, wasm.Opcode.I32_CONST),
      new ast.Drop()
    ];

    module.addFunction('foo', type1, [], body1);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (func (;0;) (type 0)
      |     i32.const 1
      |     drop))
    `);
  });

  test('adds constants', () => {
    const type1 = module.addFunctionType([], [wasm.Type.i64]);
    const body1 = [
      new ast.Const(1, wasm.Opcode.I32_CONST),
      new ast.Drop(),
      new ast.Const(2, wasm.Opcode.I64_CONST)
    ];

    module.addFunction('foo', type1, [], body1);

    assertModule(module, `
      | (module
      |   (type (;0;) (func (result i64)))
      |   (func (;0;) (type 0) (result i64)
      |     i32.const 1
      |     drop
      |     i64.const 2))
    `);
  });

  test('adds loads', () => {
    const type1 = module.addFunctionType([], []);
    const body1 = [
      // i32.load8_s
      new ast.Load(
        1,
        true,
        0,
        1,
        wasm.Type.i32,
        new ast.Const(1, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),

      // i32.load16_s
      new ast.Load(
        2,
        true,
        1,
        2,
        wasm.Type.i32,
        new ast.Const(2, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),

      // i32.load
      new ast.Load(
        4,
        true,
        2,
        3,
        wasm.Type.i32,
        new ast.Const(3, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),

      // i64.load8_u
      new ast.Load(
        1,
        false,
        0,
        1,
        wasm.Type.i64,
        new ast.Const(1, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),

      // i64.load16_u
      new ast.Load(
        2,
        false,
        1,
        2,
        wasm.Type.i64,
        new ast.Const(2, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),

      // i64.load32_u
      new ast.Load(
        4,
        false,
        2,
        3,
        wasm.Type.i64,
        new ast.Const(3, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),

      // i64.load
      new ast.Load(
        8,
        false,
        3,
        4,
        wasm.Type.i64,
        new ast.Const(4, wasm.Opcode.I32_CONST)
      ),
      new ast.Drop(),
    ];

    module.addMemory(1, 1, []);
    module.addFunction('foo', type1, [], body1);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (func (;0;) (type 0)
      |     i32.const 1
      |     i32.load8_s
      |     drop
      |     i32.const 2
      |     i32.load16_s offset=1
      |     drop
      |     i32.const 3
      |     i32.load offset=2 align=2
      |     drop
      |     i32.const 1
      |     i64.load8_u
      |     drop
      |     i32.const 2
      |     i64.load16_u offset=1
      |     drop
      |     i32.const 3
      |     i64.load32_u offset=2 align=2
      |     drop
      |     i32.const 4
      |     i64.load offset=3 align=4
      |     drop)
      |   (memory (;0;) 1 1))
    `);
  });
});
