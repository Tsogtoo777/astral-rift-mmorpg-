/** Astral Rift 6.2.11: low-cost 2D footprint and camera obstruction.
 * A collider is registered ONLY for an object actually drawn (or a known solid castle).
 * World coordinates, metres; all probes are deterministic and frame-rate independent.
 */
export function makeWorldCollision6211(initial=[]){
  const solids=[];
  function add(c){
    if(!c || !Number.isFinite(c.x) || !Number.isFinite(c.z) || !(c.r>0 || (c.w>0&&c.d>0)))return false;
    solids.push({name:c.name||'prop',type:c.type||((c.r>0)?'circle':'box'),x:c.x,z:c.z,
      r:c.r||0,w:c.w||0,d:c.d||0,yMin:c.yMin??0,yMax:c.yMax??5,angle:c.angle||0});
    return true;
  }
  initial.forEach(add);
  function overlaps(c,x,z,padding){
    const dx=x-c.x,dz=z-c.z;
    if(c.type==='circle')return dx*dx+dz*dz<(c.r+padding)**2;
    const ca=Math.cos(c.angle),sa=Math.sin(c.angle);
    const u=dx*ca+dz*sa,v=-dx*sa+dz*ca;
    return Math.abs(u)<c.w/2+padding&&Math.abs(v)<c.d/2+padding;
  }
  function blocked(x,z,r=.36){
    for(const c of solids)if(overlaps(c,x,z,r))return true;
    return false;
  }
  // Sweep the actual player position along a movement segment. Calling this
  // from the existing moveSafely09 (which subdivides movement) prevents tunnelling.
  function move(x,z,dx,dz,r=.36){
    const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));let xx=x,zz=z;
    for(let i=0;i<count;i++){
      const sx=dx/count,sz=dz/count;
      if(!blocked(xx+sx,zz,r))xx+=sx;
      if(!blocked(xx,zz+sz,r))zz+=sz;
    }
    return {x:xx,z:zz};
  }
  // Wall / tree trunk camera clipping. Approximate the first collision along
  // the desired camera ray and move camera forward, preserving its pitch.
  function resolveCamera(target,desired){
    const dx=desired.x-target.x,dz=desired.z-target.z,dy=desired.y-target.y;
    const len2=dx*dx+dz*dz;if(len2<1e-7)return false;
    let first=1;
    for(const c of solids){
      // AABB for boxes is an inexpensive conservative camera approximation;
      // player collision still uses the exact rotated footprint above.
      const radius=c.type==='circle'?c.r:Math.hypot(c.w,c.d)/2;
      const vx=target.x-c.x,vz=target.z-c.z;
      const a=len2,b=2*(vx*dx+vz*dz),cc=vx*vx+vz*vz-(radius+.15)**2;
      const disc=b*b-4*a*cc;if(disc<0)continue;
      const t=(-b-Math.sqrt(disc))/(2*a);
      if(t<.025||t>=first)continue;
      const y=target.y+dy*t;
      if(y<c.yMin-.1||y>c.yMax+.15)continue;
      first=t;
    }
    if(first===1)return false;
    const t=Math.max(.15,first-.075);
    desired.set(target.x+dx*t,target.y+dy*t,target.z+dz*t);
    return true;
  }
  return {solids,add,blocked,move,resolveCamera};
}
