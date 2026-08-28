/* ----------------------------------------------------------------------------------------------
   guardian-core.js

   Pure, DOM-free logic extracted from index.html: seed data, migration/merge rules, formatting,
   filtering/sorting, record validation, and export row mapping. No dependency on `document`,
   `window.storage`, or Firebase, so it can be unit tested (Vitest) and reused by index.html as-is.

   Works both as a classic browser <script> (attaches `window.GuardianCore`) and as a CommonJS
   module (`module.exports`) for Node/Vitest — see the UMD wrapper below.
------------------------------------------------------------------------------------------------- */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GuardianCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

/* ---------------------------------------------------------- SEED DATA ---------------------------------------------------------- */
const SEED_PANELS = [{"area": "Lago North", "unitId": 101, "panelName": "Panel Valve H10-1-8", "house": "H10", "ip": null, "type": "Valves", "totalGates": 8, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 102, "panelName": "Panel Valve H10-1-32", "house": "H10", "ip": null, "type": "Valves", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 103, "panelName": "Panel Valve2 H10-2-32", "house": "H10", "ip": null, "type": "Valves", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 104, "panelName": "Panel Curtain H10-3-16", "house": "H10", "ip": null, "type": "Curtains", "totalGates": 16, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 105, "panelName": "Panel Curtain2 H10-4-16", "house": "H10", "ip": null, "type": "Curtains", "totalGates": 16, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 106, "panelName": "Panel Curtain3 H10-5-16", "house": "H10", "ip": null, "type": "Curtains", "totalGates": 16, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 107, "panelName": "Panel H11-Control-16", "house": "H11", "ip": null, "type": "Control", "totalGates": 16, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 108, "panelName": "Panel Valve H11-7-32", "house": "H11", "ip": null, "type": "Valves", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 109, "panelName": "Panel Valve H12-8-32", "house": "H12", "ip": null, "type": "Valves", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 110, "panelName": "Panel Valve2 H12-9-32", "house": "H12", "ip": null, "type": "Valves", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 111, "panelName": "Panel Mixer H12-10-16", "house": "H12", "ip": null, "type": "Mixer", "totalGates": 16, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 112, "panelName": "Control Panel House 9", "house": "H9", "ip": null, "type": "Control", "totalGates": 32, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 113, "panelName": "Panel Irrigation House 5", "house": "H5", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 114, "panelName": "Panel Irrigation House 6", "house": "H6", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 115, "panelName": "Panel Irrigation House 7", "house": "H7", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 116, "panelName": "Curtain Panel H5-H7", "house": "H5-H7", "ip": null, "type": "Curtains", "totalGates": 8, "maxActive": 4, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 117, "panelName": "Panel Irrigation House 8", "house": "H8", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 118, "panelName": "Irrigation Panel House 8", "house": "H8", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 119, "panelName": "Irrigation Panel House 8", "house": "H8", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 120, "panelName": "Control Panel House 8", "house": "H8", "ip": null, "type": "Control", "totalGates": 16, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 121, "panelName": "Curtain Panel H14-H16", "house": "H14-H16", "ip": null, "type": "Curtains", "totalGates": 8, "maxActive": 2, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 122, "panelName": "Panel Irrigation House 14", "house": "H14", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 123, "panelName": "Panel Irrigation House 15", "house": "H15", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 124, "panelName": "Panel Irrigation House 16", "house": "H16", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 125, "panelName": "Panel Irrigation House 17", "house": "H17", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 126, "panelName": "Panel Irrigation House 18", "house": "H18", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 127, "panelName": "Panel Irrigation House 19", "house": "H19", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 128, "panelName": "Control Panel H17-H19", "house": "H17-H19", "ip": null, "type": "Control", "totalGates": 16, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Lago North", "unitId": 129, "panelName": "Panel Irrigation House 17", "house": "H17", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago 2", "unitId": 101, "panelName": "Irrigation Panel H2", "house": "H2", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Lago 2", "unitId": 102, "panelName": "Control Panel", "house": "H2", "ip": null, "type": "Control", "totalGates": 32, "maxActive": 32, "transformer": null, "notes": null}, {"area": "Lago 1", "unitId": 101, "panelName": "Panel Heater MH", "house": "MH", "ip": null, "type": "Heater", "totalGates": 16, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Lago 1", "unitId": 102, "panelName": "Panel Fan South MH", "house": "MH", "ip": null, "type": "Fan", "totalGates": 8, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago 1", "unitId": 103, "panelName": "Panel Fan North MH", "house": "MH", "ip": null, "type": "Fan", "totalGates": 8, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Lago 1", "unitId": 104, "panelName": "Panel Mixer MH 1", "house": "MH", "ip": null, "type": "Mixer", "totalGates": 16, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 101, "panelName": "Irrigation Panel H1 & H2", "house": "H1-H2", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 102, "panelName": "Irrigation Panel H2", "house": "H2", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 103, "panelName": "Irrigation Panel H3", "house": "H3", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 104, "panelName": "Irrigation Panel H3 & H4", "house": "H3-H4", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 105, "panelName": "Irrigation Panel H4", "house": "H4", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 106, "panelName": "Irrigation Panel H5", "house": "H5", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 107, "panelName": "Irrigation Panel H5 & H6", "house": "H5-H6", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 16, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 108, "panelName": "Irrigation Panel H6", "house": "H6", "ip": null, "type": "Irrigation", "totalGates": 8, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 109, "panelName": "Irrigation Panel H7 & H8", "house": "H7-H8", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 110, "panelName": "Irrigation Panel H8", "house": "H8", "ip": null, "type": "Irrigation", "totalGates": 8, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 111, "panelName": "Irrigation Panel H9 & H10", "house": "H9-H10", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 1", "unitId": 112, "panelName": "Irrigation Panel H11 & H12", "house": "H11-H12", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 18, "panelName": "Irrigation Panel H18", "house": "H18", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 19, "panelName": "Irrigation Panel H19", "house": "H19", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 20, "panelName": "Irrigation Panel H20", "house": "H20", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 22, "panelName": "Irrigation Panel H22", "house": "H22", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 41, "panelName": "Irrigation Panel H24-1", "house": "H24", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 42, "panelName": "Irrigation Panel H24-2", "house": "H24", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 43, "panelName": "Irrigation Panel H24-3", "house": "H24", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 51, "panelName": "Irrigation Panel H25-1", "house": "H25", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 52, "panelName": "Irrigation Panel H25-2", "house": "H25", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 53, "panelName": "Irrigation Panel H25-3", "house": "H25", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 61, "panelName": "Irrigation Panel H26-1", "house": "H26", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 62, "panelName": "Irrigation Panel H26-2", "house": "H26", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 63, "panelName": "Irrigation Panel H26-3", "house": "H26", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 71, "panelName": "Irrigation Panel H27-1", "house": "H27", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 2", "unitId": 81, "panelName": "Irrigation Panel H28-1", "house": "H28", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 14, "transformer": null, "notes": null}, {"area": "Cactus Área 3", "unitId": 101, "panelName": "Irrigation Panel H17", "house": "H17", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 3", "unitId": 103, "panelName": "Irrigation Panel H15", "house": "H15", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 3", "unitId": 104, "panelName": "Irrigation Panel H14", "house": "H14", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 3", "unitId": 105, "panelName": "Irrigation Panel H14-2", "house": "H14", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 3", "unitId": 106, "panelName": "Irrigation Panel H13_H29_H30", "house": "H13-H29-H30", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": 5, "transformer": null, "notes": null}, {"area": "Cactus Área 3", "unitId": 107, "panelName": "Irrigation Panel H13_H29_H30-2", "house": "H13-H29-H30", "ip": null, "type": "Irrigation", "totalGates": 8, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 101, "panelName": "Irrigation Panel H28", "house": "H28", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 102, "panelName": "Irrigation Panel H29", "house": "H29", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 103, "panelName": "Irrigation Panel H30", "house": "H30", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 104, "panelName": "Irrigation Panel H31", "house": "H31", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 105, "panelName": "Irrigation Panel H32", "house": "H32", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 106, "panelName": "Irrigation Panel H33", "house": "H33", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 107, "panelName": "Irrigation Panel H34", "house": "H34", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "East Farm", "unitId": 108, "panelName": "Irrigation Panel H35", "house": "H35", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": 5, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 25, "panelName": "Panel 25", "house": "—", "ip": "192.168.1.1", "type": "Control/Irrigation", "totalGates": 16, "maxActive": 16, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 26, "panelName": "Panel 26", "house": "—", "ip": "192.168.1.1", "type": "Control/Irrigation", "totalGates": 16, "maxActive": 16, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 27, "panelName": "Panel 27", "house": "—", "ip": "192.168.1.1", "type": "Control/Irrigation", "totalGates": 8, "maxActive": 8, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 28, "panelName": "Panel 28", "house": "—", "ip": "192.168.1.1", "type": "Irrigation", "totalGates": 32, "maxActive": 6, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 29, "panelName": "Panel 29", "house": "—", "ip": "192.168.1.1", "type": "Irrigation", "totalGates": 32, "maxActive": 6, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 30, "panelName": "Panel 30", "house": "—", "ip": "192.168.1.1", "type": "Irrigation", "totalGates": 32, "maxActive": 6, "transformer": null, "notes": null}, {"area": "20 Acres", "unitId": 31, "panelName": "Panel 31", "house": "—", "ip": "192.168.1.1", "type": "Irrigation", "totalGates": 32, "maxActive": 6, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 1, "panelName": "Panel 245", "house": "—", "ip": "192.168.1.245", "type": "Irrigation", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 11, "panelName": "Panel 247", "house": "—", "ip": "192.168.1.150", "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 12, "panelName": "Panel 246", "house": "—", "ip": "192.168.1.246", "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 15, "panelName": "Panel 244", "house": "—", "ip": "10.240.90.251", "type": "Irrigation", "totalGates": 32, "maxActive": 8, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 16, "panelName": "Fan-House1", "house": "—", "ip": null, "type": "Fan", "totalGates": 8, "maxActive": null, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 17, "panelName": "Fan-House2", "house": "—", "ip": null, "type": "Fan", "totalGates": 8, "maxActive": null, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 18, "panelName": "Fan-House3", "house": "—", "ip": null, "type": "Fan", "totalGates": 16, "maxActive": null, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 20, "panelName": "Fan-House4", "house": "—", "ip": null, "type": "Fan", "totalGates": 8, "maxActive": null, "transformer": null, "notes": null}, {"area": "Geerlings", "unitId": 30, "panelName": "House5", "house": "—", "ip": "10.240.90.251", "type": "Control/Fan", "totalGates": 8, "maxActive": null, "transformer": null, "notes": null}, {"area": "Premier 1", "unitId": 10, "panelName": "Panel 10", "house": "H107", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "19 salidas usadas"}, {"area": "Premier 1", "unitId": 11, "panelName": "Panel 11", "house": "H108", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "19 salidas usadas"}, {"area": "Premier 1", "unitId": 12, "panelName": "Panel 12", "house": "H109", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "19 salidas usadas"}, {"area": "Premier 1", "unitId": 13, "panelName": "Panel 13", "house": "H110", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "19 salidas usadas"}, {"area": "Premier 1", "unitId": 14, "panelName": "Panel 14", "house": "H111", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "19 salidas usadas"}, {"area": "Premier 1", "unitId": 15, "panelName": "Panel 15", "house": "H112", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "19 salidas usadas"}, {"area": "Premier 1", "unitId": null, "panelName": "Panel", "house": "H113", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "no power"}, {"area": "Premier 1", "unitId": 17, "panelName": "Panel 17", "house": "H114", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": 18, "panelName": "Panel 18", "house": "H115", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": 19, "panelName": "Panel 19", "house": "H116", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "300 va (20 electrovalvulas)", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": null, "panelName": "Panel", "house": "H117", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "no power"}, {"area": "Premier 1", "unitId": 21, "panelName": "Panel 21", "house": "H118", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": null, "panelName": "Panel", "house": "H119", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "300 va (20 electrovalvulas)", "notes": "placa sin power"}, {"area": "Premier 1", "unitId": 23, "panelName": "Panel 23", "house": "H99 y H105", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "100 va (15 electrovalvulas)", "notes": "24 salidas usadas"}, {"area": "Premier 1", "unitId": 24, "panelName": "Panel 24", "house": "H98 y H104", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "24 salidas usadas"}, {"area": "Premier 1", "unitId": 25, "panelName": "Panel 25", "house": "H97 y H103", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "100 va (15 electrovalvulas)", "notes": "24 salidas usadas"}, {"area": "Premier 1", "unitId": 26, "panelName": "Panel 26", "house": "H96 y H102", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "300 va (20 electrovalvulas)", "notes": "24 salidas usadas"}, {"area": "Premier 1", "unitId": 27, "panelName": "Panel 27", "house": "H95 y H101", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "300 va (20 electrovalvulas)", "notes": "24 salidas usadas"}, {"area": "Premier 1", "unitId": 28, "panelName": "Panel 28", "house": "H94 y H100", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "24 salidas usadas"}, {"area": "Premier 1", "unitId": 29, "panelName": "Panel 29", "house": "H90", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "no tiene", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": null, "panelName": "Panel", "house": "H91", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "no tiene", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": 31, "panelName": "Panel 31", "house": "H92", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": 32, "panelName": "Panel 32", "house": "H93", "ip": null, "type": "Irrigation", "totalGates": 32, "maxActive": null, "transformer": "300 va (20 electrovalvulas)", "notes": "20 salidas usadas"}, {"area": "Premier 1", "unitId": 54, "panelName": "Panel 54", "house": "H87 y H88", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "10 no Modbus"}, {"area": "Premier 1", "unitId": 36, "panelName": "Panel 36", "house": "H87 y H88", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no Modbus"}, {"area": "Premier 1", "unitId": 27, "panelName": "Panel 27", "house": "H87 y H88", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no Modbus"}, {"area": "Premier 2", "unitId": 26, "panelName": "Panel 26", "house": "H84A", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no power"}, {"area": "Premier 2", "unitId": 25, "panelName": "Panel 25", "house": "H84", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 16}, {"area": "Premier 2", "unitId": 35, "panelName": "Panel 35", "house": "H84 y 84A", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "12 no power"}, {"area": "Premier 2", "unitId": 55, "panelName": "Panel 55", "house": "H70 y 80", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "12 no power"}, {"area": "Premier 2", "unitId": 50, "panelName": "Panel 50", "house": "H70 y 80", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no power"}, {"area": "Premier 2", "unitId": 53, "panelName": "Panel 53", "house": "H70 y 80", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no power"}, {"area": "Premier 2", "unitId": 32, "panelName": "Panel 32", "house": "H69", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no power"}, {"area": "Premier 2", "unitId": 20, "panelName": "Panel 20", "house": "H68 y 69", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no power"}, {"area": "Premier 2", "unitId": 23, "panelName": "Panel 23", "house": "H68 y 69", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "12 no power"}, {"area": "Premier 2", "unitId": 16, "panelName": "Panel 16", "house": "H67", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": "16 no power"}, {"area": "Premier 2", "unitId": 10, "panelName": "Panel 10", "house": "H67 y H66", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 16}, {"area": "Premier 2", "unitId": 11, "panelName": "Panel 11", "house": "H67 y H66", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 12}, {"area": "Premier 2", "unitId": 18, "panelName": "Panel 18", "house": "H66", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 16}, {"area": "Premier 2", "unitId": 17, "panelName": "Panel 17", "house": "H66", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 6}, {"area": "Premier 2", "unitId": 24, "panelName": "Panel 24", "house": "63 y 64", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 11}, {"area": "Premier 2", "unitId": 51, "panelName": "Panel 51", "house": "63 y 64", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": 11}, {"area": "Premier 3", "unitId": 201, "panelName": "Panel 201", "house": "15 y 27", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 29, "panelName": "Panel 29", "house": "15 y 27", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 33, "panelName": "Panel 33", "house": "16 y 28", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 30, "panelName": "Panel 30", "house": "16 y 28", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 26, "panelName": "Panel 26", "house": "29 y 17", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 200, "panelName": "Panel 200", "house": "29 y 17", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 25, "panelName": "Panel 25", "house": "18 y 30", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 27, "panelName": "Panel 27", "house": "18 y 30", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 43, "panelName": "Panel 43", "house": "19 y 31", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 44, "panelName": "Panel 44", "house": "19 y 31", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 40, "panelName": "Panel 40", "house": "20 y 32", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 38, "panelName": "Panel 38", "house": "20 y 32", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 39, "panelName": "Panel 39", "house": "21 y 33", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 42, "panelName": "Panel 42", "house": "21 y 33", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 41, "panelName": "Panel 41", "house": "22 y 34", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 29, "panelName": "Panel 29", "house": "22 y 34", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 37, "panelName": "Panel 37", "house": "23 y 35", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 202, "panelName": "Panel 202", "house": "23 y 35", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 19, "panelName": "Panel 19", "house": "24 y 36", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 21, "panelName": "Panel 21", "house": "24 y 36", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 28, "panelName": "Panel 28", "house": "25 y 37", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 30, "panelName": "Panel 30", "house": "25 y 37", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 34, "panelName": "Panel 34", "house": "26 y 38", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}, {"area": "Premier 3", "unitId": 31, "panelName": "Panel 31", "house": "26 y 38", "ip": null, "type": "Irrigation", "totalGates": 16, "maxActive": null, "transformer": "40 va (5 electrovalvulas)", "notes": null}]
;
const SEED_SENSORS = [{"area": "Lago North", "devEUI": "a8404158e758f5bf", "name": "Temp/Hum H10"}, {"area": "Lago North", "devEUI": "a8404128f359ba56", "name": "Temp/Hum H8"}, {"area": "Lago North", "devEUI": "a840413e3559ba51", "name": "Temp/Hum H11-1"}, {"area": "Lago North", "devEUI": "a840416c8a59ba4f", "name": "Temp/Hum H11-2"}, {"area": "Lago North", "devEUI": "a84041a58559b29f", "name": "Temp/Hum H12-1"}, {"area": "Lago North", "devEUI": "a84041ecde59b2a0", "name": "Temp/Hum H12-2"}, {"area": "Lago North", "devEUI": "a84041581e5b9144", "name": "Temp/Hum H15"}, {"area": "Lago North", "devEUI": "a8404125555b9148", "name": "Temp/Hum H6"}, {"area": "Lago North", "devEUI": "a84041fc255b9151", "name": "Temp/Hum H9"}, {"area": "Lago 1", "devEUI": "a84041c89a58f5c6", "name": "Temp/Hum H1-C"}, {"area": "Lago 1", "devEUI": "a84041c42159b2a1", "name": "Temp/Hum H1-N"}, {"area": "Lago 1", "devEUI": "a84041dbe959ba4e", "name": "Temp/Hum H1-S"}]
;

