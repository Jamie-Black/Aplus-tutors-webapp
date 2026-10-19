"use strict";

/*==================================================
APLUS TUTORS
ADMIN DASHBOARD DATA

Handles:
- Dashboard statistics
- Latest students
- Dashboard data loading
==================================================*/


/*==================================================
DASHBOARD DATA STATE
==================================================*/

let dashboardData = {

    students: 0,

    subjects: 0,

    questions: 0,

    exams: 0,

    latestStudents: []

};


/*==================================================
LOAD DASHBOARD DATA
==================================================*/

async function loadDashboardData() {

    try {

        console.log(
            "Loading Admin Dashboard data from Appwrite..."
        );


        /*------------------------------------------
        LOAD BASIC STATISTICS
        ------------------------------------------*/

        const [

            studentsResult,

            subjectsResult,

            questionsResult,

            latestStudentsResult

        ] = await Promise.all([

            tablesDB.listRows(
                DATABASE_ID,
                USERS_TABLE_ID,
                [
                    Query.equal(
                        "role",
                        "student"
                    ),
                    Query.limit(1)
                ]
            ),

            tablesDB.listRows(
                DATABASE_ID,
                SUBJECTS_TABLE_ID,
                [
                    Query.limit(1)
                ]
            ),

            tablesDB.listRows(
                DATABASE_ID,
                QUESTIONS_TABLE_ID,
                [
                    Query.limit(1)
                ]
            ),

            tablesDB.listRows(
                DATABASE_ID,
                USERS_TABLE_ID,
                [
                    Query.equal(
                        "role",
                        "student"
                    ),
                    Query.orderDesc(
                        "$createdAt"
                    ),
                    Query.limit(5)
                ]
            )

        ]);


        /*------------------------------------------
        STORE STATISTICS
        ------------------------------------------*/

        dashboardData.students =
            studentsResult.total || 0;


        dashboardData.subjects =
            subjectsResult.total || 0;


        dashboardData.questions =
            questionsResult.total || 0;


        /*
         * CBT count will be connected later
         * when the CBT table configuration
         * is confirmed.
         */

        dashboardData.exams = 0;


        /*------------------------------------------
        STORE LATEST STUDENTS
        ------------------------------------------*/

        dashboardData.latestStudents =
            latestStudentsResult.rows || [];


        console.log(
            "Dashboard data loaded:",
            dashboardData
        );


        /*------------------------------------------
        UPDATE DASHBOARD
        ------------------------------------------*/

        updateDashboardStatistics();

        renderLatestStudents();


        return dashboardData;

    }

    catch (error) {

        console.error(
            "Admin Dashboard Data Error:",
            error
        );

        return null;

    }

}


/*==================================================
UPDATE STATISTICS
==================================================*/

function updateDashboardStatistics() {


    /*------------------------------------------
    STUDENTS
    ------------------------------------------*/

    const studentsElement =
        document.getElementById(
            "totalStudents"
        );

    if (studentsElement) {

        studentsElement.textContent =
            dashboardData.students;

    }


    /*------------------------------------------
    SUBJECTS
    ------------------------------------------*/

    const subjectsElement =
        document.getElementById(
            "totalSubjects"
        );

    if (subjectsElement) {

        subjectsElement.textContent =
            dashboardData.subjects;

    }


    /*------------------------------------------
    QUESTIONS
    ------------------------------------------*/

    const questionsElement =
        document.getElementById(
            "totalQuestions"
        );

    if (questionsElement) {

        questionsElement.textContent =
            dashboardData.questions;

    }


    /*------------------------------------------
    CBT EXAMS
    ------------------------------------------*/

    const examsElement =
        document.getElementById(
            "totalExams"
        );

    if (examsElement) {

        examsElement.textContent =
            dashboardData.exams;

    }

}


/*==================================================
RENDER LATEST STUDENTS
==================================================*/

function renderLatestStudents() {

    const container =
        document.getElementById(
            "latestStudents"
        );


    if (!container) {

        return;

    }


    /*------------------------------------------
    NO STUDENTS
    ------------------------------------------*/

    if (
        !dashboardData.latestStudents ||
        dashboardData.latestStudents.length === 0
    ) {

        container.innerHTML = `

            <div class="dashboard-card">

                <div class="dashboard-card-header">

                    <div>

                        <h3>
                            Latest Students
                        </h3>

                        <p>
                            Recently registered students
                        </p>

                    </div>

                </div>

                <div class="dashboard-empty">

                    <i class="fa-solid fa-user-graduate"></i>

                    <p>
                        No students registered yet.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    /*------------------------------------------
    BUILD STUDENT ROWS
    ------------------------------------------*/

    const studentRows =
        dashboardData.latestStudents
            .map(

                function (student) {

                    const name =
                        student.fullName ||
                        "Unnamed Student";


                    const email =
                        student.email ||
                        "No email";


                    const department =
                        student.department ||
                        "Not assigned";


                    const status =
                        student.status ||
                        "Active";


                    const photo =
                        student.photoUrl ||
                        "assets/Screenshot_20260806-223602.png";


                    const createdAt =
                        formatDashboardDate(
                            student.$createdAt
                        );


                    return `

                        <div class="latest-student-row">

                            <div class="latest-student-info">

                                <img
                                    src="${photo}"
                                    alt="${escapeDashboardHTML(name)}"
                                    class="latest-student-photo"
                                    onerror="this.src='assets/Screenshot_20260806-223602.png'"
                                >

                                <div>

                                    <h4>
                                        ${escapeDashboardHTML(name)}
                                    </h4>

                                    <p>
                                        ${escapeDashboardHTML(email)}
                                    </p>

                                </div>

                            </div>


                            <div class="latest-student-department">

                                ${escapeDashboardHTML(department)}

                            </div>


                            <div class="latest-student-status">

                                <span class="student-status-badge">

                                    ${escapeDashboardHTML(status)}

                                </span>

                            </div>


                            <div class="latest-student-date">

                                ${createdAt}

                            </div>

                        </div>

                    `;

                }

            )
            .join("");


    /*------------------------------------------
    RENDER
    ------------------------------------------*/

    container.innerHTML = `

        <div class="dashboard-card latest-students-card">

            <div class="dashboard-card-header">

                <div>

                    <h3>
                        Latest Students
                    </h3>

                    <p>
                        Recently registered students
                    </p>

                </div>

                <a
                    href="students.html"
                    class="dashboard-view-all"
                >

                    View All

                    <i class="fa-solid fa-arrow-right"></i>

                </a>

            </div>


            <div class="latest-students-table">

                <div class="latest-students-heading">

                    <span>
                        Student
                    </span>

                    <span>
                        Department
                    </span>

                    <span>
                        Status
                    </span>

                    <span>
                        Registered
                    </span>

                </div>


                ${studentRows}

            </div>

        </div>

    `;

}


/*==================================================
FORMAT DASHBOARD DATE
==================================================*/

function formatDashboardDate(
    dateValue
) {

    if (!dateValue) {

        return "Unknown";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

    }


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/*==================================================
ESCAPE HTML
==================================================*/

function escapeDashboardHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/*==================================================
INITIALIZE DASHBOARD DATA
==================================================*/

document.addEventListener(

    "aplusDashboardReady",

    function () {

        loadDashboardData();

    }

);