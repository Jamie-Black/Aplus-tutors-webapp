"use strict";

/* =========================================================
   APLUS TUTORS
   ADMIN CBT RESULTS

   PHASE 1:
   - Initialize page
   - Wait for authentication
   - Load CBT attempts
   - Load student profiles
   - Match attempts to students
   - Display results table
   - Handle loading and error states

   EXISTING TABLES:
   - cbt_attempts
   - users

   IMPORTANT:
   This script does not modify existing CBT records.
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

/* =========================================================
   APPWRITE TABLE CONFIGURATION
========================================================= */

const RESULTS_ATTEMPTS_TABLE_ID =
    CBT_ATTEMPTS_TABLE_ID;

const RESULTS_USERS_TABLE_ID =
    USERS_TABLE_ID;

const RESULTS_CBT_SETTINGS_TABLE_ID =
    "cbt_settings";

const RESULTS_PAGE_SIZE = 25;


/* =========================================================
   STATISTICS CONFIGURATION
========================================================= */

// A score of 50% or higher is considered a pass.
const RESULTS_PASS_MARK = 50;


/* =========================================================
   PAGE STATE
========================================================= */

let resultsInitialized = false;

let resultsLoading = false;

let resultsAuthUser = null;

let resultsAdminProfile = null;

let resultsAttempts = [];

let resultsStudents = [];

let resultsEnrichedAttempts = [];

let resultsCurrentPage = 1;

let resultsFilteredAttempts = [];


/* =========================================================
   PHASE 2 — EXAM SETTINGS STATE
========================================================= */

// Stores examination settings loaded from Appwrite.
let resultsExamSettings = [];

// Maps examination IDs to readable examination names.
let resultsExamNames = new Map();


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const resultsElements = {

    loader:
        document.getElementById("pageLoader"),

    refreshButton:
        document.getElementById("refreshResultsBtn"),

    search:
        document.getElementById("resultsSearch"),

    departmentFilter:
        document.getElementById("departmentFilter"),

    statusFilter:
        document.getElementById("statusFilter"),

    dateFilter:
        document.getElementById("resultsDateFilter"),

    message:
        document.getElementById("resultsMessage"),

    tableBody:
        document.getElementById("resultsTableBody"),

    paginationInfo:
        document.getElementById("resultsPaginationInfo"),

    pageNumber:
        document.getElementById("resultsPageNumber"),

    previousButton:
        document.getElementById("previousResultsPage"),

    nextButton:
        document.getElementById("nextResultsPage"),

    totalAttempts:
        document.getElementById("totalAttempts"),

    uniqueStudents:
        document.getElementById("uniqueStudents"),

    averageScore:
        document.getElementById("averageScore"),

    highestScore:
        document.getElementById("highestScore"),

    passRate:
        document.getElementById("passRate"),

    inProgressAttempts:
        document.getElementById("inProgressAttempts")

};


/* =========================================================
   WAIT FOR AUTHENTICATION
========================================================= */

document.addEventListener(
    "aplusAuthReady",
    async function (event) {

        if (resultsInitialized) {
            return;
        }

        resultsAuthUser =
            event.detail.authUser;

        resultsAdminProfile =
            event.detail.user;

        await initializeAdminResults();

    }
);


/* =========================================================
   INITIALIZE RESULTS PAGE
========================================================= */

async function initializeAdminResults() {

    if (resultsInitialized) {
        return;
    }

    resultsInitialized = true;

    bindResultsEvents();

    await loadAdminResults();

}


/* =========================================================
   BIND PAGE EVENTS
========================================================= */

