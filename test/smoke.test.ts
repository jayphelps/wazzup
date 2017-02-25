import { ast, wasm } from '../';
import { assertModule } from './utils/assertModule';

describe.skip('Smoke test', () => {
  let module;

  beforeEach(() => {
    module = new ast.Module();
  });

  test('does all the things', () => {
    const text = 'hello bae!';
    const data = [
      new ast.Data(
        String.fromCharCode(text.length) + text,
        new ast.Const(0, wasm.Opcode.I32_CONST)
      )
    ];

    const memory = module.addMemory(1, 1, data);
    module.addExport('memory', memory);

    const logStringType = module.addFunctionType([wasm.Type.i32], []);
    const logString = module.addImport('logString', 'env', 'logString', wasm.ExternalKind.Function, logStringType);
    const mainType = module.addFunctionType([], []);
    const mainBody = [
      new ast.If(
        new ast.Const(1, wasm.Opcode.I32_CONST),
        new ast.Call(
          logString,
          [new ast.Const(0, wasm.Opcode.I32_CONST)]
        )
      )
    ];
    const main = module.addFunction('main', mainType, [], mainBody);

    module.addExport('main', main);

    require('fs').writeFileSync('out.wasm', new Buffer(module.toBuffer()), { encoding: null });

    assertModule(module, `
      | (module)
    `);
});