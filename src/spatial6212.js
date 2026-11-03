/**
 * Astral Rift 6.2.12 — spatial hash for nearby enemy discovery.
 * Ported/adapted from NJ-MMO SpatialHash (MIT, copyright 2026 Waldemar Neto).
 * See THIRD_PARTY_LICENSES_NJ.md.
 */
export class SpatialHash6212{
  constructor(cellSize=16){
    if(!(Number.isFinite(cellSize)&&cellSize>0))throw new RangeError('cellSize must be positive');
    this.size=cellSize;
    this.positions=new Map();
    this.buckets=new Map();
  }
  key(x,z){return `${Math.floor(x/this.size)},${Math.floor(z/this.size)}`;}
  set(id,x,z){
    if(!Number.isFinite(x)||!Number.isFinite(z))return false;
    const nextKey=this.key(x,z),prev=this.positions.get(id);
    if(prev&&prev.key!==nextKey){
      const oldBucket=this.buckets.get(prev.key);
      oldBucket?.delete(id);
      if(oldBucket?.size===0)this.buckets.delete(prev.key);
    }
    if(!this.buckets.has(nextKey))this.buckets.set(nextKey,new Set());
    this.buckets.get(nextKey).add(id);
    this.positions.set(id,{x,z,key:nextKey});
    return true;
  }
  delete(id){
    const prev=this.positions.get(id);
    if(!prev)return false;
    const b=this.buckets.get(prev.key);
    b?.delete(id);
    if(b?.size===0)this.buckets.delete(prev.key);
    this.positions.delete(id);
    return true;
  }
  queryRadius(x,z,r){
    if(!Number.isFinite(x)||!Number.isFinite(z)||!(r>=0))return [];
    const size=this.size,minX=Math.floor((x-r)/size),maxX=Math.floor((x+r)/size);
    const minZ=Math.floor((z-r)/size),maxZ=Math.floor((z+r)/size),r2=r*r;
    const matches=[];
    for(let ix=minX;ix<=maxX;ix++)for(let iz=minZ;iz<=maxZ;iz++){
      const bucket=this.buckets.get(`${ix},${iz}`);
      if(!bucket)continue;
      for(const id of bucket){
        const p=this.positions.get(id);
        if(!p)continue;
        const dx=p.x-x,dz=p.z-z;
        if(dx*dx+dz*dz<=r2)matches.push(id);
      }
    }
    return matches;
  }
}
