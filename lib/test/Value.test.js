import {Value} from '../Value.js';
import {PrimitiveType} from '../Type.js';
import chai,{expect} from 'chai';
import spies from 'chai-spies';

chai.use(spies);

describe('Value', ()=> {
  it('should not be publicly extensible', ()=>{
    expect(()=>{
      class SubValue extends Value {};
      new SubValue();
    }).to.throw(Error);
  });
});
describe('Value.for', ()=> {
  const $Number = PrimitiveType.create({
    check(v) {return typeof v === 'number';}
  });
  it('should require a type', ()=>{
    expect(()=>Value.for()).to.throw(Error);
  });
  it('should allow constraints', ()=>{
    const even = Value.for($Number);
    const check = chai.spy(d => d % 2 === 0);
    even.constrain(check);
    even.define(2);
    expect(check).to.be.called.exactly(1);
    expect(() => even.constrain(d => d % 2 === 1)).to.throw(Error);
  });
  it('should throw errors when constraints fail', ()=>{
    const even = Value.for($Number);
    const check = chai.spy(d => d % 2 === 1);
    even.constrain(check);
    expect(() => even.define(2)).to.throw(Error);
    expect(check).to.be.called.exactly(1);
  });
  it('should make definitions available with .then', (done)=>{
    const num = Value.for($Number);
    const value = Symbol();
    num.then((v) => {
      try {
        expect(v).to.equal(value);
      }
      catch (e) {
        return done(e);
      }
      done();
    })
    num.define(value);
  });
});