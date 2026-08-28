const fs = require('fs');

const path = './src/pantalles/admin/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Corregir la capçalera trencada de PlansEntrenamentView i tancar ExercicisFisicsView
const brokenHeaderPart = `                            <button \r\n  /**\r\n  * VIEW: Gestió de Plans d'Entrenament (MODUL DE FITNES & CONTROL DOCENT)`;
const brokenHeaderPartLF = `                            <button \n  /**\n  * VIEW: Gestió de Plans d'Entrenament (MODUL DE FITNES & CONTROL DOCENT)`;

const replacementHeader = `                            <button \n                             onClick={() => onDelete(\`exercicis_fisics/\${ex.id}\`, ex.id)}\n                             className={\`p-2 rounded-lg transition-all shrink-0 \${darkMode ? 'hover:bg-red-500/20 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}\`}\n                           >\n                              <Trash2 size={14} />\n                           </button>\n                        </div>\n                      ))\n                   )}\n              </div>\n           </div>\n        </div>\n      </div>\n    </div>\n  );\n}\n\n/**\n * VIEW: Gestió de Plans d'Entrenament (MODUL DE FITNES & CONTROL DOCENT)`;

if (content.includes(brokenHeaderPart)) {
    content = content.replace(brokenHeaderPart, replacementHeader);
    console.log("Capçalera CRLF corregida correctament.");
} else if (content.includes(brokenHeaderPartLF)) {
    content = content.replace(brokenHeaderPartLF, replacementHeader);
    console.log("Capçalera LF corregida correctament.");
} else {
    // Intentem per substring flexible
    const index = content.indexOf('<button \r\n  /**');
    const indexLF = content.indexOf('<button \n  /**');
    if (index !== -1) {
        console.log("S'ha trobat un patró similar CRLF, reemplaçant...");
        content = content.substring(0, index) + replacementHeader.substring(replacementHeader.indexOf('<button')) + content.substring(index + brokenHeaderPart.length - 28);
    } else if (indexLF !== -1) {
        console.log("S'ha trobat un patró similar LF, reemplaçant...");
        const targetStr = content.substring(indexLF, indexLF + 150);
        console.log("Target trobat: ", targetStr);
    } else {
        console.log("Alerta: No s'ha trobat cap capçalera trencada directament, es farà un reemplaçament per línies de text.");
    }
}

// 2. Netejar residus de codi vell tallat prop de la línia 5860
const brokenResidu = `  );\r\n}\r\n}) return null;\r\n                           return (\r\n                              <div key={exId} className={\`flex items-center gap-3 p-2 rounded-xl \${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'}\`}>\r\n                                 <span className="text-[10px] font-black text-emerald-500 w-4">{idx + 1}</span>\r\n                                 <span className={\`text-[10px] font-bold uppercase truncate \${darkMode ? 'text-slate-400' : 'text-slate-600'}\`}>{ex.nom}</span>\r\n                              </div>\r\n                           );\r\n                        })}\r\n                     </div>\r\n                  </div>\r\n                ))\r\n              )}\r\n           </div>\r\n        </div>\r\n      </div>`;

const brokenResiduLF = `  );\n}\n}) return null;\n                           return (\n                              <div key={exId} className={\`flex items-center gap-3 p-2 rounded-xl \${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'}\`}>\n                                 <span className="text-[10px] font-black text-emerald-500 w-4">{idx + 1}</span>\n                                 <span className={\`text-[10px] font-bold uppercase truncate \${darkMode ? 'text-slate-400' : 'text-slate-600'}\`}>{ex.nom}</span>\n                              </div>\n                           );\n                        })}\n                     </div>\n                  </div>\n                ))\n              )}\n           </div>\n        </div>\n      </div>`;

if (content.includes(brokenResidu)) {
    content = content.replace(brokenResidu, '  );\n}');
    console.log("Residus de codi antic corregits (CRLF).");
} else if (content.includes(brokenResiduLF)) {
    content = content.replace(brokenResiduLF, '  );\n}');
    console.log("Residus de codi antic corregits (LF).");
} else {
    // Cerca dinàmica del residu trencador
    const targetToken = `}) return null;`;
    const targetIdx = content.indexOf(targetToken);
    if (targetIdx !== -1) {
        console.log("S'ha trobat el residu '}) return null;' a la posició", targetIdx);
        // Trobem el final d'aquest residu abans de la línia de "function GimnasosView"
        const nextFunctionIdx = content.indexOf('function GimnasosView', targetIdx);
        if (nextFunctionIdx !== -1) {
            // Reemplacem des de '}) return null;' fins a la línia anterior de 'function GimnasosView'
            const textToReplace = content.substring(targetIdx, nextFunctionIdx);
            content = content.replace(textToReplace, '');
            console.log("Residu dinàmic netejat amb èxit!");
        }
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Procés de correcció quirúrgica acabat amb èxit.");
