// =================================================================
// Shared site JavaScript (every page)
// Root-relative paths work from any folder (posts/, practices/, ...)
// =================================================================


// ----- Header -----

fetch("/header.html")
    .then(response => response.text())
    .then(data => {
        const slot = document.getElementById("header");
        if (!slot) return;

        slot.innerHTML = data;
        updateNavOnScroll();
        markCurrentPage();
    });


// ----- Footer -----

fetch("/footer.html")
    .then(response => response.text())
    .then(data => {
        const slot = document.getElementById("footer");
        if (!slot) return;

        slot.innerHTML = data;

        // Tell Font Awesome to process the newly added icons
        if (window.FontAwesome) {
            FontAwesome.dom.i2svg();
        }
    });


// ----- Navigation -----

function setMenuOpen(open) {
    const menu = document.getElementById("mobileMenu");
    const button = document.querySelector(".dropbtn");
    if (!menu || !button) return;

    menu.classList.toggle("show", open);
    button.setAttribute("aria-expanded", String(open));
}

function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu) setMenuOpen(!menu.classList.contains("show"));
}

// Close mobile menu when clicking outside
window.addEventListener("click", function (event) {
    const menu = document.getElementById("mobileMenu");
    const button = document.querySelector(".dropbtn");

    if (menu && button &&
        !button.contains(event.target) &&
        !menu.contains(event.target)) {
        setMenuOpen(false);
    }
});

// Close mobile menu with Escape and return focus to the button
document.addEventListener("keydown", function (event) {
    const menu = document.getElementById("mobileMenu");

    if (event.key === "Escape" && menu && menu.classList.contains("show")) {
        setMenuOpen(false);
        document.querySelector(".dropbtn")?.focus();
    }
});

// Highlight the section the visitor is in
function markCurrentPage() {
    const path = location.pathname;
    const section =
        path.startsWith("/posts/") ? "/blog.html" :
        path.startsWith("/practices/") ? "/practice.html" :
        path === "/" ? "/index.html" : path;

    document.querySelectorAll("nav a").forEach(link => {
        if (link.getAttribute("href") === section && !link.classList.contains("logo")) {
            link.setAttribute("aria-current", "page");
        }
    });
}

// Change navbar background when scrolling
function updateNavOnScroll() {
    const nav = document.querySelector("nav");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
}

window.addEventListener("scroll", updateNavOnScroll, { passive: true });

// Height of the fixed nav, used when scrolling to a chapter
function navHeight() {
    const nav = document.querySelector("nav");
    return nav ? nav.offsetHeight : 0;
}


// ----- Side notes (Bhagavad Gita) -----
// Terms open on hover, keyboard focus, or tap.

document.querySelectorAll(".note-term").forEach(term => {
    term.setAttribute("tabindex", "0");
    term.setAttribute("role", "button");
    term.setAttribute("aria-expanded", "false");

    const toggle = () => {
        const open = !term.classList.contains("open");
        term.classList.toggle("open", open);
        term.setAttribute("aria-expanded", String(open));
    };

    term.addEventListener("click", toggle);
    term.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
        }
    });
});


// ----- Tabs -----

function openTab(event, tabId, scrollToTabs = true) {
    const selectedContent = document.getElementById(tabId);
    if (!selectedContent) return;

    document.querySelectorAll(".tab-content")
        .forEach(content => content.classList.remove("active"));
    document.querySelectorAll(".tab-button")
        .forEach(button => {
            button.classList.remove("active");
            button.setAttribute("aria-selected", "false");
        });

    selectedContent.classList.add("active");

    // Activate the correct tab button
    const activeButton = event
        ? event.currentTarget
        : document.querySelector(`.tab-button[onclick*="'${tabId}'"]`);

    if (activeButton) {
        activeButton.classList.add("active");
        activeButton.setAttribute("aria-selected", "true");

        activeButton.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        });
    }

    // Scroll to the beginning of the selected chapter
    if (scrollToTabs) {
        setTimeout(() => scrollToChapter(selectedContent), 100);
    }
}

function scrollToChapter(chapter) {
    const tabButtons = document.querySelector(".tab-buttons");
    const tabBarHeight = tabButtons ? tabButtons.offsetHeight : 0;

    const position =
        chapter.getBoundingClientRect().top +
        window.scrollY -
        navHeight() -
        tabBarHeight;

    window.scrollTo({ top: position, behavior: "smooth" });
}


// ----- Previous / Next Chapter -----

function goToChapter(tabId) {
    openTab(null, tabId, false);

    setTimeout(() => {
        const chapter = document.getElementById(tabId);
        if (chapter) scrollToChapter(chapter);
    }, 100);
}
