import * as ast from './ast';
import * as wasm from './wasm';
import { assert } from './utils/assert';
import { ByteArray } from './ByteArray';
import { SectionBuffer } from './SectionBuffer';

export interface Options {
  includeNames: boolean;
  relocatable: boolean;
}

export const defaultOptions: Options = {
  includeNames: false,
  relocatable: false,
};

export class BinaryWriter implements ast.Visitor<void> {
  section: SectionBuffer;
  bytes = new ByteArray();
  functionIndexMap = new Map<string, number>();
  currentRelocSection?: ast.RelocSection;

  constructor(
    public module: ast.Module,
    public options: Options = defaultOptions,
  ) {}

  findIndexForFunctionType(type: ast.FunctionType) {
    const { types } = this.module;
    return types.indexOf(type);
  }

  findIndexForFunctionName(name: string): number {
    const { functionIndexMap } = this;

    if (functionIndexMap.size === 0) {
      let index = 0;
      for (const imp of this.module.imports) {
        if (imp.externalKind === wasm.ExternalKind.Function) {
          functionIndexMap.set(imp.name, index);
          index++;
        }
      }

      for (const fn of this.module.functions) {
        functionIndexMap.set(fn.name, index);
        index++;
      }
    }

    const index = functionIndexMap.get(name);
    assert(typeof index === 'number', `Cannot find index for function ${name}, no prior declaration found`);

    return index as number;
  }

  visitReloc(reloc: ast.Reloc) {

  }

  visitConst(expr: ast.Const): void {
    this.section.write(expr.opcode);
    this.section.write(expr.value);
  }

  visitUnreachable(expr: ast.Unreachable): void {
    throw 'not implemented';
  }

  visitNop(expr: ast.Nop): void {
    throw 'not implemented';
  }

  visitBlock(block: ast.Block): void {
    this.section.write(wasm.Opcode.BLOCK);
    this.section.write(block.returnType);

    for (const child of block.children) {
      child.accept(this);
    }

    this.section.write(wasm.Opcode.END);
  }

  visitLoop(expr: ast.Loop): void {
    throw 'not implemented';
  }

  visitIf(expr: ast.If): void {
    expr.condition.accept(this);
    this.section.write(wasm.Opcode.IF);

    if (typeof expr.consequence.returnType !== 'undefined') {
      this.section.write(wasm.Type.blockType);
    } else {
      throw 'not implemented';
    }

    // TODO: binaryan appears to require blocks, so without this our
    /// tests fail. Is that per spec? It's not clear to me...
    (new ast.Block([expr.consequence], wasm.Type.blockType)).accept(this);

    this.section.write(wasm.Opcode.END);

    /*
    recurse(curr->condition);
    o << int8_t(BinaryConsts::If);
    o << binaryWasmType(curr->type != unreachable ? curr->type : none);
    breakStack.push_back(IMPOSSIBLE_CONTINUE); // the binary format requires this; we have a block if we need one; TODO: optimize
    recursePossibleBlockContents(curr->ifTrue); // TODO: emit block contents directly, if possible
    breakStack.pop_back();
    if (curr->ifFalse) {
      o << int8_t(BinaryConsts::Else);
      breakStack.push_back(IMPOSSIBLE_CONTINUE); // TODO ditto
      recursePossibleBlockContents(curr->ifFalse);
      breakStack.pop_back();
    }
    o << int8_t(BinaryConsts::End);*/
  }

  visitBranch(expr: ast.Branch): void {
    throw 'not implemented';
  }

  visitBranchIf(expr: ast.BranchIf): void {
    throw 'not implemented';
  }

  visitBranchTable(expr: ast.BranchTable): void {
    throw 'not implemented';
  }

  visitReturn(expr: ast.Return): void {
    throw 'not implemented';
  }

  visitCall(call: ast.Call): void {
    for (const arg of call.args) {
      arg.accept(this);
    }

    this.section.write(wasm.Opcode.CALL);
    const index = this.findIndexForFunctionName(call.target.name);
    this.section.write(index);
  }

