import {DynamicSSA,SSA} from './SSA.js';
import {Value} from './Value.js';
import {Type} from './Type.js';

const SECRET = Symbol('SECRET');

export class StubOperation {
  static create({name, operands, result}) {
    return new StubOperation({name,operands,result}, SECRET);
  }
  constructor({
    name = 'Anonymous Operation',
    operands,
    result
  } = {},should_be_secret) {
    this.name = name;
    this.operands = [...operands];
    
    let i = 0;
    for (const operand of operands) {
      if (operand instanceof Type !== true) {
        throw new TypeError(`Operation ${name} operand ${i} is not an instance of Type`);
      }
      i++;
    }
    if (result instanceof Type !== true) {
      if (result !== null) {
        throw new TypeError(`result of Operation ${name} must be an instance of Type or null, not ${result}`);
      }
    }
    this.result = result;
    Object.freeze(this.operands);
    Object.freeze(this);
  }
  createCallValue(...operand_ssas) {
    let i = 0;
    for (const ssa of operand_ssas) {
      const type = this.operands[i];
      if (ssa instanceof SSA !== true) {
        throw new TypeError(`Operation ${this.name} operand ${i} is not an instance of SSA`);
      }
      for (const value of ssa.values) {
        if (type.isSuperTypeOf(value.type) !== true) {
          throw new TypeError(`Operation ${this.name} expects type ${type.name} for operand number ${i}, but got a ${value.type.name}`);
        }
      }
      i++;
    }
    if (operand_ssas.length !== this.operands.length) {
      throw new RangeError(`Operation ${this.name} expected ${this.operands.length} operands, but got ${operand_ssas.length}`);
    }
    if (this.result === null) {
      return null;
    }
    return DynamicSSA.for(this.result);
  }
}