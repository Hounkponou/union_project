/**
 * Mariage Ella & Emmanuel — Pont entre le Google Sheet des réponses et les pages
 * invitation.html / scanner.html (lecture par ID + pointage), sans serveur.
 *
 * INSTALLATION (une seule fois) :
 *  1. Ouvre le Google Sheet lié à ton formulaire (les réponses).
 *  2. Dans la 1re ligne, AJOUTE ces colonnes (à droite de celles du formulaire) :
 *        ID | Places | Table | Catégorie | Pointé | Heure pointage | Lien invitation
 *  3. Menu « Extensions » → « Apps Script », colle TOUT ce fichier, enregistre (💾).
 *  4. RECHARGE le Google Sheet (F5). Un menu « 💍 Mariage » apparaît en haut.
 *  5. Menu « 💍 Mariage » → « Diagnostic » : vérifie que la colonne ID est bien détectée.
 *  6. Menu « 💍 Mariage » → « Attribuer les IDs » (autorise l'accès la 1re fois).
 *  7. Menu « 💍 Mariage » → « Générer les liens » (remplit « Lien invitation »).
 *  8. « Déployer » → « Nouveau déploiement » → « Application Web »
 *        Exécuter en tant que : Moi  —  Qui a accès : Tout le monde
 *     Copie l'URL en /exec et transmets-la (elle va dans invitation.html et scanner.html).
 */

// ===== CONFIG =====
// URL du déploiement du DOSSIER invitation/ (projet Vercel séparé). À compléter après déploiement.
var INVITATION_URL = "https://wedding-emmanuel-ella.vercel.app";
var SHEET_NAME = ""; // "" = 1re feuille. Sinon : nom exact de l'onglet des réponses.
var LIST_TOKEN = "ee-2026-staff"; // jeton de l'entrée « liste » (scanner hors-ligne). NE PAS partager aux invités.
var COL = {          // libellés cherchés (exact d'abord, sinon « contient »), insensible à la casse
  nom: "nom",
  present: "serez-vous",
  id: "id",
  places: "places",
  table: "table",
  categorie: "catég",
  pointe: "pointé",
  heure: "heure pointage",
  lien: "lien invitation",
  telecharger: "télécharger"
};

/** Menu dédié dans le Sheet (apparaît après rechargement de la page). */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("💍 Mariage")
    .addItem("Diagnostic", "diagnostic")
    .addSeparator()
    .addItem("Attribuer les IDs", "attribuerIDs")
    .addItem("Générer les liens", "genererLiens")
    .addToUi();
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}
function idx_(headers, label) {
  label = String(label).toLowerCase().trim();
  for (var i = 0; i < headers.length; i++)                               // 1) correspondance exacte
    if (String(headers[i]).toLowerCase().trim() === label) return i;
  for (var j = 0; j < headers.length; j++)                               // 2) sinon « contient »
    if (String(headers[j]).toLowerCase().indexOf(label) > -1) return j;
  return -1;
}