function bindResultsEvents() {

    /* Refresh button */

    resultsElements.refreshButton
        ?.addEventListener(
            "click",
            async function () {

                await loadAdminResults();

            }
        );


    /* Search */

    resultsElements.search
        ?.addEventListener(
            "input",
            function () {

                resultsCurrentPage = 1;

                applyResultsFilters();

            }
        );


    /* Department filter */

    resultsElements.departmentFilter
        ?.addEventListener(
            "change",
            function () {

                resultsCurrentPage = 1;

                applyResultsFilters();

            }
        );


    /* Status filter */

    resultsElements.statusFilter
        ?.addEventListener(
            "change",
            function () {

                resultsCurrentPage = 1;

                applyResultsFilters();

            }
        );


    /* Examination date filter */

    resultsElements.dateFilter
        ?.addEventListener(
            "change",
            function () {

                resultsCurrentPage = 1;

                applyResultsFilters();

            }
        );


    /* Previous page */

    resultsElements.previousButton
        ?.addEventListener(
            "click",
            function () {

                if (resultsCurrentPage > 1) {

                    resultsCurrentPage--;

                    renderResultsTable();

                }

            }
        );


    /* Next page */

    resultsElements.nextButton
        ?.addEventListener(
            "click",
            function () {

                const totalPages =
                    Math.ceil(
                        resultsFilteredAttempts.length /
                        RESULTS_PAGE_SIZE
                    );

                if (
                    resultsCurrentPage <
                    totalPages
                ) {

                    resultsCurrentPage++;

                    renderResultsTable();

                }

            }
        );
        
        
        
/* =====================================================
   VIEW CBT RESULT BUTTON
===================================================== */

if (resultsElements.tableBody) {

    resultsElements.tableBody.addEventListener(
        "click",
        function (event) {

            const button = event.target.closest(
                ".results-view-btn"
            );

            if (!button) {
                return;
            }

            const attemptId =
                button.dataset.attemptId;

            if (!attemptId) {

                showResultsMessage(
                    "Unable to identify this examination attempt.",
                    "error"
                );

                return;
            }

            openResultsDetailModal(attemptId);

        }
    );

}

}


/* =========================================================
   LOAD ADMIN RESULTS
========================================================= */

async function loadAdminResults() {

    if (resultsLoading) {
        return;
    }

    resultsLoading = true;

    setResultsLoading(true);

    showResultsMessage(
        "Loading CBT examination records...",
        "loading"
    );

    try {

        console.log(
            "Loading Aplus Tutors CBT results..."
        );


        /* ================================================
           STEP 1: VERIFY ADMIN AUTHENTICATION
        ================================================ */

        if (
            !resultsAuthUser ||
            !resultsAuthUser.$id
        ) {

            throw new Error(
                "Administrator authentication is not ready."
            );

        }


        if (
            !resultsAdminProfile ||
            String(
                resultsAdminProfile.role || ""
            ).toLowerCase() !== "admin"
        ) {

            throw new Error(
                "Administrator access could not be verified."
            );

        }


        /* ================================================
           STEP 2: LOAD CBT ATTEMPTS
        ================================================ */

        resultsAttempts =
            await fetchAllResultsRows(
                RESULTS_ATTEMPTS_TABLE_ID
            );


        console.log(
            "CBT attempts loaded:",
            resultsAttempts.length
        );
        
        
        /* ================================================
   PHASE 2: LOAD EXAMINATION SETTINGS
================================================ */

await loadResultsExamSettings();
        /* ================================================
           STEP 3: LOAD STUDENT PROFILES
        ================================================ */

        resultsStudents =
            await fetchAllResultsRows(
                RESULTS_USERS_TABLE_ID
            );


        /* ================================================
           STEP 4: KEEP STUDENT PROFILES ONLY
        ================================================ */

        resultsStudents =
            resultsStudents.filter(
                function (student) {

                    return (
                        String(
                            student.role || ""
                        ).toLowerCase() === "student"
                    );

                }
            );


        console.log(
            "Student profiles loaded:",
            resultsStudents.length
        );


        /* ================================================
           STEP 5: MATCH ATTEMPTS TO STUDENTS
        ================================================ */

        resultsEnrichedAttempts =
            resultsAttempts.map(
                function (attempt) {

                    const student =
                        findResultsStudent(
                            attempt.studentId
                        );

                    return {

                        ...attempt,

                        studentName:
                            student?.fullName ||
                            "Unknown Student",

                        studentEmail:
                            student?.email ||
                            "",

                        studentDepartment:
                            student?.department ||
                            "",

                        studentProfileId:
                            student?.$id ||
                            ""

                    };

                }
            );


        /* ================================================
           STEP 6: SORT NEWEST FIRST
        ================================================ */

        resultsEnrichedAttempts.sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.completedAt ||
                        a.startedAt ||
                        a.$createdAt ||
                        0
                    ).getTime() || 0;

                const dateB =
                    new Date(
                        b.completedAt ||
                        b.startedAt ||
                        b.$createdAt ||
                        0
                    ).getTime() || 0;

                return dateB - dateA;

            }
        );


/* ================================================
   PHASE 2: UPDATE DASHBOARD STATISTICS
================================================ */

updateResultsStatistics();


/* ================================================
   STEP 7: INITIALIZE FILTERED RESULTS
================================================ */

resultsCurrentPage = 1;

