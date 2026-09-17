// ----- Determine page location -----

const isPost = window.location.pathname.includes("/posts/");
const basePath = isPost ? "../" : "";


// ----- Header -----

fetch(basePath + "/header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header").innerHTML = data;
    });


// ----- Navigation -----

function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("show");
}

// Close mobile menu when clicking outside
window.addEventListener("click", function(event) {
    const menu = document.getElementById("mobileMenu");
    const button = document.querySelector(".dropbtn");

    if (menu && button &&
        !button.contains(event.target) &&
        !menu.contains(event.target)) {
        menu.classList.remove("show");
    }
});


// Change navbar background when scrolling
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

    // Only activate the button if the function was called by a tab button
    if (event) {
        event.currentTarget.classList.add("active");
    } else {
        // Find and activate the corresponding tab button
        const button = document.querySelector(
            `.tab-button[onclick*="'${tabId}'"]`
        );

        if (button) {
            button.classList.add("active");
        }
    }
}

function nextChapter(tabId) {
    openTab(null, tabId);

    setTimeout(() => {
        const tabs = document.querySelector(".tab-buttons");

        if (tabs) {
            const headerOffset = 70;
            const tabsPosition = tabs.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: tabsPosition - headerOffset,
                behavior: "smooth"
            });
        }
    }, 50);
}

// ----- Footer -----

fetch(basePath + "footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer").innerHTML = data;

        // Tell Font Awesome to process the newly added icons
        if (window.FontAwesome) {
            FontAwesome.dom.i2svg();
        }
    });
