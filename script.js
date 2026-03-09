const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links a');
const yearNode = document.querySelector('#year');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 900 && nav && menuButton) {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
});

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