const NEW_SENSORS_GEERLINGS = [
  {"area": "Geerlings", "devEUI": "a840411f218605fd", "name": "Dragino zone 1"},
  {"area": "Geerlings", "devEUI": "a8404131f18605fc", "name": "Dragino zone 2"},
  {"area": "Geerlings", "devEUI": "a84041e07187bcba", "name": "Dragino zone 3"},
  {"area": "Geerlings", "devEUI": "a840412dc18605fb", "name": "Dragino zone 4"},
  {"area": "Geerlings", "devEUI": "a84041877185b48e", "name": "Dragino zone 5"},
  {"area": "Geerlings", "devEUI": "a8404196218826c0", "name": "Dragino Rain"},
  {"area": "Geerlings", "devEUI": "a84041297a5bbefa", "name": "Soil Moisture"},
  {"area": "Geerlings", "devEUI": "a8404109355b93e7", "name": "Leaf Moisture"},
  {"area": "Geerlings", "devEUI": "a8404110865bc8e3", "name": "Rain_Node"}
];

const NEW_SENSORS_ENV_CNF_MIST = [
  {"area": "env-cnf-mist", "devEUI": "a84041acb458f5c9", "name": "LSN50V2-S31B-1"},
  {"area": "env-cnf-mist", "devEUI": "a84041c1f558f5c2", "name": "LSN50V2-S31B-2"},
  {"area": "env-cnf-mist", "devEUI": "a8404191bc58f5c8", "name": "LSN50V2-S31B-3"},
  {"area": "env-cnf-mist", "devEUI": "a84041270758f5c0", "name": "LSN50V2-S31B-4"},
  {"area": "env-cnf-mist", "devEUI": "a84041774a58f5ce", "name": "LSN50V2-S31B-5"},
  {"area": "env-cnf-mist", "devEUI": "a84041ea0258f5cc", "name": "LSN50V2-S31B-6"},
  {"area": "env-cnf-mist", "devEUI": "a840414531860c08", "name": "LSN50V2-S31B-W"},
  {"area": "env-cnf-mist", "devEUI": "a840417eee5bc69f", "name": "Leaf Moisture"},
  {"area": "env-cnf-mist", "devEUI": "a84041b5115bbbed", "name": "Soil Moisture"},
  {"area": "env-cnf-mist", "devEUI": "a84041333e5b91d9", "name": "PHEndDevice"},
  {"area": "env-cnf-mist", "devEUI": "a8404181635bc8e7", "name": "SE01-LB Moisture 2"},
  {"area": "env-cnf-mist", "devEUI": "a84041bd115bc8e5", "name": "SE01-LB 3"},
  {"area": "env-cnf-mist", "devEUI": "a84041ea285bc8e9", "name": "SE01-LB Soil Moisture 4"},
  {"area": "env-cnf-mist", "devEUI": "a840411a405bc8e8", "name": "SE01-LB Soil Moisture 5"}
];

