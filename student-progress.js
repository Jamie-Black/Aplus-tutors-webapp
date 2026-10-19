/* =========================================================
   APLUS TUTORS
   STUDENT PROGRESS PAGE

   PHASE 1:
   Initialization, page elements, loading states,
   error handling, and refresh controls.
========================================================= */


/* =========================================================
   PAGE STATE
========================================================= */

let studentProgressUser = null;

let studentProgressInitialized = false;

let studentProgressLoading = false;

/* =========================================================
   STUDENT PROGRESS DATA
========================================================= */

let studentProgressQuizAttempts = [];

let studentProgressCbtAttempts = [];

/*
 * CBT ANSWERS
 *
 * Each CBT answer contains a subjectId.
 * We use it to calculate performance separately
 * for every subject in a completed CBT examination.
 */

let studentProgressCbtAnswers = [];

let studentProgressNoteRecords = [];

let studentProgressSubjects = [];

let studentProgressNotes = [];

let studentProgressDataLoaded = false;



/* =========================================================
   PAGE ELEMENTS
========================================================= */

const progressPageElements = {

    loader:
        document.getElementById("pageLoader"),

    message:
        document.getElementById("progressMessage"),

    refreshButton:
        document.getElementById("refreshProgressBtn"),

    quizCount:
        document.getElementById("progressQuizCount"),

    cbtCount:
        document.getElementById("progressCbtCount"),

    averageScore:
        document.getElementById("progressAverageScore"),

    notesPercent:
        document.getElementById("progressNotesPercent"),

    ringScore:
        document.getElementById("performanceRingScore"),

    scoreRing:
        document.getElementById("performanceScoreRing"),

    correctAnswers:
        document.getElementById("progressCorrectAnswers"),

    incorrectAnswers:
        document.getElementById("progressIncorrectAnswers"),

    totalAssessments:
        document.getElementById("progressTotalAssessments"),

    performanceTip:
        document.getElementById("progressPerformanceTip"),

    completedNotes:
        document.getElementById("progressCompletedNotes"),

    totalNotes:
        document.getElementById("progressTotalNotes"),

    notesBar:
        document.getElementById("progressNotesBar"),

    notesCaption:
        document.getElementById("progressNotesCaption"),

    subjectsContainer:
        document.getElementById("progressSubjectsContainer"),

    assessmentsBody:
        document.getElementById("progressAssessmentsBody"),

    assessmentsEmpty:
        document.getElementById("progressAssessmentsEmpty")

};


/* =========================================================
   SHOW PAGE MESSAGE
========================================================= */

function showProgressMessage(
    message,
    type = "info"
) {

    const element =
        progressPageElements.message;

    if (!element) {
        return;
    }

    element.textContent = message;

    element.className =
        "progress-message";

    if (type === "error") {

        element.classList.add("is-error");

    } else if (type === "success") {

        element.classList.add("is-success");

    }

    element.hidden = false;

}


/* =========================================================
   HIDE PAGE MESSAGE
========================================================= */

function hideProgressMessage() {

    const element =
        progressPageElements.message;

    if (!element) {
        return;
    }

    element.hidden = true;

    element.textContent = "";

    element.className =
        "progress-message";

}


/* =========================================================
   SHOW PAGE LOADER
========================================================= */

