import {Value} from '../Value.js';
import {PrimitiveType} from '../Type.js';
import {AllocationSSA,DynamicSSA,PhiSSA,SSA} from '../SSA.js';
import chai,{expect} from 'chai';
import spies from 'chai-spies';

chai.use(spies);

const $Number = PrimitiveType.create({
  check(v) {return typeof v === 'number';}
});
const ONE = Value.for($Number);
  
describe('SSA', ()=> {
  it('should not be publicly extensible', ()=>{
    expect(()=>{
      class SubSSA extends SSA {};
      new SubSSA();
    }).to.throw(Error);
  });
});
describe('DynamicSSA.for', ()=> {
  it('should use Value.DYNAMIC', (done)=>{
    const dyn = DynamicSSA.for($Number);
    dyn.values[0].then((v)=>{
      expect(v).to.equal(Value.DYNAMIC);
      done();
    });
  });
});
describe('AllocationSSA.for', ()=> {
  it('should check that base is a Value', ()=>{
    expect(()=>AllocationSSA.for(1)).to.throw(Error);
    AllocationSSA.for(ONE);
  });
});
describe('PhiSSA.for', ()=> {
  const ONE_ALLOC = AllocationSSA.for(ONE);
  const TWO_ALLOC = AllocationSSA.for(ONE);
  it('should require a multiple SSAs', ()=>{
    expect(()=>PhiSSA.for(ONE_ALLOC)).to.throw(Error);
    PhiSSA.for(ONE_ALLOC,TWO_ALLOC);
  });
});