const NEW_SENSORS_LAGO_NORTH_2 = [
  {"area": "Lago North", "devEUI": "a84041b4485b915a", "name": "Temp/Hum H18", "appKey": "86c2b8a81f106f4bbeae08429b1b3b11"}
];

/* Application session key (ChirpStack) para sensores que ya existen, identificados por DevEUI.
   A diferencia de APP_KEY_UPDATES, estos SÍ se sobreescriben siempre porque vienen directo
   del panel oficial de ChirpStack (fuente de verdad para estas claves). */
const SESSION_KEY_UPDATES = [
  {devEUI:'a8404125555b9148', appKey:'b448f3f32e73db6730694bd1744d2635'},
  {devEUI:'a84041581e5b9144', appKey:'fdda89fd5ffa73498ca1ecbacd087834'},
  {devEUI:'a84041ecde59b2a0', appKey:'c4edf5b5c47bc639e871472c10c4b6cc'},
  {devEUI:'a84041a58559b29f', appKey:'570327a81ef16ab78cad2534915fb119'},
  {devEUI:'a84041fc255b9151', appKey:'3ef911244c476a9cd03d0110026893f2'},
  {devEUI:'a8404128f359ba56', appKey:'3d12ebd10225d2b49cb2faae2c64d16b'},
  {devEUI:'a8404158e758f5bf', appKey:'a2dc82624dfcfd018602b856ecd15813'},
  {devEUI:'a840416c8a59ba4f', appKey:'659b1e5bbf9f19393b9a3c93af5f3f8c'}
];

