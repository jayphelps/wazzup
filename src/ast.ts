import { assert } from './utils/assert';
import * as wasm from './wasm';
import { Module } from './Module';
export { Module };

export interface Visitor<T> {
  visitConst(node: Const): T;

  // Control Flow
  visitUnreachable(node: Unreachable): T;
  visitNop(node: Nop): T;
  visitBlock(node: Block): T;
  visitLoop(node: Loop): T;
  visitIf(node: If): T;
  visitBranch(node: Branch): T;
  visitBranchIf(node: BranchIf): T;
  visitBranchTable(node: BranchTable): T;
  visitReturn(node: Return): T;

  // Call Operators
  visitCall(node: Call): T;
  visitCallIndirect(node: CallIndirect): T;

  // Parametric Operators
  visitDrop(node: Drop): T;
  visitSelect(node: Select): T;

  // Variable Access
  visitGetLocal(node: GetLocal): T;
  visitSetLocal(node: SetLocal): T;
  visitTeeLocal(node: TeeLocal): T;
  visitGetGlobal(node: GetGlobal): T;
  visitSetGlobal(node: GetGlobal): T;

  // Memory Operators
  visitLoad(node: Load): T;
  visitStore(node: Store): T;
  visitCurrentMemory(node: CurrentMemory): T;
  visitGrowMemory(node: GrowMemory): T;

  // Other Expressions
  visitUnaryExpression(node: UnaryExpression): T;
  visitBinaryExpression(node: BinaryExpression): T;

  // Relocation
  visitReloc(node: Reloc): T;

  // Declarations
  visitFunctionType(node: FunctionType): T;
  visitImport(node: Import): T;
  visitExport(node: Export): T;
  visitGlobal(node: Global): T;
  visitFunction(node: Function): T;
  visitTable(node: Table): T;
  visitMemory(node: Memory): T;
  visitData(node: Data): T;
  visitModule(node: Module): T;
}

export interface Node {
  accept<T>(visitor: Visitor<T>): T;
}

export interface Expression extends Node {
  returnType?: wasm.Type;
}

export interface Type extends Node {
  type: wasm.Type;
}

export class Const implements Expression {
  returnType: wasm.Type;

  constructor(
    public value: number,
    public opcode: wasm.Opcode,
  ) {
    switch (opcode) {
      case wasm.Opcode.I32_CONST:
        this.returnType = wasm.Type.i32;
        break;

      case wasm.Opcode.I64_CONST:
        this.returnType = wasm.Type.i64;
        break;
      
      case wasm.Opcode.F32_CONST:
        this.returnType = wasm.Type.f32;
        break;

      case wasm.Opcode.F64_CONST:
        this.returnType = wasm.Type.f64;
        break;
    }
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitConst(this);
  }
}

// Control Flow

export class Unreachable implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnreachable(this);
  }
}

export class Nop implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitNop(this);
  }
}

export class Block implements Expression {
  constructor(
    public children: Array<Expression>,
    public returnType: wasm.Type,
    public name?: string,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBlock(this);
  }
}

export class Loop implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLoop(this);
  }
}

export class If implements Expression {
  returnType: wasm.Type;

  constructor(
    public condition: Expression,
    public consequence: Expression,
    public alternate?: Expression,
  ) {
    // TODO: wtf...bad jay, bad
    if (typeof consequence.returnType !== 'undefined') {
      this.returnType = consequence.returnType;
    }
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitIf(this);
  }
}

export class Branch implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBranch(this);
  }
}

export class BranchIf implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBranchIf(this);
  }
}

export class BranchTable implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBranchTable(this);
  }
}

export class Return implements Expression {
  returnType = wasm.Type.none;

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReturn(this);
  }
}

// Call Operators

export class Call implements Expression {
  returnType: wasm.Type;

  constructor(
    public target: Function | Import,
    public args: Array<Expression>,
  ) {
    if (target instanceof Function) {
      if (target.functionType.returnTypes.length) {
        this.returnType = target.functionType.returnTypes[0];
      } else {
        this.returnType = wasm.Type.none;
      }
    } else if (target instanceof Import) {
      this.returnType = target.type;
    }
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCall(this);
  }
}

export class CallIndirect implements Expression {
  constructor(
    public target: Expression,
    public args: Array<Expression>,
    public type: FunctionType,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCallIndirect(this);
  }
}

