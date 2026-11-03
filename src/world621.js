/** Alpha 6.2.1: optional CC0 models published on 3DAssets.dev.
 * The sources are permanent CORS-enabled CDN GLBs, NOT embedded in this ZIP.
 * Use ?worldassets=off to disable. ?worldassets=local after caching models.
 * No runtime backend required; any unavailable model retains old scenery.
 */
export const SOURCES621=Object.freeze({
  houseSmall:{id:'28757',name:'Medieval timber house',url:'https://3dassets.dev/assets/medieval-mmo-starter-realm-timber-house-small-25223f49'},
  houseMedium:{id:'28759',name:'Medieval townhouse',url:'https://3dassets.dev/assets/medieval-mmo-starter-realm-timber-house-medium-81d882c1'},
  cottage:{id:'28762',name:'Thatched cottage',url:'https://3dassets.dev/assets/medieval-mmo-starter-realm-thatched-cottage-3921d162'},
  tavern:{id:'28758',name:'Village tavern',url:'https://3dassets.dev/assets/medieval-mmo-starter-realm-village-tavern-55158e5e'},
  smithy:{id:'28751',name:'Smithy',url:'https://3dassets.dev/assets/medieval-mmo-starter-realm-smithy-c320a869'},
  tower:{id:'28761',name:'Wooden watchtower',url:'https://3dassets.dev/assets/medieval-mmo-starter-realm-watchtower-e7eabfff'},
  oak:{id:'28310',name:'Mature oak',url:'https://3dassets.dev/assets/dense-temperate-forest-flora-oak-mature-7bc940c3'},
  birch:{id:'28318',name:'Silver birch',url:'https://3dassets.dev/assets/dense-temperate-forest-flora-birch-mature-4b795c7d'},
  pine:{id:'28345',name:'Scots pine',url:'https://3dassets.dev/assets/dense-temperate-forest-flora-scots-pine-mature-c2ba1938'},
  rock:{id:'28425',name:'Mossy boulder',url:'https://3dassets.dev/assets/dense-temperate-forest-flora-mossy-boulder-large-a8829872'},
  arch:{id:'37387',name:'Medieval stone arcade',url:'https://3dassets.dev/assets/medieval-monastery-and-scriptorium-chapter-house-bay-6a4c98ec'},
});
export function assetUrl621(key,local=false){
  const v=SOURCES621[key];if(!v)throw Error('Unknown asset '+key);
  return local?`/world621/${key}.glb`:`https://cdn.3dassets.dev/assets/${v.id}/v1/model.glb`;
}
const TOWN_POINTS621=[[-9,10],[-3,14],[5,14],[12,9],[-11,1],[14,0],[-7,-12],[8,-14]];
const HOUSE_KEYS621=['cottage','houseSmall','houseMedium','tavern','houseSmall','smithy','cottage','houseMedium'];
export function layout621(){
  const plants=[],boulders=[];
  // deterministic non-grid patterns; paths left open and town center preserved.
  for(let i=0;i<54;i++){
    const forest=i<31;
    const a=i*2.3999632297;
    const r=forest?19+(i%8)*3.1:24+(i%7)*3.6;
    const x=(forest?-88:0)+Math.cos(a)*r;
    const z=(forest?-69:0)+Math.sin(a)*r;
    if(forest&&Math.abs(x+72)<8&&Math.abs(z+62)<10)continue;
    const key=['oak','birch','pine','oak','pine'][i%5];
    const scale=(key==='oak'?.62:key==='birch'?.66:.62)*(0.84+(i%4)*.075);
    plants.push({key,x,z,scale,angle:(i*.79)%6.283,forest});
  }
  for(let i=0;i<23;i++){
    const a=i*2.3999632297,r=18+(i%7)*3.9;
    const forest=i<14,x=(forest?-88:96)+Math.cos(a)*r,z=(forest?-69:89)+Math.sin(a)*r;
    boulders.push({key:'rock',x,z,scale:.75+(i%4)*.2,angle:a,forest});
  }
  return {plants,boulders};
}
/** Build visuals (not colliders). Async loads are bounded to unique model URLs.
 * Every old object remains visible until its individual replacement succeeds.
 */
