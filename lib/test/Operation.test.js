import {Value} from '../Value.js';
import {PrimitiveType} from '../Type.js';
import {DynamicSSA} from '../SSA.js';
import {StubOperation} from '../Operation.js';
import chai,{expect} from 'chai';
import spies from 'chai-spies';

chai.use(spies);

const $Number = PrimitiveType.create({
  check(v) {return typeof v === 'number';}
});
const $String = PrimitiveType.create({
  check(v) {return typeof v === 'string';}
});
const ONE = Value.for($Number);

describe('StubOperation', ()=> {
  it('should not be publicly extensible', ()=>{
    expect(()=>{
      class SubStubOperation extends StubOperation {};
      new SubStubOperation();
    }).to.throw(Error);
  });
});

describe('StubOperation.create', ()=> {
  it('should require operand and result types', ()=>{
    expect(()=>{
      StubOperation.create();
    }).to.throw(Error);
  });
  it('should check operand and result types', ()=>{
    expect(()=>{
      StubOperation.create({operands:[]});
    }).to.throw(Error);
    expect(()=>{
      StubOperation.create({result:null});
    }).to.throw(Error);
    StubOperation.create({
      operands:[],
      result:null
    });
  });
});

describe('StubOperation.createCallValue', ()=> {
  it('should create null for a null result type', ()=>{
    const result = StubOperation.create({
      operands:[],
      result:null
    }).createCallValue();
    expect(result).to.equal(null);
  });
  it('should create a DynamicSSA for a result type', ()=>{
    const result = StubOperation.create({
      operands:[],
      result:$Number
    }).createCallValue();
    expect(result).to.be.an.instanceof(DynamicSSA);
    expect(result.values[0].type).to.equal($Number);
  });
  it('should verify the operand types', ()=>{
    const operation = StubOperation.create({
      operands:[$Number],
      result:$Number
    });
    expect(()=>operation.createCallValue()).to.throw(RangeError);
    expect(()=>operation.createCallValue(DynamicSSA.for($String))).to.throw(TypeError);
    operation.createCallValue(DynamicSSA.for($Number));
  });
});