  visitCallIndirect(callIndirect: ast.CallIndirect): void {
    for (const arg of callIndirect.args) {
      arg.accept(this);
    }

    callIndirect.target.accept(this);
    this.section.write(wasm.Opcode.CALL_INDIRECT);
    const index = this.findIndexForFunctionType(callIndirect.type);
    this.section.write(index);
    // reserved flag field by spec, not yet used
    this.section.write(0);
  }

  visitDrop(expr: ast.Drop): void {
    expr.target.accept(this);
    this.section.write(wasm.Opcode.DROP);
  }

  visitSelect(expr: ast.Select): void {
    throw 'not implemented';
  }

  visitGetLocal(expr: ast.GetLocal): void {
    this.section.write(wasm.Opcode.GET_LOCAL);
    this.section.write(expr.index);
  }

  visitSetLocal(expr: ast.SetLocal): void {
    expr.value.accept(this);
    this.section.write(wasm.Opcode.SET_LOCAL);
    this.section.write(expr.index);
  }

  visitTeeLocal(expr: ast.TeeLocal): void {
    expr.value.accept(this);
    this.section.write(wasm.Opcode.TEE_LOCAL);
    this.section.write(expr.index);
  }

  visitGetGlobal(expr: ast.GetGlobal): void {
    throw 'not implemented';
  }

  visitSetGlobal(expr: ast.SetGlobal): void {
    throw 'not implemented';
  }

  visitLoad(expr: ast.Load): void {
    expr.location.accept(this);

    switch (expr.type) {
      case wasm.Type.i32:
        switch (expr.byteCount) {
          case 1:
            this.section.write(
              expr.signed ? wasm.Opcode.I32_LOAD8_S : wasm.Opcode.I32_LOAD8_U
            );
            break;

          case 2:
            this.section.write(
              expr.signed ? wasm.Opcode.I32_LOAD16_S : wasm.Opcode.I32_LOAD16_U
            );
            break;

          case 4:
            this.section.write(wasm.Opcode.I32_LOAD);
            break;

          default:
            throw new TypeError(`i32.load expects a byte count of 1, 2, or 4 but was ${expr.byteCount}`);
        }
        break;

      case wasm.Type.i64:
        switch (expr.byteCount) {
          case 1:
            this.section.write(
              expr.signed ? wasm.Opcode.I64_LOAD8_S : wasm.Opcode.I64_LOAD8_U
            );
            break;

          case 2:
            this.section.write(
              expr.signed ? wasm.Opcode.I64_LOAD16_S : wasm.Opcode.I64_LOAD16_U
            );
            break;

          case 4:
            this.section.write(
              expr.signed ? wasm.Opcode.I64_LOAD32_S : wasm.Opcode.I64_LOAD32_U
            );
            break;

          case 8:
            this.section.write(wasm.Opcode.I64_LOAD);
            break;

          default:
            throw new TypeError(`i32.load expects a byte count of 1, 2, or 4 but was ${expr.byteCount}`);
        }
        break;

      default:
        throw TypeError(`Unrecognized wasm type ${expr.type}, expected i32 (${wasm.Type.i32}) or i64 (${wasm.Type.i64})`);
    }

    this.writeMemoryAccess(expr.alignment, expr.byteCount, expr.offset);
  }

  visitStore(expr: ast.Store): void {
    expr.location.accept(this);
    expr.value.accept(this);

    switch (expr.type) {
      case wasm.Type.i32:
        switch (expr.byteCount) {
          case 1:
            this.section.write(wasm.Opcode.I32_STORE8);
            break;

          case 2:
            this.section.write(wasm.Opcode.I32_STORE16);
            break;

          case 4:
            this.section.write(wasm.Opcode.I32_STORE);
            break;

          default:
            throw 'unreachable?';
        }
        break;

      case wasm.Type.i64:
        switch (expr.byteCount) {
          case 1:
            this.section.write(wasm.Opcode.I64_STORE8);
            break;

          case 2:
            this.section.write(wasm.Opcode.I64_STORE16);
            break;

          case 4:
            this.section.write(wasm.Opcode.I64_STORE32);
            break;

          case 8:
            this.section.write(wasm.Opcode.I64_STORE);
            break;

          default:
            throw 'unreachable?';
        }
        break;

      case wasm.Type.f32:
        this.section.write(wasm.Opcode.F32_STORE);
        break;

      case wasm.Type.f64:
        this.section.write(wasm.Opcode.F64_STORE);
        break;

      default:
        throw 'unreachable?';
    }

    this.writeMemoryAccess(expr.alignment, expr.byteCount, expr.offset);
  }

