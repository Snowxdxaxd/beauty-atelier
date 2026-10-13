const workFilters = document.querySelectorAll('[data-filter]');
const workCards = document.querySelectorAll('[data-category]');
workFilters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    workFilters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    let count = 0;
    workCards.forEach(card => {
      const visible = category === 'all' || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) count += 1;
    });
    document.querySelector('.work-count').textContent = `Показано: ${count}`;
  });
});
