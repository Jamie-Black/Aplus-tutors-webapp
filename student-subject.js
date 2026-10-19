/* ==================================================
   APLUS TUTORS
   STUDENT SUBJECTS PAGE
   PHASE 3 — LOAD AND DISPLAY STUDENT SUBJECTS
================================================== */


/* ==================================================
   STUDENT SUBJECT STATE
================================================== */

let currentStudentDepartment = "";



/* ==================================================
   INITIALIZE STUDENT SUBJECT PAGE
================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    await initializeStudentSubjects();

});



/* ==================================================
   INITIALIZE PAGE
================================================== */

async function initializeStudentSubjects() {

    try {

        console.log(
            "Initializing Student Subjects Page..."
        );


        /* ------------------------------------------
           GET CURRENT APPWRITE USER
        ------------------------------------------ */

        const currentUser =
            await account.get();


        console.log(
            "Logged-in User:",
            currentUser
        );


        /* ------------------------------------------
           LOAD STUDENT PROFILE
        ------------------------------------------ */

        await loadCurrentStudent(
            currentUser.$id
        );


        /* ------------------------------------------
           MAKE SURE DEPARTMENT EXISTS
        ------------------------------------------ */

        if (!currentStudentDepartment) {

            console.error(
                "Student department is missing."
            );

            showStudentDepartmentError();

            return;

        }


        /* ------------------------------------------
           LOAD SUBJECTS
        ------------------------------------------ */

        await loadStudentSubjects();


        /* ------------------------------------------
           RENDER SUBJECTS
        ------------------------------------------ */

        renderStudentSubjects();


        console.log(
            "Student Subjects Page Loaded Successfully."
        );


    } catch (error) {

        console.error(
            "Student Subjects Initialization Error:",
            error
        );

        showStudentDepartmentError();

        showSubjectsError();

    }

}



/* ==================================================
   LOAD CURRENT STUDENT
================================================== */

async function loadCurrentStudent(userId) {

    console.log(
        "Loading student profile for:",
        userId
    );


    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                USERS_TABLE_ID,
                [

                    Query.equal(
                        "userId",
                        userId
                    ),

                    Query.limit(1)

                ]
            );


        console.log(
            "Student Profile Response:",
            response
        );


        /* ------------------------------------------
           CHECK PROFILE
        ------------------------------------------ */

        if (
            !response.rows ||
            response.rows.length === 0
        ) {

            throw new Error(
                "Student profile could not be found."
            );

        }


        /* ------------------------------------------
           STORE PROFILE
        ------------------------------------------ */

        currentStudent =
            response.rows[0];


        console.log(
            "Current Student:",
            currentStudent
        );


        /* ------------------------------------------
           GET DEPARTMENT
        ------------------------------------------ */

        currentStudentDepartment =
            currentStudent.department || "";


        console.log(
            "Student Department:",
            currentStudentDepartment
        );


        /* ------------------------------------------
           CHECK DEPARTMENT
        ------------------------------------------ */

        if (!currentStudentDepartment) {

            throw new Error(
                "Student department is not available."
            );

        }


        /* ------------------------------------------
           UPDATE DEPARTMENT BADGE
        ------------------------------------------ */

        updateStudentDepartment(
            currentStudentDepartment
        );


    } catch (error) {

        console.error(
            "Error Loading Student Profile:",
            error
        );

        throw error;

    }

}



/* ==================================================
   UPDATE DEPARTMENT BADGE
================================================== */

function updateStudentDepartment(department) {

    const departmentBadge =
        document.getElementById(
            "studentDepartmentBadge"
        );


    if (!departmentBadge) {

        console.warn(
            "studentDepartmentBadge was not found."
        );

        return;

    }


    departmentBadge.innerHTML = `

        <i class="fa-solid fa-users"></i>

        <span>
            ${escapeStudentSubjectHTML(department)}
        </span>

    `;

}



/* ==================================================
   DEPARTMENT ERROR STATE
================================================== */

function showStudentDepartmentError() {

    const departmentBadge =
        document.getElementById(
            "studentDepartmentBadge"
        );


    if (!departmentBadge) {

        return;

    }


    departmentBadge.innerHTML = `

        <i class="fa-solid fa-triangle-exclamation"></i>

        <span>
            Department unavailable
        </span>

    `;

}



/* ==================================================
   LOAD STUDENT SUBJECTS
================================================== */

/* ==================================================
   LOAD STUDENT SUBJECTS
================================================== */