const TYPE_COLORS = {
  'Valves':'var(--valve)','Irrigation':'var(--irrigation)','Control':'var(--control)',
  'Mixer':'var(--mixer)','Curtains':'var(--curtain)','Fan':'var(--fan)','Heater':'var(--heater)',
  'Exhaust Fan':'var(--exhaustfan)',
  'Control/Irrigation':'var(--control)','Control/Fan':'var(--control)'
};
function typeColor(t){ return TYPE_COLORS[t] || 'var(--default-type)'; }

/* Configuración pública de Firebase (Firestore) de este proyecto. No es secreta: Firebase está
   diseñado para que esta configuración viva en el código del cliente — la protección real de los
   datos está en las Reglas de seguridad de Firestore, no en ocultar este objeto. Sirve como valor
   por defecto para que cualquier dispositivo se conecte solo, sin tener que pegar la configuración
   a mano en la pantalla de "Sincronización". */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBqrH-PkWtjlWVQYc4Bp6Y6d_-jb4ntsdE",
  authDomain: "guardian-inventario.firebaseapp.com",
  projectId: "guardian-inventario",
  storageBucket: "guardian-inventario.firebasestorage.app",
  messagingSenderId: "406540944484",
  appId: "1:406540944484:web:dc28219c554832091c8b71",
  measurementId: "G-15Z0ZVG0B0"
};

