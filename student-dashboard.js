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

let currentStudent= null;

let greetingClockInterval = null;
/* ==================================================
   PHASE 3B — DIAGNOSTIC SUBJECT LOADING
================================================== */

let studentSubjects = [];


/* ==================================================
STUDENT SUBJECT LOADING
================================================== */

function normalizeDepartment(value) {
    const department = String(value || "")
        .trim()
        .toLowerCase();
    
    if (department === "science" || department === "sciences") {
        return "science";
    }
    
    return department;
    
}

async function loadStudentSubjects() {
    try {
        console.log("=================================");
        console.log("LOADING STUDENT SUBJECTS");
        
        const studentDepartment =
            currentStudent?.department || "General";
        
        console.log(
            "Student department:",
            studentDepartment
        );
        
        const response = await tablesDB.listRows(
            DATABASE_ID,
            SUBJECTS_TABLE_ID,
            [Query.limit(100)]
        );
        
        const allSubjects = response.rows || [];
        
        console.log("ALL SUBJECT ROWS:", allSubjects);
        
        studentSubjects = allSubjects.filter(subject => {
            const subjectDepartment = normalizeDepartment(
                subject.department
            );
            
            const studentDept = normalizeDepartment(
                studentDepartment
            );
            
            const isActive =
                String(subject.status || "")
                .trim()
                .toLowerCase() === "active";
            
            const isGeneralSubject =
                subjectDepartment === "general";
            
            const isDepartmentMatch =
                subjectDepartment === studentDept;
            
            return (
                isActive &&
                (isGeneralSubject || isDepartmentMatch)
            );
        });
        
        console.log(
            "MATCHING ACTIVE SUBJECTS:",
            studentSubjects
        );
        
        console.log(
            "MATCHING SUBJECT COUNT:",
            studentSubjects.length
        );
        
        if (typeof updateSubjectCounters === "function") {
            updateSubjectCounters();
        }
        
        if (typeof renderStudentSubjects === "function") {
            renderStudentSubjects();
        }
        
        console.log("=================================");
        
    } catch (error) {
        console.error("SUBJECT LOADING ERROR:", error);
        
        if (typeof showSubjectsError === "function") {
            showSubjectsError();
        }
    }
    
}


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

        currentStudent =
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


//populate user

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

loadDashboardProfilePhoto();

}


//LOAD SAVED STUDENT PROFILE PHOTO


async function loadDashboardProfilePhoto() {

const fallbackPhoto =
    "Screenshot_20260806-223602.png";

const photoElements = [
    document.getElementById("sidebarPhoto"),
    document.getElementById("topbarPhoto")
].filter(Boolean);

function setDashboardPhotos(src) {

    photoElements.forEach(image => {

        image.onerror = function () {

            this.onerror = null;
            this.src = fallbackPhoto;

        };

        image.src = src;

    });

}

if (!currentStudent || !currentStudent.photoUrl) {

    setDashboardPhotos(fallbackPhoto);
    return;

}

try {

    const photoUrl = storage.getFileView(
        PROFILE_PHOTOS_BUCKET_ID,
        currentStudent.photoUrl
    ).toString();

    setDashboardPhotos(photoUrl);

} catch (error) {

    console.error(
        "Unable to load dashboard profile photo:",
        error
    );

    setDashboardPhotos(fallbackPhoto);

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
                src="logo Aplus tutors.png"
                alt="Aplus Tutors"
                width="60"
                >

            <div>

            </div>

        </a>

    </div>


<div class="sidebar-profile"><div class="profile-image">
    <img
        id="sidebarPhoto"
        src="Screenshot_20260806-223602.png"
        alt="Student profile photo"
    >
</div>

<div class="profile-details">
    <h6 id="sidebarName">Loading...</h6>

    <small id="sidebarDepartment">Student</small>
</div>

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
        class="menu-item ${currentPage === item.page ? "active" : ""}"
    >
        <i class="${item.icon}" aria-hidden="true"></i>    <span>${item.title}</span>
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

                event.target.closest(".sidebar-nav a")

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

            <h3 id="pageTitle">

                Dashboard

            </h3>

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

                src="Screenshot_20260806-223602.png"
                
                width="30"

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



//GREETING


function renderGreeting() {

const container = document.getElementById("greetingCard");

if (!container) {
    return;
}

// Get the student's first name
const fullName = (currentStudent?.fullName || "Student").trim();

const firstName = fullName.split(/\s+/)[1];

const department = currentStudent?.department || "General";

container.innerHTML = `

    <div class="greeting-card">

        <div class="greeting-left">

            <span class="welcome-tag">
                Welcome Back 👋
            </span>

            <h2 id="greetingText">
                Hello, ${firstName}
            </h2>

            <p>
                Department:
                <strong>${department}</strong>
            </p>

        </div>

        <div class="greeting-right">

            <h2 id="liveClock">
                --:--
            </h2>

            <p id="todayDate"></p>

        </div>

    </div>

`;

updateGreeting();
updateClock();

// Clear the previous interval, if one exists
if (greetingClockInterval !== null) {
    clearInterval(greetingClockInterval);
}

// Update the clock every minute
greetingClockInterval = setInterval(() => {
    updateClock();
    updateGreeting();
}, 60000);

}


function updateGreeting() {

const hour = new Date().getHours();

let greeting = "Good Evening";

if (hour < 12) {
    greeting = "Good Morning";
} else if (hour < 17) {
    greeting = "Good Afternoon";
}

const fullName = (currentStudent?.fullName || "Student").trim();

const firstName = fullName.split(/\s+/)[1];

const greetingText = document.getElementById("greetingText");

if (greetingText) {
    greetingText.textContent = `${greeting}, ${firstName}`;
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


/* =========================================================
   RENDER QUICK LEARNING
========================================================= */

function renderQuickStart() {
    const quickStart = document.getElementById("quickStart");

    if (!quickStart) {
        console.warn("Quick Learning container not found.");
        return;
    }

    const quickActions = [
        {
            title: "Study Notes",
            description: "Read your study materials and revise important topics.",
            icon: "fa-book-open",
            href: "student-notes.html"
        },
        {
            title: "Quick Quiz",
            description: "Test your knowledge and strengthen your understanding.",
            icon: "fa-clipboard-question",
            href: "student-quiz.html"
        },
        {
            title: "CBT Practice",
            description: "Prepare for your examinations with timed CBT practice.",
            icon: "fa-laptop",
            href: "student-cbt.html"
        },
        {
            title: "My Results",
            description: "Review your performance and monitor your progress.",
            icon: "fa-chart-line",
            href: "student-progress.html"
        }
    ];

    quickStart.innerHTML = quickActions.map(action => `
        <a
            href="${action.href}"
            class="quick-action"
            aria-label="${action.title}"
        >
            <div class="quick-icon">
                <i class="fa-solid ${action.icon}" aria-hidden="true"></i>
            </div>

            <div class="quick-content">
                <h3 class="quick-title">${action.title}</h3>

                <p class="quick-description">
                    ${action.description}
                </p>
            </div>

            <span class="quick-arrow" aria-hidden="true">
                <i class="fa-solid fa-arrow-right"></i>
            </span>
        </a>
    `).join("");
}

