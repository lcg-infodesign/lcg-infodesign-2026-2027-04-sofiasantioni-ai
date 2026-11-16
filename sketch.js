let data;

// Massimi globali per rendere tutti i glifi comparabili sulla stessa scala
let maxLength = 0;
let maxArea = 0;
let maxDischarge = 0;
let maxTributaries = 0;

// Palette colori per continente
let continentColors = {
  "Africa": "#E07A5F",
  "South America": "#2A9D8F",
  "Asia": "#E9A825",
  "North America": "#457B9D",
  "Europe": "#6D597A",
  "Australia": "#D65A31",
  "Oceania": "#3D9970"
};

let backgroundColor = '#F5F5F5';
let cardBgColor = '#FFFFFF';
let textColor = '#222222';
let mutedColor = '#666666';

// Layout
let margin = 32;
let headerHeight = 195;
let gutter = 16;
let cardHeight = 135;

// Interazione
let hoveredId = null;
let hovered = false;

async function setup() {
  data = await loadTable("assets/rivers.csv", ",", "header");

  // Calcola i massimi globali del dataset
  for (let r = 0; r < data.getRowCount(); r++) {
    let l = float(data.getString(r, "length")) || 0;
    let a = float(data.getString(r, "area")) || 0;
    let d = float(data.getString(r, "discharge")) || 0;
    let t = float(data.getString(r, "tributaries")) || 0;

    if (l > maxLength) maxLength = l;
    if (a > maxArea) maxArea = a;
    if (d > maxDischarge) maxDischarge = d;
    if (t > maxTributaries) maxTributaries = t;
  }

  let cols = getColumnsCount();
  let rows = ceil(data.getRowCount() / cols);
  let totalHeight = headerHeight + rows * (cardHeight + gutter) + margin * 2;

  createCanvas(windowWidth, max(windowHeight, totalHeight));
  textFont("sans-serif");
}

function getColumnsCount() {
  if (width > 1300) return 5;
  if (width > 960) return 4;
  if (width > 640) return 3;
  return 2;
}

function windowResized() {
  let cols = getColumnsCount();
  let rows = ceil(data.getRowCount() / cols);
  let totalHeight = headerHeight + rows * (cardHeight + gutter) + margin * 2;
  resizeCanvas(windowWidth, max(windowHeight, totalHeight));
}

function draw() {
  background(backgroundColor);
  hovered = false;
  hoveredId = null;

  drawHeaderAndLegend();

  let cols = getColumnsCount();
  let availableWidth = width - margin * 2 - gutter * (cols - 1);
  let cardWidth = availableWidth / cols;

  for (let r = 0; r < data.getRowCount(); r++) {
    let colIndex = r % cols;
    let rowIndex = floor(r / cols);

    let x = margin + colIndex * (cardWidth + gutter);
    let y = headerHeight + rowIndex * (cardHeight + gutter);

    let id = data.getString(r, "id");
    let riverName = data.getString(r, "name");
    let continent = data.getString(r, "continent");
    let lengthVal = float(data.getString(r, "length")) || 0;
    let areaVal = float(data.getString(r, "area")) || 0;
    let dischargeVal = float(data.getString(r, "discharge")) || 0;
    let tribVal = float(data.getString(r, "tributaries")) || 0;

    let isOver =
      mouseX >= x &&
      mouseX <= x + cardWidth &&
      mouseY >= y &&
      mouseY <= y + cardHeight;

    if (isOver) {
      hovered = true;
      hoveredId = id;
    }

    drawRiverCard(x, y, cardWidth, cardHeight, id, riverName, continent, lengthVal, areaVal, dischargeVal, tribVal, isOver);
  }

  cursor(hovered ? HAND : ARROW);
}

