import { assert } from './utils/assert';
import * as wasm from './wasm';
import * as ast from './ast';
import { Options, BinaryWriter } from './BinaryWriter';

export class Module {
  version = wasm.VERSION;
  types: Array<ast.Type> = [];
  exports: Array<ast.Export> = [];
  imports: Array<ast.Import> = [];
  functions: Array<ast.Function> = [];
  start: ast.Function | null;
  tables: Array<ast.Table> = [];
  memories: Array<ast.Memory> = [];
  globals: Array<ast.Global> = [];

  get names(): Array<string> {
    const imports = this.imports.map(imp => imp.name);
    const functions = this.functions.map(fn => fn.name);
    return imports.concat(functions);
  }

  addGlobal(type: wasm.Type, init: ast.Expression, immutable: boolean) {
    const global = new ast.Global(type, init, immutable);
    this.globals.push(global);
    return global;
  }

  addMemory(initialSize: number, maximumSize: number, segments: Array<ast.Data>) {
    assert(this.memories.length === 0, 'You can only have a single memory in wasm MVP');
    const memory = new ast.Memory(initialSize, maximumSize, segments);
    this.memories.push(memory);
    return memory;
  }

  addTable(elements: Array<ast.Element>, offset: ast.Expression = new ast.Const(0, wasm.Opcode.I32_CONST)) {
    const table = new ast.Table(elements, offset);
    this.tables.push(table);
    return table;
  }

  addStart(start: ast.Function): ast.Function {
    this.start = start;
    return start;
  }

  addExport(externalName: string, value: ast.Function | ast.Memory): ast.Export {
    const exp = new ast.Export(externalName, value.externalKind, value);
    this.exports.push(exp);
    return exp;
  }

  addImport(name: string, moduleName: string, fieldName: string, externalKind: wasm.ExternalKind, type: ast.FunctionType | wasm.Type): ast.Import {
    // TODO: remove this limitation
    assert(this.functions.length === 0, 'You cannot add imports after you have added functions');
    const returnType = (type instanceof ast.FunctionType) ? type.returnTypes[0] || wasm.Type.none : type;
    const imp = new ast.Import(name, moduleName, fieldName, externalKind, returnType);
    this.imports.push(imp);
    return imp;
  }

  addFunctionType(paramTypes?: Array<wasm.Type>, returnTypes?: Array<wasm.Type> | wasm.Type): ast.FunctionType {
    const type = new ast.FunctionType(paramTypes, returnTypes);
    this.types.push(type);
    return type;
  }

  addFunction(name: string, type: ast.FunctionType, localTypes: Array<wasm.Type>, body: Array<ast.Expression>): ast.Function {
    const fn = new ast.Function(
      name,
      type,
      localTypes,
      body
    );

    this.functions.push(fn);

    return fn;
  }

  toBuffer(options?: Options): ArrayBuffer {
    const writer = new BinaryWriter(this, options);
    return writer.writeModule();
  }
}
