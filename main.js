document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Dropdown: clic/tap en móvil y PC (además del hover que ya cubre CSS en escritorio)
  document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var parent = link.parentElement;
      var isMobile = window.matchMedia('(max-width: 880px)').matches;
      if (isMobile) {
        e.preventDefault();
        var wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.has-dropdown.open').forEach(function (el) {
          el.classList.remove('open');
        });
        parent.classList.toggle('open', !wasOpen);
      }
    });
  });

  // Cerrar el menú móvil al elegir un enlace final
  document.querySelectorAll('.main-nav .dropdown a, .main-nav > ul > li:not(.has-dropdown) > a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 880px)').matches && nav) {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Marcar el enlace activo según la página actual
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav > ul > li').forEach(function (li) {
    var link = li.querySelector(':scope > a');
    if (link && link.getAttribute('href') === current) {
      li.classList.add('active');
    }
  });
});