applyResultsFilters();

        /* ================================================
           STEP 8: SUCCESS MESSAGE
        ================================================ */

        showResultsMessage(
            resultsAttempts.length
                ? "CBT results loaded successfully."
                : "No CBT attempts have been recorded yet.",
            resultsAttempts.length
                ? "success"
                : "empty"
        );


        console.log(
            "Admin results initialized successfully."
        );


    } catch (error) {

        console.error(
            "Unable to load admin CBT results:",
            error
        );

        resultsAttempts = [];

        resultsStudents = [];

        resultsEnrichedAttempts = [];

        resultsFilteredAttempts = [];

        renderResultsTable();

        showResultsMessage(
            "Unable to load CBT results. Please refresh the page or try again.",
            "error"
        );


    } finally {

        resultsLoading = false;

        setResultsLoading(false);

    }

}


/* =========================================================
   FETCH ALL ROWS WITH PAGINATION
========================================================= */

/*
   Loads every row in batches.

   Appwrite pagination prevents the page from relying
   on a single limited query.

   The function uses the existing global variables:

   DATABASE_ID
   tablesDB
   Query
*/

async function fetchAllResultsRows(tableId) {

    const allRows = [];

    let cursor = null;

    const batchSize = 100;


    while (true) {

        const queries = [

            Query.limit(batchSize)

        ];


        if (cursor) {

            queries.push(
                Query.cursorAfter(cursor)
            );

        }


        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                tableId,
                queries
            );


        const rows =
            response.rows || [];


        allRows.push(
            ...rows
        );


        if (
            rows.length < batchSize
        ) {

            break;

        }


        const lastRow =
            rows[rows.length - 1];


        if (
            !lastRow ||
            !lastRow.$id
        ) {

            break;

        }


        cursor =
            lastRow.$id;

    }


    return allRows;

}


/* =========================================================
   FIND STUDENT PROFILE
========================================================= */

/*
   Supports either of these database arrangements:

   1. users.$id equals cbt_attempts.studentId

   2. users.userId equals cbt_attempts.studentId

   The first is the normal arrangement when studentId
   stores the Appwrite users table row ID.
*/

function findResultsStudent(studentId) {

    if (!studentId) {
        return null;
    }


    return resultsStudents.find(
        function (student) {

            return (
                student.$id === studentId ||
                student.userId === studentId
            );

        }
    ) || null;

}






/* =========================================================
   PHASE 2 — UPDATE DASHBOARD STATISTICS
========================================================= */

