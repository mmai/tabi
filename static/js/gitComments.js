// Submits the git comments form without leaving the page, and shows the
// server response in place of the form. Without JavaScript the form still
// posts normally and the server answers with a small HTML page.
document.querySelectorAll('form.git-comment-form').forEach((form) => {
    const status = form.querySelector('.git-comment-status');
    // The HTML minifier drops type="submit" (the default), so select the plain button.
    const button = form.querySelector('button');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (form.getAttribute('aria-busy') === 'true') return;
        const label = button.textContent;
        form.setAttribute('aria-busy', 'true');
        button.disabled = true;
        button.textContent = form.dataset.sendingLabel || label;
        status.textContent = '';
        status.classList.remove('git-comment-error');

        let result;
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            result = await response.json();
        } catch {
            result = { ok: false, message: form.dataset.errorMessage };
        }

        if (result.ok) {
            const notice = document.createElement('p');
            notice.className = 'git-comment-status git-comment-success';
            notice.setAttribute('role', 'status');
            notice.textContent = result.message;
            form.replaceWith(notice);
            return;
        }

        status.textContent = result.message;
        status.classList.add('git-comment-error');
        form.removeAttribute('aria-busy');
        button.disabled = false;
        button.textContent = label;
        // A Turnstile token can only be used once.
        const widget = form.querySelector('.cf-turnstile');
        if (widget && window.turnstile) {
            window.turnstile.reset(widget);
        }
    });
});
