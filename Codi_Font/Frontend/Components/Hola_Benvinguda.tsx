import { motion } from "motion/react";

/**
 * Aquest component és l'encarregat de pintar només el missatge de benvinguda.
 * Si algun dia volem canviar el text o l'animació de benvinguda, només haurem de tocar aquí.
 */
export default function Hola_Benvinguda() {
  return (
    <motion.h1 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-6xl font-bold tracking-tight text-blue-600"
      id="text-benvinguda"
    >
      Hola
    </motion.h1>
  );
}