async function loadStudentSubjects() {

    console.log(
        "Loading subjects for department:",
        currentStudentDepartment
    );


    try {

        /* ------------------------------------------
           CHECK DEPARTMENT
        ------------------------------------------ */

        if (!currentStudentDepartment) {

            throw new Error(
                "Cannot load subjects because student department is missing."
            );

        }


        /* ------------------------------------------
           LOAD DEPARTMENT SUBJECTS
        ------------------------------------------ */

        const departmentResponse =
            await tablesDB.listRows({

                databaseId: DATABASE_ID,

                tableId: SUBJECTS_TABLE_ID,

                queries: [

                    Query.equal(
                        "department",
                        currentStudentDepartment
                    ),

                    Query.equal(
                        "status",
                        "active"
                    ),

                    Query.orderAsc(
                        "name"
                    ),

                    Query.limit(100)

                ]

            });


        /* ------------------------------------------
           LOAD GENERAL SUBJECTS
           GENERAL SUBJECTS ARE AVAILABLE
           TO ALL STUDENTS
        ------------------------------------------ */

        const generalResponse =
            await tablesDB.listRows({

                databaseId: DATABASE_ID,

                tableId: SUBJECTS_TABLE_ID,

                queries: [

                    Query.equal(
                        "department",
                        "General"
                    ),

                    Query.equal(
                        "status",
                        "active"
                    ),

                    Query.orderAsc(
                        "name"
                    ),

                    Query.limit(100)

                ]

            });


        /* ------------------------------------------
           COMBINE BOTH RESULTS
        ------------------------------------------ */

        const departmentSubjects =
            departmentResponse.rows || [];

        const generalSubjects =
            generalResponse.rows || [];


        studentSubjects = [
            ...departmentSubjects,
            ...generalSubjects
        ];


        /* ------------------------------------------
           REMOVE POSSIBLE DUPLICATES
        ------------------------------------------ */

        const uniqueSubjects = [];

        const subjectIds = new Set();


        studentSubjects.forEach(function (subject) {

            if (!subjectIds.has(subject.$id)) {

                subjectIds.add(subject.$id);

                uniqueSubjects.push(subject);

            }

        });


        studentSubjects =
            uniqueSubjects;


        /* ------------------------------------------
           SORT SUBJECTS BY NAME
        ------------------------------------------ */

        studentSubjects.sort(function (a, b) {

            return String(a.name || "")
                .localeCompare(
                    String(b.name || "")
                );

        });


        console.log(
            "Department Subjects:",
            departmentSubjects
        );


        console.log(
            "General Subjects:",
            generalSubjects
        );


        console.log(
            "Active Student Subjects:",
            studentSubjects
        );


        /* ------------------------------------------
           UPDATE COUNTERS
        ------------------------------------------ */

        updateSubjectCounters();


    } catch (error) {

        console.error(
            "Error Loading Student Subjects:",
            error
        );

        throw error;

    }

}



/* ==================================================
   UPDATE SUBJECT COUNTERS
================================================== */

function updateSubjectCounters() {

    const availableCount =
        document.getElementById(
            "availableSubjectsCount"
        );


    const activeCount =
        document.getElementById(
            "activeSubjectsCount"
        );


    const totalSubjects =
        studentSubjects.length;


    const activeSubjects =
        studentSubjects.filter(function (subject) {

            return String(
                subject.status || ""
            ).toLowerCase() === "active";

        }).length;


    if (availableCount) {

        availableCount.textContent =
            totalSubjects;

    }


    if (activeCount) {

        activeCount.textContent =
            activeSubjects;

    }

}



/* ==================================================
   RENDER STUDENT SUBJECTS
================================================== */

function renderStudentSubjects() {

    const grid =
        document.getElementById(
            "studentSubjectsGrid"
        );


    if (!grid) {

        console.warn(
            "studentSubjectsGrid was not found."
        );

        return;

    }


    /* ------------------------------------------
       CLEAR LOADING STATE
    ------------------------------------------ */

    grid.innerHTML = "";


    /* ------------------------------------------
       NO SUBJECTS
    ------------------------------------------ */

    if (
        !Array.isArray(studentSubjects) ||
        studentSubjects.length === 0
    ) {

        showNoSubjects();

        return;

    }


    /* ------------------------------------------
       CREATE SUBJECT CARDS
    ------------------------------------------ */

    studentSubjects.forEach(function (subject) {

        const column =
            document.createElement("div");


        column.className =
            "col-12 col-md-6 col-xl-4";


        column.innerHTML =
            createSubjectCard(subject);


        grid.appendChild(column);

    });


    console.log(
        "Rendered Subjects:",
        studentSubjects.length
    );

}



