/** Alpha 5.6 — camera clipping guard, applied AFTER the camera smoothing step.
 * Prevents the interpolated camera from passing through a wall when a player turns.
 */
export function createCameraGuard56(THREE, obstacleMeshes) {
  const ray=new THREE.Raycaster();
  const direction=new THREE.Vector3();
  function visibleInHierarchy(obj) {
    for(let parent=obj;parent;parent=parent.parent)if(parent.visible===false)return false;
    return true;
  }
  function resolve(target,cameraPosition) {
    direction.copy(cameraPosition).sub(target);
    const length=direction.length();
    if(length<.08)return false;
    direction.multiplyScalar(1/length);
    ray.set(target,direction);
    ray.near=.28;
    ray.far=length;
    const visible=obstacleMeshes.filter(o=>visibleInHierarchy(o)&&(!o.material?.transparent||o.material.opacity>=.95));
    const intersections=ray.intersectObjects(visible,false);
    if(!intersections.length)return false;
    const safe=Math.min(length,Math.max(.72,intersections[0].distance-.40));
    cameraPosition.copy(target).addScaledVector(direction,safe);
    return true;
  }
  return {resolve};
}