function drawHeaderAndLegend() {
  noStroke();
  fill(textColor);
  textAlign(LEFT, TOP);
  textSize(22);
  textStyle(BOLD);
  text("Atlante dei 100 Fiumi Principali", margin, 24);

  textStyle(NORMAL);
  textSize(13);
  fill(mutedColor);
  

  // --- LEGENDA VISIVA DEL GLIFO ---
  let legY = 82;
  let sampleX = margin;
  let sampleY = legY + 18;
  let sampleColor = "#457B9D";

  // Disegna glifo campione nella legenda
  fill(color(69, 123, 157, 45));
  noStroke();
  rect(sampleX, sampleY - 12, 65, 24, 3);

  stroke(sampleColor);
  strokeWeight(4);
  line(sampleX, sampleY, sampleX + 65, sampleY);

  strokeWeight(1.5);
  line(sampleX + 18, sampleY, sampleX + 10, sampleY - 10);
  line(sampleX + 36, sampleY, sampleX + 28, sampleY + 10);
  line(sampleX + 52, sampleY, sampleX + 44, sampleY - 10);

  // Testi esplicativi decodifica
  noStroke();
  fill(textColor);
  textSize(12);
  textStyle(BOLD);
  text("Come leggere il glifo:", sampleX + 80, legY);

  textStyle(NORMAL);
  fill(mutedColor);
  text("• Lunghezza asta = Lunghezza (km)      • Spessore asta = Portata (m³/s)      • Fascia chiara = Bacino idrografico (km²)      • Rami = Affluenti", sampleX + 80, legY + 18);

  // --- LEGENDA CONTINENTI ---
  let contY = 136;
  let cx = margin;
  fill(textColor);
  textStyle(BOLD);
  text("Continente:", cx, contY);
  cx += 82;

  textStyle(NORMAL);
  let keys = Object.keys(continentColors);
  for (let i = 0; i < keys.length; i++) {
    let cName = keys[i];
    let colHex = continentColors[cName];

    fill(colHex);
    noStroke();
    circle(cx + 6, contY + 7, 10);

    fill(mutedColor);
    text(cName, cx + 16, contY);
    cx += textWidth(cName) + 34;
  }

  // Linea separatrice
  stroke(220);
  strokeWeight(1);
  line(margin, headerHeight - 16, width - margin, headerHeight - 16);
}

function drawRiverCard(x, y, w, h, id, riverName, continent, lengthVal, areaVal, dischargeVal, tribVal, isHovered) {
  let colHex = continentColors[continent] || "#66A9ED";
  let c = color(colHex);

  // Sfondo card
  fill(cardBgColor);
  stroke(isHovered ? colHex : 230);
  strokeWeight(isHovered ? 2 : 1);
  rect(x, y, w, h, 6);

  // Nome del fiume (troncato se troppo lungo)
  noStroke();
  fill(textColor);
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  let shortName = riverName.split("–")[0]; // Prende il nome principale prima di eventuali trattini lunghi
  if (shortName.length > 22) shortName = shortName.substring(0, 20) + "…";
  text(shortName, x + 12, y + 10);

  // Continente e lunghezza
  textStyle(NORMAL);
  textSize(11);
  fill(mutedColor);
  text(continent + " • " + nf(round(lengthVal), 0, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " km", x + 12, y + 28);

  // Area disegno glifo
  let gx = x + 14;
  let maxGlyphW = w - 28;
  let centerY = y + 86;
  let maxBandH = 44;

  // Calcolo dimensioni proporzionali
  let gLen = map(lengthVal, 0, maxLength, 10, maxGlyphW);
  let gAreaH = map(sqrt(areaVal), 0, sqrt(maxArea), 6, maxBandH);
  let gThickness = map(sqrt(dischargeVal), 0, sqrt(maxDischarge), 1.5, 9);
  let numBranches = constrain(round(map(sqrt(tribVal), 0, sqrt(maxTributaries), 1, 7)), 1, 7);

  // 1. Fascia del bacino idrografico (area)
  fill(red(c), green(c), blue(c), 40);
  noStroke();
  rect(gx, centerY - gAreaH / 2, gLen, gAreaH, 3);

  // 2. Rami affluenti (tributaries)
  stroke(c);
  strokeWeight(1.2);
  for (let i = 0; i < numBranches; i++) {
    let bx = gx + ((i + 1) / (numBranches + 1)) * gLen;
    let dir = i % 2 === 0 ? -1 : 1;
    let branchLen = min(12, gAreaH * 0.45);
    line(bx, centerY, bx - branchLen * 0.6, centerY + dir * branchLen);
  }

  // 3. Asta principale (length + discharge)
  stroke(c);
  strokeWeight(gThickness);
  strokeCap(ROUND);
  line(gx, centerY, gx + gLen, centerY);
  strokeCap(SQUARE);
}

function mousePressed() {
  if (hovered && hoveredId !== null) {
    window.location.href = "detail.html?river=" + encodeURIComponent(hoveredId);
  }
}