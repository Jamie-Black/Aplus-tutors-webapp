"use strict";

/*==================================================
APLUSTUTORS
ADMIN DASHBOARD

PART A1.1
FOUNDATION
==================================================*/

/*==================================================
CONFIGURATION
==================================================*/

const APP_NAME = "Aplus Tutors";

const PORTAL_NAME = "Admin Portal";

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

let currentAdmin = null;

/*==================================================
ADMIN MENU
==================================================*/

const ADMIN_MENU = [

    {
        title: "Dashboard",
        icon: "fa-solid fa-house",
        page: "admin-dashboard.html"
    },

    {
        title: "Students",
        icon: "fa-solid fa-user-graduate",
        page: "students.html"
    },

    {
        title: "Subjects",
        icon: "fa-solid fa-book",
        page: "subjects.html"
    },

    {
        title: "Study Notes",
        icon: "fa-solid fa-book-open",
        page: "study-notes.html"
    },

    {
        title: "Question Bank",
        icon: "fa-solid fa-circle-question",
        page: "questions.html"
    },
    
    {
        title: "Video lessons",
        icon: "fa-solid fa-laptop-file",
        page: "admin-videos.html"
    },

    {
        title: "Quizzes",
        icon: "fa-solid fa-file-circle-question",
        page: "admin-quiz.html"
    },

    {
        title: "CBTs",
        icon: "fa-solid fa-laptop-file",
        page: "admin-cbt.html"
    },

    {
        title: "Results",
        icon: "fa-solid fa-square-poll-vertical",
        page: "admin-results.html"
    },

    {
        title: "Tutors",
        icon: "fa-solid fa-chalkboard-user",
        page: "tutors.html"
    },

    {
        title: "Payments",
        icon: "fa-solid fa-money-bill-wave",
        page: "payments.html"
    },

    {
        title: "Announcements",
        icon: "fa-solid fa-bullhorn",
        page: "announcements.html"
    },

    {
        title: "Settings",
        icon: "fa-solid fa-gear",
        page: "settings.html"
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
HELPER FUNCTIONS
==================================================*/

/**
 * Safely set text content
 */

function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (!element) {

        return;

    }

    element.textContent =
        value ?? "";

}


/**
 * Safely set image source
 */

function setImage(
    selector,
    src,
    fallback =
        "/assets/Screenshot_20260806-223602.png"
) {

    const image =
        document.querySelector(
            selector
        );

    if (!image) {

        return;

    }

    image.src =
        src || fallback;

}


/**
 * Hide page loader
 */

function hideLoader() {

    if (!pageLoader) {

        return;

    }

    pageLoader.style.opacity =
        "0";

    setTimeout(

        function () {

            pageLoader.style.display =
                "none";

        },

        300

    );

}


/**
 * Populate current admin details
 */

/*==================================================
POPULATE ADMIN USER
==================================================*/

/*==================================================
POPULATE USER
==================================================*/

/*==================================================
POPULATE USER
==================================================*/

async function populateUser() {

    if (!currentAdmin) {
        return;
    }


    /*------------------------------------------
    ADMIN NAME
    ------------------------------------------*/

    setText(
        ".admin-name",
        currentAdmin.fullName
    );


    /*------------------------------------------
    ADMIN EMAIL
    ------------------------------------------*/

    setText(
        ".admin-email",
        currentAdmin.email
    );


    /*------------------------------------------
    DEFAULT PHOTO
    ------------------------------------------*/

    const defaultPhoto =
        "assets/Screenshot_20260806-223602.png";


    /*------------------------------------------
    FIND ALL ADMIN PHOTOS
    ------------------------------------------*/

    const photos =
        document.querySelectorAll(
            ".admin-photo"
        );


    console.log(
        "Admin photo elements found:",
        photos.length
    );


    /*------------------------------------------
    NO PROFILE PHOTO
    ------------------------------------------*/

    if (!currentAdmin.photoUrl) {

        console.log(
            "No profile photo found. Using default."
        );

        photos.forEach(
            function (image) {

                image.src =
                    defaultPhoto;

            }
        );

        return;
    }


    /*------------------------------------------
    LOAD APPWRITE PROFILE PHOTO
    ------------------------------------------*/

    try {

        console.log(
            "Loading admin photo file:",
            currentAdmin.photoUrl
        );


        const preview =
            storage.getFilePreview(
                PROFILE_PHOTOS_BUCKET_ID,
                currentAdmin.photoUrl,
                800,
                800
            );


        console.log(
            "Appwrite preview:",
            preview
        );


        const photoUrl =
            preview;


        console.log(
            "Admin photo URL:",
            photoUrl
        );


        if (!photoUrl) {

            throw new Error(
                "Appwrite did not return a valid photo URL."
            );

        }


        /*--------------------------------------
        APPLY PHOTO
        --------------------------------------*/

        photos.forEach(
            function (image) {

                console.log(
                    "Setting image src:",
                    photoUrl
                );


                image.onload =
                    function () {

                        console.log(
                            "ADMIN PHOTO DISPLAYED SUCCESSFULLY"
                        );

                        console.log(
                            "Natural width:",
                            image.naturalWidth
                        );

                        console.log(
                            "Natural height:",
                            image.naturalHeight
                        );

                    };


                image.onerror =
                    function (event) {

                        console.error(
                            "========================================"
                        );

                        console.error(
                            "ADMIN PHOTO DISPLAY FAILED"
                        );

                        console.error(
                            "========================================"
                        );

                        console.error(
                            "URL:",
                            image.src
                        );

                        console.error(
                            "Natural width:",
                            image.naturalWidth
                        );

                        console.error(
                            "Natural height:",
                            image.naturalHeight
                        );

                        console.error(
                            "Image element:",
                            image
                        );

                        /*
                         * IMPORTANT:
                         * Do NOT replace the image here.
                         * We want to see the actual browser error.
                         */

                    };


                image.src =
                    photoUrl;

            }
        );


        console.log(
            "Admin dashboard photo URL applied successfully"
        );

    }
    catch (error) {

        console.error(
            "Admin dashboard photo error:",
            error
        );


        photos.forEach(
            function (image) {

                image.src =
                    defaultPhoto;

            }
        );

    }

}




/*==================================================
SET DASHBOARD ADMIN PHOTOS
==================================================*/

function setDashboardPhotos(
    photoUrl
) {

    const photos =
        document.querySelectorAll(
            ".admin-photo"
        );


    photos.forEach(
        function (image) {

            image.src =
                photoUrl;

        }
    );

}




/*==================================================
BUILD SIDEBAR
==================================================*/

function buildSidebar() {

    if (!sidebar) {

        return;

    }

    sidebar.innerHTML = `

        <div class="sidebar-header">

            <div class="logo">

                <i class="fa-solid fa-graduation-cap"></i>

                <span>${APP_NAME}</span>

            </div>

        </div>

        <div class="sidebar-profile">

            <div class="profile-image">
                <img
                    class="admin-photo"
                    src="/assets/Screenshot_20260806-223602.png"
                    alt="Admin"
                >

            </div>

            <div class="profile-details">

                <h6 class="admin-name">

                    Loading...

                </h6>

                <small>

                    Administrator

                </small>

                <p class="admin-email">

                </p>

            </div>

        </div>

        <nav class="sidebar-menu">

            ${buildMenuItems()}

        </nav>

        <div class="sidebar-footer">

            <button
                id="logoutBtn"
                class="logout-btn"
            >

                <i class="fa-solid fa-right-from-bracket"></i>

                Logout

            </button>

        </div>

    `;

}

/*==================================================
BUILD MENU
==================================================*/

function buildMenuItems() {

    const currentPage =

        window.location.pathname

        .split("/")

        .pop();

    return ADMIN_MENU

        .map(

            function (item) {

                const active =

                    currentPage === item.page

                        ? "active"

                        : "";

                return `

                    <a
                        href="${item.page}"
                        class="menu-item ${active}"
                    >

                        <i class="${item.icon}"></i>

                        <span>

                            ${item.title}

                        </span>

                    </a>

                `;

            }

        )

        .join("");

}





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
                class="menu-toggle"
            >

                <i class="fa-solid fa-bars"></i>

            </button>

            <div>

                <h4 class="page-title">

                    Dashboard

                </h4>

                <small>

                    ${PORTAL_NAME}

                </small>

            </div>

        </div>

        <div class="topbar-center">

            <div class="search-box">

                <i class="fa-solid fa-search"></i>

                <input
                    type="search"
                    placeholder="Search..."
                >

            </div>

        </div>

        <div class="topbar-right">

            <button
                class="notification-btn"
                title="Notifications"
            >

                <i class="fa-regular fa-bell"></i>

                <span class="notification-badge">

                    0

                </span>

            </button>

            <div class="topbar-profile">
              <a href="admin-profile.html">
                <img
                    class="admin-photo"
                    src="/assets/Screenshot_20260806-223602.png"
                    alt="Admin"
                ></a>

                <div>

                    <div class="admin-name">

                        Loading...

                    </div>

                    <small>

                        Administrator

                    </small>

                </div>

            </div>

        </div>

    `;

}




/*==================================================
SIDEBAR EVENTS
==================================================*/

function attachSidebar() {

    const menuToggle =

        document.getElementById(
            "menuToggle"
        );

    if (menuToggle) {

        menuToggle.addEventListener(

            "click",

            function () {

                sidebar.classList.toggle(
                    "show"
                );

                overlay.classList.toggle(
                    "show"
                );

            }

        );

    }

    if (overlay) {

        overlay.addEventListener(

            "click",

            closeSidebar

        );

    }

    document.addEventListener(

        "keydown",

        function (event) {

            if (

                event.key === "Escape"

            ) {

                closeSidebar();

            }

        }

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

        async function () {

            const confirmed =

                confirm(

                    "Are you sure you want to logout?"

                );

            if (!confirmed) {

                return;

            }

            try {

                await account.deleteSession(
                    "current"
                );

            }

            catch (error) {

                console.error(

                    "Logout Error",

                    error

                );

            }

            localStorage.removeItem(
                "aplusUser"
            );

            window.location.href =
                "login.html";

        }

    );

}









/*==================================================
ATTACH EVENTS
==================================================*/

function attachEvents() {

    attachSidebar();

    attachLogout();

}






/*==================================================
RENDER DASHBOARD
==================================================*/

function renderDashboard() {

    const dashboard =

        document.getElementById(
            "dashboardContent"
        );

    if (!dashboard) {

        return;

    }

    dashboard.innerHTML = `

        <div class="welcome-card">

            <div>

                <h2>

                    Welcome,

                    ${currentAdmin?.fullName || "Administrator"}

                </h2>

                <p>

                    Manage students, quizzes, subjects,
                    tutors and CBT examinations from one place.

                </p>

            </div>

        </div>


        <div class="stats-grid">

            <div class="stat-card">

                <div class="stat-icon">

                    <i class="fa-solid fa-user-graduate"></i>

                </div>

                <div>

                    <h3 id="totalStudents">

                        0

                    </h3>

                    <span>

                        Students

                    </span>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">

                    <i class="fa-solid fa-book"></i>

                </div>

                <div>

                    <h3 id="totalSubjects">

                        0

                    </h3>

                    <span>

                        Subjects

                    </span>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">

                    <i class="fa-solid fa-circle-question"></i>

                </div>

                <div>

                    <h3 id="totalQuestions">

                        0

                    </h3>

                    <span>

                        Questions

                    </span>

                </div>

            </div>


            <div class="stat-card">

                <div class="stat-icon">

                    <i class="fa-solid fa-laptop-file"></i>

                </div>

                <div>

                    <h3 id="totalExams">

                        0

                    </h3>

                    <span>

                        CBT Exams

                    </span>

                </div>

            </div>

        </div>


        <div class="quick-actions">

            <h3>

                Quick Actions

            </h3>

            <div class="action-grid">

                <a
                    href="students.html"
                    class="action-card"
                >

                    <i class="fa-solid fa-user-plus"></i>

                    <span>

                        Add Student

                    </span>

                </a>

                <a
                    href="subjects.html"
                    class="action-card"
                >

                    <i class="fa-solid fa-book-medical"></i>

                    <span>

                        Add Subject

                    </span>

                </a>

                <a
                    href="questions.html"
                    class="action-card"
                >

                    <i class="fa-solid fa-plus"></i>

                    <span>

                        Add Question

                    </span>

                </a>

                <a
                    href="cbt.html"
                    class="action-card"
                >

                    <i class="fa-solid fa-file-circle-plus"></i>

                    <span>

                        Create CBT

                    </span>

                </a>

            </div>

        </div>


        <div class="dashboard-row">

            <div class="dashboard-card">

                <h3>

                    Recent Activities

                </h3>

                <div id="recentActivitiesList">

                    <p>

                        No activities yet.

                    </p>

                </div>

            </div>


            <div class="dashboard-card">

                <h3>

                    Performance Overview

                </h3>

                <canvas
                    id="dashboardChart"
                    height="220"
                ></canvas>

            </div>

        </div>

    `;

}





/*==================================================
INITIALIZE DASHBOARD
==================================================*/

function initializeDashboard(event) {

    try {

        currentUser =
            event.detail.authUser;

        currentAdmin =
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

            "Admin Dashboard Error",

            error

        );

    }

}

