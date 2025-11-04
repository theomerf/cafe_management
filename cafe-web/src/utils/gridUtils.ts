// Grid konfigürasyonu - kolayca özelleştirilebilir
export const GRID_CONFIG = {
  GRID_SIZE: 1,           // Her grid hücresi 1 birim
  GRID_SNAP: 0.5,         // Hassasiyet 0.5 birim
  SNAP_THRESHOLD: 0.25,   // Snap etkinleşme eşiği
  MIN_X: -10,
  MAX_X: 10,
  MIN_Z: -10,
  MAX_Z: 10,
  PADDING: 0.5,           // Sınırdan uzaklık
  ROW_COL_THRESHOLD: 0.3, // Satır/sütün alignment eşiği (birim cinsinden)
};

/**
 * Verilen değeri grid hizasına snap'ler
 */
export const snapToGrid = (value: number, gridSize: number = GRID_CONFIG.GRID_SNAP): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * X ve Z koordinatlarını grid hizasına snap'ler
 * @param x - X koordinatı
 * @param z - Z koordinatı
 * @returns [snappedX, snappedZ]
 */
export const snapPositionToGrid = (x: number, z: number): [number, number] => {
  const snappedX = snapToGrid(x, GRID_CONFIG.GRID_SNAP);
  const snappedZ = snapToGrid(z, GRID_CONFIG.GRID_SNAP);
  return [snappedX, snappedZ];
};

/**
 * Grid sınırlarını döndürür
 */
export const getGridBounds = () => {
  return {
    minX: GRID_CONFIG.MIN_X + GRID_CONFIG.PADDING,
    maxX: GRID_CONFIG.MAX_X - GRID_CONFIG.PADDING,
    minZ: GRID_CONFIG.MIN_Z + GRID_CONFIG.PADDING,
    maxZ: GRID_CONFIG.MAX_Z - GRID_CONFIG.PADDING,
  };
};

/**
 * Konumun geçerli olup olmadığını kontrol eder
 * @param x - X koordinatı
 * @param z - Z koordinatı
 * @returns true eğer konumu geçerli ise
 */
export const isPositionValid = (x: number, z: number): boolean => {
  const bounds = getGridBounds();
  const isWithinBounds =
    x >= bounds.minX &&
    x <= bounds.maxX &&
    z >= bounds.minZ &&
    z <= bounds.maxZ;

  return isWithinBounds;
};

/**
 * İki masanın çakışıp çakışmadığını kontrol eder
 * @param pos1 - Birinci masanın pozisyonu [x, z]
 * @param pos2 - İkinci masanın pozisyonu [x, z]
 * @param minDistance - Masalar arasındaki minimum mesafe (default 1.5 birim)
 * @returns true eğer çakışıyorsa
 */
export const isPositionOccupied = (
  pos1: [number, number],
  pos2: [number, number],
  minDistance: number = 1.5
): boolean => {
  const dx = pos1[0] - pos2[0];
  const dz = pos1[1] - pos2[1];
  const distance = Math.sqrt(dx * dx + dz * dz);
  return distance < minDistance;
};

/**
 * Konumu grid sınırları içinde kısıtlar
 * @param x - X koordinatı
 * @param z - Z koordinatı
 * @returns [constrainedX, constrainedZ]
 */
export const constrainPositionToBounds = (x: number, z: number): [number, number] => {
  const bounds = getGridBounds();
  const constrainedX = Math.max(bounds.minX, Math.min(x, bounds.maxX));
  const constrainedZ = Math.max(bounds.minZ, Math.min(z, bounds.maxZ));
  return [constrainedX, constrainedZ];
};

/**
 * Sürüklenirken pozisyonu doğrular ve snap'ler
 */
export const validateAndSnapPosition = (x: number, z: number): [number, number] => {
  // Önce grid'e snap et
  let [snappedX, snappedZ] = snapPositionToGrid(x, z);

  // Sonra sınırları kontrol et
  [snappedX, snappedZ] = constrainPositionToBounds(snappedX, snappedZ);

  return [snappedX, snappedZ];
};

/**
 * Tüm masaların X koordinatlarından unique satırları bulur
 * @param tablePositions - Masaların [x, z] koordinatları
 * @returns Benzersiz X koordinatları (satırlar)
 */
export const extractUniqueRows = (tablePositions: [number, number][]): number[] => {
  const xValues = tablePositions.map(pos => pos[0]);
  const uniqueX = Array.from(new Set(xValues.map(x => snapToGrid(x, GRID_CONFIG.GRID_SNAP))));
  return uniqueX.sort((a, b) => a - b);
};

/**
 * Tüm masaların Z koordinatlarından unique sütunları bulur
 * @param tablePositions - Masaların [x, z] koordinatları
 * @returns Benzersiz Z koordinatları (sütunlar)
 */
export const extractUniqueColumns = (tablePositions: [number, number][]): number[] => {
  const zValues = tablePositions.map(pos => pos[1]);
  const uniqueZ = Array.from(new Set(zValues.map(z => snapToGrid(z, GRID_CONFIG.GRID_SNAP))));
  return uniqueZ.sort((a, b) => a - b);
};

/**
 * Verilen pozisyona en yakın satırı (X koordinatı) bulur
 * @param position - [x, z] koordinatı
 * @param tablePositions - Tüm masaların koordinatları
 * @returns En yakın X değeri
 */
