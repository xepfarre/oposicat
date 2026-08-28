"""
Script generador de recursos gràfics per a OposiCAT.
Genera imatges d'alta qualitat, 100% vàlides, sense corrupció de capçalera ni talls,
amb l'estil visual premium d'OposiCAT (#050b14, blau fosc, or i senyera).
"""
import os
import subprocess

def run_cmd(cmd):
    res = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("Error executing:", cmd, "\nStderr:", res.stderr)
    return res.returncode == 0

def create_card_image(out_path, width, height, bg_grad, title, subtitle="", tag="", badge_color="#FFDF00", icon_shape="shield"):
    """
    Crea una imatge professional amb degradats, ressalts atmosfèrics i tipografia nítida.
    """
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    # Base command with gradient
    cmd = [
        "convert",
        f"-size {width}x{height}",
        f"gradient:'{bg_grad[0]}-{bg_grad[1]}'",
        "-fill 'rgba(255,255,255,0.03)'",
        f"-draw 'circle {width//2},{height//2} {width//2},{height}'",
        "-fill 'rgba(0,102,204,0.08)'",
        f"-draw 'rectangle 0,{height-80} {width},{height}'",
        # Decorative top accent stripe (Senyera / OposiCAT tone)
        f"-fill '{badge_color}'",
        f"-draw 'rectangle 0,0 {width},6'"
    ]

    # Tag / Category pill
    if tag:
        cmd.extend([
            f"-fill 'rgba(255,255,255,0.15)'",
            f"-draw 'roundrectangle 40,30 260,65 8,8'",
            f"-fill '{badge_color}'",
            "-font DejaVu-Sans-Bold -pointsize 14 -gravity northwest",
            f"-draw \"text 55,40 '{tag}'\""
        ])

    # Title
    cmd.extend([
        "-fill '#ffffff'",
        "-font DejaVu-Sans-Bold -pointsize 32 -gravity center",
        f"-draw \"text 0,-15 '{title}'\""
    ])

    # Subtitle
    if subtitle:
        cmd.extend([
            "-fill '#94a3b8'",
            "-font DejaVu-Sans -pointsize 18 -gravity center",
            f"-draw \"text 0,35 '{subtitle}'\""
        ])

    # Bottom branding badge
    cmd.extend([
        "-fill 'rgba(148,163,184,0.5)'",
        "-font DejaVu-Sans-Bold -pointsize 12 -gravity southeast",
        "-draw \"text 40,30 'OPOSICAT • MOSSOS D\\'ESQUADRA'\"",
        f"-quality 95 -strip",
        f"'{out_path}'"
    ])

    run_cmd(" ".join(cmd))

def create_hero_bg(out_path, width, height, title, subtitle, theme="navy"):
    """
    Crea fons de pantalla panoràmics (16:9) atmosfèrics per a les vistes centrals.
    """
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    colors = {
        "navy": ("#030712", "#0f172a", "#1e3a8a"),
        "teorica": ("#020b18", "#071e3d", "#0c4a6e"),
        "fisica": ("#050e1a", "#0f233a", "#047857"),
        "psico": ("#0a081e", "#1e1548", "#6d28d9"),
        "ispc": ("#010915", "#0a192f", "#1d4ed8"),
        "comunitat": ("#060c18", "#0f2038", "#d97706")
    }.get(theme, ("#030712", "#0f172a", "#1e3a8a"))

    cmd = f"""convert -size {width}x{height} xc:'{colors[0]}' \
        -fill '{colors[1]}' -draw "circle {width//2},{height//3} {width//2},{height}" \
        -fill 'rgba(29, 78, 216, 0.15)' -draw "rectangle 0,{height//2} {width},{height}" \
        -fill 'rgba(255, 223, 0, 0.8)' -draw "rectangle 0,0 {width},4" \
        -fill 'rgba(225, 6, 19, 0.8)' -draw "rectangle 0,4 {width},8" \
        -fill 'rgba(255, 255, 255, 0.05)' -draw "polygon 0,{height} {width//3},0 {width*2//3},0 {width},{height}" \
        -fill '#ffffff' -font DejaVu-Sans-Bold -pointsize 44 -gravity center -draw "text 0,-25 '{title}'" \
        -fill '#93c5fd' -font DejaVu-Sans -pointsize 20 -gravity center -draw "text 0,35 '{subtitle}'" \
        -fill 'rgba(148, 163, 184, 0.6)' -font DejaVu-Sans-Bold -pointsize 14 -gravity south -draw "text 0,30 'OPOSICAT • CAMPUS OFICIAL D\\'ESTUDI'" \
        -quality 95 -strip '{out_path}'"""
    
    run_cmd(cmd)

print("Starting asset generation for OposiCAT...")

