/** Alpha 6.4.4 — visual-only HUD accessibility preferences. */
export const HUD_SIZES644=Object.freeze(['compact','normal','large']);
export function normalizeHud644(value){return HUD_SIZES644.includes(value)?value:'normal';}
export function applyHud644(root,size){const value=normalizeHud644(size);root.dataset.hudSize644=value;return value;}
export function hudSettingsHtml644(size='normal'){
 return '<section class="ar644-settings"><p>HUD болон mobile товчлууруудын хэмжээ</p><div role="group" aria-label="HUD хэмжээ">'+HUD_SIZES644.map(id=>'<button type="button" data-hud644="'+id+'" aria-pressed="'+(id===normalizeHud644(size))+'">'+({compact:'Жижиг',normal:'Энгийн',large:'Том'}[id])+'</button>').join('')+'</div><small>Зөвхөн дэлгэцийн хэмжээ өөрчлөгдөнө. Тулаан, хадгалсан эд зүйлсэд нөлөөлөхгүй.</small></section>';
}
