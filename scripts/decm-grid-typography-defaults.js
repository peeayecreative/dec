/**
 * Grid layout typography defaults by column count (mirrors grid-typography-defaults.ts).
 */
(function (root) {
  var GRID_TYPOGRAPHY_BY_COLUMNS = {
    1: { title: '26px', details: '16px', labels: '16px', excerpt: '16px' },
    2: { title: '22px', details: '15px', labels: '15px', excerpt: '15px' },
    3: { title: '20px', details: '14px', labels: '14px', excerpt: '14px' },
    4: { title: '18px', details: '13px', labels: '13px', excerpt: '13px' },
  };

  function normalizeGridColumnCount(columns) {
    var value = String(columns == null ? '3' : columns).trim();
    return GRID_TYPOGRAPHY_BY_COLUMNS[value] ? value : '3';
  }

  function getGridTypographyForColumns(columns) {
    return GRID_TYPOGRAPHY_BY_COLUMNS[normalizeGridColumnCount(columns)];
  }

  function getGridColumnsClass(columns) {
    return 'decm-grid-cols-' + normalizeGridColumnCount(columns);
  }

  root.DecmGridTypographyDefaults = {
    GRID_TYPOGRAPHY_BY_COLUMNS: GRID_TYPOGRAPHY_BY_COLUMNS,
    normalizeGridColumnCount: normalizeGridColumnCount,
    getGridTypographyForColumns: getGridTypographyForColumns,
    getGridColumnsClass: getGridColumnsClass,
  };
})(typeof window !== 'undefined' ? window : this);
