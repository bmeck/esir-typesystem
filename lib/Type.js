import {Value} from './Value.js';

const ALWAYS_PASS = ()=>true;
const IS_UNDEFINED = (v)=>typeof v === 'undefined';
const SECRET = Symbol('SECRET');
const isSuperTypeOf = (parent,child) => {
  while (child !== null) {
    if (child === parent) return true;
    child = child.parent;
  }
  return false;
}

export class Type extends null {
  constructor({
    name = 'Anonymous Type',
    check = ALWAYS_PASS,
    parent = null
  }, should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot extend Type`);
    }
    if (typeof name !== 'string') {
      throw new TypeError(`Type name must be a string`);
    }
    super();
    this.name = name;
    if (parent !== null && parent instanceof Type !== true) {
      throw new TypeError(`${parent} is not a Type`);
    }
    this.parent = parent;
    if (typeof check !== 'function') {
      throw new TypeError(`Type.check() must be a function not ${check} with a typeof ${typeof check}`);
    }
    this.check = check;
  }
  isSuperTypeOf(other) {
    return isSuperTypeOf(this, other);
  }
  definitionFor(desc) {
    return desc;
  }
}
Type.SELF = Symbol('Type.SELF');
Object.freeze(Type);

export class RecordType extends Type {
  static create(desc) {
    return new RecordType(desc, SECRET);
  }
  constructor({
    name = 'Record Type',
    fields = Object.create(null),
    check = ALWAYS_PASS,
    parent = null
  } = {}, should_be_secret) {
    if (should_be_secret !== SECRET) {
      throw new Error(`Cannot directly construct RecordType, use RecordType.create`);
    }
    if (parent !== null && parent instanceof RecordType !== true) {
      throw new TypeError(`RecordType cannot have a parent of ${parent}, it is not an instance of RecordType`);
    }
    super({name, check, parent}, SECRET);
    this.fields = Object.create(null);
    for (const key of Object.keys(fields)) {
      const type = fields[key];
      if (type === Type.SELF) {
        this.fields[key] = this;
      }
      else if (type instanceof Type !== true) {
        throw new TypeError(`Expected an instance of Type for the field ${key}, but got ${type} instead.`);
      }
    }
    if (parent !== null) {
      for (const key of Object.keys(parent.fields)) {
        const type = parent.fields[key];
        if (key in this.fields) {
          const newtype = this.fields[key];
          if (isSuperTypeOf(type, newtype) !== true) {
            throw new TypeError(`cannot change field ${key} to type ${newtype} since it is not a subclass of ${type}`);
          }
        }
        else {
          this.fields[key] = type;
        }
      }
    }
    Object.freeze(this.fields);
    Object.freeze(this);
  }
  definitionFor(desc) {
    const type = this;
    const valuefields = Object.create(null);
    for (let key in desc) {
      let value = desc[key];
      if (key in type.fields !== true) {
        throw new Error(`Cannot create Value, Type ${type}, does not have a field ${key}`);
      }
      else {
        const fieldtype = type.fields[key];
        if (value instanceof Value !== true) {
          throw new TypeError(`All fields must be Values for type ${type.name}; tried to set a field ${key} of type ${fieldtype.name} to ${value} unsuccessfully`);
        }
        else if (isSuperTypeOf(fieldtype, value.type) !== true) {
          throw new TypeError(`Cannot create Value, field ${key} ${value} is not a ${fieldtype}`);
        }
        valuefields[key] = value;
      }
    }
    for (const key in this.fields) {
      if (key in valuefields !== true) {
        throw new RangeError(`Cannot create Value, Type ${type.name} expected to have a field ${key}`);
      }
    }
    return Object.freeze(valuefields);
  }
  toString() {
    return `<record-type name=${this.name}>`;
  }
}
export class PrimitiveType extends Type {
  static create(desc) {
    return new PrimitiveType(desc, SECRET);
  }
  constructor({
    name = 'Primitive Type',
    check = ALWAYS_PASS
  } = {}, should_be_secret) {
    super({
      name, check
    }, should_be_secret);
    Object.freeze(this);
  }
  definitionFor(desc) {
    return JSON.stringify(desc);
  }
  toString() {
    return `<primitive-type name=${this.name}>`;
  }
}
Object.freeze(PrimitiveType);
export class StubType extends Type {
  static create(desc) {
    return new StubType(desc, SECRET);
  }
  constructor({
    name = 'Stub Type'
  } = {}, should_be_secret) {
    super({
      name, check: IS_UNDEFINED
    }, should_be_secret);
    Object.freeze(this);
  }
  toString() {
    return `<stub-type name=${this.name}>`;
  }
}
Object.freeze(StubType);
export class ListType extends Type {
  static create(desc) {
    return new ListType(desc, SECRET);
  }
  constructor({
    name = 'List Type',
    check = ALWAYS_PASS,
    type = null
  } = {}) {
    if (type instanceof Type !== true) {
      throw new Error(`Cannot create ListType from ${type}, it is not a Type`);
    }
    if (typeof check !== 'function') {
      throw new TypeError(`Type.check() must be a function not ${check} with a typeof ${typeof check}`);
    }
    super({
      name,
      check: (v) => {
        if (Array.isArray(v) !== true) {
          throw new TypeError(`List Type ${name} must be initialized with an Array, not ${v}`);
        }
        const bad_values = v.filter(i => i instanceof type !== true);
        if (bad_values.length) {
          throw new TypeError(`List Type ${name} cannot have values that are not of type ${type}, got ${bad_values}`);
        }
        return check(v);
      }
    }, SECRET);
    this.type = type;
    Object.freeze(this);
  }
  definitionFor(desc) {
    const items = [...desc];
    const type = this.type;
    for (const item of items) {
      if (item instanceof type !== true) {
        throw new Error(`Cannot create definition for ${this.name}, all items must be of type ${type.name}; but encountered ${item}`);
      }
    }
    return Object.freeze(items);
  }
  toString() {
    return `<list-type name=${this.name}>`;
  }
}
Object.freeze(ListType);
