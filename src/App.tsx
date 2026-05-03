/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Importem "motion" per poder fer animacions visuals d'entrada i moviment
import { motion } from "motion/react";

/**
 * Funció principal de l'aplicació. 
 * Actualment només mostra una pantalla de benvinguda molt senzilla.
 */
export default function App() {
  return (
    // Creem un contenidor que ocupa tota la pantalla (h-screen)
    // Utilitzem flexbox per centrar el contingut verticalment i horitzontalment (items-center, justify-center)
    // El fons és un gris molt clar (bg-gray-50)
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-gray-900 font-sans">
      
      {/* 
          Fem servir un component animat (motion.h1) per al títol de benvinguda.
          - initial: Comença sent invisible (opacity: 0) i una mica més avall (y: 10).
          - animate: Es fa visible i puja a la seva posició original.
          - transition: Defineix que l'efecte duri 0.8 segons.
      */}
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl font-medium tracking-tight"
        id="welcome-text"
      >
        Hola
      </motion.h1>
      
    </div>
  );
}
