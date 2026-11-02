# Astral Rift Alpha 5.3.1 — Samurai Animation Loader Fix

- GLTFLoader нь GLB-ийн ясны нэрний цэгийг доогуур зураас болгон хувиргах үед ч яснуудыг олдог болгосон (`arm_stretch.r` → `arm_stretch_r`).
- Controller бүрэн шалгагдахаас өмнө дүрийг scene-д нэмэхгүй, ингэснээр алдаа гарвал T-pose дүр харагдахгүй.
- Samurai зогссон үед T-pose руу шууд буцахгүйн тулд жинхэнэ Run clip-ийн маш бага жинтэй нэг агшин ашигласан (тусдаа Idle animation байхгүй).
- Initialization алдааны шалтгааныг тоглоомын дэлгэц дээр харуулах болгосон.
- Хот, Saruul NPC, joystick, quest, combat, asset-ууд болон 56 ястай Samurai GLB өөрчлөгдөөгүй.

## Тест
Синтакс, rig нэрийн хувиргалтын smoke test, GLB node/animation integrity шалгалтыг давах ёстой. Гар утас дээрх бодит ажиллагаа тусдаа шалгах шаардлагатай.

## Түгээлт
Samurai asset лицензийн нөхцөлийг өмнөх Alpha 5.3 баримт бичгээс үзнэ үү. Олон нийтэд raw asset тараахад зохиогчийн тусгай зөвшөөрөл шаардагдаж болно.