  visitCurrentMemory(expr: ast.CurrentMemory): void {
    throw 'not implemented';
  }

  visitGrowMemory(expr: ast.GrowMemory): void {
    throw 'not implemented';
  }

  visitUnaryExpression(expr: ast.UnaryExpression): void {
    throw 'not implemented';
  }

  visitBinaryExpression(expr: ast.BinaryExpression): void {
    expr.left.accept(this);
    expr.right.accept(this);
    this.section.write(expr.opcode);
  }

  visitFunctionType(type: ast.FunctionType): void {
    this.section.write(type.type);

    this.section.write(type.paramTypes.length);
    for (const paramType of type.paramTypes) {
      this.section.write(paramType);
    }

    // (only 1 in MVP but we'll code for it anyway)
    this.section.write(type.returnTypes.length);
    for (const returnType of type.returnTypes) {
      this.section.write(returnType);
    }
  }

  visitImport(imp: ast.Import): void {
    this.section.writeString(imp.moduleName);
    this.section.writeString(imp.fieldName);
    this.section.write(imp.externalKind);

    switch (imp.externalKind) {
      case wasm.ExternalKind.Function: {
        const index = this.findIndexForFunctionName(imp.name);
        this.section.write(index);
        break;
      }

      case wasm.ExternalKind.Table: {
        // TODO figure out how best to allow them to configure this
        // this.section.write(imp.type);
        // this.writeResizableLimits(1, Infinity);
        // break;
        throw new Error('You can\'t import tables yet');
      }

      case wasm.ExternalKind.Memory: {
        // TODO figure out how best to allow them to configure this
        this.writeResizableLimits(1);
        break;
      }

      case wasm.ExternalKind.Global: {
        // TODO: this is needed we're overloading what type is
        // but that's obviously bad
        assert(typeof imp.type === 'number');
        this.section.write(imp.type as number);
        // Mutable global's can't be imported for now.
        this.section.write(0);
        break;
      }

      default:
        throw 'todo';
    }
  }

  visitExport(exp: ast.Export): void {
    this.section.writeString(exp.externalName);
    this.section.write(exp.externalKind);

    switch (exp.externalKind) {
      case wasm.ExternalKind.Function: {
        // TODO: do something different so we don't need these instanceof guards
        // for here and Memory
        if (exp.value instanceof ast.Function) {
          const index = this.findIndexForFunctionName(exp.value.name);
          this.section.write(index);
        } else {
          throw 'Not a Function';
        }
        break;
      }

      case wasm.ExternalKind.Memory: {
        if (exp.value instanceof ast.Memory) {
          const index = this.module.memories.indexOf(exp.value);
          this.section.write(index);
        } else {
          throw 'Not a Memory';
        }
        break;
      }

      default:
        throw 'todo';
    }
  }

  visitGlobal(expr: ast.Global): void {
    throw 'not implemented';
  }

  visitFunction(expr: ast.Function): void {
    throw 'not implemented';
  }

  visitTable(table: ast.Table) {
    throw 'todo';
  }

  visitData(data: ast.Data) {
    // does nothing by default
  }

  visitMemory(expr: ast.Memory): void {
    // does nothing by default
  }

  visitModule(expr: ast.Module): void {
    throw 'not implemented';
  }

  // TODO: this is bad and only works sometimes because of luck
  prependWithSize(work: Function): void {
    // The size is first, but we don't know it yet so we move on
    // and write it after we're doing
    const start = this.section.bytes.offset;
    this.section.write(0);

    work();

    // Now that we're done we need to go back and write the real size
    const size = this.section.bytes.offset - start - 1;
    this.section.write(size, start);
  }

