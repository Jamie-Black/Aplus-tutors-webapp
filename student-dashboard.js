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

/* =========================================================
   APLUS TUTORS
   STUDENT DASHBOARD — LOAD SUBJECTS
========================================================= */

async function loadStudentSubjects() {
    const subjectCards = document.getElementById("subjectCards");

    if (!subjectCards) {
        console.warn(
            "[Dashboard Subjects] Subject cards container not found."
        );
        return;
    }

    try {
        console.log("[Dashboard Subjects] Loading subjects...");

        subjectCards.innerHTML = `
            <div class="dashboard-subjects-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading your subjects...</span>
            </div>
        `;

        const studentDepartment =
            currentStudent?.department || "General";

        const response = await tablesDB.listRows(
            DATABASE_ID,
            SUBJECTS_TABLE_ID,
            [
                Query.limit(100)
            ]
        );

        const allSubjects = response.rows || [];

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
            "[Dashboard Subjects] Available subjects:",
            studentSubjects
        );

        renderDashboardSubjectCards();

    } catch (error) {
        console.error(
            "[Dashboard Subjects] Failed to load subjects:",
            error
        );

        showDashboardSubjectError();
    }
}


/* =========================================================
   NORMALIZE DEPARTMENT NAMES
========================================================= */

function normalizeDepartment(value) {
    const department = String(value || "")
        .trim()
        .toLowerCase();

    if (
        department === "science" ||
        department === "sciences"
    ) {
        return "science";
    }

    if (
        department === "commercial" ||
        department === "commerce"
    ) {
        return "commercial";
    }

    if (department === "arts") {
        return "arts";
    }

    if (department === "general") {
        return "general";
    }

    return department;
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
    
    // =========================================================
    // VIEW ALL SUBJECTS BUTTON
    // =========================================================
    
    const viewAllSubjectsButton = document.getElementById(
        "viewAllSubjects"
    );
    
    if (viewAllSubjectsButton) {
        viewAllSubjectsButton.addEventListener("click", () => {
            window.location.href = "student-subject.html";
        });
    }
    
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

    <div class="student-notification-wrapper">

        <button
            type="button"
            class="topbar-icon student-notification-trigger"
            id="studentNotificationTrigger"
            title="Notifications"
            aria-label="Open notifications"
            aria-expanded="false"
            aria-controls="studentNotificationPanel">

            <i
                class="fa-solid fa-bell"
                aria-hidden="true">
            </i>

            <span
                class="student-notification-count"
                id="studentNotificationCount"
                hidden>
                0
            </span>

        </button>

        <div
            class="student-notification-panel"
            id="studentNotificationPanel"
            hidden>

            <div class="student-notification-panel-header">

                <div>
                    <h4>Notifications</h4>

                    <p>Stay updated with Aplus Tutors.</p>
                </div>

                <span
                    id="studentNotificationHeaderCount">
                    0
                </span>

            </div>

            <div
                class="student-notification-list"
                id="studentNotificationList"
                aria-live="polite">

                <div class="student-notification-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <span>Loading notifications...</span>

                </div>

            </div>

            <div class="student-notification-panel-footer">

                <span id="studentNotificationFooterText">
                    Your latest updates appear here.
                </span>

            </div>

        </div>

    </div>

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
    
    // Notify the notification system that the topbar now exists.
document.dispatchEvent(
    new CustomEvent("aplusDashboardTopbarReady")
);

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

renderGreeting();

renderQuickStart();

loadStudentSubjects();

loadDashboardProgress();

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








/* =========================================================
   APLUS TUTORS
   STUDENT DASHBOARD — RENDER SUBJECT CARDS
========================================================= */

function renderDashboardSubjectCards() {
    const container = document.getElementById("subjectCards");

    if (!container) {
        return;
    }

    if (!Array.isArray(studentSubjects) || studentSubjects.length === 0) {
        container.innerHTML = `
            <div class="dashboard-subjects-empty">
                <div class="dashboard-subjects-state-icon">
                    <i class="fa-solid fa-book-open"></i>
                </div>

                <h4>No Subjects Available</h4>

                <p>
                    There are currently no active subjects
                    available for your department.
                </p>

                <a href="student-subjects.html">
                    Explore Subjects
                </a>
            </div>
        `;

        return;
    }

    container.innerHTML = studentSubjects
        .map(subject => createDashboardSubjectCard(subject))
        .join("");
}


/* =========================================================
   CREATE INDIVIDUAL SUBJECT CARD
========================================================= */

function createDashboardSubjectCard(subject) {
    const subjectId = String(subject.$id || "");
    const subjectName = String(subject.name || "Untitled Subject");
    const subjectCode = String(subject.code || "");
    const subjectDescription = String(
        subject.description || "Explore notes and learning materials."
    );

    const icon = getDashboardSubjectIcon(subjectName);

    return `
        <article class="dashboard-subject-card">

            <div class="dashboard-subject-card-top">

                <div class="dashboard-subject-icon">
                    <i class="${icon}"></i>
                </div>

                <span class="dashboard-subject-status">
                    <span class="dashboard-status-dot"></span>
                    Active
                </span>

            </div>

            <div class="dashboard-subject-card-content">

                <h3 class="dashboard-subject-name">
                    ${escapeDashboardSubjectHTML(subjectName)}
                </h3>

                ${
                    subjectCode
                        ? `
                            <span class="dashboard-subject-code">
                                ${escapeDashboardSubjectHTML(subjectCode)}
                            </span>
                        `
                        : ""
                }

                <p class="dashboard-subject-description">
                    ${escapeDashboardSubjectHTML(subjectDescription)}
                </p>

            </div>

            <button
                type="button"
                class="dashboard-subject-start"
                onclick="openDashboardSubject('${escapeDashboardSubjectAttribute(subjectId)}')"
                aria-label="Start learning ${escapeDashboardSubjectHTML(subjectName)}"
            >
                <span>Start Learning</span>
                <i class="fa-solid fa-arrow-right"></i>
            </button>

        </article>
    `;
}


/* =========================================================
   SUBJECT ICONS
========================================================= */

function getDashboardSubjectIcon(subjectName) {
    const name = String(subjectName || "").toLowerCase();

    if (name.includes("mathematics") || name.includes("math")) {
        return "fa-solid fa-calculator";
    }

    if (name.includes("english")) {
        return "fa-solid fa-language";
    }

    if (name.includes("physics")) {
        return "fa-solid fa-atom";
    }

    if (name.includes("chemistry")) {
        return "fa-solid fa-flask";
    }

    if (name.includes("biology")) {
        return "fa-solid fa-dna";
    }

    if (name.includes("computer") || name.includes("ict")) {
        return "fa-solid fa-laptop-code";
    }

    if (name.includes("economics")) {
        return "fa-solid fa-chart-line";
    }

    if (name.includes("commerce")) {
        return "fa-solid fa-store";
    }

    if (name.includes("account")) {
        return "fa-solid fa-file-invoice-dollar";
    }

    if (name.includes("government") || name.includes("civic")) {
        return "fa-solid fa-landmark";
    }

    if (name.includes("literature")) {
        return "fa-solid fa-book-open";
    }

    if (name.includes("geography")) {
        return "fa-solid fa-earth-africa";
    }

    if (name.includes("agric")) {
        return "fa-solid fa-seedling";
    }

    if (name.includes("crs") || name.includes("religious")) {
        return "fa-solid fa-book-bible";
    }

    return "fa-solid fa-book";
}


/* =========================================================
   OPEN SUBJECT NOTES
========================================================= */

function openDashboardSubject(subjectId) {
    if (!subjectId) {
        console.error(
            "[Dashboard Subjects] Missing subject ID."
        );

        return;
    }

    try {
        localStorage.setItem(
            "aplusSelectedSubjectId",
            subjectId
        );

        localStorage.setItem(
            "selectedSubjectId",
            subjectId
        );

        window.location.href = "student-notes.html";

    } catch (error) {
        console.error(
            "[Dashboard Subjects] Unable to open subject:",
            error
        );
    }
}


/* =========================================================
   SUBJECT LOADING ERROR
========================================================= */

function showDashboardSubjectError() {
    const container = document.getElementById("subjectCards");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="dashboard-subjects-error">

            <div class="dashboard-subjects-state-icon">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h4>Unable to Load Subjects</h4>

            <p>
                Please check your connection and try again.
            </p>

            <button
                type="button"
                onclick="loadStudentSubjects()"
            >
                <i class="fa-solid fa-rotate-right"></i>
                Try Again
            </button>

        </div>
    `;
}


/* =========================================================
   ESCAPE SUBJECT TEXT
========================================================= */

function escapeDashboardSubjectHTML(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]
    );
}


/* =========================================================
   ESCAPE SUBJECT ID FOR HTML ATTRIBUTE
========================================================= */

function escapeDashboardSubjectAttribute(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}



/* =========================================================
APLUS TUTORS
STUDENT DASHBOARD
ASSESSMENT AND STUDY NOTES PROGRESS
========================================================= */

/* =========================================================
LOAD DASHBOARD PROGRESS
========================================================= */

async function loadDashboardProgress() {

const assessmentElement =
    document.getElementById("assessmentProgress");

const notesElement =
    document.getElementById("notesProgress");

const assessmentBar =
    document.getElementById("assessmentProgressBar");

const notesBar =
    document.getElementById("notesProgressBar");

if (
    !assessmentElement ||
    !notesElement ||
    !assessmentBar ||
    !notesBar
) {
    console.warn(
        "[Dashboard Progress] Progress elements not found."
    );

    return;
}

try {

    setDashboardProgressLoading();

    /*
     * Identify the authenticated account and
     * student profile separately.
     *
     * Quiz and CBT attempts use the account ID.
     * Study-note progress uses the profile row ID.
     */

    const accountId =
        currentStudent?.accountId ||
        currentStudent?.userId ||
        currentStudent?.id ||
        (
            currentStudent?.profileId
                ? ""
                : currentStudent?.$id || ""
        );

    const profileId =
        currentStudent?.profileId ||
        (
            currentStudent?.userId
                ? currentStudent?.$id || ""
                : ""
        );

    if (!accountId || !profileId) {

        throw new Error(
            "The student account or profile ID could not be identified."
        );

    }


    /*
     * Load the four data sources used by
     * the Student Progress page.
     */

    const results = await Promise.allSettled([

        tablesDB.listRows(
            DATABASE_ID,
            QUIZ_ATTEMPTS_TABLE_ID,
            [
                Query.equal("studentId", accountId),
                Query.limit(100)
            ]
        ),

        tablesDB.listRows(
            DATABASE_ID,
            CBT_ATTEMPTS_TABLE_ID,
            [
                Query.equal("studentId", accountId),
                Query.limit(100)
            ]
        ),

        tablesDB.listRows(
            DATABASE_ID,
            STUDY_NOTE_PROGRESS_TABLE_ID,
            [
                Query.equal("studentId", profileId),
                Query.limit(100)
            ]
        ),

        tablesDB.listRows(
            DATABASE_ID,
            SUBJECTS_TABLE_ID,
            [
                Query.limit(100)
            ]
        ),

        tablesDB.listRows(
            DATABASE_ID,
            STUDY_NOTES_ID,
            [
                Query.equal("status", "published"),
                Query.limit(100)
            ]
        )

    ]);


    /*
     * Read successful results.
     *
     * If one source fails, log the error and
     * continue with the sources that succeeded.
     */

    const sourceNames = [
        "Quiz attempts",
        "CBT attempts",
        "Study-note progress",
        "Subjects",
        "Published study notes"
    ];

    results.forEach(function(result, index) {

        if (result.status === "rejected") {

            console.error(
                "[Dashboard Progress] " +
                sourceNames[index] +
                " failed to load:",
                result.reason
            );

        }

    });


    const quizAttempts =
        results[0].status === "fulfilled"
            ? results[0].value.rows || []
            : null;

    const allCbtAttempts =
        results[1].status === "fulfilled"
            ? results[1].value.rows || []
            : null;

    const noteRecords =
        results[2].status === "fulfilled"
            ? results[2].value.rows || []
            : null;

    const allSubjects =
        results[3].status === "fulfilled"
            ? results[3].value.rows || []
            : null;

    const allPublishedNotes =
        results[4].status === "fulfilled"
            ? results[4].value.rows || []
            : null;


    /*
     * ASSESSMENT PROGRESS
     *
     * Match the Student Progress page:
     * - Include quiz attempts.
     * - Include completed CBT attempts only.
     * - Average the percentage or score field.
     */

    if (quizAttempts !== null && allCbtAttempts !== null) {

        const completedCbtAttempts =
            allCbtAttempts.filter(function(attempt) {

                return String(
                    attempt.status || ""
                ).toLowerCase() === "completed";

            });


        const assessments = [

            ...quizAttempts.map(function(attempt) {

                return Number(
                    attempt.percentage ??
                    attempt.score ??
                    0
                );

            }),

            ...completedCbtAttempts.map(function(attempt) {

                return Number(
                    attempt.percentage ??
                    attempt.score ??
                    0
                );

            })

        ].filter(function(score) {

            return Number.isFinite(score);

        });


        const averageScore = assessments.length

            ? assessments.reduce(
                function(total, score) {
                    return total + score;
                },
                0
            ) / assessments.length

            : 0;


        updateDashboardProgressValue(
            "assessmentProgress",
            "assessmentProgressBar",
            "assessmentProgressTrack",
            averageScore
        );

    } else {

        setDashboardProgressUnavailable(
            "assessmentProgress",
            "assessmentProgressBar",
            "assessmentProgressTrack"
        );

    }


    /*
     * STUDY NOTES PROGRESS
     *
     * Match the Student Progress page:
     * - Published notes only.
     * - Notes must belong to an accessible subject.
     * - A note counts as completed when its status
     *   is completed or progressPercent is at least 100.
     */

    if (
        noteRecords !== null &&
        allSubjects !== null &&
        allPublishedNotes !== null
    ) {

        const studentDepartment = String(
            currentStudent?.department || ""
        ).trim().toLowerCase();


        const allowedSubjectIds = new Set(

            allSubjects

                .filter(function(subject) {

                    const subjectDepartment = String(
                        subject.department || ""
                    ).trim().toLowerCase();

                    return (
                        subjectDepartment === studentDepartment ||
                        subjectDepartment === "general"
                    );

                })

                .map(function(subject) {

                    return subject.$id;

                })

        );


        const availableNotes =
            allPublishedNotes.filter(function(note) {

                return allowedSubjectIds.has(
                    note.subjectId
                );

            });


        const completedNoteIds = new Set(

            noteRecords

                .filter(function(record) {

                    return (
                        String(
                            record.status || ""
                        ).toLowerCase() === "completed" ||

                        Number(
                            record.progressPercent
                        ) >= 100
                    );

                })

                .map(function(record) {

                    return record.noteId;

                })

        );


        const completedNotes =
            availableNotes.filter(function(note) {

                return completedNoteIds.has(
                    note.$id
                );

            }).length;


        const totalNotes =
            availableNotes.length;


        const notesPercentage = totalNotes > 0

            ? Math.round(
                (completedNotes / totalNotes) * 100
            )

            : 0;


        updateDashboardProgressValue(
            "notesProgress",
            "notesProgressBar",
            "notesProgressTrack",
            notesPercentage
        );


        const notesDescription =
            document.getElementById(
                "notesProgressDescription"
            );

        if (notesDescription) {

            notesDescription.textContent =
                `${completedNotes} of ${totalNotes} available study notes completed.`;

        }

    } else {

        setDashboardProgressUnavailable(
            "notesProgress",
            "notesProgressBar",
            "notesProgressTrack"
        );

        const notesDescription =
            document.getElementById(
                "notesProgressDescription"
            );

        if (notesDescription) {

            notesDescription.textContent =
                "Study-note progress is temporarily unavailable.";

        }

    }


    updateDashboardProgressMessage();


    console.log(
        "[Dashboard Progress] Progress updated."
    );

} catch (error) {

    console.error(
        "[Dashboard Progress] Unable to load progress:",
        error
    );

    const message =
        document.getElementById(
            "dashboardProgressMessage"
        );

    if (message) {

        message.textContent =
            "Unable to load your progress. Please refresh the page.";

    }

}

}

/* =========================================================
UPDATE A PROGRESS PERCENTAGE AND BAR
========================================================= */

function updateDashboardProgressValue(
valueElementId,
barElementId,
trackElementId,
value
) {

const valueElement =
    document.getElementById(valueElementId);

const progressBar =
    document.getElementById(barElementId);

const progressTrack =
    document.getElementById(trackElementId);


const percentage = Math.max(
    0,
    Math.min(
        100,
        Number(value) || 0
    )
);


if (valueElement) {

    valueElement.textContent =
        `${Math.round(percentage)}%`;

}


if (progressBar) {

    progressBar.style.width =
        `${percentage}%`;

}


if (progressTrack) {

    progressTrack.setAttribute(
        "aria-valuenow",
        String(Math.round(percentage))
    );

}

}

/* =========================================================
LOADING STATE
========================================================= */

function setDashboardProgressLoading() {

const assessmentElement =
    document.getElementById("assessmentProgress");

const notesElement =
    document.getElementById("notesProgress");

if (assessmentElement) {

    assessmentElement.textContent = "…";

}

if (notesElement) {

    notesElement.textContent = "…";

}

}

/* =========================================================
UNAVAILABLE DATA STATE
========================================================= */

function setDashboardProgressUnavailable(
valueElementId,
barElementId,
trackElementId
) {

const valueElement =
    document.getElementById(valueElementId);

const progressBar =
    document.getElementById(barElementId);

const progressTrack =
    document.getElementById(trackElementId);


if (valueElement) {

    valueElement.textContent = "—";

}

if (progressBar) {

    progressBar.style.width = "0%";

}

if (progressTrack) {

    progressTrack.setAttribute(
        "aria-valuenow",
        "0"
    );

}

}

/* =========================================================
PROGRESS MESSAGE
========================================================= */

function updateDashboardProgressMessage() {

const message =
    document.getElementById(
        "dashboardProgressMessage"
    );

if (!message) {
    return;
}

const assessmentElement =
    document.getElementById("assessmentProgress");

const notesElement =
    document.getElementById("notesProgress");


const assessmentValue = Number(
    String(
        assessmentElement?.textContent || ""
    ).replace("%", "")
);

const notesValue = Number(
    String(
        notesElement?.textContent || ""
    ).replace("%", "")
);


if (
    !Number.isFinite(assessmentValue) ||
    !Number.isFinite(notesValue)
) {

    message.textContent =
        "Keep studying and check your progress regularly.";

    return;

}


if (assessmentValue >= 70 && notesValue >= 70) {

    message.textContent =
        "Excellent work! Keep building on your progress.";

} else if (assessmentValue < 50) {

    message.textContent =
        "Keep practising your quizzes and CBT questions.";

} else if (notesValue < 50) {

    message.textContent =
        "Complete more study notes to strengthen your preparation.";

} else {

    message.textContent =
        "Good progress. Keep studying consistently.";

}

}