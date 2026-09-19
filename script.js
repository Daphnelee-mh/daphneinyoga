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
function openTab(event, tabId, scrollToTabs = true) {
    const contents = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-button");

    contents.forEach(content => content.classList.remove("active"));
    buttons.forEach(button => button.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");

    // Activate the correct tab button
    let activeButton;

    if (event) {
        activeButton = event.currentTarget;
    } else {
        activeButton = document.querySelector(
            `.tab-button[onclick*="'${tabId}'"]`
        );
    }

    if (activeButton) {
        activeButton.classList.add("active");

        // Keep the active button visible in the horizontal scroll
        activeButton.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        });
    }

    // Scroll page so the sticky tab bar sits under the header
    if (scrollToTabs) {
        setTimeout(() => {
            const tabButtons = document.querySelector(".tab-buttons");

            if (tabButtons) {
                const headerOffset = 70;

                const position =
                    tabButtons.getBoundingClientRect().top +
                    window.scrollY -
                    headerOffset;

                window.scrollTo({
                    top: position,
                    behavior: "smooth"
                });
            }
        }, 50);
    }
}


// ----- Previous / Next Chapter -----
function goToChapter(tabId) {
    openTab(null, tabId, false);

    setTimeout(() => {
        const chapter = document.getElementById(tabId);
        const tabButtons = document.querySelector(".tab-buttons");

        if (chapter && tabButtons) {
            const headerOffset = 70;
            const tabBarHeight = tabButtons.offsetHeight;

            const position =
                chapter.getBoundingClientRect().top +
                window.scrollY -
                headerOffset -
                tabBarHeight;

            window.scrollTo({
                top: position,
                behavior: "smooth"
            });
        }
    }, 100);
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