/** Affiche la feuille utilisée, les en-têtes, et les colonnes détectées. */
function diagnostic() {
  var sh = getSheet_(), headers = sh.getDataRange().getValues()[0];
  var msg = "Feuille utilisée : « " + sh.getName() + " »\n\nColonnes (ligne 1) :\n";
  for (var i = 0; i < headers.length; i++) msg += "  " + (i + 1) + ". " + headers[i] + "\n";
  msg += "\nDétection :\n";
  ["id", "nom", "places", "table", "categorie", "pointe", "heure", "lien"].forEach(function (k) {
    var i = idx_(headers, COL[k]);
    msg += "  • " + k + " → " + (i > -1 ? "col " + (i + 1) + " (« " + headers[i] + " »)" : "⚠️ INTROUVABLE") + "\n";
  });
  SpreadsheetApp.getUi().alert(msg);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var out;
  try {
    if (p.action === "list") out = listGuests_(p.token);
    else if (!p.id) out = { ok: false, error: "missing id" };
    else if (p.action === "checkin") out = checkin_(p.id);
    else out = readGuest_(p.id);
  } catch (err) { out = { ok: false, error: String(err) }; }
  var json = JSON.stringify(out);
  if (p.callback)
    return ContentService.createTextOutput(p.callback + "(" + json + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/** Liste de tous les invités (pour le scanner hors-ligne). Protégée par jeton. */
function listGuests_(token) {
  if (String(token) !== LIST_TOKEN) return { ok: false, error: "unauthorized" };
  var sh = getSheet_(), data = sh.getDataRange().getValues(), h = data[0];
  var iId = idx_(h, COL.id), iNom = idx_(h, COL.nom), iPl = idx_(h, COL.places),
      iTab = idx_(h, COL.table), iCat = idx_(h, COL.categorie), iPr = idx_(h, COL.present), iPt = idx_(h, COL.pointe);
  var list = [];
  for (var r = 1; r < data.length; r++) {
    var id = iId > -1 ? String(data[r][iId]).trim() : "";
    if (!id) continue;
    list.push({
      id: id, nom: iNom > -1 ? data[r][iNom] : "", places: iPl > -1 ? data[r][iPl] : "",
      table: iTab > -1 ? data[r][iTab] : "", categorie: iCat > -1 ? data[r][iCat] : "",
      present: iPr > -1 ? data[r][iPr] : "", pointe: iPt > -1 ? String(data[r][iPt]).trim() !== "" : false
    });
  }
  return { ok: true, count: list.length, guests: list };
}

function findRow_(sh, iId, id) {
  var data = sh.getDataRange().getValues();
  for (var r = 1; r < data.length; r++)
    if (String(data[r][iId]).trim() === String(id).trim())
      return { row: r + 1, values: data[r], headers: data[0] };
  return null;
}
function readGuest_(id) {
  var sh = getSheet_(), headers = sh.getDataRange().getValues()[0];
  var iId = idx_(headers, COL.id);
  if (iId < 0) return { ok: false, error: "no ID column" };
  var f = findRow_(sh, iId, id);
  if (!f) return { ok: false };
  var g = function (l) { var i = idx_(f.headers, l); return i > -1 ? f.values[i] : ""; };
  return { ok: true, id: id, nom: g(COL.nom), places: g(COL.places), table: g(COL.table),
    categorie: g(COL.categorie), present: g(COL.present), pointe: g(COL.pointe) };
}
function checkin_(id) {
  var sh = getSheet_(), headers = sh.getDataRange().getValues()[0];
  var iId = idx_(headers, COL.id);
  var f = findRow_(sh, iId, id);
  if (!f) return { ok: false };
  var g = function (l) { var i = idx_(f.headers, l); return i > -1 ? f.values[i] : ""; };
  var iP = idx_(f.headers, COL.pointe), iH = idx_(f.headers, COL.heure);
  var already = iP > -1 && String(f.values[iP]).trim() !== "";
  if (iP > -1 && !already) {
    sh.getRange(f.row, iP + 1).setValue("Oui");
    if (iH > -1) sh.getRange(f.row, iH + 1).setValue(new Date());
  }
  return { ok: true, id: id, nom: g(COL.nom), table: g(COL.table),
    categorie: g(COL.categorie), places: g(COL.places), already: already };
}

/** Attribue un ID (INV-001…) aux lignes qui n'en ont pas. */
function attribuerIDs() {
  var sh = getSheet_(), data = sh.getDataRange().getValues(), headers = data[0];
  var iId = idx_(headers, COL.id);
  if (iId < 0) { SpreadsheetApp.getUi().alert("⚠️ Colonne « ID » introuvable.\nAjoute-la dans la 1re ligne, puis relance.\n(Utilise « Diagnostic » pour voir les colonnes détectées.)"); return; }
  var n = 0;
  for (var r = 1; r < data.length; r++)
    if (String(data[r][iId]).trim() === "") {
      sh.getRange(r + 1, iId + 1).setValue("INV-" + ("000" + r).slice(-3)); n++;
    }
  SpreadsheetApp.getUi().alert(n + " identifiant(s) attribué(s) dans la colonne « " + headers[iId] + " ».");
}

/**
 * Remplit « Lien invitation » pour chaque invité ayant un ID.
 * Les infos (nom, places, table, catégorie) sont ENCODÉES DANS LE LIEN : la carte
 * s'affiche alors instantanément, SANS appel au serveur — donc fiable partout
 * (réseau faible, navigateur intégré WhatsApp/Messenger…). L'ID reste dans le lien
 * pour le QR de pointage et comme repli de lecture live.
 */
function genererLiens() {
  var sh = getSheet_(), data = sh.getDataRange().getValues(), headers = data[0];
  var iId = idx_(headers, COL.id), iLien = idx_(headers, COL.lien), iDl = idx_(headers, COL.telecharger);
  var iNom = idx_(headers, COL.nom), iTable = idx_(headers, COL.table),
      iPlaces = idx_(headers, COL.places), iCat = idx_(headers, COL.categorie);
  if (iId < 0 || iLien < 0) { SpreadsheetApp.getUi().alert("⚠️ Colonnes « ID » et « Lien invitation » requises (vois « Diagnostic »)."); return; }
  function add(q, cle, i, r) {
    if (i > -1) { var v = String(data[r][i]).trim(); if (v) q += "&" + cle + "=" + encodeURIComponent(v); }
    return q;
  }
  var n = 0;
  for (var r = 1; r < data.length; r++) {
    var id = String(data[r][iId]).trim();
    if (id) {
      var q = "/?id=" + encodeURIComponent(id);
      q = add(q, "nom", iNom, r);
      q = add(q, "places", iPlaces, r);
      q = add(q, "table", iTable, r);
      q = add(q, "cat", iCat, r);
      sh.getRange(r + 1, iLien + 1).setValue(INVITATION_URL + q);
      if (iDl > -1) sh.getRange(r + 1, iDl + 1).setValue(INVITATION_URL + q + "&dl=1");
      n++;
    }
  }
  SpreadsheetApp.getUi().alert(n + " lien(s) généré(s)" + (iDl > -1 ? " (+ liens de téléchargement)" : "") + ".");
}
