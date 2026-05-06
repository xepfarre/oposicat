import { seccioA } from './contingut/seccioA';
import { seccioB } from './contingut/seccioB';
import { seccioC } from './contingut/seccioC';

// Fitxer d'entrada principal per als continguts (Arquitectura Lego)
// Centralitzem totes les seccions aquí per exportar-les de forma unificada.

export const CONTINGUT_TEMARI_TEXTS: Record<string, Record<string, Record<string, string>>> = {
  "A": seccioA,
  "B": seccioB,
  "C": seccioC
};
