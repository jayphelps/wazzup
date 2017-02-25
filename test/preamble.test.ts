import { ast } from '../';
import { assertModule } from './utils/assertModule';

describe('Preamble', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('contains standard preamble', () => {
    assertModule(module, `
      | (module)
    `);
  });
});