/* Decide qué configuración de Firebase usar: si el navegador tiene una guardada a mano (pantalla
   de "Sincronización", para apuntar a OTRO proyecto de Firebase), esa gana. Si no hay nada guardado,
   o el texto guardado no es una configuración válida, usa la configuración por defecto de arriba. */
function resolveFirebaseConfig(storedConfigString, defaultConfig){
  if(storedConfigString){
    try{
      const parsed = JSON.parse(storedConfigString);
      if(parsed && parsed.apiKey && parsed.projectId) return parsed;
    }catch(e){}
  }
  return defaultConfig || null;
}

/* Corrige datos de versiones anteriores (área "?" -> Premier 1, sensores faltantes de Lago) sin perder
   los registros que el usuario haya agregado o editado. Se usa tanto en modo local como al sembrar Firestore. */
function migratePanelsArray(arr){
  return arr.map(p => p.area === '?' ? {...p, area:'Premier 1'} : p);
}
function migrateSensorsArray(arr){
  const existingEUIs = new Set(arr.map(s=>s.devEUI));
  const merged = arr.slice();
  SEED_SENSORS.forEach((s,i)=>{
    if(s.devEUI && !existingEUIs.has(s.devEUI)){
      merged.push({...s, _id:'s_mig_'+i});
      existingEUIs.add(s.devEUI);
    }
  });
  [...NEW_SENSORS_GEERLINGS, ...NEW_SENSORS_ENV_CNF_MIST, ...NEW_SENSORS_LAGO_NORTH_2].forEach((s,i)=>{
    if(s.devEUI && !existingEUIs.has(s.devEUI)){
      merged.push({...s, _id:'s_imp_'+i});
      existingEUIs.add(s.devEUI);
    }
  });
  return merged;
}
/* Application Key para sensores que ya existen en el sistema (identificados por DevEUI).
   Solo se aplica si el sensor todavía no tiene un Application Key guardado, para no pisar
   nada que el usuario haya escrito a mano. */