  /*addReloc(type: wasm.RelocType, index: number, addend = 0) {
    if (!this.currentRelocSection) {
      const name = wasm.nameForSection(this.section.id);
      this.relocSections.push(
        new ast.RelocSection(name)
      );
      this.currentRelocSection = this.relocSections[this.relocSections.length - 1];
    }

    this.currentRelocSection.relocs.push(
      new ast.Reloc(type, this.section.bytes.offset, index, addend)
    )
  }

  writeWithReloc(index: number, type: wasm.RelocType) {
    this.addReloc(type, index);
    // TODO write with padding so it doesn't need resizing ever
    // https://github.com/WebAssembly/tool-conventions/blob/master/Linking.md#merging-function-sections
    this.section.write(index);
    return this;
  }*/

  writeMemoryAccess(alignment: number, byteCount: 1 | 2 | 4 | 8, offset: number) {
    this.section.write(Math.log2(alignment ? alignment : byteCount));
    this.section.write(offset);
  }

  writeResizableLimits(initial: number, maximum = 0) {
    const hasMaximum = (maximum > 0 && maximum !== Infinity);
    const flags = hasMaximum ? 1 : 0;
    this.section.write(flags);
    this.section.write(initial);

    if (hasMaximum) {
      this.section.write(maximum);
    }
  }

  writeSection(section: SectionBuffer): void {
    this.bytes.writeU32LEB128(section.id);
    this.bytes.writeU32LEB128(section.bytes.offset);

    this.bytes.copy(section.bytes);
  }

  writePreamble(): void {
    const { version } = this.module;
    this.bytes.writeU32(wasm.MAGIC_NUMBER);
    this.bytes.writeU32(version);
  }

  writeTypeSection(): void {
    const { types } = this.module;
    if (!types.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Type);

    section.write(types.length);

    for (const type of types) {
      type.accept(this);
    }

    this.writeSection(section);
  }

  writeImportSection(): void {
    const { imports } = this.module;
    if (!imports.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Import);

    section.write(imports.length);

    for (const imp of imports) {
      imp.accept(this);
    }

    this.writeSection(section);
  }

  writeFunctionSection(): void {
    const { functions } = this.module;
    if (!functions.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Function);

    section.write(functions.length);

    for (const fn of functions) {
      const index = this.findIndexForFunctionType(fn.functionType);
      section.write(index);
    }

    this.writeSection(section);
  }

  writeTableSection(): void {
    const { tables } = this.module;
    if (!tables.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Table);

    section.write(tables.length);

    for (const table of tables) {
      if (table.elements.length > 0) {
        section.write(table.elements[0].type);
        this.writeResizableLimits(table.elements.length);
      }
    }

    this.writeSection(section);
  }

  writeMemorySection(): void {
    const { memories } = this.module;
    if (!memories.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Memory);

    section.write(memories.length);

    for (const memory of memories) {
      memory.accept(this);
      this.writeResizableLimits(memory.initialSize, memory.maxSize);
    }

    this.writeSection(section);
  }

  writeGlobalSection(): void {
    const { globals } = this.module;
    if (!globals.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Global);

    section.write(globals.length);

    for (const global of globals) {
      section.write(global.type);
      section.write(global.immutable ? 0 : 1);
      global.init.accept(this);
      section.write(wasm.Opcode.END);
    }

    this.writeSection(section);
  }

  writeExportSection(): void {
    const { exports } = this.module;
    if (!exports.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Export);
    section.write(exports.length);

    for (const exp of exports) {
      exp.accept(this);
    }

    this.writeSection(section);
  }

  writeStartSection(): void {
    const { start } = this.module;
    if (start == null) return;

    const section = this.section = new SectionBuffer(wasm.Section.Start);
    const index = this.findIndexForFunctionName(start.name);
    section.write(index);
    this.writeSection(section);
  }

  writeElementSection(): void {
    const { tables } = this.module;
    if (!tables.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Element);

    section.write(tables.length);

    for (let i = 0, l = tables.length; i < l; i++) {
      const table = tables[i];

      if (table.elements.length > 0) {
        section.write(i);
        table.offset.accept(this);
        section.write(wasm.Opcode.END);
        section.write(table.elements.length);

        for (const el of table.elements) {
          const index = this.findIndexForFunctionName(el.name);
          section.write(index);
        }
      }
    }

    this.writeSection(section);
  }

