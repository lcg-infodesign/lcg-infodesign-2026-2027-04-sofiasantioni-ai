let backgroundColor = '#F5F5F5';
let cardBgColor = '#FFFFFF';
let textColor = '#222222';
let mutedColor = '#666666';

let continentColors = {
  "Africa": "#E07A5F",
  "South America": "#2A9D8F",
  "Asia": "#E9A825",
  "North America": "#457B9D",
  "Europe": "#6D597A",
  "Australia": "#D65A31",
  "Oceania": "#3D9970"
};

let data;
let selectedRiverId;
let riverRow = null;

// Massimi globali per la scala comparabile
let maxLength = 0;
let maxArea = 0;
let maxDischarge = 0;
let maxTributaries = 0;

let backBtn = { x: 32, y: 24, w: 190, h: 36 };

async function setup() {
  data = await loadTable("assets/rivers.csv", ",", "header");

  let params = getURLParams();
  selectedRiverId = params.river ? decodeURIComponent(params.river) : null;

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

  if (selectedRiverId) {
    riverRow = data.findRow(selectedRiverId, "id");
  }

  createCanvas(windowWidth, max(windowHeight, 720));
  textFont("sans-serif");
}

function windowResized() {
  resizeCanvas(windowWidth, max(windowHeight, 720));
}

function draw() {
  background(backgroundColor);
  drawBackButton();

  if (!riverRow) {
    fill(textColor);
    textAlign(LEFT, TOP);
    textSize(18);
    text("Fiume non trovato (ID: " + (selectedRiverId || "nessuno") + "). Torna alla vista d'insieme.", 32, 90);
    return;
  }

  // Estrai tutte le 12 colonne della riga selezionata
  let id = riverRow.getString("id");
  let riverName = riverRow.getString("name");
  let countries = riverRow.getString("countries");
  let outflow = riverRow.getString("outflow");
  let continent = riverRow.getString("continent");
  let lengthVal = float(riverRow.getString("length")) || 0;
  let areaVal = float(riverRow.getString("area")) || 0;
  let dischargeVal = float(riverRow.getString("discharge")) || 0;
  let tribVal = float(riverRow.getString("tributaries")) || 0;
  let minTemp = float(riverRow.getString("min_temp"));
  let maxTemp = float(riverRow.getString("max_temp"));
  let avgTemp = float(riverRow.getString("avg_temp"));

  let accentHex = continentColors[continent] || "#66A9ED";

  // 1. Intestazione Fiume
  let startY = 78;
  fill(textColor);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(26);
  textStyle(BOLD);
  text(riverName, 32, startY, width - 64);

  textStyle(NORMAL);
  textSize(13);
  fill(mutedColor);
  text("ID #" + id + "  •  Continente: " + continent + "  •  Foce: " + outflow, 32, startY + 38);
  text("Paesi attraversati: " + countries, 32, startY + 58, width - 64);

  // Layout a 2 colonne sotto l'intestazione
  let contentY = startY + 95;
  let isWide = width > 820;
  let leftW = isWide ? min(400, width * 0.42) : width - 64;
  let leftH = 380;

  // Box Sinistro: Glifo comparabile + Dati + Barra Temperatura
  drawGlyphAndTempBox(32, contentY, leftW, leftH, accentHex, lengthVal, areaVal, dischargeVal, tribVal, minTemp, maxTemp, avgTemp);

  // Box Destro: Rappresentazione unitaria della portata (Pallini)
  let rightX = isWide ? 32 + leftW + 24 : 32;
  let rightY = isWide ? contentY : contentY + leftH + 24;
  let rightW = isWide ? width - rightX - 32 : width - 64;
  let rightH = isWide ? leftH : 320;

  drawDischargeDotsBox(rightX, rightY, rightW, rightH, accentHex, dischargeVal);
}

function drawBackButton() {
  let isOver =
    mouseX >= backBtn.x &&
    mouseX <= backBtn.x + backBtn.w &&
    mouseY >= backBtn.y &&
    mouseY <= backBtn.y + backBtn.h;

  fill(isOver ? "#222222" : cardBgColor);
  stroke("#222222");
  strokeWeight(1.5);
  rect(backBtn.x, backBtn.y, backBtn.w, backBtn.h, 6);

  noStroke();
  fill(isOver ? "#FFFFFF" : textColor);
  textAlign(CENTER, CENTER);
  textSize(13);
  textStyle(BOLD);
  text("← Vista d'insieme", backBtn.x + backBtn.w / 2, backBtn.y + backBtn.h / 2);

  cursor(isOver ? HAND : ARROW);
}