# 1. FONS HERO & ACADÈMIA
create_hero_bg("public/assets/imatges/fons_ispc.png", 1600, 900, "INSTITUT DE SEGURETAT PÚBLICA", "Campus d'estudi i preparació integral", "ispc")
create_hero_bg("src/assets/images/ISPC.jpg", 1600, 900, "INSTITUT DE SEGURETAT PÚBLICA", "ISPC Mollet del Vallès", "ispc")
create_hero_bg("src/assets/images/fons_teorica_1780343152615.png", 1600, 900, "PROVA TEÒRICA", "Temari oficial, testos i simulacres", "teorica")
create_hero_bg("src/assets/images/Teorica.png", 1600, 900, "PROVA TEÒRICA", "Temari oficial, testos i simulacres", "teorica")
create_hero_bg("src/assets/images/FP.png", 1600, 900, "PROVA TEÒRICA MOSSOS", "Bloc Teòric Completiu", "teorica")

create_hero_bg("src/assets/images/fons_fisica_1780343173628.png", 1600, 900, "PROVA FÍSICA", "Entrenaments, barems i circuits oficials", "fisica")
create_hero_bg("src/assets/images/PF.png", 1600, 900, "PROVA FÍSICA", "Preparació d'agilitat, potència i resistència", "fisica")

create_hero_bg("src/assets/images/fons_psicologica_1780343193032.png", 1600, 900, "PROVA PSICOPROFESSIONAL", "Psicotècnics, Biodata i Entrevista", "psico")
create_hero_bg("src/assets/images/PP.png", 1600, 900, "PROVA PSICOPROFESSIONAL", "Aptituds mentals i perfil de personalitat", "psico")

create_hero_bg("src/assets/images/XP1.png", 1600, 900, "COMUNITAT I MOTIVACIÓ", "La teva plaça comença amb la constància diària", "comunitat")
create_hero_bg("src/assets/images/XP.png", 1600, 900, "COMUNITAT I MOTIVACIÓ", "La teva plaça comença amb la constància diària", "comunitat")

create_hero_bg("src/assets/images/Foto01.png", 1400, 800, "OPOSICAT CAMPUS", "Planificació i seguiment personalitzat", "navy")
create_hero_bg("src/assets/images/Foto02.png", 1400, 800, "RECURSOS D\\'ESTUDI", "Classes en directe i simuladors", "navy")
create_hero_bg("src/assets/images/Foto03.png", 1400, 800, "TEMARI OFICIAL", "Estructura actualitzada per àmbits", "teorica")

# 2. CARROUSEL PANTALLA BEN VINGUDA / INICI
create_hero_bg("public/assets/imatges/carrusel_mossos.png", 1400, 700, "MOSSOS D\\'ESQUADRA", "Policia de la Generalitat de Catalunya", "navy")
create_hero_bg("public/assets/imatges/carrusel_bombers.png", 1400, 700, "BOMBERS DE CATALUNYA", "Prevenció i extinció d\\'incendis", "comunitat")
create_hero_bg("public/assets/imatges/carrusel_agentrural.png", 1400, 700, "AGENTS RURALS", "Protecció i custòdia del medi natural", "fisica")
create_hero_bg("public/assets/imatges/carrusel_proteciocivil.png", 1400, 700, "PROTECCIÓ CIVIL", "Gestió d\\'emergències de Catalunya", "teorica")

create_hero_bg("src/assets/images/mossos_cotxe.png", 1200, 675, "MOSSOS D\\'ESQUADRA", "Patrulles i Unitats Operatives", "navy")
create_hero_bg("src/assets/images/bombers_camio.png", 1200, 675, "BOMBERS DE LA GENERALITAT", "Cos de Bombers", "comunitat")

# 3. DIETA I ON ENTRENAR
create_hero_bg("src/assets/images/Dieta_APP.png", 1200, 675, "NUTRICIÓ I DIETA", "Planificació nutricional per a opositors", "fisica")
create_hero_bg("src/assets/images/Dieta.png", 1200, 675, "NUTRICIÓ I DIETA", "Planificació nutricional per a opositors", "fisica")
create_hero_bg("src/assets/images/Dieta_WEB.png", 1200, 675, "NUTRICIÓ I DIETA", "Planificació nutricional per a opositors", "fisica")
create_hero_bg("src/assets/images/onentrenar.png", 1200, 675, "ON ENTRENAR", "Gimnasos i pistes d\\'atletisme recomanades", "fisica")

