document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Remove old error messages
        form.querySelectorAll('.error-msg').forEach(function (m) { m.remove(); });

        var valid = true;

        function showError(input, message) {
            var msg = document.createElement('small');
            msg.className = 'error-msg';
            msg.textContent = message;
            input.parentElement.appendChild(msg);
            valid = false;
        }

        var name = form.querySelector('#name');
        var phone = form.querySelector('#phone');
        var message = form.querySelector('#message');

        if (name.value.trim().length < 2) {
            showError(name, 'Please enter your full name.');
        }

        if (phone.value.trim() !== '' && !/^[0-9+ ]{10,15}$/.test(phone.value.trim())) {
            showError(phone, 'Enter a valid phone number (10 to 15 digits).');
        }

        if (message.value.trim().length < 10) {
            showError(message, 'Please write at least 10 characters.');
        }

        if (valid) {
            alert('Thank you! Your message has been sent.');
            form.reset();
        }
    });
});
// Fade-in animation on scroll
document.addEventListener('DOMContentLoaded', function () {
    var items = document.querySelectorAll(
        '.product-card, .service-card, .step, .benefits li, .info-item, .contact-item'
    );

    items.forEach(function (item) {
        item.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach(function (item) {
        observer.observe(item);
    });
});