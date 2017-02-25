import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Memory Section', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds a memory', () => {
    module.addMemory(1, 1, []);

    assertModule(module, `
      | (module
      |   (memory (;0;) 1 1))
    `);
  });

  test('adds a memory with a single datum', () => {
    const data = [
      new ast.Data('hello world', new ast.Const(0, wasm.Opcode.I32_CONST))
    ];

    module.addMemory(2, 4, data);

    assertModule(module, `
      | (module
      |   (memory (;0;) 2 4)
      |   (data (i32.const 0) "hello world"))
    `);
  });

  test('adds a memory with a multiple data', () => {
    const data = [
      new ast.Data('hello', new ast.Const(0, wasm.Opcode.I32_CONST)),
      new ast.Data('world', new ast.Const(50, wasm.Opcode.I32_CONST))
    ];

    module.addMemory(2, 4, data);

    assertModule(module, `
      | (module
      |   (memory (;0;) 2 4)
      |   (data (i32.const 0) \"hello\")
      |   (data (i32.const 50) \"world\"))
    `);
  });
});
