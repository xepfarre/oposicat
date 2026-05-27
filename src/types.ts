/**
 * DEFINICIÓ DE TIPUS PER A OPOSICAT
 * 
 * En aquest fitxer definim exactament com s'han d'estructurar les dades que corren per la nostra aplicació.
 * Això serveix com a "contracte" perquè tant la pantalla que veu l'usuari com la base de dades utilitzin el mateix idioma.
 */

// Format d'un perfil d'estudiant (usuari) a la col·lecció principal de la Base de Dades Firestore.
// Aquest document de fitxa és semipúblic o accesible per altres mòduls, per tant NO conté dades privades de facturació.
export interface PerfilUsuari {
  uid: string;            // L'identificador únic que li dóna Firebase Auth (la clau d'estudiant)
  email: string;          // El correu electrònic de l'usuari
  displayName: string;    // El nom complet, nom públic o sobrenom de l'opositor
  photoURL?: string;       // Una adreça on està guardada la seva foto de perfil (si n'hi ha)
  rol: 'opositor' | 'admin'; // El rang d'accés que té (opositor estàndard o administrador del backoffice)
  
  // Seguiment de l'estat del pagament de l'aplicació (Accessible per a control)
  haPagat: boolean;       // Ens diu de forma immediata si l'usuari ha pagat l'accés o no
  estatSubscripcio: 'activa' | 'caducada' | 'pendent_de_pagament'; // Estat detallat d'aquesta subscripció
  
  // Dades de control temporal i seguretat bàsica
  creatEl: any;           // Data exacta de quan es va crear el compte (un "timestamp" de la base de dades)
  ultimAccesEl?: any;     // Data exacta de l'última vegada que va obrir l'aplicació (per saber si és actiu)
  correuVerificat: boolean; // Control de seguretat per saber si ha confirmat la seva adreça d'email
  idSessioActiva?: string; // Control de dispositiu únic: ID de la sessió del darrer dispositiu que ha entrat
}

// Format de les Dades Sensibles i Facturació de l'estudiant.
// Arquitectura "Lego" de Seguretat de 2 nivells: per estricta privacitat i protecció de dades (RGPD),
// aquestes dades es guarden a la subcol·lecció absolutament privada "privat/dades_sensibles" dins del document de l'usuari.
// Només el propi opositor quan estigui autenticat i els administradors podran accedir-hi.
export interface DadesSensiblesUsuari {
  uid: string;                       // L'identificador únic de l'usuari per lligar amb el compte principal
  nomCompletFacturacio?: string;     // Nom real i oficial per a les factures
  cognomsFacturacio?: string;        // Cognoms real i oficial per a les factures
  dniFacturacio?: string;            // DNI, NIE o Passaport numèric per poder facturar correctament
  telefonContacte?: string;          // Telèfon de contacte privat per incidències de pagament
  adrecaPostal?: string;             // Adreça postal del domicili de l'opositor (per a la factura)
  codiPostal?: string;               // Codi postal de la localitat
  provincia?: string;                // Província d'on és l'opositor
  facturaSol·licitada: boolean;      // Control si vol rebre factura automàtica en PDF per correu
  registreIpOriginal?: string;       // IP de registre purament si cal per auditories de seguretat d'admissions
  actualitzatEl?: any;               // Última data de canvi de dades
}
