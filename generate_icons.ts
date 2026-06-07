import { Jimp } from "jimp";
import path from "path";
import fs from "fs";

async function generateIcons() {
  console.log("[OposiCAT Icon Generator] Generant les icones PNG oficials per al PWA...");
  const publicDir = path.join(process.cwd(), "public");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const icon192Path = path.join(publicDir, "icon-192.png");
  const icon512Path = path.join(publicDir, "icon-512.png");

  try {
    // Escollim un color de fons blau fosc eleganta l'estil d'OposiCAT i cos de mossos
    // Per evitar tindre fons trencats, creem una imatge buida
    // En Jimp v1.x canem amb constructor o mètode simple: new Jimp({ width, height, color })
    // El color és un format hexadecimal d'RGBA (per exemple groc or o blau fosc #00274d = 0x00274dff)
    const image512 = new Jimp({
      width: 512,
      height: 512,
      color: 0x00274dff
    });

    // Farem un cercle o vora daurada/or per donar sensació d'escut acadèmic
    // Com que no volem complicacions amb fonts de sistema, dibuixem una estrella o disseny retro
    // O podem directament escriure a la imatge neta de 512
    await image512.write(icon512Path);
    console.log("[OposiCAT Icon Generator] Icona 512px completada.");

    // Generem la de 192px clonant i canviant mida
    const image192 = image512.clone();
    image192.resize({ w: 192, h: 192 });
    await image192.write(icon192Path);
    console.log("[OposiCAT Icon Generator] Icona 192px completada.");

    console.log("[OposiCAT Icon Generator] Totes les icones PNG s'han generat amb èxit.");
  } catch (error) {
    console.error("[OposiCAT Icon Generator] Error generant icones:", error);
  }
}

generateIcons();
