import { describe, it, expect } from 'vitest';
import GuardianCore from '../guardian-core.js';

const {
  typeColor,
  migratePanelsArray,
  migrateSensorsArray,
  applyAppKeyUpdatesArray,
  applySessionKeyUpdatesArray,
  escapeHtml,
  escapeAttr,
  gateArrayHtml,
  val,
  computeAreas,
  computeStats,
  filterAndSortData,
  buildRecordFromFieldValues,
  findDuplicateSensorByDevEUI,
  panelsToExportRows,
  sensorsToExportRows,
  controllersToExportRows,
  deviceProfilesToExportRows,
  DEFAULT_FIREBASE_CONFIG,
  resolveFirebaseConfig,
} = GuardianCore;

describe('escapeHtml / escapeAttr', () => {
  it('escapes all five HTML-significant characters', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('leaves safe text untouched', () => {
    expect(escapeHtml('Panel H10-1-8')).toBe('Panel H10-1-8');
  });

  it('coerces non-string input (numbers) to string first', () => {
    expect(escapeHtml(42)).toBe('42');
  });

  it('escapeAttr behaves the same as escapeHtml', () => {
    expect(escapeAttr('<script>')).toBe(escapeHtml('<script>'));
  });

  it('neutralizes a script-injection attempt from a free-text field like notes', () => {
    const malicious = '<img src=x onerror="alert(1)">';
    const escaped = escapeHtml(malicious);
    expect(escaped).not.toContain('<img');
    expect(escaped).toContain('&lt;img');
  });
});

describe('typeColor', () => {
  it('returns the mapped CSS variable for a known type', () => {
    expect(typeColor('Valves')).toBe('var(--valve)');
    expect(typeColor('Irrigation')).toBe('var(--irrigation)');
  });

  it('falls back to the default type color for unknown types', () => {
    expect(typeColor('Otro')).toBe('var(--default-type)');
    expect(typeColor(undefined)).toBe('var(--default-type)');
  });
});

describe('migratePanelsArray', () => {
  it('rewrites the legacy "?" area to "Premier 1"', () => {
    const input = [{ _id: 'p1', area: '?', panelName: 'X' }];
    const result = migratePanelsArray(input);
    expect(result[0].area).toBe('Premier 1');
  });

  it('leaves panels with a real area untouched', () => {
    const input = [{ _id: 'p1', area: 'Lago North', panelName: 'X' }];
    const result = migratePanelsArray(input);
    expect(result[0].area).toBe('Lago North');
  });

  it('does not mutate the input array', () => {
    const input = [{ _id: 'p1', area: '?' }];
    const snapshot = JSON.stringify(input);
    migratePanelsArray(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});

describe('migrateSensorsArray', () => {
  it('adds seed/import sensors missing from the existing array', () => {
    const result = migrateSensorsArray([]);
    // SEED_SENSORS (12) + NEW_SENSORS_GEERLINGS (9) + NEW_SENSORS_ENV_CNF_MIST (14) + NEW_SENSORS_LAGO_NORTH_2 (1)
    expect(result.length).toBe(12 + 9 + 14 + 1);
  });

  it('does not duplicate a sensor whose devEUI already exists', () => {
    const existing = [{ _id: 'custom1', devEUI: 'a8404158e758f5bf', name: 'Already here' }];
    const result = migrateSensorsArray(existing);
    const matches = result.filter((s) => s.devEUI === 'a8404158e758f5bf');
    expect(matches.length).toBe(1);
    expect(matches[0]._id).toBe('custom1');
    expect(matches[0].name).toBe('Already here');
  });

  it('preserves user-added sensors with devEUIs not in any seed list', () => {
    const existing = [{ _id: 'custom2', devEUI: 'deadbeef00000000', name: 'User sensor' }];
    const result = migrateSensorsArray(existing);
    expect(result.some((s) => s._id === 'custom2')).toBe(true);
  });
});

describe('applyAppKeyUpdatesArray', () => {
  it('fills in the app key only when the sensor has none', () => {
    const input = [{ devEUI: 'a84041e43c58f5d1', appKey: null }];
    const { arr, changed } = applyAppKeyUpdatesArray(input);
    expect(changed).toBe(true);
    expect(arr[0].appKey).toBe('1CD30C3EDEB815F7CD8A0980AE856652');
  });

  it('does not overwrite an appKey the user already entered', () => {
    const input = [{ devEUI: 'a84041e43c58f5d1', appKey: 'user-typed-value' }];
    const { arr, changed } = applyAppKeyUpdatesArray(input);
    expect(changed).toBe(false);
    expect(arr[0].appKey).toBe('user-typed-value');
  });

  it('leaves sensors with no matching devEUI unchanged', () => {
    const input = [{ devEUI: 'unrelated', appKey: null }];
    const { arr, changed } = applyAppKeyUpdatesArray(input);
    expect(changed).toBe(false);
    expect(arr[0].appKey).toBeNull();
  });
});

describe('applySessionKeyUpdatesArray', () => {
  it('always overwrites the appKey for a matching devEUI, even if already set', () => {
    const input = [{ devEUI: 'a8404125555b9148', appKey: 'stale-value' }];
    const { arr, changed } = applySessionKeyUpdatesArray(input);
    expect(changed).toBe(true);
    expect(arr[0].appKey).toBe('b448f3f32e73db6730694bd1744d2635');
  });

  it('reports no change when the value already matches the source of truth', () => {
    const input = [{ devEUI: 'a8404125555b9148', appKey: 'b448f3f32e73db6730694bd1744d2635' }];
    const { arr, changed } = applySessionKeyUpdatesArray(input);
    expect(changed).toBe(false);
    expect(arr[0].appKey).toBe('b448f3f32e73db6730694bd1744d2635');
  });
});

describe('gateArrayHtml', () => {
  it('renders the empty placeholder when total gates is 0', () => {
    expect(gateArrayHtml(0, 0)).toContain('empty-val');
  });

  it('renders one dot per gate, marking the active ones "on"', () => {
    const html = gateArrayHtml(8, 3);
    const onCount = (html.match(/gate-dot on/g) || []).length;
    const totalDots = (html.match(/gate-dot/g) || []).length;
    expect(totalDots).toBe(8);
    expect(onCount).toBe(3);
  });

  it('caps the number of rendered dots at 32 even for larger totals', () => {
    const html = gateArrayHtml(64, 10);
    const totalDots = (html.match(/class="gate-dot/g) || []).length;
    expect(totalDots).toBe(32);
  });

  it('coerces non-numeric input safely instead of throwing', () => {
    expect(() => gateArrayHtml(null, undefined)).not.toThrow();
    expect(gateArrayHtml(null, undefined)).toContain('empty-val');
  });
});

describe('val', () => {
  it('renders the empty placeholder for null, undefined, and empty string', () => {
    expect(val(null)).toContain('empty-val');
    expect(val(undefined)).toContain('empty-val');
    expect(val('')).toContain('empty-val');
  });

  it('escapes and stringifies real values', () => {
    expect(val('<b>')).toBe('&lt;b&gt;');
    expect(val(192)).toBe('192');
  });
});

describe('computeAreas', () => {
  it('collects unique areas from both panels and sensors, sorted', () => {
    const panels = [{ area: 'Zeta' }, { area: 'Alpha' }];
    const sensors = [{ area: 'Alpha' }, { area: 'Beta' }];
    expect(computeAreas(panels, sensors)).toEqual(['Alpha', 'Beta', 'Zeta']);
  });

  it('ignores records with a falsy area', () => {
    const panels = [{ area: '' }, { area: null }, { area: 'Real' }];
    expect(computeAreas(panels, [])).toEqual(['Real']);
  });

  it('also collects areas from controllers', () => {
    const controllers = [{ area: 'Casa 5' }];
    expect(computeAreas([], [], controllers)).toEqual(['Casa 5']);
  });
});

describe('computeStats', () => {
  it('sums totalGates and counts panels/sensors/controllers/deviceProfiles/areas', () => {
    const panels = [
      { area: 'A', totalGates: 16 },
      { area: 'A', totalGates: 8 },
      { area: 'B', totalGates: '32' }, // stored as string, as it can arrive from a form field
    ];
    const sensors = [{ area: 'A' }, { area: 'C' }];
    const controllers = [{ area: 'D' }];
    const deviceProfiles = [{ name: 'ESP32 v1' }, { name: 'ESP32 v2' }];
    expect(computeStats(panels, sensors, controllers, deviceProfiles)).toEqual({
      totalPanels: 3,
      totalGates: 56,
      totalAreas: 4, // A, B, C, D
      totalSensors: 2,
      totalControllers: 1,
      totalDeviceProfiles: 2,
    });
  });

  it('treats a missing/non-numeric totalGates as 0 instead of NaN', () => {
    const panels = [{ area: 'A', totalGates: null }, { area: 'A' }];
    expect(computeStats(panels, []).totalGates).toBe(0);
  });

  it('defaults totalControllers to 0 when no controllers are passed', () => {
    expect(computeStats([], []).totalControllers).toBe(0);
  });
});

describe('filterAndSortData', () => {
  const panels = [
    { _id: 'p1', area: 'Lago North', type: 'Valves', panelName: 'Panel Valve H10', unitId: 102 },
    { _id: 'p2', area: 'Lago North', type: 'Irrigation', panelName: 'Panel Irrigation H10', unitId: 15 },
    { _id: 'p3', area: 'Cactus Área 1', type: 'Irrigation', panelName: 'Irrigation Panel H1', unitId: 101 },
  ];

  it('filters by activeArea', () => {
    const result = filterAndSortData(panels, { activeArea: 'Cactus Área 1' });
    expect(result.map((r) => r._id)).toEqual(['p3']);
  });

  it('filters by type only when activeTab is panels', () => {
    const withTypeFilter = filterAndSortData(panels, { activeTab: 'panels', typeFilterVal: 'Irrigation' });
    expect(withTypeFilter.map((r) => r._id).sort()).toEqual(['p2', 'p3']);

    const ignoredOnSensorsTab = filterAndSortData(panels, { activeTab: 'sensors', typeFilterVal: 'Irrigation' });
    expect(ignoredOnSensorsTab.length).toBe(3);
  });

  it('performs a case-insensitive search across all fields', () => {
    const result = filterAndSortData(panels, { searchTerm: 'valve' });
    expect(result.map((r) => r._id)).toEqual(['p1']);
  });

  it('sorts numerically when both values are numbers', () => {
    const result = filterAndSortData(panels, { sortKey: 'unitId', sortDir: 1 });
    expect(result.map((r) => r.unitId)).toEqual([15, 101, 102]);
  });

  it('reverses order when sortDir is -1', () => {
    const result = filterAndSortData(panels, { sortKey: 'unitId', sortDir: -1 });
    expect(result.map((r) => r.unitId)).toEqual([102, 101, 15]);
  });

  it('falls back to locale string comparison for non-numeric sort keys', () => {
    const result = filterAndSortData(panels, { sortKey: 'area', sortDir: 1 });
    expect(result.map((r) => r.area)).toEqual(['Cactus Área 1', 'Lago North', 'Lago North']);
  });

  it('does not mutate the input array', () => {
    const copy = panels.slice();
    filterAndSortData(panels, { sortKey: 'unitId' });
    expect(panels).toEqual(copy);
  });

  it('ignores activeArea for the deviceProfiles tab, which has no area concept', () => {
    const deviceProfiles = [
      { _id: 'dp1', name: 'ESP32 v1', code: 'AT+PROFILE=1' },
      { _id: 'dp2', name: 'ESP32 v2', code: 'AT+PROFILE=2' },
    ];
    const result = filterAndSortData(deviceProfiles, { activeArea: 'Lago North', activeTab: 'deviceProfiles' });
    expect(result.length).toBe(2);
  });
});

describe('buildRecordFromFieldValues', () => {
  const fields = [
    { key: 'panelName', required: true },
    { key: 'notes' },
    { key: 'totalGates', type: 'number' },
  ];

  it('flags invalid when a required field is empty', () => {
    const { valid } = buildRecordFromFieldValues(fields, { panelName: '  ', notes: 'x', totalGates: '8' });
    expect(valid).toBe(false);
  });

  it('is valid when required fields are present', () => {
    const { valid, rec } = buildRecordFromFieldValues(fields, { panelName: 'Panel A', notes: '', totalGates: '' });
    expect(valid).toBe(true);
    expect(rec.panelName).toBe('Panel A');
  });

  it('trims whitespace and converts empty strings to null', () => {
    const { rec } = buildRecordFromFieldValues(fields, { panelName: '  Panel B  ', notes: '   ', totalGates: '' });
    expect(rec.panelName).toBe('Panel B');
    expect(rec.notes).toBeNull();
    expect(rec.totalGates).toBeNull();
  });

  it('coerces number-type fields with Number()', () => {
    const { rec } = buildRecordFromFieldValues(fields, { panelName: 'Panel C', notes: '', totalGates: '32' });
    expect(rec.totalGates).toBe(32);
    expect(typeof rec.totalGates).toBe('number');
  });
});

describe('export row mapping', () => {
  it('maps panel fields to their Spanish column headers', () => {
    const rows = panelsToExportRows([
      { area: 'Lago North', unitId: 101, panelName: 'Panel 1', house: 'H10', ip: null, type: 'Valves', totalGates: 8, maxActive: 8, transformer: null, notes: null },
    ]);
    expect(rows[0]).toEqual({
      'Área': 'Lago North', 'ID': 101, 'Panel': 'Panel 1', 'Casa': 'H10', 'IP': null,
      'Tipo': 'Valves', 'Salidas Totales': 8, 'Máx Activas': 8, 'Transformador': null, 'Notas': null,
    });
  });

  it('maps sensor fields to their Spanish column headers', () => {
    const rows = sensorsToExportRows([{ area: 'Lago North', devEUI: 'abc123', appKey: 'key1', name: 'Sensor 1', atPin: 'AT1', otaPin: 'OTA1' }]);
    expect(rows[0]).toEqual({ 'Área': 'Lago North', 'DevEUI': 'abc123', 'Application Key': 'key1', 'Nombre': 'Sensor 1', 'AT PIN': 'AT1', 'OTA PIN': 'OTA1' });
  });

  it('maps controller fields to their Spanish column headers', () => {
    const rows = controllersToExportRows([
      { area: 'Casa 5', name: 'Controlador Casa 5', ipInternet: '10.0.0.1', ipLocal: '192.168.1.5', ipModbus: '10.0.0.2', ipDragino: '10.0.0.3', docker: 'Sí', user: 'admin', notes: 'Reiniciar semanalmente' },
    ]);
    expect(rows[0]).toEqual({
      'Área': 'Casa 5', 'Nombre': 'Controlador Casa 5', 'IP Internet': '10.0.0.1', 'IP Local': '192.168.1.5',
      'IP Modbus': '10.0.0.2', 'IP Dragino': '10.0.0.3', 'Docker': 'Sí', 'Usuario': 'admin',
      'Notas': 'Reiniciar semanalmente',
    });
  });

  it('maps device profile fields to their Spanish column headers', () => {
    const rows = deviceProfilesToExportRows([{ name: 'ESP32 v1', code: 'AT+PROFILE=1\nAT+SAVE' }]);
    expect(rows[0]).toEqual({ 'Nombre': 'ESP32 v1', 'Código': 'AT+PROFILE=1\nAT+SAVE' });
  });
});

describe('resolveFirebaseConfig', () => {
  it('falls back to the default config when nothing is stored (a brand-new device/browser)', () => {
    const result = resolveFirebaseConfig(null, DEFAULT_FIREBASE_CONFIG);
    expect(result).toEqual(DEFAULT_FIREBASE_CONFIG);
  });

  it('falls back to the default config when the stored value is an empty string', () => {
    const result = resolveFirebaseConfig('', DEFAULT_FIREBASE_CONFIG);
    expect(result).toEqual(DEFAULT_FIREBASE_CONFIG);
  });

  it('prefers a manually-saved override over the default, so pointing at another project still works', () => {
    const override = { apiKey: 'other-key', projectId: 'other-project' };
    const result = resolveFirebaseConfig(JSON.stringify(override), DEFAULT_FIREBASE_CONFIG);
    expect(result).toEqual(override);
  });

  it('falls back to the default when the stored value is not valid JSON', () => {
    const result = resolveFirebaseConfig('{not valid json', DEFAULT_FIREBASE_CONFIG);
    expect(result).toEqual(DEFAULT_FIREBASE_CONFIG);
  });

  it('falls back to the default when the stored value is missing required fields', () => {
    const result = resolveFirebaseConfig(JSON.stringify({ foo: 'bar' }), DEFAULT_FIREBASE_CONFIG);
    expect(result).toEqual(DEFAULT_FIREBASE_CONFIG);
  });

  it('returns null when there is neither a stored config nor a default', () => {
    expect(resolveFirebaseConfig(null, null)).toBeNull();
  });

  it('ships with the real Guardian Firebase project as the built-in default', () => {
    expect(DEFAULT_FIREBASE_CONFIG.projectId).toBe('guardian-inventario');
    expect(DEFAULT_FIREBASE_CONFIG.apiKey).toBeTruthy();
  });
});

describe('findDuplicateSensorByDevEUI', () => {
  const sensors = [
    { _id: 's1', devEUI: 'a840411f218605fd', name: 'Dragino zone 1' },
    { _id: 's2', devEUI: 'a8404131f18605fc', name: 'Dragino zone 2' },
  ];

  it('finds another sensor that already uses the same devEUI', () => {
    const dup = findDuplicateSensorByDevEUI(sensors, 'a840411f218605fd', null);
    expect(dup).not.toBeNull();
    expect(dup._id).toBe('s1');
  });

  it('returns null when no other sensor uses that devEUI', () => {
    expect(findDuplicateSensorByDevEUI(sensors, 'brand-new-eui', null)).toBeNull();
  });

  it('ignores the record being edited (its own devEUI is not a duplicate of itself)', () => {
    const dup = findDuplicateSensorByDevEUI(sensors, 'a840411f218605fd', 's1');
    expect(dup).toBeNull();
  });

  it('still flags a duplicate against a DIFFERENT record while editing one', () => {
    const dup = findDuplicateSensorByDevEUI(sensors, 'a840411f218605fd', 's2');
    expect(dup).not.toBeNull();
    expect(dup._id).toBe('s1');
  });

  it('returns null for an empty or missing devEUI instead of matching everything', () => {
    expect(findDuplicateSensorByDevEUI(sensors, '', null)).toBeNull();
    expect(findDuplicateSensorByDevEUI(sensors, null, null)).toBeNull();
  });
});