function updateResultsStatistics() {

    /* ================================================
       VERIFY DATA
    ================================================ */

    const attempts = Array.isArray(resultsAttempts)
        ? resultsAttempts
        : [];


    /* ================================================
       TOTAL ATTEMPTS
    ================================================ */

    if (resultsElements.totalAttempts) {

        resultsElements.totalAttempts.textContent =
            attempts.length.toLocaleString();

    }


    /* ================================================
       UNIQUE STUDENTS
    ================================================ */

    const uniqueStudentIds = new Set();

    attempts.forEach(function (attempt) {

        const studentId =
            String(attempt.studentId || "").trim();

        if (studentId) {

            uniqueStudentIds.add(studentId);

        }

    });


    if (resultsElements.uniqueStudents) {

        resultsElements.uniqueStudents.textContent =
            uniqueStudentIds.size.toLocaleString();

    }


    /* ================================================
       SELECT COMPLETED ATTEMPTS
    ================================================ */

    const completedAttempts =
        attempts.filter(function (attempt) {

            return (
                String(attempt.status || "")
                    .toLowerCase()
                    .trim() === "completed"
            );

        });


    /* ================================================
       EXTRACT VALID PERCENTAGE SCORES
    ================================================ */

    const scoredAttempts =
        completedAttempts.map(function (attempt) {

            const percentage =
                Number(attempt.percentage);

            return {
                attempt: attempt,
                percentage: percentage
            };

        }).filter(function (item) {

            return (
                item.attempt.percentage !== null &&
                item.attempt.percentage !== undefined &&
                item.attempt.percentage !== "" &&
                Number.isFinite(item.percentage) &&
                item.percentage >= 0 &&
                item.percentage <= 100
            );

        });


    /* ================================================
       AVERAGE SCORE
    ================================================ */

    let averageScore = null;

    if (scoredAttempts.length > 0) {

        const totalScore =
            scoredAttempts.reduce(
                function (sum, item) {

                    return sum + item.percentage;

                },
                0
            );

        averageScore =
            totalScore / scoredAttempts.length;

    }


    if (resultsElements.averageScore) {

        resultsElements.averageScore.textContent =
            averageScore === null
                ? "—"
                : averageScore.toFixed(1) + "%";

    }


    /* ================================================
       HIGHEST SCORE
    ================================================ */

    let highestScore = null;

    if (scoredAttempts.length > 0) {

        highestScore =
            Math.max.apply(
                null,
                scoredAttempts.map(function (item) {

                    return item.percentage;

                })
            );

    }


    if (resultsElements.highestScore) {

        resultsElements.highestScore.textContent =
            highestScore === null
                ? "—"
                : highestScore.toFixed(1) + "%";

    }


    /* ================================================
       PASS RATE
    ================================================ */

    let passRate = null;

    if (scoredAttempts.length > 0) {

        const passedAttempts =
            scoredAttempts.filter(
                function (item) {

                    return (
                        item.percentage >=
                        RESULTS_PASS_MARK
                    );

                }
            );


        passRate =
            (
                passedAttempts.length /
                scoredAttempts.length
            ) * 100;

    }


    if (resultsElements.passRate) {

        resultsElements.passRate.textContent =
            passRate === null
                ? "—"
                : passRate.toFixed(1) + "%";

    }


    /* ================================================
       IN-PROGRESS ATTEMPTS
    ================================================ */

    const inProgressCount =
        attempts.filter(function (attempt) {

            return (
                String(attempt.status || "")
                    .toLowerCase()
                    .trim() === "in_progress"
            );

        }).length;


    if (resultsElements.inProgressAttempts) {

        resultsElements.inProgressAttempts.textContent =
            inProgressCount.toLocaleString();

    }


    /* ================================================
       DEBUG INFORMATION
    ================================================ */

    console.log(
        "Results statistics updated:",
        {
            totalAttempts: attempts.length,

            uniqueStudents: uniqueStudentIds.size,

            completedAttempts:
                completedAttempts.length,

            attemptsWithValidScores:
                scoredAttempts.length,

            averageScore: averageScore,

            highestScore: highestScore,

            passRate: passRate,

            inProgressAttempts: inProgressCount
        }
    );

}



/* =========================================================
   PHASE 2 — LOAD EXAMINATION SETTINGS
========================================================= */

async function loadResultsExamSettings() {

    resultsExamSettings = [];

    resultsExamNames = new Map();

    try {

        resultsExamSettings =
            await fetchAllResultsRows(
                RESULTS_CBT_SETTINGS_TABLE_ID
            );


        resultsExamSettings.forEach(
            function (setting) {

                const possibleNames = [

                    setting.examName,

                    setting.examTypeName,

                    setting.examType,

                    setting.name,

                    setting.title,

                    setting.label

                ];


                const examName =
                    possibleNames.find(
                        function (value) {

                            return (
                                typeof value === "string" &&
                                value.trim() !== ""
                            );

                        }
                    );


                if (!examName) {
                    return;
                }


                const possibleIds = [

                    setting.$id,

                    setting.examTypeId,

                    setting.examId,

                    setting.id

                ];


                possibleIds.forEach(
                    function (id) {

                        if (
                            id !== undefined &&
                            id !== null &&
                            String(id).trim() !== ""
                        ) {

                            resultsExamNames.set(
                                String(id),
                                examName.trim()
                            );

                        }

                    }
                );

            }
        );


        console.log(
            "Examination settings loaded:",
            resultsExamSettings.length
        );


        console.log(
            "Readable examination names mapped:",
            resultsExamNames.size
        );


    } catch (error) {

        /*
         * Examination names are an enhancement.
         * A settings-table error must not prevent
         * the results page from loading.
         */

        console.warn(
            "Unable to load examination names:",
            error
        );

        resultsExamSettings = [];

        resultsExamNames = new Map();

    }

}


/* =========================================================
   PHASE 2 — GET READABLE EXAMINATION NAME
========================================================= */

function getResultsExamName(examTypeId) {

    if (
        examTypeId === undefined ||
        examTypeId === null ||
        String(examTypeId).trim() === ""
    ) {

        return "—";

    }


    const id =
        String(examTypeId);


    return (
        resultsExamNames.get(id) ||
        id
    );

}




/* =========================================================
   APPLY SEARCH AND FILTERS
========================================================= */