// Parametric Operators

export class Drop implements Expression {
  constructor(
    public target: Expression
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitDrop(this);
  }
}

export class Select implements Expression {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSelect(this);
  }
}

// Variable Access

export class GetLocal implements Expression {
  constructor(
    public index: number,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGetLocal(this);
  }
}

export class SetLocal implements Expression {
  constructor(
    public index: number,
    public value: Expression,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSetLocal(this);
  }
}

export class TeeLocal implements Expression {
  constructor(
    public index: number,
    public value: Expression,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitTeeLocal(this);
  }
}

export class GetGlobal implements Expression {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGetGlobal(this);
  }
}

export class SetGlobal implements Expression {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitSetGlobal(this);
  }
}

// Memory Operators

export class Load implements Expression {
  constructor(
    public byteCount: 1 | 2 | 4 | 8,
    public signed: boolean,
    public offset: number,
    public alignment: number,
    public type: wasm.Type,
    public location: Expression,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitLoad(this);
  }
}

export class Store implements Expression {
  constructor(
    public byteCount: 1 | 2 | 4 | 8,
    public offset: number,
    public alignment: number,
    public type: wasm.Type,
    public location: Expression,
    public value: Expression,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitStore(this);
  }
}

export class CurrentMemory implements Expression {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitCurrentMemory(this);
  }
}

export class GrowMemory implements Expression {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitGrowMemory(this);
  }
}

// Other Expressions

export class UnaryExpression implements Expression {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitUnaryExpression(this);
  }
}

export class BinaryExpression implements Expression {
  constructor(
    public left: Expression,
    public opcode: wasm.Opcode,
    public right: Expression
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

// Declarations

export class FunctionType implements Type, Node {
  type = wasm.Type.func;
  returnTypes: Array<wasm.Type>;

  constructor(
    // TODO: how can we actually save the name in the binary?
    // Doesn't appear to belong in the Name Section and
    // don't see it emitted in Binaryan
    // public name: string,
    public paramTypes: Array<wasm.Type> = [],
    returnTypes: Array<wasm.Type> | wasm.Type = [],
  ) {
    this.returnTypes = Array.isArray(returnTypes) ? returnTypes : [returnTypes];
    assert(this.returnTypes.length <= 1, 'FunctionTypes can only have a single return value in wasm MVP');
  }

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitFunctionType(this);
  }
}

export class Import {
  constructor(
    public name: string,
    public moduleName: string,
    public fieldName: string,
    public externalKind: wasm.ExternalKind,
    // TODO: this overload isn't great
    // Sometimes it's an AST type sometimes it's
    // a native WASM type
    // public type: Type | wasm.Type,
    public type: wasm.Type,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitImport(this);
  }
}

export class Export {
  constructor(
    public externalName: string,
    public externalKind: wasm.ExternalKind,
    public value: Function | Memory,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitExport(this);
  }
}

export class Global {
  constructor(
    public type: wasm.Type,
    public init: Expression,
    public immutable: boolean = true,
  ) {}
}

export interface Element {
  type: wasm.Type;
  name: string;
}

export class Function implements Element {
  type = wasm.Type.anyfunc;
  externalKind = wasm.ExternalKind.Function;

  constructor(
    public name: string,
    public functionType: FunctionType,
    // params plus vars
    public localTypes: Array<wasm.Type>,
    public body: Array<Expression>,
    // public localNames: Array<string>,
    // public localIndices: { [key: string]: number },
  ) {}
}

export class Table implements Node {
  constructor(
    public elements: Array<Element>,
    public offset: Expression,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitTable(this);
  }
}

export class Data {
  constructor(
    public value: string | number,
    public offset: Expression,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitData(this);
  }
}

export class Memory {
  externalKind = wasm.ExternalKind.Memory;

  constructor(
    public initialSize: number,
    public maxSize: number,
    public segments: Array<Data>,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitMemory(this);
  }
}

export class Reloc {
  constructor(
    public type: wasm.RelocType,
    public offset: number,
    public index: number,
    public addend: number,
  ) {}

  accept<T>(visitor: Visitor<T>): T {
    return visitor.visitReloc(this);
  }
}

export class RelocSection {
  relocs: Array<Reloc> = [];

  constructor(
    public name: string
  ) {}
}
