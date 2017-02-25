import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Export Section', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds exports', () => {
    const type1 = module.addFunctionType();
    const func1 = module.addFunction('foo', type1, [], []);

    module.addExport('foo', func1);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (func (;0;) (type 0))
      |   (export "foo" (func 0)))
    `);

    const type2 = module.addFunctionType();
    const func2 = module.addFunction('bar', type2, [], []);

    module.addExport('bar', func2);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (type (;1;) (func))
      |   (func (;0;) (type 0))
      |   (func (;1;) (type 1))
      |   (export "foo" (func 0))
      |   (export "bar" (func 1)))
    `);
  });
});
