
const form = document.querySelector('form');
const table = document.querySelector('.table');
const filterControllers = Array.from(form.querySelectorAll('select, input'));

function intersect(elementArrays) {
  let returnArray = elementArrays[0];
  for (let i = 1; i < elementArrays.length; i++) {
    returnArray = returnArray.filter((value) => elementArrays[i].includes(value));
  }
  return returnArray;
}

function updateFilters() {
  const activeFilters = filterControllers.map((filterElement) => {
    return filterElement.value;
  });

  const filteredElements = activeFilters.map((filterValue) => {
    return Array.from(table.querySelectorAll(`.row[data-filters${(filterValue === '*') ? '' : `*="${filterValue}"`}]`));
  });

  const elementsToShow = intersect(filteredElements);

  Array.from(table.querySelectorAll('.row[data-filters]')).forEach((rowElement) => { rowElement.style.display = 'none'; });
  elementsToShow.forEach((rowElement) => { rowElement.style.display = 'block'; });
}

module.exports = {
  init() {
    filterControllers.forEach((filterController) => {
      filterController.addEventListener('change', updateFilters);
    });
  },
};