export const findNearestRow = (
  position: [number, number],
  tablePositions: [number, number][]
): number => {
  const rows = extractUniqueRows(tablePositions);
  
  if (rows.length === 0) {
    return snapToGrid(position[0], GRID_CONFIG.GRID_SNAP);
  }

  let nearestRow = rows[0];
  let minDistance = Math.abs(position[0] - rows[0]);

  for (const row of rows) {
    const distance = Math.abs(position[0] - row);
    if (distance < minDistance) {
      minDistance = distance;
      nearestRow = row;
    }
  }

  return nearestRow;
};

/**
 * Verilen pozisyona en yakın sütunu (Z koordinatı) bulur
 * @param position - [x, z] koordinatı
 * @param tablePositions - Tüm masaların koordinatları
 * @returns En yakın Z değeri
 */
export const findNearestColumn = (
  position: [number, number],
  tablePositions: [number, number][]
): number => {
  const columns = extractUniqueColumns(tablePositions);
  
  if (columns.length === 0) {
    return snapToGrid(position[1], GRID_CONFIG.GRID_SNAP);
  }

  let nearestColumn = columns[0];
  let minDistance = Math.abs(position[1] - columns[0]);

  for (const column of columns) {
    const distance = Math.abs(position[1] - column);
    if (distance < minDistance) {
      minDistance = distance;
      nearestColumn = column;
    }
  }

  return nearestColumn;
};

/**
 * Pozisyonu en yakın satır ve sütüne hizala
 * Sürüklemeler bittikten sonra kullanıcı bıraktığında çalışır
 * @param position - [x, z] koordinatı
 * @param tablePositions - Tüm masaların koordinatları (sürüklenen dahil değil)
 * @param threshold - Hizalama eşiği (default GRID_CONFIG.ROW_COL_THRESHOLD)
 * @returns Hizalanmış [x, z] koordinatı
 */
export const alignToNearestRowColumn = (
  position: [number, number],
  tablePositions: [number, number][],
  threshold: number = GRID_CONFIG.ROW_COL_THRESHOLD
): [number, number] => {
  // Önce grid'e snap et
  let [snappedX, snappedZ] = snapPositionToGrid(position[0], position[1]);

  // Eğer başka masa yoksa snap edilmiş pozisyonu döndür
  if (tablePositions.length === 0) {
    return [snappedX, snappedZ];
  }

  // En yakın satırı bul (X koordinatı)
  const nearestRowX = findNearestRow([snappedX, snappedZ], tablePositions);
  const rowDistance = Math.abs(snappedX - nearestRowX);

  // En yakın sütunu bul (Z koordinatı)
  const nearestColumnZ = findNearestColumn([snappedX, snappedZ], tablePositions);
  const columnDistance = Math.abs(snappedZ - nearestColumnZ);

  // Eşik değerine göre hizala
  const alignedX = rowDistance < threshold ? nearestRowX : snappedX;
  const alignedZ = columnDistance < threshold ? nearestColumnZ : snappedZ;

  // Sınırları kontrol et
  const [finalX, finalZ] = constrainPositionToBounds(alignedX, alignedZ);

  return [finalX, finalZ];
};

/**
 * Masaların grid layout'unu analiz eder ve bilgi döndürür
 * @param tablePositions - Tüm masaların [x, z] koordinatları
 * @returns { rows, columns, spacing } - Satırlar, sütunlar ve aralarındaki mesafe
 */
export const analyzeGridLayout = (tablePositions: [number, number][]) => {
  const rows = extractUniqueRows(tablePositions);
  const columns = extractUniqueColumns(tablePositions);

  // Satırlar arasındaki ortalama mesafe
  let rowSpacing = 0;
  if (rows.length > 1) {
    const spacings = [];
    for (let i = 1; i < rows.length; i++) {
      spacings.push(rows[i] - rows[i - 1]);
    }
    rowSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
  }

  // Sütunlar arasındaki ortalama mesafe
  let columnSpacing = 0;
  if (columns.length > 1) {
    const spacings = [];
    for (let i = 1; i < columns.length; i++) {
      spacings.push(columns[i] - columns[i - 1]);
    }
    columnSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
  }

  return {
    rows,
    columns,
    rowSpacing: rowSpacing || 2, // Default 2 birim
    columnSpacing: columnSpacing || 2, // Default 2 birim
    totalTables: tablePositions.length,
  };
};

/**
 * Boş bir satır/sütun kombinasyonunu bulur (yeni masa eklemek için)
 * @param tablePositions - Tüm masaların koordinatları
 * @param layout - Grid layout analizi (analyzeGridLayout sonucu)
 * @returns Önerilen [x, z] pozisyonu
 */
export const findEmptyGridPosition = (
  tablePositions: [number, number][],
  layout = analyzeGridLayout(tablePositions)
): [number, number] => {
  const { rows, columns, rowSpacing, columnSpacing } = layout;

  // Eğer hiç masa yoksa start pozisyonunu döndür
  if (rows.length === 0) {
    return [0, 0];
  }

  // Tüm satır-sütun kombinasyonlarını kontrol et
  for (const row of rows) {
    for (const column of columns) {
      const position: [number, number] = [row, column];
      // Eğer bu konumda masa yoksa boş demektir
      const occupied = tablePositions.some(
        pos => Math.abs(pos[0] - row) < 0.1 && Math.abs(pos[1] - column) < 0.1
      );
      if (!occupied) {
        return position;
      }
    }
  }

  // Tüm kombinasyonlar dolu ise yeni satırı başlat
  const nextRow = Math.max(...rows) + rowSpacing;
  return [nextRow, columns[0]];
};