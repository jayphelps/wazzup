import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Function Section', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds functions', () => {
    const type1 = module.addFunctionType();

    module.addFunction('foo', type1, [], []);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (func (;0;) (type 0)))
    `);

    const type2 = module.addFunctionType();

    module.addFunction('bar', type2, [], []);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (type (;1;) (func))
      |   (func (;0;) (type 0))
      |   (func (;1;) (type 1)))
    `);
  });

  test('adds functions with local types', () => {
    const type1 = module.addFunctionType();
    const localTypes1 = [wasm.Type.i32, wasm.Type.i64];
    module.addFunction('foo', type1, localTypes1, []);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (func (;0;) (type 0)
      |     (local i32 i64)))
    `);

    const type2 = module.addFunctionType();
    const localTypes2 = [wasm.Type.i32, wasm.Type.i32, wasm.Type.i64];
    module.addFunction('bar', type2, localTypes2, []);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (type (;1;) (func))
      |   (func (;0;) (type 0)
      |     (local i32 i64))
      |   (func (;1;) (type 1)
      |     (local i32 i32 i64)))
    `);
  });
});
