// ================================
// NDLOVU POULTRY FARM - script.js
// ================================

// ---------- Helpers ----------
function clearErrors(form) {
    form.querySelectorAll('.error-msg').forEach(function (m) { m.remove(); });
}

function showError(input, message) {
    var msg = document.createElement('small');
    msg.className = 'error-msg';
    msg.textContent = message;
    input.parentElement.appendChild(msg);
}

// Checks the fields every form shares. Returns true if all are valid.
function validateCommon(form) {
    var valid = true;
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var phone = form.querySelector('#phone');
    var message = form.querySelector('#message');

    if (name && name.value.trim().length < 2) {
        showError(name, 'Please enter your full name.');
        valid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        valid = false;
    }

    if (phone) {
        var p = phone.value.trim();
        var phoneRequired = phone.hasAttribute('required');
        if ((phoneRequired || p !== '') && !/^[0-9+ ]{10,15}$/.test(p)) {
            showError(phone, 'Enter a valid phone number (10 to 15 digits).');
            valid = false;
        }
    }

    if (message && message.value.trim().length < 10) {
        showError(message, 'Please write at least 10 characters.');
        valid = false;
    }

    return valid;
}

// ---------- CONTACT FORM: compile an email and open it ----------
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors(form);

        var valid = validateCommon(form);

        var subject = form.querySelector('#subject');
        var type = form.querySelector('#messageType');

        if (type && type.value === '') {
            showError(type, 'Please select a message type.');
            valid = false;
        }
        if (subject && subject.value.trim().length < 3) {
            showError(subject, 'Please enter a subject.');
            valid = false;
        }

        if (!valid) return;

        // Recipient email address
        var recipient = 'info@ndlovupoultry.com';

        var body =
            'Name: ' + form.querySelector('#name').value.trim() + '\n' +
            'Email: ' + form.querySelector('#email').value.trim() + '\n' +
            'Phone: ' + form.querySelector('#phone').value.trim() + '\n' +
            'Message type: ' + type.value + '\n\n' +
            form.querySelector('#message').value.trim();

        var mailto = 'mailto:' + recipient +
            '?subject=' + encodeURIComponent('[' + type.value + '] ' + subject.value.trim()) +
            '&body=' + encodeURIComponent(body);

        alert('Thank you! Your email is ready. Press Send in your email app to finish.');
        window.location.href = mailto;
        form.reset();
    });
});

// ---------- ENQUIRY FORM: validate, send with AJAX, show cost response ----------
document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('enquiryForm');
    if (!form) return;

    var result = document.getElementById('enquiryResult');

    // Change these prices to match your farm
    var PRICES = {
        'live-chickens': { label: 'Live Chickens', price: 65, unit: 'chicken' },
        'fresh-eggs': { label: 'Fresh Eggs', price: 55, unit: 'dozen' },
        'chicks': { label: 'Chicks', price: 15, unit: 'chick' },
        'slaughtering': { label: 'Slaughtering & Cleaning', price: 20, unit: 'chicken' }
    };

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors(form);
        result.textContent = '';
        result.className = '';

        var valid = validateCommon(form);

        var product = form.querySelector('#product');
        var qtyInput = form.querySelector('#quantity');
        var delivery = form.querySelector('#delivery');
        var quantity = parseInt(qtyInput.value, 10);
        var item = PRICES[product.value];

        if (product.value === '') {
            showError(product, 'Please select a product.');
            valid = false;
        }

        if (item && (isNaN(quantity) || quantity < 1)) {
            showError(qtyInput, 'Please enter a quantity of 1 or more.');
            valid = false;
        }

        if (!valid) return;

        // Build the response (cost / availability)
        var lines = [];
        lines.push('Thank you, ' + form.querySelector('#name').value.trim() + '! Your enquiry has been received.');

        if (item) {
            var total = item.price * quantity;
            var discountNote = '';
            if (quantity >= 50) {
                total = total * 0.9;
                discountNote = ' (includes 10% bulk discount)';
            }
            lines.push('Product: ' + item.label);
            lines.push('Price: R' + item.price + ' per ' + item.unit);
            lines.push('Estimated cost for ' + quantity + ': R' + total.toFixed(2) + discountNote);
            lines.push('Availability: In stock. Ready within 24 hours.');
        } else {
            lines.push('Our team will send you a quote and availability within 24 hours.');
        }

        if (delivery.value === 'yes') {
            lines.push('Delivery: We deliver to local areas in Mpumalanga. The delivery fee will be confirmed when we contact you.');
        } else if (delivery.value === 'no') {
            lines.push('Pickup: Collect from the farm during business hours.');
        }

        // AJAX submission: sends the form to the URL in the form action
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form)
        })
            .then(function (response) {
                if (!response.ok) throw new Error('Request failed');
                result.className = 'enquiry-result success';
                result.textContent = lines.join('\n');
                form.reset();
            })
            .catch(function () {
                result.className = 'enquiry-result failed';
                result.textContent = 'Sorry, something went wrong sending your enquiry. Please check your internet connection and try again.';
            });
    });
});

