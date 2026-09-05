// ----- Navigation -----

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

// Change navbar background when scrolling
window.addEventListener("click", function(event) {
    const menu = document.getElementById("mobileMenu");
    const button = document.querySelector(".dropbtn");

    if (menu && button &&
        !button.contains(event.target) &&
        !menu.contains(event.target)) {
        menu.classList.remove("show");
    }
});

  // Close mobile menu when clicking outside
window.addEventListener("scroll", function() {
    const nav = document.querySelector("nav");

    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    }
});

// ----- Tabs -----

function openTab(event, tabId) {
    const contents = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-button");

    contents.forEach(content => {
        content.classList.remove("active");
    });

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}

// ----- Footer -----

fetch("footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer").innerHTML = data;

        // Tell Font Awesome to process the newly added icons
        if (window.FontAwesome) {
            FontAwesome.dom.i2svg();
        }
    });
