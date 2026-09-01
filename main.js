document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // MENÚ PRINCIPAL
  // ============================================================

  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');

  if (!toggle || !nav) {
    console.error('DeskAssist Global: no se encontró #menuToggle o #mainNav');
    return;
  }


  // ============================================================
  // ABRIR / CERRAR MENÚ MÓVIL
  // ============================================================

  toggle.addEventListener('click', function (e) {

    e.preventDefault();
    e.stopPropagation();

    var isOpen = nav.classList.toggle('open');

    toggle.classList.toggle('open', isOpen);

    toggle.setAttribute(
      'aria-expanded',
      isOpen ? 'true' : 'false'
    );

    toggle.setAttribute(
      'aria-label',
      isOpen ? 'Cerrar menú' : 'Abrir menú'
    );

    document.body.style.overflow = isOpen ? 'hidden' : '';

  });


  // ============================================================
  // DROPDOWNS
  // Clic/tap en móvil y hover en PC mediante CSS
  // ============================================================

  document
    .querySelectorAll('.has-dropdown > a')
    .forEach(function (link) {

      link.addEventListener('click', function (e) {

        var parent = link.parentElement;

        var isMobile =
          window.matchMedia('(max-width: 880px)').matches;

        if (isMobile) {

          e.preventDefault();
          e.stopPropagation();

          var wasOpen =
            parent.classList.contains('open');

          // Cerrar otros dropdowns
          document
            .querySelectorAll('.has-dropdown.open')
            .forEach(function (el) {

              if (el !== parent) {
                el.classList.remove('open');
              }

            });

          // Abrir/cerrar el seleccionado
          parent.classList.toggle('open', !wasOpen);

        }

      });

    });


  // ============================================================
  // CERRAR MENÚ AL ELEGIR UN ENLACE FINAL
  // ============================================================

  document
    .querySelectorAll(
      '.main-nav .dropdown a, ' +
      '.main-nav > ul > li:not(.has-dropdown) > a'
    )
    .forEach(function (link) {

      link.addEventListener('click', function () {

        if (
          window.matchMedia('(max-width: 880px)').matches
        ) {

          nav.classList.remove('open');

          toggle.classList.remove('open');

          toggle.setAttribute(
            'aria-expanded',
            'false'
          );

          toggle.setAttribute(
            'aria-label',
            'Abrir menú'
          );

          document.body.style.overflow = '';

        }

      });

    });


  // ============================================================
  // CERRAR MENÚ SI SE CAMBIA DE CELULAR A PC
  // ============================================================

  window.addEventListener('resize', function () {

    if (window.innerWidth > 880) {

      nav.classList.remove('open');

      toggle.classList.remove('open');

      toggle.setAttribute(
        'aria-expanded',
        'false'
      );

      toggle.setAttribute(
        'aria-label',
        'Abrir menú'
      );

      document.body.style.overflow = '';

      // Cerrar dropdowns móviles
      document
        .querySelectorAll('.has-dropdown.open')
        .forEach(function (el) {
          el.classList.remove('open');
        });

    }

  });


  // ============================================================
  // ENLACE ACTIVO SEGÚN LA PÁGINA ACTUAL
  // ============================================================

  var current =
    window.location.pathname.split('/').pop() ||
    'index.html';

  document
    .querySelectorAll('.main-nav > ul > li')
    .forEach(function (li) {

      var link =
        li.querySelector(':scope > a');

      if (
        link &&
        link.getAttribute('href') === current
      ) {

        li.classList.add('active');

      }

    });


  // ============================================================
  // MENSAJE DE COMPROBACIÓN
  // ============================================================

  console.log(
    'DeskAssist Global: menú móvil cargado correctamente.'
  );

});