// ---------- Fade-in animation on scroll ----------
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

// ---------- SERVICES: search and sort ----------
document.addEventListener('DOMContentLoaded', function () {
    var search = document.getElementById('serviceSearch');
    var sort = document.getElementById('serviceSort');
    var grid = document.querySelector('.services-grid');
    if (!search || !grid) return;

    var original = Array.prototype.slice.call(grid.querySelectorAll('.service-card'));
    var noResults = document.getElementById('noResults');

    function title(card) {
        return card.querySelector('h2').textContent.toLowerCase();
    }

    function update() {
        var q = search.value.trim().toLowerCase();
        var list = original.slice();

        if (sort.value === 'az') {
            list.sort(function (a, b) { return title(a).localeCompare(title(b)); });
        } else if (sort.value === 'za') {
            list.sort(function (a, b) { return title(b).localeCompare(title(a)); });
        }

        var shown = 0;
        list.forEach(function (card) {
            grid.appendChild(card);
            var match = card.textContent.toLowerCase().indexOf(q) !== -1;
            card.style.display = match ? '' : 'none';
            if (match) shown++;
        });

        noResults.style.display = shown === 0 ? 'block' : 'none';
    }

    search.addEventListener('input', update);
    sort.addEventListener('change', update);
});

// ---------- ABOUT: accordion ----------
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.accordion-header').forEach(function (btn) {
        btn.addEventListener('click', function () {
            btn.parentElement.classList.toggle('open');
        });
    });
});

// ---------- GALLERY: lightbox ----------
document.addEventListener('DOMContentLoaded', function () {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    var lightboxImg = document.getElementById('lightboxImg');

    document.querySelectorAll('.gallery-img').forEach(function (img) {
        img.addEventListener('click', function () {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('show');
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('show');
    }

    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });
});

// ---------- CONTACT: Leaflet map ----------
document.addEventListener('DOMContentLoaded', function () {
    var mapDiv = document.getElementById('map');
    if (!mapDiv || typeof L === 'undefined') return;

    // Change these numbers to your farm's location
    var lat = -25.4753;
    var lng = 30.9694;

    var map = L.map('map').setView([lat, lng], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup('<strong>Ndlovu Poultry Farm</strong><br>Mpumalanga, South Africa')
        .openPopup();

    setTimeout(function () {
        map.invalidateSize();
    }, 200);
});

// ---------- SERVICES: dynamic product list (loaded with JavaScript) ----------
document.addEventListener('DOMContentLoaded', function () {
    var list = document.getElementById('productList');
    if (!list) return;

    // Change these products and prices to match your farm
    var products = [
        { name: 'Live Chickens', price: 65, unit: 'per chicken', text: 'Healthy, quality chickens from our farm.' },
        { name: 'Fresh Eggs', price: 55, unit: 'per dozen', text: 'Farm-fresh eggs collected daily.' },
        { name: 'Chicks', price: 15, unit: 'per chick', text: 'Well-bred broiler and layer chicks.' },
        { name: 'Slaughtering and Cleaning', price: 20, unit: 'per chicken', text: 'Ready-to-cook chickens, gutted and plucked.' }
    ];

    products.forEach(function (p) {
        var card = document.createElement('div');
        card.className = 'product-card';

        var title = document.createElement('h3');
        title.textContent = p.name;

        var desc = document.createElement('p');
        desc.textContent = p.text;

        var price = document.createElement('p');
        price.className = 'product-price';
        price.textContent = 'R' + p.price + ' ' + p.unit;

        var link = document.createElement('a');
        link.href = 'enquiries.html';
        link.className = 'btn product-btn';
        link.textContent = 'Enquire now';

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(price);
        card.appendChild(link);
        list.appendChild(card);
    });
});