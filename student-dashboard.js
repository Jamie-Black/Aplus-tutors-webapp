"use strict";

/*==================================================
APLUS TUTORS
STUDENT DASHBOARD
CORE
==================================================*/


/*==================================================
ELEMENTS
==================================================*/

const sidebar =
    document.getElementById("sidebar");

const topbar =
    document.getElementById("topbar");

const overlay =
    document.getElementById("overlay");

const pageLoader =
    document.getElementById("pageLoader");


/*==================================================
CURRENT USER
==================================================*/

let currentUser = null;
/* ==================================================
   PHASE 3B — DIAGNOSTIC SUBJECT LOADING
================================================== */

let studentSubjects = [];


async function loadStudentSubjects() {

    try {

        console.log(
            "================================="
        );

        console.log(
            "LOADING STUDENT SUBJECTS"
        );

        console.log(
            "Student department:",
            currentStudentDepartment
        );


        if (!currentStudentDepartment) {

            console.error(
                "Student department is empty."
            );

            showSubjectsError();

            return;

        }


        /* ==========================================
           FIRST: LOAD ALL SUBJECTS
           WITHOUT FILTERING
        ========================================== */

        const allSubjectsResponse =
            await tablesDB.listRows(
                DATABASE_ID,
                SUBJECTS_TABLE_ID,
                [
                    Query.limit(100)
                ]
            );


        console.log(
            "ALL SUBJECT ROWS:",
            allSubjectsResponse.rows
        );

        console.log(
            "TOTAL SUBJECT ROWS:",
            allSubjectsResponse.rows.length
        );


        /* ==========================================
           SECOND: SHOW DEPARTMENT VALUES
        ========================================== */

        allSubjectsResponse.rows.forEach(
            function (subject, index) {

                console.log(
                    `Subject ${index + 1}:`,
                    {
                        id: subject.$id,
                        name: subject.name,
                        department: subject.department,
                        status: subject.status
                    }
                );

            }
        );


        /* ==========================================
           THIRD: FILTER IN JAVASCRIPT
           FOR DIAGNOSTIC PURPOSES
        ========================================== */

        const matchingSubjects =
            allSubjectsResponse.rows.filter(
                function (subject) {

                    const sameDepartment =
                        String(
                            subject.department || ""
                        ).trim().toLowerCase()
                        ===
                        String(
                            currentStudentDepartment || ""
                        ).trim().toLowerCase();


                    const isActive =
                        String(
                            subject.status || ""
                        ).trim().toLowerCase()
                        === "active";


                    return (
                        sameDepartment &&
                        isActive
                    );

                }
            );


        console.log(
            "MATCHING ACTIVE SUBJECTS:",
            matchingSubjects
        );


        console.log(
            "MATCHING SUBJECT COUNT:",
            matchingSubjects.length
        );


        /* ==========================================
           STORE RESULTS
        ========================================== */

        studentSubjects =
            matchingSubjects;


        /* ==========================================
           UPDATE COUNTERS
        ========================================== */

        updateSubjectCounters();


        /* ==========================================
           RENDER SUBJECTS
        ========================================== */

        if (
            typeof renderStudentSubjects ===
            "function"
        ) {

            renderStudentSubjects();

        }


        console.log(
            "================================="
        );


    } catch (error) {

        console.error(
            "SUBJECT LOADING ERROR:",
            error
        );

        console.error(
            "Error message:",
            error.message
        );

        showSubjectsError();

    }

}
let currentStudent = null;


/*==================================================
MENU
==================================================*/

const STUDENT_MENU = [

    {
        title: "Dashboard",
        icon: "fa-solid fa-house",
        page: "student-dashboard.html"
    },
    
    {
        title: "My subjects",
        icon: "fa-solid fa-book-open",
        page: "student-subject.html"
    },

    {
        title: "Study Notes",
        icon: "fa-solid fa-book-open",
        page: "student-notes.html"
    },
    {
        title: "Video Lessons",
        icon: "fa-solid fa-book-open",
        page: "student-videos.html"
    },
    
    {
        title: "Quick Quiz",
        icon: "fa-solid fa-circle-question",
        page: "student-quiz.html"
    },

    {
        title: "CBT Practice",
        icon: "fa-solid fa-laptop-file",
        page: "student-cbt.html"
    },

    {
        title: "My Progress",
        icon: "fa-solid fa-square-poll-vertical",
        page: "student-progress.html"
    },

    {
        title: "Profile",
        icon: "fa-solid fa-user",
        page: "student-profile.html"
    },

    {
        title: "Settings",
        icon: "fa-solid fa-gear",
        page: "student-settings.html"
    }

];


/*==================================================
WAIT FOR AUTHENTICATION
==================================================*/

document.addEventListener(

    "aplusAuthReady",

    initializeDashboard

);