const APP_KEY_UPDATES = [
  {devEUI:'a84041e43c58f5d1', appKey:'1CD30C3EDEB815F7CD8A0980AE856652'},
  {devEUI:'a840414f565b9153', appKey:'4F30E8A850781A5C741C2D6E300D6D8D'},
  {devEUI:'a84041cbae58f5c4', appKey:'6FEF60CD5E6712784629F4AB70554BE1'}
];

function applyAppKeyUpdatesArray(arr){
  let changed = false;
  const updated = arr.map(s=>{
    const match = APP_KEY_UPDATES.find(u=>u.devEUI===s.devEUI);
    if(match && !s.appKey){
      changed = true;
      return {...s, appKey: match.appKey};
    }
    return s;
  });
  return {arr: updated, changed};
}
/* Session keys oficiales de ChirpStack: SIEMPRE se sobreescriben (son la fuente de verdad). */
function applySessionKeyUpdatesArray(arr){
  let changed = false;
  const updated = arr.map(s=>{
    const match = SESSION_KEY_UPDATES.find(u=>u.devEUI===s.devEUI);
    if(match && s.appKey !== match.appKey){
      changed = true;
      return {...s, appKey: match.appKey};
    }
    return s;
  });
  return {arr: updated, changed};
}
function gateArrayHtml(total, active){
  total = Number(total)||0; active = Number(active)||0;
  if(total===0) return '<span class="empty-val">—</span>';
  const capped = Math.min(total, 32);
  let dots='';
  for(let i=0;i<capped;i++){ dots += `<div class="gate-dot ${i<active?'on':''}"></div>`; }
  return `<div class="gate-array" title="${active} de ${total} activas">${dots}</div>`;
}