/* ==================================================
   CREATE SUBJECT CARD
================================================== */

function createSubjectCard(subject) {

    const subjectName =
        subject.name ||
        "Unnamed Subject";


    const subjectCode =
        subject.code ||
        "";


    const subjectDescription =
        subject.description ||
        "Continue learning, practise questions and prepare for your examination.";


    const icon =
        getSubjectIcon(subjectName);


    return `

        <article
            class="student-subject-card"
        >

            <div
                class="student-subject-card-top"
            >

                <div
                    class="student-subject-icon"
                >

                    <i class="${icon}"></i>

                </div>


                <span
                    class="student-subject-status"
                >

                    <i class="fa-solid fa-circle-check"></i>

                    Active

                </span>

            </div>


            <h3>

                ${escapeStudentSubjectHTML(
                    subjectName
                )}

            </h3>


            ${
                subjectCode
                    ? `
                        <div
                            class="student-subject-code"
                        >

                            <i class="fa-solid fa-hashtag"></i>

                            ${escapeStudentSubjectHTML(
                                subjectCode
                            )}

                        </div>
                    `
                    : ""
            }


            <p
                class="student-subject-description"
            >

                ${escapeStudentSubjectHTML(
                    subjectDescription
                )}

            </p>


            <div
                class="student-subject-meta"
            >

                <span>

                    <i class="fa-solid fa-layer-group"></i>

                    ${escapeStudentSubjectHTML(
                        subject.department ||
                        currentStudentDepartment
                    )}

                </span>


                <span>

                    <i class="fa-solid fa-circle"></i>

                    Available

                </span>

            </div>


            <button
                type="button"
                class="student-subject-action"
                onclick="openStudentSubject('${escapeSubjectAttribute(subject.$id)}')"
            >

                <span>
                    Start Learning
                </span>

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </article>

    `;

}



/* ==================================================
   SUBJECT ICON
================================================== */

function getSubjectIcon(subjectName) {

    const name =
        String(subjectName)
            .toLowerCase();


    if (name.includes("math")) {

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


    if (
        name.includes("computer") ||
        name.includes("informatics")
    ) {

        return "fa-solid fa-computer";

    }


    if (name.includes("economics")) {

        return "fa-solid fa-chart-line";

    }


    if (name.includes("commerce")) {

        return "fa-solid fa-store";

    }


    if (name.includes("account")) {

        return "fa-solid fa-calculator";

    }


    if (
        name.includes("government") ||
        name.includes("civic")
    ) {

        return "fa-solid fa-landmark";

    }


    if (name.includes("literature")) {

        return "fa-solid fa-book-open";

    }


    return "fa-solid fa-book";

}



/* ==================================================
   NO SUBJECTS STATE
================================================== */

function showNoSubjects() {

    const grid =
        document.getElementById(
            "studentSubjectsGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = `

        <div class="col-12">

            <div
                class="student-subjects-state"
            >

                <div
                    class="student-subjects-state-icon"
                >

                    <i class="fa-solid fa-book-open"></i>

                </div>


                <h3>
                    No subjects available
                </h3>


                <p>
                    There are currently no active subjects
                    available for your department.
                </p>

            </div>

        </div>

    `;

}



/* ==================================================
   SUBJECT ERROR STATE
================================================== */

function showSubjectsError() {

    const grid =
        document.getElementById(
            "studentSubjectsGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML = `

        <div class="col-12">

            <div
                class="student-subjects-state"
            >

                <div
                    class="student-subjects-state-icon"
                >

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>


                <h3>
                    Unable to load subjects
                </h3>


                <p>
                    We could not load your subjects right now.
                    Please refresh the page and try again.
                </p>

            </div>

        </div>

    `;

}



/* ==================================================
   START LEARNING
================================================== */

function openStudentSubject(subjectId) {

    if (!subjectId) {

        console.warn(
            "Subject ID is missing."
        );

        return;

    }


    try {

        localStorage.setItem(
            "aplusSelectedSubjectId",
            subjectId
        );

    } catch (error) {

        console.warn(
            "Unable to save selected subject:",
            error
        );

    }


    console.log(
        "Selected Subject:",
        subjectId
    );

}



/* ==================================================
   BASIC HTML ESCAPE
================================================== */

function escapeStudentSubjectHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



/* ==================================================
   ESCAPE SUBJECT ATTRIBUTE
================================================== */

function escapeSubjectAttribute(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}