document.addEventListener('DOMContentLoaded', function () {
    const activePage = window.location.pathname;

    const navLinks = document.querySelectorAll('.nav li a');

    navLinks.forEach(navLink => {
        const hrefValue = navLink.getAttribute('href');

        // Check if the activePage contains the hrefValue or vice versa
        if (activePage.includes(hrefValue) || hrefValue.includes(activePage)) {
            const activate = navLink.querySelector('.nav li a button'); // Find the button inside the navLink
            if (activate) {
                activate.classList.add('active-bg');
            }
        }
    });


})