/*==================================================
INITIALIZE DASHBOARD
==================================================*/

function initializeDashboard(event) {

    try {

        currentUser =
            event.detail.authUser;

        currentStudent =
            event.detail.user;

        buildSidebar();

        buildTopbar();

        populateUser();

        attachEvents();

        renderDashboard();

        hideLoader();

    }

    catch (error) {

        console.error(
            "Dashboard Error",
            error
        );

    }

}


/*==================================================
LOADER
==================================================*/

function hideLoader() {

    if (!pageLoader) {

        return;

    }

    pageLoader.style.opacity = "0";

    setTimeout(() => {

        pageLoader.style.display = "none";

    }, 300);

}


/*==================================================
HELPERS
==================================================*/

function setText(id, value) {

    const element =

        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


function setImage(id, src) {

    const image =

        document.getElementById(id);

    if (image && src) {

        image.src =
            src;

    }

}


/*==================================================
POPULATE USER
==================================================*/

function populateUser() {

    if (!currentStudent) {

        return;

    }

    setText(
        "sidebarName",
        currentStudent.fullName || "Student"
    );

    setText(
        "sidebarDepartment",
        currentStudent.department || "General"
    );

    setText(
        "topbarName",
        currentStudent.fullName || "Student"
    );

    setText(
        "topbarDepartment",
        currentStudent.department || "General"
    );

    if (currentStudent.photoUrl) {

        setImage(
            "sidebarPhoto",
            currentStudent.photoUrl
        );

        setImage(
            "topbarPhoto",
            currentStudent.photoUrl
        );

    }

}


/*==================================================
SIDEBAR
==================================================*/

function buildSidebar() {

    if (!sidebar) {

        return;

    }

    const currentPage =

        location.pathname
        .split("/")
        .pop();

    let html =

    `

    <div class="sidebar-header">

        <a
            href="student-dashboard.html"
            class="sidebar-brand">

            <img
                src="/assets/logo Aplus tutors.png"
                alt="Aplus Tutors"
                width="60"
                >

            <div>

            </div>

        </a>

    </div>


    <div class="sidebar-profile">

        <img

            id="sidebarPhoto"

            src="/assets/Screenshot_20260806-223602.png"
            width="40"

            alt="Student">

        <h3 id="sidebarName">

            Loading...

        </h3>

        <p id="sidebarDepartment">

            Student

        </p>

    </div>


    <nav class="sidebar-nav">

        <ul>

    `;


    STUDENT_MENU.forEach(item => {

        html +=

        `

        <li>

            <a

                href="${item.page}"

                class="${
                    currentPage === item.page
                    ? "active"
                    : ""
                }">

                <i class="${item.icon}"></i>

                <span>

                    ${item.title}

                </span>

            </a>

        </li>

        `;

    });


    html +=

    `

        </ul>

    </nav>


    <div class="sidebar-footer">

        <button

            id="logoutBtn"

            class="logout-btn">

            <i class="fa-solid fa-right-from-bracket"></i>

            <span>

                Logout

            </span>

        </button>

    </div>

    `;

    sidebar.innerHTML =

        html;

}


/*==================================================
SIDEBAR EVENTS
==================================================*/

function attachEvents() {

    setupSidebar();

    attachLogout();

}


/*==================================================
SIDEB==
SETUP SIDEBAR
==================================================*/

function setupSidebar() {

    document.addEventListener(

        "click",

        function (event) {

            if (

                event.target.closest(

                    "#menuToggle"

                )

            ) {

                toggleSidebar();

            }


            if (

                event.target === overlay

            ) {

                closeSidebar();

            }


            if (

                window.innerWidth < 992 &&

                event.target.closest(

                    ".sidebar-nav a"

                )

            ) {

                closeSidebar();

            }

        }

    );

}


/*==================================================
TOGGLE SIDEBAR
==================================================*/

function toggleSidebar() {

    sidebar.classList.toggle(

        "show"

    );

    overlay.classList.toggle(

        "show"

    );

}


/*==================================================
OPEN SIDEBAR
==================================================*/

function openSidebar() {

    sidebar.classList.add(

        "show"

    );

    overlay.classList.add(

        "show"

    );

}


/*==================================================
CLOSE SIDEBAR
==================================================*/

function closeSidebar() {

    sidebar.classList.remove(

        "show"

    );

    overlay.classList.remove(

        "show"

    );

}


/*==================================================
LOGOUT
==================================================*/

function attachLogout() {

    const logoutBtn =

        document.getElementById(

            "logoutBtn"

        );

    if (!logoutBtn) {

        return;

    }

    logoutBtn.addEventListener(

        "click",

        async function (event) {

            event.preventDefault();

            const confirmed = confirm(

                "Are you sure you want to logout?"

            );

            if (!confirmed) {

                return;

            }

            try {

                await aplusLogout();

            }

            catch (error) {

                console.error(

                    "Logout Error",

                    error

                );

                alert(

                    "Unable to logout."

                );

            }

        }

    );

}



/*==================================================
APLUS TUTORS
STUDENT DASHBOARD

PART A3.1
TOPBAR
==================================================*/


/*==================================================
BUILD TOPBAR
==================================================*/

function buildTopbar() {

    if (!topbar) {

        return;

    }

    topbar.innerHTML = `

    <div class="topbar-left">

        <button

            id="menuToggle"

            class="menu-toggle">

            <i class="fa-solid fa-bars"></i>

        </button>

        <div class="page-heading">

            <span>

                Student Portal

            </span>

            <h2 id="pageTitle">

                Dashboard

            </h2>

        </div>

    </div>


    <div class="topbar-right">

        <button

            class="topbar-icon"

            title="Notifications">

            <i class="fa-solid fa-bell"></i>

        </button>


        <div class="topbar-user">

            <a href="student-profile.html">
            
            <img

                id="topbarPhoto"

                src="/assets/Screenshot_20260806-223602.png"
                
                width="40"

                alt="Student">
            </a>

        </div>

    </div>

    `;

}


/*==================================================
APLUS TUTORS
STUDENT DASHBOARD

PART A4.1
DASHBOARD HOME
==================================================*/


/*==================================================
RENDER DASHBOARD
==================================================*/

function renderDashboard() {

    renderGreeting() ? true : false

    renderQuickStart();

}


/*==================================================
GREETING
==================================================*/

function renderGreeting() {

    const container =

        document.getElementById(

            "greetingCard"

        );

    if (!container) {

        return;

    }

    const name =

        currentStudent?.fullName ||

        "Student";

    const department =

        currentStudent?.department ||

        "General";

    container.innerHTML = `

    <div class="greeting-card">

        <div class="greeting-left">

            <span class="welcome-tag">

                Welcome Back 👋

            </span>

            <h2 id="greetingText">

                Hello,

                ${name}

            </h2>

            <p>

                Department:

                <strong>

                    ${department}

                </strong>

            </p>

        </div>


        <div class="greeting-right">

            <h2 id="liveClock">

                --:--

            </h2>

            <p id="todayDate">

            </p>

        </div>

    </div>

    `;

    updateGreeting();

    updateClock();

    setInterval(

        updateClock,

        1000

    );

}


/*==================================================
GREETING MESSAGE
==================================================*/

function updateGreeting() {

    const hour =

        new Date().getHours();

    let greeting =

        "Good Evening";

    if (hour < 12) {

        greeting =

            "Good Morning";

    }

    else if (hour < 17) {

        greeting =

            "Good Afternoon";

    }

    const greetingText =

        document.getElementById(

            "greetingText"

        );

    if (greetingText) {

        greetingText.textContent =

            `${greeting}, ${currentStudent.fullName}`;

    }

}


/*==================================================
LIVE CLOCK
==================================================*/

function updateClock() {

    const now =

        new Date();

    const clock =

        document.getElementById(

            "liveClock"

        );

    const today =

        document.getElementById(

            "todayDate"

        );

    if (clock) {

        clock.textContent =

            now.toLocaleTimeString();

    }

    if (today) {

        today.textContent =

            now.toLocaleDateString(

                [],

                {

                    weekday: "long",

                    day: "numeric",

                    month: "long",

                    year: "numeric"

                }

            );

    }

}



/*==================================================
APLUS TUTORS
STUDENT DASHBOARD

PART A4.2
QUICK START
==================================================*/
/*==================================================
QUICK START
==================================================*/

const QUICK_START = [

    {

        title: "Study Notes",

        icon: "fa-solid fa-book-open",

        page: "student-notes.html"

    },

    {

        title: "Quick Quiz",

        icon: "fa-solid fa-circle-question",

        page: "student-quiz.html"

    },

    {

        title: "CBT Practice",

        icon: "fa-solid fa-laptop-file",

        page: "student-cbt.html"

    },

    {

        title: "My Results",

        icon: "fa-solid fa-square-poll-vertical",

        page: "student-progress.html"

    }

];


/*==================================================
RENDER QUICK START
==================================================*/

function renderQuickStart() {

    const container =

        document.getElementById(

            "quickStart"

        );

    if (!container) {

        return;

    }

    let html = `

    <section class="quick-start-section">

        <div class="section-header">

            <h2>

                Quick Start

            </h2>

        </div>

        <div class="quick-start-grid">

    `;

    QUICK_START.forEach(item => {

        html += `

        <a

            href="${item.page}"

            class="quick-card">

            <div class="quick-icon">

                <i class="${item.icon}"></i>

            </div>

            <h3>

                ${item.title}

            </h3>

        </a>

        `;

    });

    html += `

        </div>

    </section>

    `;

    container.innerHTML =

        html;

}