function applyResultsFilters() {

    const searchTerm =
        (
            resultsElements.search?.value || ""
        )
        .trim()
        .toLowerCase();


    const selectedDepartment =
        resultsElements.departmentFilter?.value || "";


    const selectedStatus =
        (
            resultsElements.statusFilter?.value || ""
        )
        .toLowerCase();


    const selectedDate =
        resultsElements.dateFilter?.value || "";


    resultsFilteredAttempts =
        resultsEnrichedAttempts.filter(
            function (attempt) {


                /* ========================================
                   SEARCH BY STUDENT NAME OR EMAIL
                ======================================== */

                const matchesSearch =

                    !searchTerm ||

                    String(
                        attempt.studentName || ""
                    )
                    .toLowerCase()
                    .includes(searchTerm) ||

                    String(
                        attempt.studentEmail || ""
                    )
                    .toLowerCase()
                    .includes(searchTerm);


                /* ========================================
                   FILTER BY DEPARTMENT
                ======================================== */

                const matchesDepartment =

                    !selectedDepartment ||

                    String(
                        attempt.studentDepartment || ""
                    )
                    .toLowerCase() ===
                    selectedDepartment.toLowerCase();


                /* ========================================
                   FILTER BY STATUS
                ======================================== */

                const matchesStatus =

                    !selectedStatus ||

                    String(
                        attempt.status || ""
                    )
                    .toLowerCase() === selectedStatus;


                /* ========================================
                   FILTER BY EXAMINATION DATE
                ======================================== */

                const attemptDate =
                    getResultsDate(
                        attempt
                    );


                const matchesDate =

                    !selectedDate ||

                    attemptDate === selectedDate;


                return (

                    matchesSearch &&

                    matchesDepartment &&

                    matchesStatus &&

                    matchesDate

                );

            }
        );


    /* ================================================
       KEEP PAGE NUMBER VALID
    ================================================ */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                resultsFilteredAttempts.length /
                RESULTS_PAGE_SIZE
            )
        );


    if (
        resultsCurrentPage > totalPages
    ) {

        resultsCurrentPage = totalPages;

    }


    /* ================================================
       UPDATE TABLE
    ================================================ */

    renderResultsTable();

}


/* =========================================================
   GET ATTEMPT DATE
========================================================= */

function getResultsDate(attempt) {

    const rawDate =

        attempt.completedAt ||

        attempt.startedAt ||

        attempt.$createdAt;


    if (!rawDate) {
        return "";
    }


    const date =
        new Date(rawDate);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return (

        date.getFullYear() +

        "-" +

        String(
            date.getMonth() + 1
        ).padStart(2, "0") +

        "-" +

        String(
            date.getDate()
        ).padStart(2, "0")

    );

}


/* =========================================================
   RENDER RESULTS TABLE
========================================================= */

function renderResultsTable() {

    const tbody =
        resultsElements.tableBody;


    if (!tbody) {
        return;
    }


    tbody.replaceChildren();


    /* ================================================
       EMPTY RESULTS
    ================================================ */

    if (
        resultsFilteredAttempts.length === 0
    ) {

        const row =
            document.createElement("tr");


        const cell =
            document.createElement("td");


        cell.colSpan = 9;

        cell.textContent =
            "No matching CBT attempts found.";


        row.appendChild(cell);

        tbody.appendChild(row);


        updateResultsPagination();

        return;

    }


    /* ================================================
       PAGINATION RANGE
    ================================================ */

    const startIndex =

        (resultsCurrentPage - 1) *

        RESULTS_PAGE_SIZE;


    const pageRows =

        resultsFilteredAttempts.slice(

            startIndex,

            startIndex + RESULTS_PAGE_SIZE

        );


    /* ================================================
       RENDER EACH ATTEMPT
    ================================================ */

    pageRows.forEach(
        function (attempt) {

            const row =
                document.createElement("tr");


            /* STUDENT */

            const studentCell =
                document.createElement("td");


            const studentName =
                document.createElement("strong");


            studentName.textContent =
                attempt.studentName;


            const studentEmail =
                document.createElement("small");


            studentEmail.textContent =
                attempt.studentEmail ||
                "No email available";


            studentCell.append(
                studentName,
                document.createElement("br"),
                studentEmail
            );


            row.appendChild(studentCell);


            /* DEPARTMENT */

            row.appendChild(
                createResultsCell(
                    attempt.studentDepartment || "—"
                )
            );


           /* EXAMINATION */

row.appendChild(
    createResultsCell(
        getResultsExamName(
            attempt.examTypeId
        )
    )
);


            /* SCORE */

const percentage =
                Number(
                    attempt.percentage
                );


            const scoreCell =
                createResultsCell(
                    Number.isFinite(percentage)
                        ? percentage.toFixed(1) + "%"
                        : "—"
                );


            row.appendChild(scoreCell);


            /* CORRECT ANSWERS */

            row.appendChild(
                createResultsCell(
                    attempt.correctAnswers ?? 0
                )
            );


            /* TOTAL QUESTIONS */

            row.appendChild(
                createResultsCell(
                    attempt.totalQuestions ?? 0
                )
            );


            /* DATE */

            row.appendChild(
                createResultsCell(
                    formatResultsDate(
                        attempt
                    )
                )
            );


            /* STATUS */

            const statusCell =
                document.createElement("td");


            const statusBadge =
                document.createElement("span");


            const status =
                String(
                    attempt.status || "unknown"
                )
                .toLowerCase()
                .trim();


            statusBadge.className =
                "results-status-badge";


            statusBadge.textContent =
                formatResultsStatus(status);


            statusBadge.classList.add(

                status === "completed"

                    ? "completed"

                    : status === "in_progress"

                    ? "in-progress"

                    : "unknown"

            );


            statusCell.appendChild(
                statusBadge
            );


            row.appendChild(statusCell);


/* =====================================================
   ACTION — VIEW CBT RESULT
===================================================== */

const actionCell =
    document.createElement("td");


const viewButton =
    document.createElement("button");


viewButton.type = "button";

viewButton.className =
    "results-view-btn";

viewButton.textContent = "View";


viewButton.dataset.attemptId =
    attempt.$id;


/* Enable the button */

viewButton.disabled = false;

viewButton.title =
    "View detailed CBT examination result";


/* Add button to action cell */

actionCell.appendChild(viewButton);


/* Add action cell to row */

row.appendChild(actionCell);

            tbody.appendChild(row);

        }
    );


    updateResultsPagination();

}

