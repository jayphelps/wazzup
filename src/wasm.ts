/**
 * Reference http://webassembly.org/docs/binary-encoding/#high-level-structure
 */

export const MAGIC_NUMBER = 0x6d736100;
export const VERSION = 1;

export const enum Bitness {
  x32,
  x64,
}

export const enum Type {
  none = 0,
  i32 = 0x7f,
  i64 = 0x7e,
  f32 = 0x7d,
  f64 = 0x7c,
  anyfunc = 0x70,
  func = 0x60,
  blockType = 0x40,
}

export const enum Section {
  Custom,
  Type,
  Import,
  Function,
  Table,
  Memory,
  Global,
  Export,
  Start,
  Element,
  Code,
  Data,
}

export const enum ExternalKind {
  Function,
  Table,
  Memory,
  Global,
}

export const enum Opcode {
  // Control flow
  UNREACHABLE = 0x00,
  NOP = 0x01,
  BLOCK = 0x02,
  LOOP = 0x03,
  IF = 0x04,
  IF_ELSE = 0x05,
  END = 0x0b,
  BR = 0x0c,
  BR_IF = 0x0d,
  BR_TABLE = 0x0e,
  RETURN = 0x0f,

  // Call operators
  CALL = 0x10,
  CALL_INDIRECT = 0x11,

  // Parametric operators
  DROP = 0x1a,
  SELECT = 0x1b,

  // Variable access
  GET_LOCAL = 0x20,
  SET_LOCAL = 0x21,
  TEE_LOCAL = 0x22,
  GET_GLOBAL = 0x23,
  SET_GLOBAL = 0x24,

  // Memory-related operations
  I32_LOAD = 0x28,
  I64_LOAD = 0x29,
  F32_LOAD = 0x2a,
  F64_LOAD = 0x2b,

  I32_LOAD8_S = 0x2c,
  I32_LOAD8_U = 0x2d,
  I32_LOAD16_S = 0x2e,
  I32_LOAD16_U = 0x2f,

  I64_LOAD8_S = 0x30,
  I64_LOAD8_U = 0x31,
  I64_LOAD16_S = 0x32,
  I64_LOAD16_U = 0x33,
  I64_LOAD32_S = 0x34,
  I64_LOAD32_U = 0x35,

  I32_STORE = 0x36,
  I64_STORE = 0x37,
  F32_STORE = 0x38,
  F64_STORE = 0x39,

  I32_STORE8 = 0x3a,
  I32_STORE16 = 0x3b,
  I64_STORE8 = 0x3c,
  I64_STORE16 = 0x3d,
  I64_STORE32 = 0x3e,
  MEMORY_SIZE = 0x3f,
  GROW_MEMORY = 0x40,

  // Constants
  I32_CONST = 0x41,
  I64_CONST = 0x42,
  F32_CONST = 0x43,
  F64_CONST = 0x44,

  // Comparison operators
  I32_EQZ = 0x45,
  I32_EQ = 0x46,
  I32_NE = 0x47,
  I32_LT_S = 0x48,
  I32_LT_U = 0x49,
  I32_GT_S = 0x4a,
  I32_GT_U = 0x4b,
  I32_LE_S = 0x4c,
  I32_LE_U = 0x4d,
  I32_GE_S = 0x4e,
  I32_GE_U = 0x4f,

  I64_EQZ = 0x50,
  I64_EQ = 0x51,
  I64_NE = 0x52,
  I64_LT_S = 0x53,
  I64_LT_U = 0x54,
  I64_GT_S = 0x55,
  I64_GT_U = 0x56,
  I64_LE_S = 0x57,
  I64_LE_U = 0x58,
  I64_GE_S = 0x59,
  I64_GE_U = 0x5a,

  F32_EQ = 0x5b,
  F32_NE = 0x5c,
  F32_LT = 0x5d,
  F32_GT = 0x5e,
  F32_LE = 0x5f,
  F32_GE = 0x60,

  F64_EQ = 0x61,
  F64_NE = 0x62,
  F64_LT = 0x63,
  F64_GT = 0x64,
  F64_LE = 0x65,
  F64_GE = 0x66,

  // Numeric operators
  I32_CLZ = 0x67,
  I32_CTZ = 0x68,
  I32_POPCNT = 0x69,
  I32_ADD = 0x6a,
  I32_SUB = 0x6b,
  I32_MUL = 0x6c,
  I32_DIV_S = 0x6d,
  I32_DIV_U = 0x6e,
  I32_REM_S = 0x6f,
  I32_REM_U = 0x70,
  I32_AND = 0x71,
  I32_OR = 0x72,
  I32_XOR = 0x73,
  I32_SHL = 0x74,
  I32_SHR_S = 0x75,
  I32_SHR_U = 0x76,
  I32_ROTL = 0x77,
  I32_ROTR = 0x78,

  I64_CLZ = 0x79,
  I64_CTZ = 0x7a,
  I64_POPCNT = 0x7b,
  I64_ADD = 0x7c,
  I64_SUB = 0x7d,
  I64_MUL = 0x7e,
  I64_DIV_S = 0x7f,
  I64_DIV_U = 0x80,
  I64_REM_S = 0x81,
  I64_REM_U = 0x82,
  I64_AND = 0x83,
  I64_OR = 0x84,
  I64_XOR = 0x85,
  I64_SHL = 0x86,
  I64_SHR_S = 0x87,
  I64_SHR_U = 0x88,
  I64_ROTL = 0x89,
  I64_ROTR = 0x8a,

  F32_ABS = 0x8b,
  F32_NEG = 0x8c,
  F32_CEIL = 0x8d,
  F32_FLOOR = 0x8e,
  F32_TRUNC = 0x8f,
  F32_NEAREST = 0x90,
  F32_SQRT = 0x91,
  F32_ADD = 0x92,
  F32_SUB = 0x93,
  F32_MUL = 0x94,
  F32_DIV = 0x95,
  F32_MIN = 0x96,
  F32_MAX = 0x97,
  F32_COPYSIGN = 0x98,

  F64_ABS = 0x99,
  F64_NEG = 0x9a,
  F64_CEIL = 0x9b,
  F64_FLOOR = 0x9c,
  F64_TRUNC = 0x9d,
  F64_NEAREST = 0x9e,
  F64_SQRT = 0x9f,
  F64_ADD = 0xa0,
  F64_SUB = 0xa1,
  F64_MUL = 0xa2,
  F64_DIV = 0xa3,
  F64_MIN = 0xa4,
  F64_MAX = 0xa5,
  F64_COPYSIGN = 0xa6,

  // Conversions
  I32_WRAP_I64 = 0xa7,
  I32_TRUNC_S_F32 = 0xa8,
  I32_TRUNC_U_F32 = 0xa9,
  I32_TRUNC_S_F64 = 0xaa,
  I32_TRUNC_U_F64 = 0xab,

  I64_EXTEND_S_I32 = 0xac,
  I64_EXTEND_U_I32 = 0xad,
  I64_TRUNC_S_F32 = 0xae,
  I64_TRUNC_U_F32 = 0xaf,
  I64_TRUNC_S_F64 = 0xb0,
  I64_TRUNC_U_F64 = 0xb1,

  F32_CONVERT_S_I32 = 0xb2,
  F32_CONVERT_U_I32 = 0xb3,
  F32_CONVERT_S_I64 = 0xb4,
  F32_CONVERT_U_I64 = 0xb5,
  F32_DEMOTE_F64 = 0xb6,

  F64_CONVERT_S_I32 = 0xb7,
  F64_CONVERT_U_I32 = 0xb8,
  F64_CONVERT_S_I64 = 0xb9,
  F64_CONVERT_U_I64 = 0xba,
  F64_PROMOTE_F32 = 0xbb,

  // Reinterpretations
  I32_REINTERPRET_F32 = 0xbc,
  I64_REINTERPRET_F64 = 0xbd,
  F32_REINTERPRET_I32 = 0xbe,
  F64_REINTERPRET_I64 = 0xbf,
};

