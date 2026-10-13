const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const progress = document.querySelector('.scroll-progress');
let scrollQueued = false;
function updateScroll() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${height > 0 ? window.scrollY / height : 0})`;
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
updateScroll();

const hero = document.querySelector('.hero');
const photos = [...document.querySelectorAll('[data-depth]')];
let pointerFrame = 0;
hero.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse' || window.innerWidth < 900) return;
  const x = (event.clientX / window.innerWidth - 0.5) * 28;
  const y = (event.clientY / hero.clientHeight - 0.5) * 24;
  cancelAnimationFrame(pointerFrame);
  pointerFrame = requestAnimationFrame(() => {
    photos.forEach(photo => {
      const depth = Number(photo.dataset.depth);
      photo.style.translate = `${x * depth}px ${y * depth}px`;
    });
  });
});
hero.addEventListener('pointerleave', () => {
  cancelAnimationFrame(pointerFrame);
  photos.forEach(photo => { photo.style.translate = '0 0'; });
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.header nav');
function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const dialog = document.querySelector('#booking-dialog');
const form = document.querySelector('#booking-form');
const formContent = document.querySelector('.form-content');
const success = document.querySelector('.form-success');
let previousFocus;
const now = new Date();
const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
form.elements.date.min = localDate;
function resetView() {
  formContent.hidden = false;
  success.hidden = true;
}
function openBooking(service) {
  previousFocus = document.activeElement;
  resetView();
  if (service) form.elements.service.value = service;
  closeMenu();
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => openBooking()));
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => openBooking(button.dataset.service)));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  form.reset();
  previousFocus?.focus({ preventScroll: true });
});
form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const digits = form.elements.phone.value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    form.elements.phone.setCustomValidity('Укажите телефон: от 10 до 15 цифр.');
    form.elements.phone.reportValidity();
    return;
  }
  if (!form.elements.name.value.trim()) {
    form.elements.name.setCustomValidity('Пожалуйста, укажите имя.');
    form.elements.name.reportValidity();
    return;
  }
  const data = new FormData(form);
  const date = new Date(`${data.get('date')}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  document.querySelector('#booking-summary').textContent = `${String(data.get('name')).trim()}, ваш выбор — ${String(data.get('service')).toLowerCase()}. Желаемая дата: ${date}.`;
  formContent.hidden = true;
  success.hidden = false;
  dialog.scrollTop = 0;
  document.querySelector('#booking-again').focus();
});
form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));
document.querySelector('#booking-again').addEventListener('click', () => {
  resetView();
  form.elements.service.focus();
});