export async function installWorld621({THREE,GLTFLoader,scene,world62,legacyTownBuildings621=[],legacyTrees621=[],detail622=false}){
  const query=typeof location!=='undefined'?new URLSearchParams(location.search):new URLSearchParams();
  const mode=query.get('worldassets')||'cdn';
  if(mode==='off')return {mode,loaded:0,failed:0,placements:0,disabled:true};
  const local=mode==='local';
  const loader=new GLTFLoader();
  const root=new THREE.Group();root.name='FreeCC0WorldAssets621';scene.add(root);
  const cached=new Map();const failed=new Set();
  async function fetchModel(key){
    if(!cached.has(key))cached.set(key,loader.loadAsync(assetUrl621(key,local)).then(gltf=>gltf.scene).catch(err=>{
      failed.add(key);console.warn('[World621] Could not load',key,err);return null;
    }));
    return cached.get(key);
  }
  const stats={mode,loaded:0,failed:0,placements:0,trees:0,rocks:0,houses:0};
  function put(base,x,z,scale=1,angle=0){
    if(!base)return false;
    const node=base.clone(true);
    node.position.set(x,0,z);node.rotation.y=angle;node.scale.setScalar(scale);
    node.traverse(child=>{if(child.isMesh){child.castShadow=false;child.receiveShadow=true;}});
    root.add(node);stats.placements++;return true;
  }
  const jobs=[];
  // Replace only the eight primitive house groups; original collision footprints remain.
  for(let i=0;i<TOWN_POINTS621.length;i++)jobs.push((async()=>{
    const base=await fetchModel(HOUSE_KEYS621[i]);
    if(put(base,...TOWN_POINTS621[i],.79,i%2?Math.PI:0)){
      if(legacyTownBuildings621[i])legacyTownBuildings621[i].visible=false;stats.houses++;
    }
  })());
  const {plants,boulders}=layout621();
  for(const plant of (detail622?[]:plants))jobs.push((async()=>{
    const base=await fetchModel(plant.key);
    if(put(base,plant.x,plant.z,plant.scale,plant.angle))stats.trees++;
  })());
  for(const rock of (detail622?[]:boulders))jobs.push((async()=>{
    const base=await fetchModel('rock');
    if(put(base,rock.x,rock.z,rock.scale,rock.angle))stats.rocks++;
  })());
  // Only hide old trees if new model vegetation successfully populated BOTH areas.
  jobs.push((async()=>{
    await Promise.all([fetchModel('oak'),fetchModel('birch'),fetchModel('pine')]);
    // Other placement jobs may run next microtask; wait for them in a follow-up below.
  })());
  for(const [x,z,a] of [[83,-80,0],[107,-47,1.2],[113,-86,-.4]])jobs.push((async()=>{
    const base=await fetchModel('tower');put(base,x,z,.82,a);
  })());
  for(const [x,z,a] of [[94,98,0],[107,88,Math.PI/2],[95,78,Math.PI],[84,89,-Math.PI/2]])jobs.push((async()=>{
    const base=await fetchModel('arch');put(base,x,z,1.1,a);
  })());
  await Promise.allSettled(jobs);
  if(!detail622&&stats.trees>=35){
    legacyTrees621.forEach(o=>o.visible=false);
    world62?.legacyVegetation?.trees?.forEach(o=>o.visible=false);
  }
  if(!detail622&&stats.rocks>=16)world62?.legacyVegetation?.rocks?.forEach(o=>o.visible=false);
  stats.loaded=Array.from(cached.keys()).length-failed.size;
  stats.failed=failed.size;
  if(typeof document!=='undefined'){
    const el=document.createElement('div');el.id='world621-status';el.textContent=`🌲 Орчны загвар: ${stats.loaded}/${cached.size} · ${stats.placements} объект`;
    Object.assign(el.style,{position:'fixed',right:'10px',bottom:'82px',padding:'5px 9px',background:'#15251ac9',color:'#e1f1da',borderRadius:'8px',font:'12px sans-serif',pointerEvents:'none',zIndex:'10'});
    document.body.append(el);setTimeout(()=>el.remove(),6000);
  }
  return stats;
}