  writeCodeSection(): void {
    const { functions } = this.module;
    if (!functions.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Code);

    section.write(functions.length);

    for (const { localTypes, body, } of functions) {
      // TODO this is some hacky shit yo
      // we need to write the size of the body before the body itself
      // so we're currently making another section buffer temporarily
      // which is sorta fine but an abuse of that abstraction.
      const parentSection = this.section;
      const section = this.section = new SectionBuffer(wasm.Section.Code);

      /*// To save on file size we need to dedupe the types to count how many
      // of each there are so we can only have one entry for each type
      const localsCountByType = localTypes.reduce((map, localType) => {
        if (map.has(localType)) {
          const count = map.get(localType) as number;
          map.set(localType, count + 1);
        } else {
          map.set(localType, 1);
        }
        return map;
      }, new Map<wasm.Type, number>());
      const localTypeEntries = Array.from(localsCountByType.entries());

      section.write(localTypeEntries.length);

      for (const [type, count] of localTypeEntries) {
        section.write(count);
        section.write(type);
      }*/

      section.write(localTypes.length);

      for (const type of localTypes) {
        section.write(1);
        section.write(type);
      }

      for (const element of body) {
        element.accept(this);
      }

      section.write(wasm.Opcode.END);

      parentSection.write(section.bytes.offset);
      parentSection.bytes.copy(section.bytes);
      this.section = parentSection;
    }

    this.writeSection(section);
  }

  writeDataSection(): void {
    const { memories } = this.module;
    if (!memories.length) return;
    const section = this.section = new SectionBuffer(wasm.Section.Data);
    const segmentIndexMap = new Map<ast.Data, number>();
    // TODO: not exactly ideal storing indices like this
    const segments = memories
      .map((mem, i) => {
        for (const seg of mem.segments) {
          segmentIndexMap.set(seg, i);
        }

        return mem.segments;
      })
      .reduce((acc, arr) => acc.concat(arr), []);

    if (!segments.length) return;

    section.write(segments.length);

    for (const segment of segments) {
      const index = segmentIndexMap.get(segment);
      assert(typeof index === 'number', `Cannot find index for data segment "${segment.value}"`);

      // memory index (only 0 in MVP)
      section.write(index as number);
      segment.offset.accept(this);
      section.write(wasm.Opcode.END);

      // TODO: this is awful and wrong. Figure out best way to let them pass
      // bytes instead of overloads
      if (typeof segment.value === 'string') {
          section.writeString(segment.value);
      } else if (typeof segment.value === 'number') {
          section.write(segment.value);
      }
    }

    this.writeSection(section);
  }

  writeNameSection(): void {
    const { imports, functions } = this.module;
    if (!imports.length && !functions.length) return;
    const functionImports = imports.filter(
      imp => imp.externalKind === wasm.ExternalKind.Function
    );
    const section = this.section = new SectionBuffer(wasm.Section.Custom);
    section.writeString('name');
    section.write(functionImports.length + functions.length);

    for (const imp of functionImports) {
      section.writeString('$' + imp.name);
      // TODO: locals
      // section.write(0);
      throw 'todo';
    }

    for (const fn of functions) {
      section.writeString('$' + fn.name);
      // TODO: locals
      section.write(0);
    }

    this.writeSection(section);
  }

  /*writeRelocSections(): void {
    for (const section of this.relocSections) {
      section
    }
  }*/

  writeModule(): ArrayBuffer {
    this.writePreamble();
    this.writeTypeSection();
    this.writeImportSection();
    this.writeFunctionSection();
    this.writeTableSection();
    this.writeMemorySection();
    this.writeGlobalSection();
    this.writeExportSection();
    this.writeStartSection();
    this.writeElementSection();
    this.writeCodeSection();
    this.writeDataSection();

    if (this.options.includeNames) {
      this.writeNameSection();
    }

    /*if (this.options.relocatable) {
      this.writeRelocSections();
    }*/

    return this.bytes.buffer.slice(0, this.bytes.offset);
  }
}
