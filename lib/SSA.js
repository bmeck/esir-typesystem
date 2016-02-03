import {Type} from './Type.js';
import {Value} from './Value.js';

const SECRET = Symbol('SECRET');

export class SSA {
  /**
   * @param name - debugging name
   * @param block - a block of JIT code that the SSA represents. Used for performing branches.
   */
	constructor(name = '%tmp', values, should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot extend SSA`);
    }
    this.values = [...values];
    for (const value of this.values) {
      if (value instanceof Value !== true) {
        throw new TypeError(`All values of SSA ${name} must be a Value`);
      }
    }
		this.name = name;
    Object.freeze(this.values);
	}
  
  isConstrainedToType(type) {
    if (type !== Type || 
        type instanceof Type !== true) {
       throw new Error(`Cannot constraint SSA ${this.name} to type, ${type} is not a Type`);
    }
    for (const value of this.values) {
      if (type.isSuperTypeOf(value.type) !== true) {
        return false;
      }
    }
    return true;
  }
}
Object.freeze(SSA);

/**
 * Used to represent values generated from operations
 * AKA non-static values
 */
export class DynamicSSA extends SSA {
  static for(type) {
    return new DynamicSSA(type, SECRET);
  }
  constructor(type, should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot extend DynamicSSA`);
    }
    super(`dynamic ${type.name}`, [Value.for(type).define(Value.DYNAMIC)], SECRET);
    Object.freeze(this);
  }
}
Object.freeze(DynamicSSA);
/**
 * Represents an SSA that needs to be allocated when it is encountered
 */
export class AllocationSSA extends SSA {
  static for(base) {
    return new AllocationSSA(base, SECRET);
  }
  constructor(base, should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot extend AllocationSSA`);
    }
    if (base instanceof Value !== true) {
      throw new TypeError(`Base value of AllocationSSA ${name} must be a Value`);
    }
    super(`allocation ${base.type.name}`, [base], SECRET);
    Object.freeze(this);
  }
}
Object.freeze(AllocationSSA);
/**
 * Data structure used to represent a superimposition of SSAs.
 * This means that for any given Phi, only one SSA in the list
 * can be populated, but when getting the value of the Phi, the
 * populated SSA will be used.
 * 
 * Compilers often implement this by having all of the SSAs of a
 * Phi share the same memory space.
 */
export class PhiSSA extends SSA {
  static for(...ssas) {
    return new PhiSSA(ssas, SECRET);
  }
  constructor(ssas, should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot extend PhiSSA`);
    }
    const values = [];
    for (const ssa of ssas) {
      for (const value of ssa.values) {
        values.push(value);
      }
    }
    const names = [...new Set(ssas.map(s=>s.name))];
    super(`phi():${names.join('|')}`, values, SECRET);
    if (this.values.length <= 1) {
      throw new RangeError(`Phi must be given multiple SSAs, only ${this.values.length} given`);
    }
    for (const ssa of ssas) {
      if (ssa instanceof SSA !== true) {
        throw new TypeError(`Phi must be composed entirely of SSAs`);
      }
    }
    this.ssas = ssas;
    Object.freeze(this);
  }
}
Object.freeze(PhiSSA);
