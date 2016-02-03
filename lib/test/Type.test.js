import {
  Type,
  PrimitiveType,
  StubType,
  ListType,
  RecordType
} from '../Type.js';
import {expect} from 'chai';
describe('Type', ()=> {
  it('should not be publicly extensible', ()=>{
    expect(()=>{
      class SubType extends Type {};
      new SubType();
    }).to.throw(Error);
  });
});
describe('RecordType.create', ()=> {
  it('should have sane defaults', ()=>{
    const type = RecordType.create();
    expect(type).to.be.an.instanceof(RecordType);
    expect(type).to.be.an.instanceof(Type);
    expect(type).to.not.be.an.instanceof(StubType);
    expect(type).to.not.be.an.instanceof(ListType);
    expect(type).to.not.be.an.instanceof(PrimitiveType);
    expect(type.name).to.equal('Record Type');
    expect(Object.isFrozen(type)).to.equal(true);
    expect(Object.isFrozen(type.fields)).to.equal(true);
    expect(Object.keys(type.fields)).to.deep.equal([]);
  });
  it('should support parent types', ()=>{
    expect(() => RecordType.create({parent:Type})).to.throw(TypeError);
    expect(() => RecordType.create({parent:RecordType})).to.throw(TypeError);
    const parent = RecordType.create();
    const child = RecordType.create({parent});
  });
  it('should should allow for self referential types', ()=>{
    const type = RecordType.create({fields:{self:Type.SELF}});
    expect(type.fields.self).to.equal(type);
  });
});
describe('ListType.create', ()=> {
  const type = RecordType.create();
  it('should require a type', ()=>{
    expect(()=>{ListType.create()}).to.throw(Error);
    const list = ListType.create({type});
    expect(list.type).to.equal(type);
  });
  it('should have sane defaults', ()=>{
    const list = ListType.create({type});
    expect(list).to.be.an.instanceof(ListType);
    expect(list).to.be.an.instanceof(Type);
    expect(list).to.not.be.an.instanceof(StubType);
    expect(list).to.not.be.an.instanceof(RecordType);
    expect(list).to.not.be.an.instanceof(PrimitiveType);
    expect(list.name).to.equal('List Type');
    expect(Object.isFrozen(list)).to.equal(true);
  });
});
describe('StubType.create', ()=> {
  it('should have sane defaults', ()=>{
    const type = StubType.create({});
    expect(type).to.be.an.instanceof(StubType);
    expect(type).to.be.an.instanceof(Type);
    expect(type).to.not.be.an.instanceof(ListType);
    expect(type).to.not.be.an.instanceof(RecordType);
    expect(type).to.not.be.an.instanceof(PrimitiveType);
    expect(type.name).to.equal('Stub Type');
    expect(Object.isFrozen(type)).to.equal(true);
  });
});
describe('PrimitiveType.create', ()=> {
  it('should have sane defaults', ()=>{
    const type = PrimitiveType.create({});
    expect(type).to.be.an.instanceof(PrimitiveType);
    expect(type).to.be.an.instanceof(Type);
    expect(type).to.not.be.an.instanceof(ListType);
    expect(type).to.not.be.an.instanceof(RecordType);
    expect(type).to.not.be.an.instanceof(StubType);
    expect(type.name).to.equal('Primitive Type');
    expect(Object.isFrozen(type)).to.equal(true);
  });
});