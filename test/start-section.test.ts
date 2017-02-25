import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe('Start Section', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('adds a start', () => {
    const type1 = module.addFunctionType();
    const func1 = module.addFunction('foo', type1, [], []);

    module.addStart(func1);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (func (;0;) (type 0))
      |   (start 0))
    `);

    const type2 = module.addFunctionType();
    const func2 = module.addFunction('bar', type2, [], []);

    // overrides the first start (highlander)
    module.addStart(func2);

    assertModule(module, `
      | (module
      |   (type (;0;) (func))
      |   (type (;1;) (func))
      |   (func (;0;) (type 0))
      |   (func (;1;) (type 1))
      |   (start 1))
    `);
  });
});