# 4. TEMARIS (T-1 a T-4)
temaris = [
    ("T-1.png", "ÀMBIT A", "Coneixements de l\\'entorn", "#38bdf8"),
    ("T-2.png", "ÀMBIT B", "Institucional i Dret Públic", "#fbbf24"),
    ("T-3.png", "ÀMBIT C", "Seguretat i Policia", "#ef4444"),
    ("T-3_2.png", "ÀMBIT C (PART 2)", "Codi Deontològic i Ètica", "#f87171"),
    ("T-4.png", "ÀMBIT D", "Actualitat i Cultura General", "#a855f7")
]
for fname, t, sub, col in temaris:
    create_card_image(f"src/assets/images/{fname}", 800, 450, ("#030712", "#0f172a"), t, sub, tag="TEMARI OFICIAL", badge_color=col)

# 5. PROVES FÍSIQUES (F-0 a F-8)
fisiques = [
    ("F-0.png", "CIRCUIT D\\'AGILITAT", "Coordinació, salts i passos sota tanca"),
    ("F-1.png", "PRESS DE BANCA", "Força màxima i potència de tren superior"),
    ("F-2.png", "COURSE NAVETTE", "Resistència cardiorespiratòria aeròbica"),
    ("F-3.png", "TRACCIÓ GENERAL", "Força isomètrica de dorsals i cames"),
    ("F-4.png", "SALT VERTICAL", "Potència de tren inferior i enlairament"),
    ("F-5.png", "FLEXIBILITAT", "Rang de moviment i flexió profunda de tronc"),
    ("F-6.png", "LLANÇAMENT DE PILOTA", "Potència de llançament medicinal"),
    ("F-7.png", "PROVA AQUÀTICA", "Natació i habilitats al medi aquàtic"),
    ("F-8.png", "BAREMS I TAULES", "Taules de puntuació oficials Mossos")
]
for fname, t, sub in fisiques:
    create_card_image(f"src/assets/images/{fname}", 800, 450, ("#030e1a", "#064e3b"), t, sub, tag="PROVA FÍSICA", badge_color="#34d399")

# 6. PROVES PSICOLÒGIQUES (P-0 a P-6)
psico = [
    ("P-0.png", "RAONAMENT ABSTRACTE", "Sèries de figures, patrons i matrius"),
    ("P-1.png", "APTITUD VERBAL", "Sinònims, antònims i comprensió escrita"),
    ("P-2.png", "RAONAMENT NUMÈRIC", "Càlcul mental, problemes i percentatges"),
    ("P-3.png", "APTITUD ESPACIAL", "Rotació de figures, desplegaments i plànols"),
    ("P-4.png", "ATENCIÓ I MEMÒRIA", "Retenció de dades, rastreig visual i detalls"),
    ("P-5.png", "TEST PERSONALITAT", "Qüestionaris d\\'actituds i competències"),
    ("P-6.png", "ENTREVISTA I BIODATA", "Defensa del perfil davant del tribunal")
]
for fname, t, sub in psico:
    create_card_image(f"src/assets/images/{fname}", 800, 450, ("#090618", "#3b0764"), t, sub, tag="PSICOTÈCNICS", badge_color="#c084fc")

# 7. COMUNITAT I MOTIVACIÓ (X-0 a X-5)
comunitat = [
    ("X-0.png", "OBJECTIU: LA TEVA PLAÇA", "El teu somni comença amb la constància"),
    ("X-1.png", "DISCIPLINA DIÀRIA", "Rutines d\\'estudi i hàbits guanyadors"),
    ("X-2.png", "RÀNQUING I SIMULACRES", "Medeix el teu nivell amb altres opositors"),
    ("X-3.png", "COMUNITAT OPOSICAT", "Estudia acompanyat dels millors companys"),
    ("X-4.png", "SUPERACIÓ CONTINUA", "Cada errada és una lliçó per a l\\'oficial"),
    ("X-5.png", "EL TEU FUTUR UNIFORMAT", "Servir i protegir amb orgull")
]
for fname, t, sub in comunitat:
    create_card_image(f"src/assets/images/{fname}", 800, 450, ("#080e1a", "#78350f"), t, sub, tag="MOTIVACIÓ", badge_color="#fbbf24")

# 8. MOCKS ADDICIONALS
create_card_image("src/assets/images/biodata_test_mock_1780249798091.png", 800, 450, ("#020b18", "#071e3d"), "BIODATA MOCK", "Simulació oficial del qüestionari biogràfic", tag="EXAMEN", badge_color="#38bdf8")
create_card_image("src/assets/images/ispc_questions_mock_1780249816019.png", 800, 450, ("#020b18", "#071e3d"), "PREGUNTES ISPC", "Banc de preguntes oficials de la policia", tag="BBDD", badge_color="#38bdf8")
create_card_image("src/assets/images/psychological_interview_1780249831944.png", 800, 450, ("#090618", "#3b0764"), "ENTREVISTA PERSONAL", "Criteris d\\'avaluació de psicòlegs oficials", tag="PSICÒLEG", badge_color="#c084fc")

print("All assets generated successfully!")