/* =========================================================
   CREATE SAFE TABLE CELL
========================================================= */

function createResultsCell(value) {

    const cell =
        document.createElement("td");


    cell.textContent =
        String(value ?? "—");


    return cell;

}


/* =========================================================
   FORMAT STATUS
========================================================= */

function formatResultsStatus(status) {

    const labels = {

        completed: "Completed",

        in_progress: "In Progress",

        unknown: "Unknown"

    };


    return labels[status] || status;

}


/* =========================================================
   FORMAT DATE FOR TABLE
========================================================= */

function formatResultsDate(attempt) {

    const rawDate =

        attempt.completedAt ||

        attempt.startedAt ||

        attempt.$createdAt;


    if (!rawDate) {
        return "—";
    }


    const date =
        new Date(rawDate);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        undefined,
        {

            year: "numeric",

            month: "short",

            day: "numeric"

        }
    );

}


/* =========================================================
   UPDATE PAGINATION
========================================================= */

function updateResultsPagination() {

    const total =
        resultsFilteredAttempts.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / RESULTS_PAGE_SIZE
            )
        );


    const start =

        total === 0

            ? 0

            : (
                (resultsCurrentPage - 1) *
                RESULTS_PAGE_SIZE
            ) + 1;


    const end =

        Math.min(
            resultsCurrentPage *
            RESULTS_PAGE_SIZE,

            total
        );


    if (resultsElements.paginationInfo) {

        resultsElements.paginationInfo.textContent =

            total === 0

                ? "No attempts loaded"

                : `Showing ${start}–${end} of ${total} attempts`;

    }


    if (resultsElements.pageNumber) {

        resultsElements.pageNumber.textContent =

            `Page ${resultsCurrentPage} of ${totalPages}`;

    }


    if (resultsElements.previousButton) {

        resultsElements.previousButton.disabled =

            resultsCurrentPage <= 1;

    }


    if (resultsElements.nextButton) {

        resultsElements.nextButton.disabled =

            resultsCurrentPage >= totalPages;

    }

}


/* =========================================================
   LOADING STATE
========================================================= */

function setResultsLoading(isLoading) {

    if (resultsElements.refreshButton) {

        resultsElements.refreshButton.disabled =
            isLoading;

        resultsElements.refreshButton.innerHTML =

            isLoading

                ? '<i class="fa-solid fa-spinner fa-spin"></i> Loading...'

                : '<i class="fa-solid fa-rotate"></i> Refresh';

    }


    if (resultsElements.loader) {

        resultsElements.loader.style.display =

            isLoading ? "flex" : "none";

    }

}


/* =========================================================
   TABLE MESSAGE
========================================================= */

