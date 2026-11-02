# Astral Rift Alpha 5.3 — Permanent Samurai Player

## Орсон өөрчлөлт
- SamuraiFreeModel.glb суурьтай 56 ястай шинэ үндсэн тоглогч.
- Оригинал `Samurai_Run` болон `Samurai_DrawSword` гэсэн хоёр жинхэнэ animation ашиглав.
- Run клипийг бага хурдаар тоглуулж алхалт, бүрэн хурдаар гүйлт үзүүлнэ. *Тусдаа Walk клип байхгүй*.
- Илдийг гарын ясанд суулгасан хэвээр байлгаж, гүйх үед алга болдог алдааг clip scale override-аар засах логик нэмсэн.
- Дайрах, блок, бултах хөдөлгөөнийг skeleton-д жижиг procedural overlay-оор холбосон. *Тусдаа 3 цохилтын animation клип байхгүй*.
- Зэвсэг солих үед хөвдөг хуучин илд, нумыг ашиглахгүй, skeleton-д холбогдсон илд болон гар дээр байрлах bow visual ашиглана.
- Хуучин LEGO мешийн үүсгэлт, Rodin rig/loader, хуучин hero болон Rodin GLB файлуудыг цэвэрлэсэн.
- Хот, medieval asset, Saruul NPC, collision, camera, quest, save, multiplayer биш combat, mobile joystick, хоёр зэвсгийн UI-г хадгалсан.

## Чанар ба хязгаарлалт
- GLB бүтцийг шалгасан: 1 skin, 56 joints, 2 animation.
- Node JS синтакс, smoke tests (Alpha4, architecture42, Samurai53), asset integrity шалгалт давсан.
- Vite build болон утасны бодит WebGL runtime test хийгдээгүй (package installation сүлжээнээс болж дуусаагүй).

## Лиценз
Oedo TIME!-ийн файлыг тоглоомд ашиглах, өөрчлөх боломжтой. **Моделийн файлыг тусад нь нийтэд татуулах, дахин түгээхийг зөвшөөрөхгүй.** Нийтэд нээлттэй GitHub/Vercel-д байрлуулахын өмнө эзэмшигчээс зөвшөөрөл авна уу. Нөхцөлийг `third_party/Oedo_TIME_Samurai_TERMS.txt` файлаас уншина уу.