function val(v){ return (v===null||v===undefined||v==='') ? '<span class="empty-val">—</span>' : escapeHtml(String(v)); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s){ return escapeHtml(s); }


/* ---------------------------------------------------------- AREAS / STATS ---------------------------------------------------------- */
function computeAreas(panels, sensors){
  const set = new Set();
  (panels||[]).forEach(p=>{ if(p.area) set.add(p.area); });
  (sensors||[]).forEach(s=>{ if(s.area) set.add(s.area); });
  return Array.from(set).sort((a,b)=>a.localeCompare(b));
}

function computeStats(panels, sensors){
  const totalPanels = (panels||[]).length;
  const totalGates = (panels||[]).reduce((s,p)=> s + (Number(p.totalGates)||0), 0);
  const totalAreas = computeAreas(panels, sensors).length;
  const totalSensors = (sensors||[]).length;
  return { totalPanels, totalGates, totalAreas, totalSensors };
}

/* ---------------------------------------------------------- FILTER / SORT ---------------------------------------------------------- */
function filterAndSortData(data, opts){
  opts = opts || {};
  const activeArea = opts.activeArea || null;
  const activeTab = opts.activeTab || 'panels';
  const typeFilterVal = opts.typeFilterVal || '';
  const searchTerm = opts.searchTerm || '';
  const sortKey = opts.sortKey || null;
  const sortDir = opts.sortDir || 1;

  let result = (data||[]).slice();
  if(activeArea) result = result.filter(r=>r.area===activeArea);
  if(activeTab==='panels' && typeFilterVal) result = result.filter(r=>r.type===typeFilterVal);
  if(searchTerm){
    const q = String(searchTerm).toLowerCase();
    result = result.filter(r=> Object.values(r).some(v=> v!==null && v!==undefined && String(v).toLowerCase().includes(q)));
  }
  if(sortKey){
    result.sort((a,b)=>{
      let va = a[sortKey], vb = b[sortKey];
      if(va===null||va===undefined) va='';
      if(vb===null||vb===undefined) vb='';
      if(typeof va === 'number' && typeof vb === 'number') return (va-vb)*sortDir;
      return String(va).localeCompare(String(vb), 'es', {numeric:true}) * sortDir;
    });
  }
  return result;
}