function showResultsMessage(
    message,
    type = "info"
) {

    if (!resultsElements.message) {
        return;
    }


    resultsElements.message.textContent =
        message;


    resultsElements.message.dataset.type =
        type;


    resultsElements.message.style.display =
        "block";

}



/* =========================================================
   APLUS TUTORS
   ADMIN CBT RESULTS
   RESULT DETAILS MODAL
========================================================= */


/* =========================================================
   CREATE RESULT DETAILS MODAL
========================================================= */

function createResultsDetailModal() {

    let modal = document.getElementById(
        "resultsDetailModal"
    );

    if (modal) {
        return modal;
    }

    modal = document.createElement("div");

    modal.id = "resultsDetailModal";

    modal.className = "results-detail-modal";

    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
        <div class="results-detail-backdrop"
             data-close-results-modal="true">
        </div>

        <div class="results-detail-dialog"
             role="dialog"
             aria-modal="true"
             aria-labelledby="resultsDetailTitle">

            <div class="results-detail-header">

                <div>
                    <span class="results-detail-eyebrow">
                        APLUS TUTORS
                    </span>

                    <h2 id="resultsDetailTitle">
                        CBT Result Summary
                    </h2>

                    <p>
                        Examination performance and student details
                    </p>
                </div>

                <button
                    type="button"
                    class="results-detail-close"
                    aria-label="Close result details"
                    data-close-results-modal="true">
                    &times;
                </button>

            </div>

            <div class="results-detail-body">

                <div
                    id="resultsDetailMessage"
                    class="results-detail-message"
                    aria-live="polite">
                </div>

                <div
                    id="resultsDetailContent"
                    hidden>

                    <div class="results-detail-student">

                        <div class="results-detail-avatar">
                            <i class="fas fa-user-graduate"></i>
                        </div>

                        <div class="results-detail-student-info">

                            <h3 id="detailStudentName">
                                Student
                            </h3>

                            <p id="detailStudentEmail">
                                —
                            </p>

                            <span id="detailStudentDepartment">
                                —
                            </span>

                        </div>

                    </div>


                    <div class="results-detail-section">

                        <h3>
                            <i class="fas fa-file-alt"></i>
                            Examination Information
                        </h3>

                        <div class="results-detail-grid">

                            <div class="results-detail-item">
                                <span>Examination</span>
                                <strong id="detailExamName">—</strong>
                            </div>

                            <div class="results-detail-item">
                                <span>Attempt ID</span>
                                <strong id="detailAttemptId">—</strong>
                            </div>

                            <div class="results-detail-item">
                                <span>Status</span>
                                <strong id="detailAttemptStatus">—</strong>
                            </div>

                            <div class="results-detail-item">
                                <span>Date Started</span>
                                <strong id="detailStartedAt">—</strong>
                            </div>

                            <div class="results-detail-item">
                                <span>Date Completed</span>
                                <strong id="detailCompletedAt">—</strong>
                            </div>

                        </div>

                    </div>


                    <div class="results-detail-section">

                        <h3>
                            <i class="fas fa-chart-bar"></i>
                            Performance Summary
                        </h3>

                        <div class="results-detail-score-grid">

                            <div class="results-detail-score-card">

                                <span>Score</span>

                                <strong id="detailScore">
                                    —
                                </strong>

                            </div>

                            <div class="results-detail-score-card">

                                <span>Percentage</span>

                                <strong id="detailPercentage">
                                    —
                                </strong>

                            </div>

                            <div class="results-detail-score-card">

                                <span>Correct Answers</span>

                                <strong id="detailCorrectAnswers">
                                    —
                                </strong>

                            </div>

                            <div class="results-detail-score-card">

                                <span>Total Questions</span>

                                <strong id="detailTotalQuestions">
                                    —
                                </strong>

                            </div>

                        </div>

                    </div>

                    <div class="results-detail-footer">

                        <i class="fas fa-info-circle"></i>

                        This summary displays examination performance
                        only. Individual questions and answers are
                        not displayed.

                    </div>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    /* CLOSE BUTTONS AND BACKDROP */

    modal.addEventListener("click", function (event) {

        if (
            event.target.closest(
                "[data-close-results-modal='true']"
            )
        ) {
            closeResultsDetailModal();
        }

    });


    /* ESCAPE KEY */

    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            modal.classList.contains("is-open")
        ) {
            closeResultsDetailModal();
        }

    });

    return modal;

}


/* =========================================================
   SAFE TEXT HELPER
========================================================= */

