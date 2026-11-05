/** Pure AI decision model: optional integration with existing enemy update loop. */
export function enemyDecision66({distance=Infinity,hp=100,maxHp=100,alertRadius=14,attackRadius=2.6,retreatAt=.2,boss=false}={}){
 if(!Number.isFinite(distance)||distance<0)return 'idle';
 if(hp<=0)return 'dead';
 if(!boss&&maxHp>0&&hp/maxHp<retreatAt&&distance<alertRadius)return 'retreat';
 if(distance<=attackRadius)return 'attack';
 if(distance<=alertRadius)return 'chase';
 return 'patrol';
}
export function bossPhase66(hp,maxHp){if(maxHp<=0||hp<=0)return 0;return hp/maxHp<=.25?3:hp/maxHp<=.6?2:1;}
