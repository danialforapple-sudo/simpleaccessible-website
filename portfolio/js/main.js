// Progressive enhancement: the site works fully without JavaScript.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForm();

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
});

/* Mobile navigation disclosure */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const list = document.getElementById('nav-list');
  if (!toggle || !list) return;

  const setOpen = (open) => toggle.setAttribute('aria-expanded', String(open));

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link, and on Escape (returning focus to the button)
  list.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* Contact form: accessible validation with an error summary and inline errors */
function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const summary = form.querySelector('.error-summary');
  const summaryList = summary.querySelector('ul');
  const status = form.querySelector('.form-status');

  const messages = {
    name: 'Enter your name',
    email: 'Enter an email address in the correct format, like name@example.com',
    message: 'Enter a message',
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const errors = [];
    for (const field of form.querySelectorAll('[required]')) {
      if (!field.checkValidity()) errors.push(field);
    }

    if (errors.length) {
      errors.forEach(showFieldError);
      summaryList.innerHTML = '';
      for (const field of errors) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${field.id}`;
        a.textContent = messages[field.name];
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          field.focus();
        });
        li.append(a);
        summaryList.append(li);
      }
      summary.hidden = false;
      summary.focus();
      return;
    }

    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(res.statusText);
      form.reset();
      status.textContent = 'Thanks! Your message has been sent. We will reply within two working days.';
    } catch {
      status.textContent = 'Sorry, your message could not be sent. Please email us at hello@example.com instead.';
    }
  });

  function showFieldError(field) {
    const id = `${field.id}-error`;
    const error = document.createElement('span');
    error.id = id;
    error.className = 'field-error';
    error.textContent = messages[field.name];
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', id);
    field.insertAdjacentElement('afterend', error);
  }

  function clearErrors() {
    summary.hidden = true;
    status.textContent = '';
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
    form.querySelectorAll('[aria-invalid]').forEach((el) => {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
  }
}