function drawGlyphAndTempBox(x, y, w, h, accentHex, lengthVal, areaVal, dischargeVal, tribVal, minTemp, maxTemp, avgTemp) {
  let c = color(accentHex);

  fill(cardBgColor);
  stroke(225);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(textColor);
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text("Glifo Comparabile (scala globale)", x + 18, y + 16);

  // Area disegno glifo con sfondo riferimento massimo
  let gx = x + 20;
  let gy = y + 48;
  let maxGlyphW = w - 40;
  let maxBandH = 76;
  let centerY = gy + maxBandH / 2;

  fill(245);
  noStroke();
  rect(gx, gy, maxGlyphW, maxBandH, 4);

  let gLen = map(lengthVal, 0, maxLength, 12, maxGlyphW);
  let gAreaH = map(sqrt(areaVal), 0, sqrt(maxArea), 8, maxBandH);
  let gThickness = map(sqrt(dischargeVal), 0, sqrt(maxDischarge), 2, 12);
  let numBranches = constrain(round(map(sqrt(tribVal), 0, sqrt(maxTributaries), 1, 8)), 1, 8);

  // Fascia bacino
  fill(red(c), green(c), blue(c), 45);
  rect(gx, centerY - gAreaH / 2, gLen, gAreaH, 3);

  // Affluenti
  stroke(c);
  strokeWeight(1.5);
  for (let i = 0; i < numBranches; i++) {
    let bx = gx + ((i + 1) / (numBranches + 1)) * gLen;
    let dir = i % 2 === 0 ? -1 : 1;
    let branchLen = min(18, gAreaH * 0.45);
    line(bx, centerY, bx - branchLen * 0.6, centerY + dir * branchLen);
  }

  // Asta principale
  stroke(c);
  strokeWeight(gThickness);
  strokeCap(ROUND);
  line(gx, centerY, gx + gLen, centerY);
  strokeCap(SQUARE);

  // Elenco metriche numeriche
  noStroke();
  fill(textColor);
  textSize(12);
  textStyle(NORMAL);
  let ty = gy + maxBandH + 16;
  text("• Lunghezza: " + formatNum(lengthVal) + " km", x + 18, ty);
  text("• Bacino idrografico: " + formatNum(areaVal) + " km²", x + 18, ty + 20);
  text("• Portata media: " + formatNum(dischargeVal) + " m³/s", x + 18, ty + 40);
  text("• Numero affluenti: " + formatNum(tribVal), x + 18, ty + 60);

  // --- ESCURSIONE TERMICA (min_temp, avg_temp, max_temp) ---
  let tempY = ty + 94;
  fill(textColor);
  textStyle(BOLD);
  text("Escursione termica del bacino (°C)", x + 18, tempY);

  let barX = x + 18;
  let barY = tempY + 24;
  let barW = w - 36;
  let barH = 12;

  // Scala fissa da -25°C a +35°C per confrontare tutti i fiumi
  fill(238);
  noStroke();
  rect(barX, barY, barW, barH, 6);

  // Tacca 0°C
  let zeroX = map(0, -25, 35, barX, barX + barW);
  stroke(180);
  strokeWeight(1);
  line(zeroX, barY - 4, zeroX, barY + barH + 4);

  // Intervallo min -> max
  let xMin = map(minTemp, -25, 35, barX, barX + barW);
  let xMax = map(maxTemp, -25, 35, barX, barX + barW);
  let xAvg = map(avgTemp, -25, 35, barX, barX + barW);

  fill(red(c), green(c), blue(c), 120);
  noStroke();
  rect(xMin, barY, max(4, xMax - xMin), barH, 6);

  // Punto temperatura media
  fill(textColor);
  circle(xAvg, barY + barH / 2, 8);

  fill(mutedColor);
  textStyle(NORMAL);
  textSize(11);
  text("Min: " + minTemp + "°C   |   Media: " + avgTemp + "°C   |   Max: " + maxTemp + "°C", barX, barY + 20);
}

function drawDischargeDotsBox(x, y, w, h, accentHex, dischargeVal) {
  let c = color(accentHex);

  fill(cardBgColor);
  stroke(225);
  strokeWeight(1);
  rect(x, y, w, h, 8);

  noStroke();
  fill(textColor);
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text("Portata d'acqua per unità (1 pallino = 1.000 m³/s)", x + 20, y + 16);

  // Legenda pallini
  let legY = y + 42;
  fill(c);
  circle(x + 26, legY + 6, 10);

  fill(mutedColor);
  textStyle(NORMAL);
  textSize(12);
  text("= 1.000 m³/s di portata media alla foce (totale: " + formatNum(dischargeVal) + " m³/s)", x + 38, legY);

  stroke(235);
  line(x + 20, legY + 24, x + w - 20, legY + 24);

  // Almeno 1 pallino anche per i fiumi sotto i 1.000 m³/s (es. Sepik = 101 m³/s)
  let numDots = max(1, round(dischargeVal / 1000));

  let diametro = 11;
  let padding = 5;
  let startX = x + 26;
  let startY = legY + 42;
  let posX = startX;
  let posY = startY;

  noStroke();
  fill(c);

  for (let i = 0; i < numDots; i++) {
    circle(posX, posY, diametro);
    posX += diametro + padding;

    if (posX + diametro / 2 > x + w - 20) {
      posX = startX;
      posY += diametro + padding;
    }
  }
}

function formatNum(n) {
  return nf(round(n), 0, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function mousePressed() {
  if (
    mouseX >= backBtn.x &&
    mouseX <= backBtn.x + backBtn.w &&
    mouseY >= backBtn.y &&
    mouseY <= backBtn.y + backBtn.h
  ) {
    window.location.href = "index.html";
  }
}