export const enum  RelocType {
  // A function index encoded as a 5-byte varuint32.
  // Used for the immediate argument of a call instruction.
  FUNCTION_INDEX_LEB,
  // A function table index encoded as a 5-byte varint32.
  // Used to refer to the immediate argument of a i32.const instruction,
  // e.g. taking the address of a function.
  TABLE_INDEX_SLEB,
  // A function table index encoded as a uint32, e.g. taking the address of a
  // function in a static data initializer.
  TABLE_INDEX_I32,
  // A linear memory index encoded as a 5-byte varuint32. Used for the immediate
  // argument of a load or store instruction, e.g. directly loading from or
  // storing to a C++ global.
  MEMORY_ADDR_LEB,
  // A linear memory index encoded as a 5-byte varint32. Used for the immediate
  // argument of a i32.const instruction, e.g. taking the address of a C++ global.
  MEMORY_ADDR_SLEB,
  // A linear memory index encoded as a uint32, e.g. taking the address of a
  // C++ global in a static data initializer.
  MEMORY_ADDR_I32,
  // A type table index encoded as a 5-byte varuint32, e.g. the type immediate
  // in a call_indirect.
  TYPE_INDEX_LEB,
  // A global index encoded as a 5-byte varuint32, e.g. the type immediate in a
  // get_global.
  GLOBAL_INDEX_LEB,
};

export const SECTION_NAMES = {
  [Section.Type]: 'Type',
  [Section.Import]: 'Import',
  [Section.Function]: 'Function',
  [Section.Table]: 'Table',
  [Section.Memory]: 'Memory',
  [Section.Global]: 'Global',
  [Section.Export]: 'Export',
  [Section.Element]: 'Element',
  [Section.Code]: 'Code',
  [Section.Data]: 'Data',
};

export function nameForSection(section: Section) {
  const name = SECTION_NAMES[section];
  if (name === undefined) {
    throw new Error(`Unknown section number ${section}`);
  }

  return name;
}