if (window.divi?.moduleLibrary) {
  window.divi.moduleLibrary.registerFolder({
    name: 'divi-events-calendar',
    path: '',
    title: 'Event Modules',
    icon: 'decm/event-page',
    category: 'module',
  });
} else {
  console.error('Required dependencies are not available.');
}
 