/* ---------------------------------------------------------- RECORD VALIDATION ---------------------------------------------------------- */
/* values: plain object mapping field key -> raw string from the form input.
   Mirrors the coercion saveModal() used to do inline: required-field check, '' -> null,
   Number() coercion for numeric fields. */
function buildRecordFromFieldValues(fields, values){
  const rec = {};
  let valid = true;
  (fields||[]).forEach(f=>{
    const raw = values && values[f.key] !== undefined && values[f.key] !== null ? String(values[f.key]) : '';
    const v = raw.trim();
    if(f.required && !v) valid = false;
    if(f.type==='number'){ rec[f.key] = v===''? null : Number(v); }
    else { rec[f.key] = v===''? null : v; }
  });
  return { rec, valid };
}

/* ---------------------------------------------------------- EXPORT ROW MAPPING ---------------------------------------------------------- */
function panelsToExportRows(panels){
  return (panels||[]).map(p=>({
    'Área': p.area, 'ID': p.unitId, 'Panel': p.panelName, 'Casa': p.house, 'IP': p.ip,
    'Tipo': p.type, 'Salidas Totales': p.totalGates, 'Máx Activas': p.maxActive,
    'Transformador': p.transformer, 'Notas': p.notes
  }));
}
function sensorsToExportRows(sensors){
  return (sensors||[]).map(s=>({'Área': s.area, 'DevEUI': s.devEUI, 'Application Key': s.appKey, 'Nombre': s.name}));
}

  return {
    TYPE_COLORS, typeColor,
    DEFAULT_FIREBASE_CONFIG, resolveFirebaseConfig,
    SEED_PANELS, SEED_SENSORS, NEW_SENSORS_GEERLINGS, NEW_SENSORS_ENV_CNF_MIST, NEW_SENSORS_LAGO_NORTH_2,
    SESSION_KEY_UPDATES, APP_KEY_UPDATES,
    migratePanelsArray, migrateSensorsArray,
    applyAppKeyUpdatesArray, applySessionKeyUpdatesArray,
    escapeHtml, escapeAttr,
    gateArrayHtml, val,
    computeAreas, computeStats,
    filterAndSortData,
    buildRecordFromFieldValues,
    panelsToExportRows, sensorsToExportRows
  };
});