function setResultsDetailText(elementId, value) {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : String(value);

}


/* =========================================================
   GET AVAILABLE VALUE FROM ATTEMPT
========================================================= */

function getResultsDetailValue(object, keys) {

    if (!object) {
        return null;
    }

    for (const key of keys) {

        const value = object[key];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }

    }

    return null;

}


/* =========================================================
   FORMAT RESULT DETAIL DATE
========================================================= */

function formatResultsDetailDate(value) {

    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString();

}


/* =========================================================
   OPEN RESULT DETAILS MODAL
========================================================= */

function openResultsDetailModal(attemptId) {

    const modal = createResultsDetailModal();

    const message = document.getElementById(
        "resultsDetailMessage"
    );

    const content = document.getElementById(
        "resultsDetailContent"
    );

    message.textContent = "Loading examination summary...";

    message.hidden = false;

    content.hidden = true;

    modal.classList.add("is-open");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add(
        "results-detail-modal-open"
    );


    /* FIND THE ALREADY-LOADED ATTEMPT */

    const attempt = resultsEnrichedAttempts.find(
        function (item) {

            return item.$id === attemptId;

        }
    );


    if (!attempt) {

        message.textContent =
            "The examination result could not be found. Refresh the page and try again.";

        return;

    }


    /* STUDENT INFORMATION */

    setResultsDetailText(
        "detailStudentName",
        attempt.studentName || "Unknown Student"
    );

    setResultsDetailText(
        "detailStudentEmail",
        attempt.studentEmail || "Email unavailable"
    );

    setResultsDetailText(
        "detailStudentDepartment",
        attempt.studentDepartment || "Department unavailable"
    );


    /* EXAMINATION INFORMATION */

    const examName = getResultsExamName(
        attempt.examTypeId
    );

    setResultsDetailText(
        "detailExamName",
        examName || "CBT Examination"
    );

    setResultsDetailText(
        "detailAttemptId",
        attempt.$id
    );


    /* STATUS */

    const rawStatus = getResultsDetailValue(
        attempt,
        ["status", "attemptStatus"]
    );

    const statusText = rawStatus
        ? String(rawStatus)
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            })
        : "Unknown";

    setResultsDetailText(
        "detailAttemptStatus",
        statusText
    );


    /* DATES */

    const startedAt = getResultsDetailValue(
        attempt,
        [
            "startedAt",
            "startTime",
            "$createdAt"
        ]
    );

    const completedAt = getResultsDetailValue(
        attempt,
        [
            "completedAt",
            "submittedAt",
            "endTime"
        ]
    );

    setResultsDetailText(
        "detailStartedAt",
        formatResultsDetailDate(startedAt)
    );

    setResultsDetailText(
        "detailCompletedAt",
        formatResultsDetailDate(completedAt)
    );


    /* PERFORMANCE */

    const percentage = getResultsDetailValue(
        attempt,
        [
            "percentage",
            "scorePercentage"
        ]
    );

    const correctAnswers = getResultsDetailValue(
        attempt,
        [
            "correctAnswers",
            "correctCount"
        ]
    );

    const totalQuestions = getResultsDetailValue(
        attempt,
        [
            "totalQuestions",
            "questionCount"
        ]
    );

    const score = getResultsDetailValue(
        attempt,
        [
            "score",
            "totalScore",
            "marksObtained"
        ]
    );


    setResultsDetailText(
        "detailPercentage",
        percentage !== null
            ? Number.isFinite(Number(percentage))
                ? Number(percentage).toFixed(1) + "%"
                : percentage
            : "Not available"
    );


    setResultsDetailText(
        "detailCorrectAnswers",
        correctAnswers !== null
            ? correctAnswers
            : "Not available"
    );


    setResultsDetailText(
        "detailTotalQuestions",
        totalQuestions !== null
            ? totalQuestions
            : "Not available"
    );


    setResultsDetailText(
        "detailScore",
        score !== null
            ? score
            : percentage !== null
                ? Number.isFinite(Number(percentage))
                    ? Number(percentage).toFixed(1) + "%"
                    : percentage
                : "Not available"
    );


    /* SHOW THE SUMMARY */

    message.hidden = true;

    content.hidden = false;

}


/* =========================================================
   CLOSE RESULT DETAILS MODAL
========================================================= */

function closeResultsDetailModal() {

    const modal = document.getElementById(
        "resultsDetailModal"
    );

    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");

    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove(
        "results-detail-modal-open"
    );

}
