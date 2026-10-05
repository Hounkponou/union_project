/**
 * Mariage Ella & Emmanuel — Pont entre le Google Sheet des réponses et les pages
 * invitation.html / scanner.html (lecture par ID + pointage), sans serveur.
 *
 * INSTALLATION (une seule fois) :
 *  1. Ouvre le Google Sheet lié à ton formulaire (les réponses).
 *  2. Dans la 1re ligne, AJOUTE ces colonnes (à droite de celles du formulaire) :
 *        ID | Places | Table | Catégorie | Pointé | Heure pointage | Lien invitation
 *  3. Menu « Extensions » → « Apps Script », colle TOUT ce fichier, enregistre.
 *  4. Lance la fonction « attribuerIDs » (menu ▶) et autorise l'accès → remplit les ID (INV-001…).
 *  5. (Option) Lance « genererLiens » → remplit la colonne « Lien invitation ».
 *  6. « Déployer » → « Nouveau déploiement » → type « Application Web »
 *        Exécuter en tant que : Moi  —  Qui a accès : Tout le monde
 *     Copie l'URL qui se termine par /exec et transmets-la (elle va dans invitation.html et scanner.html).
 */

// ===== CONFIG =====
var SITE_URL = "https://save-the-date-one-orcin.vercel.app"; // base du site (pour générer les liens)
var SHEET_NAME = ""; // "" = 1re feuille (réponses). Sinon mets le nom exact de l'onglet.
var COL = {            // correspondance partielle, insensible à la casse
  nom: "nom",
  present: "serez-vous",
  id: "id",
  places: "places",
  table: "table",
  categorie: "catég",
  pointe: "pointé",
  heure: "heure pointage",
  lien: "lien invitation"
};

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}
function idx_(headers, label) {
  label = String(label).toLowerCase();
  for (var i = 0; i < headers.length; i++)
    if (String(headers[i]).toLowerCase().indexOf(label) > -1) return i;
  return -1;
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var out;
  try {
    if (!p.id) out = { ok: false, error: "missing id" };
    else if (p.action === "checkin") out = checkin_(p.id);
    else out = readGuest_(p.id);
  } catch (err) { out = { ok: false, error: String(err) }; }

  var json = JSON.stringify(out);
  if (p.callback)  // JSONP (évite les soucis CORS)
    return ContentService.createTextOutput(p.callback + "(" + json + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
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
  var g = function (label) { var i = idx_(f.headers, label); return i > -1 ? f.values[i] : ""; };
  return {
    ok: true, id: id, nom: g(COL.nom), places: g(COL.places),
    table: g(COL.table), categorie: g(COL.categorie),
    present: g(COL.present), pointe: g(COL.pointe)
  };
}

function checkin_(id) {
  var sh = getSheet_(), headers = sh.getDataRange().getValues()[0];
  var iId = idx_(headers, COL.id);
  var f = findRow_(sh, iId, id);
  if (!f) return { ok: false };
  var g = function (label) { var i = idx_(f.headers, label); return i > -1 ? f.values[i] : ""; };
  var iP = idx_(f.headers, COL.pointe), iH = idx_(f.headers, COL.heure);
  var already = iP > -1 && String(f.values[iP]).trim() !== "";
  if (iP > -1 && !already) {
    sh.getRange(f.row, iP + 1).setValue("Oui");
    if (iH > -1) sh.getRange(f.row, iH + 1).setValue(new Date());
  }
  return {
    ok: true, id: id, nom: g(COL.nom), table: g(COL.table),
    categorie: g(COL.categorie), places: g(COL.places), already: already
  };
}

/** À lancer UNE FOIS : attribue un ID (INV-001…) aux lignes qui n'en ont pas. */
function attribuerIDs() {
  var sh = getSheet_(), data = sh.getDataRange().getValues(), headers = data[0];
  var iId = idx_(headers, COL.id);
  if (iId < 0) throw new Error("Ajoute d'abord une colonne « ID » dans la 1re ligne.");
  var n = 0;
  for (var r = 1; r < data.length; r++)
    if (String(data[r][iId]).trim() === "") {
      sh.getRange(r + 1, iId + 1).setValue("INV-" + ("000" + r).slice(-3)); n++;
    }
  SpreadsheetApp.getUi().alert(n + " identifiant(s) attribué(s).");
}

/** (Option) Remplit la colonne « Lien invitation » pour chaque invité. */
function genererLiens() {
  var sh = getSheet_(), data = sh.getDataRange().getValues(), headers = data[0];
  var iId = idx_(headers, COL.id), iLien = idx_(headers, COL.lien);
  if (iId < 0 || iLien < 0) throw new Error("Colonnes « ID » et « Lien invitation » requises.");
  for (var r = 1; r < data.length; r++) {
    var id = String(data[r][iId]).trim();
    if (id) sh.getRange(r + 1, iLien + 1).setValue(SITE_URL + "/invitation.html?id=" + id);
  }
  SpreadsheetApp.getUi().alert("Liens générés.");
}
