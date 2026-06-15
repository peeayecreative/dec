if (window.vendor?.wp?.hooks) {
  window.vendor.wp.hooks.addFilter('divi.moduleLibrary.moduleMapping', 'divi', modules => {
    // A path to select and modify in the `modules` object
    const path = ['decm/event-carousel', 'metadata'];
    

    // Helper functions and constants
    const { get, has } = window.lodash;
    const target = get(modules, path, {});

    if (has(modules, path)) {
      target.folder = 'divi-events-calendar';
    } else {
      console.warn(`Path ${path.join('.')} does not exist in modules.`);
    }

    // Return the modified modules
    return modules;
  });
} else {
  console.error('Required dependencies are not available.');
}