function showProgressLoader() {

    const loader =
        progressPageElements.loader;

    if (loader) {

        loader.style.display = "flex";

        loader.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


/* =========================================================
   HIDE PAGE LOADER
========================================================= */

function hideProgressLoader() {

    const loader =
        progressPageElements.loader;

    if (loader) {

        loader.style.display = "none";

        loader.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* =========================================================
   UPDATE REFRESH BUTTON
========================================================= */

function setProgressRefreshLoading(
    isLoading
) {

    const button =
        progressPageElements.refreshButton;

    if (!button) {
        return;
    }

    button.disabled = isLoading;

    if (isLoading) {

        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Refreshing...</span>
        `;

    } else {

        button.innerHTML = `
            <i class="fa-solid fa-rotate-right"></i>
            <span>Refresh</span>
        `;

    }

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatProgressNumber(
    value
) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "0";
    }

    return number.toLocaleString();

}


/* =========================================================
   FORMAT PERCENTAGE
========================================================= */

function formatProgressPercentage(
    value
) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "0%";
    }

    return `${Math.round(number)}%`;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatProgressDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   UPDATE STATISTIC TEXT
========================================================= */

function setProgressText(
    element,
    value
) {

    if (!element) {
        return;
    }

    element.textContent = value;

}


/* =========================================================
   INITIAL EMPTY STATE
========================================================= */

function initializeProgressDisplay() {

    setProgressText(
        progressPageElements.quizCount,
        "—"
    );

    setProgressText(
        progressPageElements.cbtCount,
        "—"
    );

    setProgressText(
        progressPageElements.averageScore,
        "—%"
    );

    setProgressText(
        progressPageElements.notesPercent,
        "—%"
    );

    setProgressText(
        progressPageElements.ringScore,
        "—%"
    );

    setProgressText(
        progressPageElements.correctAnswers,
        "—"
    );

    setProgressText(
        progressPageElements.incorrectAnswers,
        "—"
    );

    setProgressText(
        progressPageElements.totalAssessments,
        "—"
    );

    setProgressText(
        progressPageElements.completedNotes,
        "—"
    );

    setProgressText(
        progressPageElements.totalNotes,
        "—"
    );

}


/* =========================================================
   GET AUTHENTICATED STUDENT
   IDENTIFY ACCOUNT ID AND PROFILE ID
========================================================= */

function getProgressStudent(authEventUser = null) {

    const currentUser =
        authEventUser ||
        window.aplusUser ||
        null;

    if (!currentUser) {

        throw new Error(
            "Your student session could not be verified. Please log in again."
        );

    }

    /*
     * The authenticated account ID is used by
     * quiz_attempts and cbt_attempts.
     */

    const accountId =
        currentUser.userId ||
        currentUser.id ||
        (
            currentUser.profileId
                ? ""
                : currentUser.$id || ""
        );

    /*
     * The profile row ID is used by
     * study_note_progress.
     */

    const profileId =
        currentUser.profileId ||
        (
            currentUser.userId
                ? currentUser.$id || ""
                : ""
        );

    if (!accountId) {

        throw new Error(
            "The authenticated student account ID could not be identified."
        );

    }

    if (!profileId) {

        throw new Error(
            "The student profile ID could not be identified."
        );

    }

    const role =
        String(
            currentUser.role ||
            currentUser.userRole ||
            ""
        ).toLowerCase().trim();

    if (role && role !== "student") {

        throw new Error(
            "This page is only available to student accounts."
        );

    }

    return {
        ...currentUser,

        $id: accountId,

        id: accountId,

        accountId: accountId,

        userId: accountId,

        profileId: profileId,

        role: role || "student"
    };

}





/* =========================================================
   LOAD ALL STUDENT QUIZ ATTEMPTS
   Uses the Appwrite account ID
========================================================= */

async function loadStudentProgressQuizAttempts(accountId) {

    if (!accountId) {
        throw new Error(
            "The student account ID is missing."
        );
    }

    const response = await tablesDB.listRows(
        DATABASE_ID,
        QUIZ_ATTEMPTS_TABLE_ID,
        [
            Query.equal("studentId", accountId),
            Query.limit(100)
        ]
    );

    studentProgressQuizAttempts =
        response.rows || [];

    console.log(
        "Student quiz attempts loaded:",
        studentProgressQuizAttempts.length
    );

    return studentProgressQuizAttempts;
}


/* =========================================================
   LOAD STUDENT CBT ATTEMPTS
   Uses the Appwrite account ID
========================================================= */

async function loadStudentProgressCbtAttempts(accountId) {

    if (!accountId) {
        throw new Error(
            "The student account ID is missing."
        );
    }

    const response = await tablesDB.listRows(
        DATABASE_ID,
        CBT_ATTEMPTS_TABLE_ID,
        [
            Query.equal("studentId", accountId),
            Query.limit(100)
        ]
    );

    /*
     * Only completed CBT examinations should
     * contribute to the progress statistics.
     */

    studentProgressCbtAttempts =
        (response.rows || []).filter(function(attempt) {

            return String(
                attempt.status || ""
            ).toLowerCase() === "completed";

        });

    console.log(
        "Student CBT attempts loaded:",
        studentProgressCbtAttempts.length
    );

    return studentProgressCbtAttempts;
}


/* =========================================================
   LOAD STUDENT CBT ANSWERS

   PURPOSE:
   Load answers belonging to the student's completed CBT
   examinations.

   Each answer has a subjectId, allowing us to calculate
   performance separately for each subject.

   Existing CBT tables remain unchanged.
========================================================= */

async function loadStudentProgressCbtAnswers() {

    /*
     * Start with a clean answer collection.
     */

    studentProgressCbtAnswers = [];


    /*
     * Only completed CBT examinations contribute
     * to subject performance.
     */

    const completedAttempts =
        studentProgressCbtAttempts;


    if (!completedAttempts.length) {

        console.log(
            "No completed CBT attempts found. No CBT answers to load."
        );

        return studentProgressCbtAnswers;

    }


    /*
     * Load answers for each completed examination.
     *
     * Query each attempt separately so we don't need
     * to assume how many CBT attempts a student has.
     */

    const answerResults = await Promise.allSettled(

        completedAttempts.map(
            async function(attempt) {

                const response = await tablesDB.listRows(

                    DATABASE_ID,

                    CBT_ANSWERS_TABLE_ID,

                    [

                        Query.equal(
                            "attemptId",
                            attempt.$id
                        ),

                        Query.limit(500)

                    ]

                );


                return response.rows || [];

            }
        )

    );


    /*
     * Collect successfully loaded answer records.
     */

    const failedAttempts = [];

    answerResults.forEach(
        function(result, index) {

            if (result.status === "fulfilled") {

                studentProgressCbtAnswers.push(
                    ...result.value
                );

            } else {

                failedAttempts.push(
                    completedAttempts[index].$id
                );

                console.error(

                    "Unable to load answers for CBT attempt:",

                    completedAttempts[index].$id,

                    result.reason

                );

            }

        }
    );


    /*
     * Report loading results.
     */

    console.log(

        "Student CBT answers loaded:",

        studentProgressCbtAnswers.length

    );


    if (failedAttempts.length) {

        console.warn(

            "Some CBT answer records could not be loaded:",

            failedAttempts

        );

    }


    /*
     * Return the loaded records and loading status.
     */

    return {

        answers: studentProgressCbtAnswers,

        failedAttempts: failedAttempts

    };

}



/* =========================================================
   LOAD STUDENT STUDY-NOTE PROGRESS
   Uses the student profile row ID
========================================================= */

async function loadStudentProgressNoteRecords(profileId) {

    if (!profileId) {
        throw new Error(
            "The student profile ID is missing."
        );
    }

    const response = await tablesDB.listRows(
        DATABASE_ID,
        STUDY_NOTE_PROGRESS_TABLE_ID,
        [
            Query.equal("studentId", profileId),
            Query.limit(100)
        ]
    );

    studentProgressNoteRecords =
        response.rows || [];

    console.log(
        "Student study-note progress records loaded:",
        studentProgressNoteRecords.length
    );

    return studentProgressNoteRecords;
}


/* =========================================================
   LOAD PUBLISHED NOTES AVAILABLE TO THIS STUDENT

   Uses the same department filtering as the
   Student Study Notes page.
========================================================= */

async function loadStudentProgressNotes() {

    const studentDepartment = String(
        studentProgressUser?.department || ""
    ).trim().toLowerCase();

    if (!studentDepartment) {
        throw new Error(
            "The student's department could not be identified."
        );
    }

    /*
     * Load published notes.
     */

    const response = await tablesDB.listRows(
        DATABASE_ID,
        STUDY_NOTES_ID,
        [
            Query.equal("status", "published"),
            Query.orderDesc("$updatedAt"),
            Query.limit(100)
        ]
    );

    const allPublishedNotes =
        response.rows || [];

    /*
     * Use the subjects already loaded by the
     * progress page.
     */

    const allowedSubjectIds = new Set(
        studentProgressSubjects
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

    /*
     * Keep only notes belonging to accessible subjects.
     */

    studentProgressNotes =
        allPublishedNotes.filter(function(note) {

            return allowedSubjectIds.has(
                note.subjectId
            );

        });

    console.log(
        "Published study notes:",
        allPublishedNotes.length
    );

    console.log(
        "Study notes available to this student:",
        studentProgressNotes.length
    );

    return studentProgressNotes;
}

/* =========================================================
   LOAD SUBJECTS FOR STUDENT PROGRESS
========================================================= */

async function loadStudentProgressSubjects() {

    const response = await tablesDB.listRows(
        DATABASE_ID,
        SUBJECTS_TABLE_ID,
        [
            Query.limit(100)
        ]
    );

    studentProgressSubjects =
        response.rows || [];

    console.log(
        "Progress subjects loaded:",
        studentProgressSubjects.length
    );

    return studentProgressSubjects;
}

/* =========================================================
   LOAD ALL STUDENT PROGRESS DATA

   PHASE 2 — CORRECTED DATA LOADING

   Loads:
   1. Subjects
   2. Quiz attempts
   3. Completed CBT attempts
   4. Study-note progress
   5. Published study notes
   6. CBT answers

   Renders:
   1. Dashboard summary
   2. Subject performance
   3. Recent assessments

   FIX:
   Only one declaration of dataSources.
========================================================= */

async function loadStudentProgressData(student) {

    if (!student) {

        throw new Error(
            "Student information is unavailable."
        );

    }


    /* =====================================================
       IDENTIFY STUDENT
    ===================================================== */

    const accountId =
        student.accountId ||
        student.userId ||
        student.id ||
        student.$id;

    const profileId =
        student.profileId;


    if (!accountId) {

        throw new Error(
            "Unable to identify the student's account."
        );

    }


    if (!profileId) {

        throw new Error(
            "Unable to identify the student's profile."
        );

    }


    console.log(
        "Loading Aplus student progress...",
        {
            accountId,
            profileId
        }
    );


    /* =====================================================
       RESET LOADING STATUS
    ===================================================== */

    studentProgressDataLoaded = false;


    /* =====================================================
       PHASE A:
       LOAD SUBJECTS FIRST

       Published study notes depend on the subjects.
    ===================================================== */

    await loadStudentProgressSubjects();


    /* =====================================================
       PHASE B:
       LOAD MAIN PROGRESS DATA SOURCES
    ===================================================== */

    const results = await Promise.allSettled([

        loadStudentProgressQuizAttempts(
            accountId
        ),

        loadStudentProgressCbtAttempts(
            accountId
        ),

        loadStudentProgressNoteRecords(
            profileId
        ),

        loadStudentProgressNotes()

    ]);


    /* =====================================================
       REPORT FAILED MAIN DATA SOURCES

       IMPORTANT:
       dataSources is declared only once in this function.
    ===================================================== */

    const dataSources = [

        "Quiz attempts",

        "CBT attempts",

        "Study-note progress",

        "Published study notes"

    ];


    const failedSources = [];


    results.forEach(function(result, index) {

        if (result.status === "rejected") {

            failedSources.push(
                dataSources[index]
            );


            console.error(

                dataSources[index] +
                " failed to load:",

                result.reason

            );

        }

    });


    /* =====================================================
       PHASE B2:
       LOAD CBT ANSWERS

       Completed CBT attempts must be loaded before
       their individual answers can be retrieved.
    ===================================================== */

    try {

        const cbtAnswerResult =
            await loadStudentProgressCbtAnswers();


        /*
         * Record partial answer-loading failures.
         */

        if (

            cbtAnswerResult &&

            Array.isArray(
                cbtAnswerResult.failedAttempts
            ) &&

            cbtAnswerResult.failedAttempts.length > 0

        ) {

            failedSources.push(
                "Some CBT answer records"
            );

        }

    } catch (error) {

        console.error(

            "CBT answers failed to load:",

            error

        );


        studentProgressCbtAnswers = [];


        failedSources.push(
            "CBT answers"
        );

    }


    /* =====================================================
       PHASE C:
       RENDER DASHBOARD SUMMARY
    ===================================================== */

    try {

        renderStudentProgressSummary();

    } catch (error) {

        console.error(

            "Progress summary rendering failed:",

            error

        );

        failedSources.push(
            "Progress summary rendering"
        );

    }


    /* =====================================================
       PHASE C2:
       RENDER SUBJECT PERFORMANCE
    ===================================================== */

    try {

        renderStudentProgressSubjects();

    } catch (error) {

        console.error(

            "Subject performance rendering failed:",

            error

        );

        failedSources.push(
            "Subject performance rendering"
        );

    }


    /* =====================================================
       PHASE D:
       RENDER RECENT ASSESSMENTS
    ===================================================== */

    try {

        renderStudentProgressRecentAssessments();

    } catch (error) {

        console.error(

            "Recent assessments rendering failed:",

            error

        );

        failedSources.push(
            "Recent assessments rendering"

        );

    }


    /* =====================================================
       MARK DATA LOADING COMPLETE
    ===================================================== */

    studentProgressDataLoaded = true;


    /* =====================================================
       LOG LOADING RESULTS
    ===================================================== */

    console.log(

        "Aplus student progress loading finished.",

        {

            quizzes:
                studentProgressQuizAttempts.length,

            completedCbt:
                studentProgressCbtAttempts.length,

            cbtAnswers:
                studentProgressCbtAnswers.length,

            noteRecords:
                studentProgressNoteRecords.length,

            subjects:
                studentProgressSubjects.length,

            availableNotes:
                studentProgressNotes.length,

            failedSources:
                failedSources

        }

    );


    /* =====================================================
       RETURN LOADING RESULTS
    ===================================================== */

    return {

        success:
            failedSources.length === 0,

        failedSources:
            failedSources,

        results:
            results

    };

}/* =========================================================
   LOAD ALL STUDENT PROGRESS DATA

   PHASE 2 — CORRECTED DATA LOADING

   Loads:
   1. Subjects
   2. Quiz attempts
   3. Completed CBT attempts
   4. Study-note progress
   5. Published study notes
   6. CBT answers

   Renders:
   1. Dashboard summary
   2. Subject performance
   3. Recent assessments

   FIX:
   Only one declaration of dataSources.
========================================================= */

async function loadStudentProgressData(student) {

    if (!student) {

        throw new Error(
            "Student information is unavailable."
        );

    }


    /* =====================================================
       IDENTIFY STUDENT
    ===================================================== */

    const accountId =
        student.accountId ||
        student.userId ||
        student.id ||
        student.$id;

    const profileId =
        student.profileId;


    if (!accountId) {

        throw new Error(
            "Unable to identify the student's account."
        );

    }


    if (!profileId) {

        throw new Error(
            "Unable to identify the student's profile."
        );

    }


    console.log(
        "Loading Aplus student progress...",
        {
            accountId,
            profileId
        }
    );


    /* =====================================================
       RESET LOADING STATUS
    ===================================================== */

    studentProgressDataLoaded = false;


    /* =====================================================
       PHASE A:
       LOAD SUBJECTS FIRST

       Published study notes depend on the subjects.
    ===================================================== */

    await loadStudentProgressSubjects();


    /* =====================================================
       PHASE B:
       LOAD MAIN PROGRESS DATA SOURCES
    ===================================================== */

    const results = await Promise.allSettled([

        loadStudentProgressQuizAttempts(
            accountId
        ),

        loadStudentProgressCbtAttempts(
            accountId
        ),

        loadStudentProgressNoteRecords(
            profileId
        ),

        loadStudentProgressNotes()

    ]);


    /* =====================================================
       REPORT FAILED MAIN DATA SOURCES

       IMPORTANT:
       dataSources is declared only once in this function.
    ===================================================== */

    const dataSources = [

        "Quiz attempts",

        "CBT attempts",

        "Study-note progress",

        "Published study notes"

    ];


    const failedSources = [];


    results.forEach(function(result, index) {

        if (result.status === "rejected") {

            failedSources.push(
                dataSources[index]
            );


            console.error(

                dataSources[index] +
                " failed to load:",

                result.reason

            );

        }

    });


    /* =====================================================
       PHASE B2:
       LOAD CBT ANSWERS

       Completed CBT attempts must be loaded before
       their individual answers can be retrieved.
    ===================================================== */

    try {

        const cbtAnswerResult =
            await loadStudentProgressCbtAnswers();


        /*
         * Record partial answer-loading failures.
         */

        if (

            cbtAnswerResult &&

            Array.isArray(
                cbtAnswerResult.failedAttempts
            ) &&

            cbtAnswerResult.failedAttempts.length > 0

        ) {

            failedSources.push(
                "Some CBT answer records"
            );

        }

    } catch (error) {

        console.error(

            "CBT answers failed to load:",

            error

        );


        studentProgressCbtAnswers = [];


        failedSources.push(
            "CBT answers"
        );

    }


    /* =====================================================
       PHASE C:
       RENDER DASHBOARD SUMMARY
    ===================================================== */

    try {

        renderStudentProgressSummary();

    } catch (error) {

        console.error(

            "Progress summary rendering failed:",

            error

        );

        failedSources.push(
            "Progress summary rendering"
        );

    }


    /* =====================================================
       PHASE C2:
       RENDER SUBJECT PERFORMANCE
    ===================================================== */

    try {

        renderStudentProgressSubjects();

    } catch (error) {

        console.error(

            "Subject performance rendering failed:",

            error

        );

        failedSources.push(
            "Subject performance rendering"
        );

    }


    /* =====================================================
       PHASE D:
       RENDER RECENT ASSESSMENTS
    ===================================================== */

    try {

        renderStudentProgressRecentAssessments();

    } catch (error) {

        console.error(

            "Recent assessments rendering failed:",

            error

        );

        failedSources.push(
            "Recent assessments rendering"

        );

    }


    /* =====================================================
       MARK DATA LOADING COMPLETE
    ===================================================== */

    studentProgressDataLoaded = true;


    /* =====================================================
       LOG LOADING RESULTS
    ===================================================== */

    console.log(

        "Aplus student progress loading finished.",

        {

            quizzes:
                studentProgressQuizAttempts.length,

            completedCbt:
                studentProgressCbtAttempts.length,

            cbtAnswers:
                studentProgressCbtAnswers.length,

            noteRecords:
                studentProgressNoteRecords.length,

            subjects:
                studentProgressSubjects.length,

            availableNotes:
                studentProgressNotes.length,

            failedSources:
                failedSources

        }

    );


    /* =====================================================
       RETURN LOADING RESULTS
    ===================================================== */

    return {

        success:
            failedSources.length === 0,

        failedSources:
            failedSources,

        results:
            results

    };

}

/* =========================================================
RENDER STUDENT PROGRESS SUMMARY
========================================================= */

function renderStudentProgressSummary() {

const quizAttempts =
    studentProgressQuizAttempts;

const cbtAttempts =
    studentProgressCbtAttempts;

const noteRecords =
    studentProgressNoteRecords;


/*
 * ASSESSMENT COUNTS
 */

const quizCount =
    quizAttempts.length;

const cbtCount =
    cbtAttempts.length;

const totalAssessments =
    quizCount + cbtCount;


/*
 * CALCULATE COMBINED AVERAGE SCORE
 */

const allAssessments = [

    ...quizAttempts.map(function(attempt) {

        return {
            percentage: Number(
                attempt.percentage ??
                attempt.score ??
                0
            )
        };

    }),

    ...cbtAttempts.map(function(attempt) {

        return {
            percentage: Number(
                attempt.percentage ??
                attempt.score ??
                0
            )
        };

    })

].filter(function(attempt) {

    return Number.isFinite(attempt.percentage);

});


const averageScore = allAssessments.length

    ? allAssessments.reduce(
        function(total, attempt) {
            return total + attempt.percentage;
        },
        0
    ) / allAssessments.length

    : 0;


/*
 * CORRECT AND INCORRECT ANSWERS
 */

const correctAnswers = allAssessments.length

    ? [
        ...quizAttempts,
        ...cbtAttempts
    ].reduce(function(total, attempt) {

        return total + (
            Number(attempt.correctAnswers) || 0
        );

    }, 0)

    : 0;


const incorrectAnswers = [
    ...quizAttempts,
    ...cbtAttempts
].reduce(function(total, attempt) {

    return total + (
        Number(attempt.wrongAnswers) || 0
    );

}, 0);


const totalQuestions = [
    ...quizAttempts,
    ...cbtAttempts
].reduce(function(total, attempt) {

    return total + (
        Number(attempt.totalQuestions) || 0
    );

}, 0);


/*
 * UPDATE SUMMARY CARDS
 */

const quizCountElement =
    document.getElementById("progressQuizCount");

const cbtCountElement =
    document.getElementById("progressCbtCount");

const averageScoreElement =
    document.getElementById("progressAverageScore");

const correctElement =
    document.getElementById("progressCorrectAnswers");

const incorrectElement =
    document.getElementById("progressIncorrectAnswers");

const totalAssessmentsElement =
    document.getElementById("progressTotalAssessments");

const ringScoreElement =
    document.getElementById("performanceRingScore");


if (quizCountElement) {
    quizCountElement.textContent = quizCount;
}

if (cbtCountElement) {
    cbtCountElement.textContent = cbtCount;
}

if (averageScoreElement) {
    averageScoreElement.textContent =
        averageScore.toFixed(1) + "%";
}

if (correctElement) {
    correctElement.textContent = correctAnswers;
}

if (incorrectElement) {
    incorrectElement.textContent = incorrectAnswers;
}

if (totalAssessmentsElement) {
    totalAssessmentsElement.textContent =
        totalAssessments;
}

if (ringScoreElement) {
    ringScoreElement.textContent =
        Math.round(averageScore) + "%";
}


/*
 * UPDATE PERFORMANCE RING
 */

const performanceRing =
    document.getElementById("performanceScoreRing");

if (performanceRing) {

    const percentage = Math.max(
        0,
        Math.min(100, averageScore)
    );

    performanceRing.style.setProperty(
        "--progress",
        percentage + "%"
    );

    performanceRing.style.background =
        "conic-gradient(#dc143c " +
        percentage +
        "%, #eeeeee " +
        percentage +
        "%)";

}


/*
 * /* =========================================================
   STUDY NOTES SUMMARY

   Count only notes available to this student.
========================================================= */

const totalNotes =
    studentProgressNotes.length;

const completedNoteIds = new Set(
    studentProgressNoteRecords
    .filter(function(record) {
        
        return (
            String(record.status || "").toLowerCase() ===
            "completed" ||
            Number(record.progressPercent) >= 100
        );
        
    })
    .map(function(record) {
        return record.noteId;
    })
);

const completedNotes =
    studentProgressNotes.filter(function(note) {
        
        return completedNoteIds.has(note.$id);
        
    }).length;

const notesPercentage =
    totalNotes > 0 ?
    Math.round(
        (completedNotes / totalNotes) * 100
    ) :
    0;


/* UPDATE COMPLETED NOTES */

setProgressText(
    progressPageElements.completedNotes,
    formatProgressNumber(completedNotes)
);


/* UPDATE TOTAL NOTES */

setProgressText(
    progressPageElements.totalNotes,
    formatProgressNumber(totalNotes)
);


/* UPDATE PERCENTAGE */

setProgressText(
    progressPageElements.notesPercent,
    formatProgressPercentage(notesPercentage)
);


/* UPDATE PROGRESS BAR */

if (progressPageElements.notesBar) {
    
    progressPageElements.notesBar.style.width =
        notesPercentage + "%";
    
    progressPageElements.notesBar.setAttribute(
        "aria-valuenow",
        String(notesPercentage)
    );
    
}


/* UPDATE CAPTION */

if (progressPageElements.notesCaption) {
    
    progressPageElements.notesCaption.textContent =
        `${completedNotes} of ${totalNotes} notes completed`;
    
}


console.log(
    "Study notes summary calculated:",
    {
        totalNotes,
        completedNotes,
        notesPercentage
    }
);

}




/* =========================================================
   SUBJECT PERFORMANCE
   APLUS TUTORS

   Calculates subject-specific statistics from:

   1. Quiz attempts
   2. Completed CBT attempts
   3. CBT answers grouped by subjectId

   Does not modify existing assessment records.
========================================================= */


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeStudentProgressHtml(value) {

    return String(value ?? "").replace(

        /[&<>"']/g,

        function(character) {

            const replacements = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#39;"

            };

            return replacements[character];

        }

    );

}


/* =========================================================
   CHECK WHETHER A CBT ANSWER IS CORRECT
========================================================= */

function isStudentProgressAnswerCorrect(answer) {

    const value = answer.isCorrect;

    return (

        value === true ||

        value === 1 ||

        String(value).toLowerCase() === "true" ||

        String(value) === "1"

    );

}


/* =========================================================
   GET SUBJECT NAME
========================================================= */

function getStudentProgressSubjectName(subjectId) {

    const subject = studentProgressSubjects.find(

        function(item) {

            return item.$id === subjectId;

        }

    );


    if (!subject) {

        return "Unknown Subject";

    }


    return (

        subject.name ||

        subject.subjectName ||

        subject.title ||

        subject.subject ||

        "Unnamed Subject"

    );

}


/* =========================================================
   GET ACCESSIBLE SUBJECTS

   Use the student's department to determine which
   subjects should appear on the progress page.
========================================================= */

function getStudentProgressAccessibleSubjects() {

    const department = String(

        studentProgressUser?.department || ""

    ).trim().toLowerCase();


    return studentProgressSubjects.filter(

        function(subject) {

            const subjectDepartment = String(

                subject.department || ""

            ).trim().toLowerCase();


            const subjectStatus = String(

                subject.status || ""

            ).trim().toLowerCase();


            /*
             * Exclude explicitly inactive subjects.
             */

            if (subjectStatus === "inactive") {

                return false;

            }


            /*
             * Include subjects belonging to the student's
             * department and subjects marked General.
             */

            return (

                subjectDepartment === department ||

                subjectDepartment === "general"

            );

        }

    );

}


/* =========================================================
   CALCULATE SUBJECT PERFORMANCE
========================================================= */

function calculateStudentProgressSubjectPerformance() {

    /*
     * Each subject will have its own statistics.
     */

    const subjectStatistics = new Map();


    /*
     * INITIALIZE SUBJECT STATISTICS
     */

    const accessibleSubjects =
        getStudentProgressAccessibleSubjects();


    accessibleSubjects.forEach(

        function(subject) {

            subjectStatistics.set(

                subject.$id,

                {

                    subjectId: subject.$id,

                    subjectName:

                        subject.name ||

                        subject.subjectName ||

                        subject.title ||

                        subject.subject ||

                        "Unnamed Subject",

                    quizCount: 0,

                    cbtCount: 0,

                    assessmentCount: 0,

                    correctAnswers: 0,

                    incorrectAnswers: 0,

                    totalQuestions: 0,

                    scoreTotal: 0,

                    scoreCount: 0,

                    averageScore: 0

                }

            );

        }

    );


    /*
     * HELPER:
     * Return the statistics object for a subject.
     *
     * Subjects not currently accessible to the student
     * are excluded from the calculations.
     */

    function getSubjectStatistics(subjectId) {

        if (!subjectId) {

            return null;

        }


        return subjectStatistics.get(subjectId) || null;

    }


    /*
     * PHASE A:
     * PROCESS QUIZ ATTEMPTS
     *
     * Quiz attempts contain their own subjectId
     * and score information.
     */

    studentProgressQuizAttempts.forEach(

        function(attempt) {

            const stats = getSubjectStatistics(

                attempt.subjectId

            );


            if (!stats) {

                return;

            }


            /*
             * Count quiz assessments.
             */

            stats.quizCount++;

            stats.assessmentCount++;


            /*
             * Read the quiz percentage.
             */

            const rawScore = Number(

                attempt.percentage ??

                attempt.score

            );


            /*
             * Only valid percentages contribute to
             * the subject average.
             */

            if (

                Number.isFinite(rawScore) &&

                rawScore >= 0 &&

                rawScore <= 100

            ) {

                stats.scoreTotal += rawScore;

                stats.scoreCount++;

            }


            /*
             * Correct answers.
             */

            const correct = Number(

                attempt.correctAnswers

            );


            if (

                Number.isFinite(correct) &&

                correct >= 0

            ) {

                stats.correctAnswers += correct;

            }


            /*
             * Incorrect answers.
             */

            const incorrect = Number(

                attempt.wrongAnswers ??

                attempt.incorrectAnswers

            );


            if (

                Number.isFinite(incorrect) &&

                incorrect >= 0

            ) {

                stats.incorrectAnswers += incorrect;

            }


            /*
             * Total questions.
             */

            const total = Number(

                attempt.totalQuestions

            );


            if (

                Number.isFinite(total) &&

                total >= 0

            ) {

                stats.totalQuestions += total;

            }

        }

    );


    /*
     * PHASE B:
     * GROUP CBT ANSWERS BY ATTEMPT AND SUBJECT.
     *
     * One CBT examination may contain multiple subjects.
     *
     * We must calculate a separate percentage for each
     * subject in each completed CBT examination.
     */

    const completedCbtAttemptIds = new Set(

        studentProgressCbtAttempts.map(

            function(attempt) {

                return attempt.$id;

            }

        )

    );


    const cbtSubjectGroups = new Map();


    studentProgressCbtAnswers.forEach(

        function(answer) {

            /*
             * Ignore answers that do not belong to a
             * currently loaded completed CBT attempt.
             */

            if (

                !completedCbtAttemptIds.has(

                    answer.attemptId

                )

            ) {

                return;

            }


            /*
             * Get the subject for this answer.
             */

            const subjectId = answer.subjectId;


            const stats = getSubjectStatistics(

                subjectId

            );


            if (!stats) {

                return;

            }


            /*
             * Each attempt-subject combination forms
             * a separate group.
             */

            const groupKey =

                answer.attemptId +

                "::" +

                subjectId;


            if (!cbtSubjectGroups.has(groupKey)) {

                cbtSubjectGroups.set(

                    groupKey,

                    {

                        attemptId: answer.attemptId,

                        subjectId: subjectId,

                        correctAnswers: 0,

                        incorrectAnswers: 0,

                        totalQuestions: 0

                    }

                );

            }


            const group = cbtSubjectGroups.get(

                groupKey

            );


            /*
             * Count each loaded answer record as one
             * question in this subject group.
             *
             * This assumes the CBT answer table contains
             * one record per question, including unanswered
             * questions when applicable.
             */

            group.totalQuestions++;


            /*
             * Count correct and incorrect answers.
             *
             * Unanswered questions are not classified
             * as incorrect unless isCorrect is false.
             */

            if (

                isStudentProgressAnswerCorrect(answer)

            ) {

                group.correctAnswers++;

            } else if (

                answer.isCorrect === false ||

                answer.isCorrect === 0 ||

                String(answer.isCorrect).toLowerCase() === "false" ||

                String(answer.isCorrect) === "0"

            ) {

                group.incorrectAnswers++;

            }

        }

    );


    /*
     * PHASE C:
     * APPLY CBT SUBJECT STATISTICS.
     */

    cbtSubjectGroups.forEach(

        function(group) {

            const stats = getSubjectStatistics(

                group.subjectId

            );


            if (!stats) {

                return;

            }


            stats.cbtCount++;

            stats.assessmentCount++;


            stats.correctAnswers +=

                group.correctAnswers;


            stats.incorrectAnswers +=

                group.incorrectAnswers;


            stats.totalQuestions +=

                group.totalQuestions;


            /*
             * Calculate the CBT score for this subject.
             */

            if (group.totalQuestions > 0) {

                const subjectScore =

                    (

                        group.correctAnswers /

                        group.totalQuestions

                    ) * 100;


                stats.scoreTotal += subjectScore;

                stats.scoreCount++;

            }

        }

    );


    /*
     * PHASE D:
     * CALCULATE AVERAGE SCORES.
     *
     * Each quiz contributes one score.
     * Each subject within a completed CBT contributes
     * one subject-specific score.
     */

    subjectStatistics.forEach(

        function(stats) {

            stats.averageScore = stats.scoreCount

                ? stats.scoreTotal / stats.scoreCount

                : 0;

        }

    );


    /*
     * Return the subject statistics.
     */

    return Array.from(

        subjectStatistics.values()

    ).sort(

        function(a, b) {

            return a.subjectName.localeCompare(

                b.subjectName

            );

        }

    );

}


/* =========================================================
   GET SUBJECT PERFORMANCE LABEL
========================================================= */

function getStudentProgressPerformanceLevel(score) {

    if (score >= 80) {

        return {

            label: "Excellent",

            className: "subject-level-excellent"

        };

    }


    if (score >= 70) {

        return {

            label: "Very Good",

            className: "subject-level-very-good"

        };

    }


    if (score >= 60) {

        return {

            label: "Good",

            className: "subject-level-good"

        };

    }


    if (score >= 50) {

        return {

            label: "Fair",

            className: "subject-level-fair"

        };

    }


    return {

        label: "Needs Improvement",

        className: "subject-level-needs-improvement"

    };

}


/* =========================================================
   RENDER SUBJECT PERFORMANCE
========================================================= */

function renderStudentProgressSubjects() {

    const container =

        progressPageElements.subjectsContainer;


    if (!container) {

        console.warn(

            "Subject performance container was not found."

        );

        return;

    }


    /*
     * Calculate subject statistics.
     */

    const subjects =

        calculateStudentProgressSubjectPerformance();


    /*
     * EMPTY STATE:
     * No accessible subjects were found.
     */

    if (!subjects.length) {

        container.innerHTML = `

            <div class="progress-empty-state">

                <div class="progress-empty-icon">

                    <i class="fa-solid fa-book-open"></i>

                </div>

                <h3>No subjects available</h3>

                <p>

                    We could not find subjects assigned to

                    your department.

                    Please contact your administrator.

                </p>

            </div>

        `;

        return;

    }


    /*
     * RENDER EACH SUBJECT.
     */

    container.innerHTML = subjects.map(

        function(subject) {

            const hasAssessments =

                subject.assessmentCount > 0;


            const score = hasAssessments

                ? Math.max(

                    0,

                    Math.min(

                        100,

                        subject.averageScore

                    )

                )

                : 0;


            const performance =

                getStudentProgressPerformanceLevel(

                    score

                );


            const scoreText = hasAssessments

                ? score.toFixed(1) + "%"

                : "—";


            const performanceLabel = hasAssessments

                ? performance.label

                : "Not assessed";


            const performanceClass = hasAssessments

                ? performance.className

                : "subject-level-not-assessed";


            const progressWidth = hasAssessments

                ? score

                : 0;


            const subjectName =

                escapeStudentProgressHtml(

                    subject.subjectName

                );


            /*
             * CREATE SUBJECT CARD.
             */

            return `

                <article class="progress-subject-card">


                    <div class="progress-subject-header">


                        <div class="progress-subject-icon">

                            <i class="fa-solid fa-book-open"></i>

                        </div>


                        <div class="progress-subject-heading">

                            <h3>

                                ${subjectName}

                            </h3>

                            <span class="progress-subject-assessment-count">

                                ${subject.assessmentCount}

                                ${subject.assessmentCount === 1

                                    ? "assessment"

                                    : "assessments"

                                }

                            </span>

                        </div>


                        <div class="progress-subject-score">

                            <strong>

                                ${scoreText}

                            </strong>

                        </div>


                    </div>


                    <div class="progress-subject-progress-track">

                        <div

                            class="progress-subject-progress-fill"

                            style="width: ${progressWidth}%"

                            role="progressbar"

                            aria-label="${subjectName} average score"

                            aria-valuemin="0"

                            aria-valuemax="100"

                            aria-valuenow="${progressWidth}"

                        ></div>

                    </div>


                    <div class="progress-subject-performance-row">

                        <span class="progress-subject-performance-label">

                            Performance

                        </span>


                        <span class="progress-subject-level ${performanceClass}">

                            ${performanceLabel}

                        </span>

                    </div>


                    <div class="progress-subject-statistics">


                        <div class="progress-subject-stat">

                            <span>Quizzes</span>

                            <strong>

                                ${subject.quizCount}

                            </strong>

                        </div>


                        <div class="progress-subject-stat">

                            <span>CBT exams</span>

                            <strong>

                                ${subject.cbtCount}

                            </strong>

                        </div>


                        <div class="progress-subject-stat">

                            <span>Correct</span>

                            <strong class="subject-correct-count">

                                ${subject.correctAnswers}

                            </strong>

                        </div>


                        <div class="progress-subject-stat">

                            <span>Incorrect</span>

                            <strong class="subject-incorrect-count">

                                ${subject.incorrectAnswers}

                            </strong>

                        </div>


                    </div>


                    ${

                        hasAssessments

                            ? ""

                            : `

                                <p class="progress-subject-empty-note">

                                    Complete a quiz or CBT examination

                                    to see your performance here.

                                </p>

                            `

                    }


                </article>

            `;

        }

    ).join("");


    console.log(

        "Subject performance rendered:",

        subjects.map(

            function(subject) {

                return {

                    subject: subject.subjectName,

                    quizzes: subject.quizCount,

                    cbtExams: subject.cbtCount,

                    averageScore:

                        subject.assessmentCount

                            ? subject.averageScore.toFixed(1)

                            : null,

                    assessments: subject.assessmentCount

                };

            }

        )

    );

}



/* =========================================================
RENDER RECENT STUDENT ASSESSMENTS
Combines quiz attempts and completed CBT attempts
========================================================= */

/* =========================================================
   RENDER RECENT STUDENT ASSESSMENTS

   Columns:
   1. Assessment
   2. Subject
   3. Score
   4. Date
   5. Results
========================================================= */

function renderStudentProgressRecentAssessments() {

    const tableBody =
        progressPageElements.assessmentsBody;

    const emptyState =
        progressPageElements.assessmentsEmpty;

    if (!tableBody) {

        console.warn(
            "Recent assessments table body was not found."
        );

        return;
    }


    /* =====================================================
       FIND SUBJECT NAME USING SUBJECT ID
    ===================================================== */

function getProgressSubjectName(subjectId) {

    if (!subjectId) {
        return "—";
    }

    const subject = studentProgressSubjects.find(
        function(item) {
            return item.$id === subjectId;
        }
    );

    if (!subject) {

        console.warn(
            "Subject not found for assessment:",
            subjectId
        );

        return "Unknown Subject";

    }

    return (
        subject.name ||
        subject.subjectName ||
        subject.title ||
        subject.subject ||
        "Unnamed Subject"
    );

}


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeProgressHtml(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            function(character) {

                const replacements = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                };

                return replacements[character];

            }
        );

    }


    /* =====================================================
       COMBINE QUIZ AND CBT ATTEMPTS
    ===================================================== */

    const assessments = [

        ...studentProgressQuizAttempts.map(
            function(attempt) {

                return {
                    ...attempt,
                    assessmentType: "Quiz"
                };

            }
        ),

        ...studentProgressCbtAttempts.map(
            function(attempt) {

                return {
                    ...attempt,
                    assessmentType: "CBT"
                };

            }
        )

    ];


    /* =====================================================
       SORT NEWEST FIRST
    ===================================================== */

    assessments.sort(function(a, b) {

        const dateA = new Date(
            a.completedAt || a.startedAt || 0
        ).getTime();

        const dateB = new Date(
            b.completedAt || b.startedAt || 0
        ).getTime();

        return dateB - dateA;

    });


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (assessments.length === 0) {

        tableBody.innerHTML = "";

        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }


    /* =====================================================
       DISPLAY FIVE MOST RECENT ASSESSMENTS
    ===================================================== */

    const recentAssessments =
        assessments.slice(0, 5);


    /* =====================================================
       CREATE TABLE ROWS
    ===================================================== */

    tableBody.innerHTML = recentAssessments.map(
        function(attempt) {

            const assessmentType =
                attempt.assessmentType;


            /* ---------------------------------------------
               ASSESSMENT NAME
            --------------------------------------------- */

            const assessmentName =
                assessmentType === "CBT"
                    ? "CBT Examination"
                    : "Quiz Assessment";


            /* ---------------------------------------------
               SUBJECT NAME

               A quiz has one subjectId.
               A CBT can contain multiple subjects.
            --------------------------------------------- */

            let subjectName = "—";

            if (assessmentType === "Quiz") {

                subjectName =
                    getProgressSubjectName(
                        attempt.subjectId
                    );

            } else {

                subjectName = "Multiple Subjects";

            }


            /* ---------------------------------------------
               SCORE
            --------------------------------------------- */

            const rawPercentage = Number(
                attempt.percentage ??
                attempt.score ??
                0
            );

            const percentage = Math.max(
                0,
                Math.min(
                    100,
                    Number.isFinite(rawPercentage)
                        ? rawPercentage
                        : 0
                )
            );

            const scoreClass =
                percentage >= 50
                    ? "text-success"
                    : "text-danger";


            /* ---------------------------------------------
               DATE
            --------------------------------------------- */

            const dateValue =
                attempt.completedAt ||
                attempt.startedAt ||
                null;

            const formattedDate =
                formatProgressDate(dateValue);


            /* ---------------------------------------------
               ANSWER SUMMARY
            --------------------------------------------- */

            const correctAnswers =
                Number(attempt.correctAnswers) || 0;

            const wrongAnswers =
                Number(
                    attempt.wrongAnswers ??
                    attempt.incorrectAnswers ??
                    0
                );

            const totalQuestions =
                Number(attempt.totalQuestions) || 0;


            /* ---------------------------------------------
               RESULT STATUS
            --------------------------------------------- */

            let resultLabel = "Completed";

            let resultClass = "text-bg-secondary";

            if (
                String(attempt.status || "").toLowerCase()
                === "passed"
            ) {

                resultLabel = "Passed";

                resultClass = "text-bg-success";

            } else if (
                String(attempt.status || "").toLowerCase()
                === "failed"
            ) {

                resultLabel = "Failed";

                resultClass = "text-bg-danger";

            } else if (
                assessmentType === "CBT" &&
                String(attempt.status || "").toLowerCase()
                === "completed"
            ) {

                resultLabel = "Completed";

                resultClass = "text-bg-success";

            }


            /* ---------------------------------------------
               RETURN FIVE TABLE CELLS
            --------------------------------------------- */

            return `
                <tr>

                    <!-- ASSESSMENT -->

                    <td>
                        <div class="fw-semibold">
                            ${escapeProgressHtml(assessmentName)}
                        </div>
                    </td>


                    <!-- SUBJECT -->

                    <td>
                        <span>
                            ${escapeProgressHtml(subjectName)}
                        </span>
                    </td>


                    <!-- SCORE -->

                    <td>
                        <span class="fw-semibold ${scoreClass}">
                            ${percentage.toFixed(1)}%
                        </span>

                        <div class="small text-muted">
                            ${correctAnswers} / ${totalQuestions} correct
                        </div>
                    </td>


                    <!-- DATE -->

                    <td>
                        ${escapeProgressHtml(formattedDate)}
                    </td>


                    <!-- RESULTS -->

                    <td>
                        <span class="badge ${resultClass}">
                            ${escapeProgressHtml(resultLabel)}
                        </span>

                        <div class="small text-muted mt-1">
                            ${wrongAnswers} incorrect
                        </div>
                    </td>

                </tr>
            `;

        }
    ).join("");


    console.log(
        "Recent student assessments rendered:",
        recentAssessments.length
    );

}



/* =========================================================
   INITIALIZATION ERROR HANDLER
========================================================= */

function handleProgressInitializationError(
    error
) {

    console.error(
        "Student Progress initialization error:",
        error
    );

    showProgressMessage(
        error?.message ||
        "We could not initialize your progress page. Please refresh and try again.",
        "error"
    );

}


/* =========================================================
INITIALIZE STUDENT PROGRESS
========================================================= */

async function initializeStudentProgress(
authEventUser = null
) {

if (studentProgressInitialized) {
    return;
}

showProgressLoader();

initializeProgressDisplay();

try {

    /*
     * First, use the profile supplied by the
     * authentication event, if available.
     */

    let authenticatedUser =
        authEventUser ||
        null;

    /*
     * If the guard has not supplied the profile yet,
     * wait for aplusAuthReady.
     */

    if (!authenticatedUser) {

        authenticatedUser =
            await new Promise(
                (resolve, reject) => {

                    let completed = false;

                    const timeout = setTimeout(
                        () => {

                            if (completed) {
                                return;
                            }

                            completed = true;

                            document.removeEventListener(
                                "aplusAuthReady",
                                handleAuthReady
                            );

                            /*
                             * The guard may already have
                             * completed before this listener
                             * was registered.
                             */

                            if (window.aplusUser) {

                                resolve(
                                    window.aplusUser
                                );

                            } else {

                                reject(
                                    new Error(
                                        "Authentication is taking too long. Please refresh the page."
                                    )
                                );

                            }

                        },
                        15000
                    );

                    function handleAuthReady(event) {

                        if (completed) {
                            return;
                        }

                        completed = true;

                        clearTimeout(timeout);

                        document.removeEventListener(
                            "aplusAuthReady",
                            handleAuthReady
                        );

                        resolve(
                            event.detail?.user ||
                            window.aplusUser ||
                            null
                        );

                    }

                    document.addEventListener(
                        "aplusAuthReady",
                        handleAuthReady
                    );

                    /*
                     * Check again after registering
                     * the listener to avoid missing
                     * an event that just occurred.
                     */

                    if (window.aplusUser) {

                        completed = true;

                        clearTimeout(timeout);

                        document.removeEventListener(
                            "aplusAuthReady",
                            handleAuthReady
                        );

                        resolve(
                            window.aplusUser
                        );

                    }

                }
            );

    }

    /*
     * Normalize and verify the student.
     */

    studentProgressUser =
        getProgressStudent(
            authenticatedUser
        );

    console.log(
        "Aplus Student Progress initialized.",
        {
            studentId:
                studentProgressUser.$id,

            studentName:
                studentProgressUser.fullName ||
                studentProgressUser.name ||
                "Student",

            role:
                studentProgressUser.role
        }
    );

    hideProgressMessage();

/* =========================================================
   LOAD STUDENT PROGRESS DATA
========================================================= */

studentProgressLoading = true;

setProgressRefreshLoading(true);

try {

    showProgressMessage(
        "Loading your assessment and study progress..."
    );

    await loadStudentProgressData(
        studentProgressUser
    );

    hideProgressMessage();

    studentProgressInitialized = true;

    showProgressMessage(
        "Your progress has been updated successfully.",
        "success"
    );

} catch (error) {

    console.error(
        "Unable to load student progress data:",
        error
    );

    showProgressMessage(
        "Some progress data could not be loaded. Please check the console and try refreshing.",
        "error"
    );

} finally {

    studentProgressLoading = false;

    setProgressRefreshLoading(false);

}
} catch (error) {

    handleProgressInitializationError(
        error
    );

} finally {

    hideProgressLoader();

}

}


/* =========================================================
   REFRESH STUDENT PROGRESS
========================================================= */

if (progressPageElements.refreshButton) {
    
    progressPageElements.refreshButton.addEventListener(
        "click",
        async function() {
            
            /*
             * PREVENT MULTIPLE SIMULTANEOUS REQUESTS
             */
            
            if (studentProgressLoading) {
                return;
            }
            
            
            /*
             * VERIFY STUDENT SESSION
             */
            
            if (!studentProgressUser) {
                
                showProgressMessage(
                    "Your student session could not be verified. Please log in again.",
                    "error"
                );
                
                return;
                
            }
            
            
            /*
             * START REFRESH
             */
            
            studentProgressLoading = true;
            
            setProgressRefreshLoading(true);
            
            showProgressMessage(
                "Refreshing your progress..."
            );
            
            
            try {
                
                /*
                 * RELOAD ALL PROGRESS DATA
                 */
                
                await loadStudentProgressData(
                    studentProgressUser
                );
                
                
                /*
                 * SHOW SUCCESS
                 */
                
                showProgressMessage(
                    "Your progress has been refreshed successfully.",
                    "success"
                );
                
            } catch (error) {
                
                console.error(
                    "Student progress refresh failed:",
                    error
                );
                
                showProgressMessage(
                    "Unable to refresh your progress. Please try again.",
                    "error"
                );
                
            } finally {
                
                studentProgressLoading = false;
                
                setProgressRefreshLoading(false);
                
            }
            
        }
    );
    
}




/* =========================================================
   START STUDENT PROGRESS PAGE
   Connect the authentication guard to this page.
========================================================= */

let studentProgressStartRequested = false;


function startStudentProgressPage(authEventUser = null) {

    if (studentProgressStartRequested) {
        return;
    }

    studentProgressStartRequested = true;

    console.log(
        "Starting Aplus Student Progress page..."
    );

    initializeStudentProgress(authEventUser);

}


/*
 * Listen for the authentication guard's event.
 */

document.addEventListener(
    "aplusAuthReady",
    function(event) {

        console.log(
            "Student Progress received authentication event."
        );

        startStudentProgressPage(
            event.detail?.user || null
        );

    }
);


/*
 * Handle cases where authentication completed
 * before this script registered its listener.
 */

if (window.aplusUser) {

    console.log(
        "Existing authenticated student detected."
    );

    startStudentProgressPage(
        window.aplusUser
    );

}