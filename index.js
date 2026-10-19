/* =====================================================
APLUS TUTORS HOMEPAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

/* =================================================
   MOBILE NAVIGATION
================================================= */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {

        const isOpen = mainNav.classList.toggle("show");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

    });


    // Close mobile menu after clicking a link

    const navLinks = mainNav.querySelectorAll("a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("show");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =================================================
   HERO CAROUSEL
================================================= */

const slides = document.querySelectorAll(".hero-slide");
const indicators = document.querySelectorAll(".indicator");

const nextButton = document.getElementById("heroNext");
const prevButton = document.getElementById("heroPrev");

let currentSlide = 0;
let heroTimer;


function showHeroSlide(index) {

    if (!slides.length) return;

    slides.forEach(slide => {

        slide.classList.remove("active");

    });


    indicators.forEach(indicator => {

        indicator.classList.remove("active");

    });


    currentSlide =
        (index + slides.length) % slides.length;


    slides[currentSlide].classList.add("active");


    if (indicators[currentSlide]) {

        indicators[currentSlide]
            .classList.add("active");

    }

}


function nextHeroSlide() {

    showHeroSlide(currentSlide + 1);

}


function previousHeroSlide() {

    showHeroSlide(currentSlide - 1);

}


function startHeroTimer() {

    clearInterval(heroTimer);

    heroTimer = setInterval(
        nextHeroSlide,
        6000
    );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            nextHeroSlide();

            startHeroTimer();

        }
    );

}


if (prevButton) {

    prevButton.addEventListener(
        "click",
        () => {

            previousHeroSlide();

            startHeroTimer();

        }
    );

}


indicators.forEach((indicator, index) => {

    indicator.addEventListener(
        "click",
        () => {

            showHeroSlide(index);

            startHeroTimer();

        }
    );

});


showHeroSlide(0);

startHeroTimer();


/* =================================================
   TESTIMONIALS
================================================= */

const testimonialContainer =
    document.getElementById(
        "testimonial-container"
    );

const testimonialNext =
    document.getElementById(
        "nextTestimonial"
    );

const testimonialPrev =
    document.getElementById(
        "prevTestimonial"
    );


if (
    testimonialContainer &&
    typeof testimonials !== "undefined" &&
    testimonials.length > 0
) {

    let currentTestimonial = 0;

    testimonialContainer.innerHTML =
        testimonials
            .map((testimonial, index) => {

                return `

                <article
                    class="testimonial-card ${index === 0 ? "active" : ""}"
                >

                    <img
                        src="${testimonial.image}"
                        alt="${testimonial.name}"
                        class="testimonial-image"
                    >

                    <p class="testimonial-message">
                        "${testimonial.message}"
                    </p>

                    <h3 class="testimonial-name">
                        ${testimonial.name}
                    </h3>

                    <span class="testimonial-role">
                        ${testimonial.role}
                    </span>

                </article>

                `;

            })
            .join("");


    const cards =
        testimonialContainer
            .querySelectorAll(
                ".testimonial-card"
            );


    function showTestimonial(index) {

        cards.forEach(card => {

            card.classList.remove("active");

        });


        currentTestimonial =
            (index + cards.length)
            % cards.length;


        cards[currentTestimonial]
            .classList.add("active");

    }


    if (testimonialNext) {

        testimonialNext
            .addEventListener(
                "click",
                () => {

                    showTestimonial(
                        currentTestimonial + 1
                    );

                }
            );

    }


    if (testimonialPrev) {

        testimonialPrev
            .addEventListener(
                "click",
                () => {

                    showTestimonial(
                        currentTestimonial - 1
                    );

                }
            );

    }


    // Automatically change testimonial

    setInterval(() => {

        showTestimonial(
            currentTestimonial + 1
        );

    }, 7000);

}


/* =================================================
   HEADER SCROLL EFFECT
================================================= */

const header =
    document.getElementById(
        "siteHeader"
    );


window.addEventListener(
    "scroll",
    () => {

        if (!header) return;

        if (window.scrollY > 40) {

            header.style.background =
                "rgba(5,5,5,0.98)";

        } else {

            header.style.background =
                "rgba(5,5,5,0.92)";

        }

    }
);


/* =================================================
   SMOOTH SCROLL FOR INTERNAL LINKS
================================================= */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");

                if (
                    targetId === "#" ||
                    !targetId
                ) return;


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    });

});