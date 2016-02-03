import {Type} from './Type.js';

const SECRET = Symbol('SECRET');

function $checkConstraint(desc, constraint) {
  if (constraint(desc) !== true) {
    throw new TypeError(`${desc} failed constraint ${constraint}. This constraint should have thrown a TypeError instead for better debugging.`);
  }
}

export class Value extends null {
  static for(type) {
    return new Value(type, SECRET);
  }
  constructor(type,should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot extend Value type, did you mean to use Value.for?`);
    }
    if (type !== Type && type instanceof Type !== true) {
      throw new TypeError(`Cannot create Value, type ${type} is not a Type`);
    }
    super();
    this.type = type;
    
    let defined = false;
    let definition = undefined;
    let constraints = [];
    let waiters = [];
    
    this.define = (desc) => {
      if (defined) {
        throw new Error(`Value cannot be instanciated with ${desc}, it has already been instanciated`);
      }
      definition = desc;
      defined = true;
      for (const constraint of constraints) {
        $checkConstraint(definition,constraint);
      }
      constraints = null;
      for (const waiter of waiters) {
        waiter(definition);
      }
      waiters = null;
      return this;
    }
    this.constrain = (constraint) => {
      if (typeof constraint !== 'function') {
        throw new TypeError(`Cannot constrain Value with type ${this.type.name}, test ${constraint} is not a function`)
      }
      if (defined) {
        throw new Error(`Cannot constrain Value with type ${this.type.name}, it has already been defined to ${definition}`);
      }
      else constraints.push(constraint);
      return this;
    }
    this.then = f => {
      if (typeof f !== 'function') {
        throw new TypeError(`Cannot wait on Value, handler ${f} is not a function`)
      }
      if (defined) f(definition);
      else waiters.push(f);
      return this;
    }
    Object.freeze(this);
  }
  toString() {
    return `<value type=${this.type}>`;
  }
}
Value.DYNAMIC = Symbol('DYNAMIC');
Object.freeze(Value);