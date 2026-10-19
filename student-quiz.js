/* =========================================================
   APLUS TUTORS — STUDENT QUIZ
   PHASE 1
   CORE STATE, DOM REFERENCES & UTILITIES
   ========================================================= */


/* =========================================================
   GLOBAL QUIZ STATE
   ========================================================= */

/*
    Current authenticated student
*/
let currentQuizUser = null;


/*
    Current student profile from users table
*/
let currentQuizStudent = null;


/*
    Available subjects
*/
let availableQuizSubjects = [];


/*
    Available topics for selected subject
*/
let availableQuizTopics = [];


/*
    Questions loaded for the selected topic
*/
let availableQuestions = [];


/*
    Questions actually used in the current quiz
*/
let quizQuestions = [];


/*
    Answers selected by the student.

    Example:

    quizAnswers = [
        {
            questionId: "question-id",
            selectedAnswer: "B"
        }
    ];
*/
let quizAnswers = [];


/*
    Current question index
*/
let currentQuestionIndex = 0;


/*
    Selected subject
*/
let selectedQuizSubject = null;


/*
    Selected topic
*/
let selectedQuizTopic = null;


/*
    Quiz configuration
*/
let quizQuestionCount = 10;

let quizTimePerQuestion = 60;

let quizPassMark = 50;
/*
    Timer state
*/
let quizTimerInterval = null;

let quizTimeRemaining = 60;


/*
    Prevent duplicate quiz submissions
*/
let quizSubmitting = false;


/*
    Current quiz attempt ID

    This will be populated when the
    quiz_attempts record is created.
*/
let currentQuizAttemptId = null;

/*
    Quiz timing
*/
let quizStartedAt = null;

let quizCompletedAt = null;

/*
    Stores the final quiz result
*/
let currentQuizResult = null;


/*
    Prevent repeated initialization
*/
let quizInitialized = false;


/*
    Prevent double clicks while loading
*/
let quizLoading = false;


/* =========================================================
   DOM REFERENCES
   ========================================================= */

/*
    Page
*/
const studentQuizPage =
    document.getElementById("studentQuizPage");


/*
    Page message
*/
const quizPageMessage =
    document.getElementById("quizPageMessage");


/*
    Setup
*/
const quizSetup =
    document.getElementById("quizSetup");


/*
    Subjects
*/
const quizSubjectsLoading =
    document.getElementById("quizSubjectsLoading");

const quizSubjectsGrid =
    document.getElementById("quizSubjectsGrid");

const quizNoSubjects =
    document.getElementById("quizNoSubjects");


/*
    Topics
*/
const quizTopicSection =
    document.getElementById("quizTopicSection");

const selectedQuizSubjectElement =
    document.getElementById("selectedQuizSubject");

const quizTopicsLoading =
    document.getElementById("quizTopicsLoading");

const quizTopicsGrid =
    document.getElementById("quizTopicsGrid");

const quizNoTopics =
    document.getElementById("quizNoTopics");


/*
    Configuration
*/
const quizConfiguration =
    document.getElementById("quizConfiguration");

const selectedQuizTopicElement =
    document.getElementById("selectedQuizTopic");
    
const quizQuestionCountSelect =
    document.getElementById(
        "quizQuestionCount"
    );

const quizQuestionCountElement =
    document.getElementById("quizQuestionCount");

const quizTimePerQuestionElement =
    document.getElementById("quizTimePerQuestion");

const quizPassMarkElement =
    document.getElementById("quizPassMark");

const startQuizBtn =
    document.getElementById("startQuizBtn");


/*
    Active quiz
*/
const activeQuiz =
    document.getElementById("activeQuiz");

const activeQuizTitle =
    document.getElementById("activeQuizTitle");

const quizTimer =
    document.getElementById("quizTimer");

const quizTimerValue =
    document.getElementById("quizTimerValue");

const quizQuestionCounter =
    document.getElementById("quizQuestionCounter");

const quizProgressPercent =
    document.getElementById("quizProgressPercent");

const quizProgressBar =
    document.getElementById("quizProgressBar");

const quizQuestion =
    document.getElementById("quizQuestion");

const quizOptions =
    document.getElementById("quizOptions");

const previousQuestionBtn =
    document.getElementById("previousQuestionBtn");

const nextQuestionBtn =
    document.getElementById("nextQuestionBtn");

const submitQuizBtn =
    document.getElementById("submitQuizBtn");


/*
    Result
*/
const quizResult =
    document.getElementById("quizResult");

const quizResultTitle =
    document.getElementById("quizResultTitle");

const quizResultScore =
    document.getElementById("quizResultScore");

const quizResultMessage =
    document.getElementById("quizResultMessage");

const quizCorrectCount =
    document.getElementById("quizCorrectCount");

const quizWrongCount =
    document.getElementById("quizWrongCount");

const quizUnansweredCount =
    document.getElementById("quizUnansweredCount");

const reviewQuizBtn =
    document.getElementById("reviewQuizBtn");

const retryQuizBtn =
    document.getElementById("retryQuizBtn");

const backToQuizSetupBtn =
    document.getElementById("backToQuizSetupBtn");


/*
    Review
*/
const quizReview =
    document.getElementById("quizReview");

const closeReviewBtn =
    document.getElementById("closeReviewBtn");

const quizReviewList =
    document.getElementById("quizReviewList");


/* =========================================================
   BASIC UTILITY FUNCTIONS
   ========================================================= */

/*
    Safely convert a value to a string.
*/
function quizSafeString(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}


/*
    Safely convert a value to a number.
*/
function quizSafeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


/*
    Escape HTML before inserting database
    content into innerHTML.

    This is especially important because
    question/option text comes from Appwrite.
*/
function escapeQuizHTML(value) {

    const text =
        quizSafeString(value);

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==================================================
   SAFELY RENDER QUESTION HTML
================================================== */

function renderQuizRichContent(element, content) {

    if (!element) return;

    const html = quizSafeString(content);

    // Fall back to plain text if DOMPurify is unavailable.
    if (!window.DOMPurify) {
        element.textContent = html;
        return;
    }

    // Safely render formatted question content and images.
    element.innerHTML = window.DOMPurify.sanitize(html, {
        USE_PROFILES: {
            html: true
        },
        ADD_ATTR: [
            "data-appwrite-file-id"
        ]
    });

    // Restore Appwrite image URLs when a file ID is available.
    const images = element.querySelectorAll(
        "img[data-appwrite-file-id]"
    );

    images.forEach(function (img) {

        const fileId = img.dataset.appwriteFileId;

        if (!fileId || !window.storage) return;

        try {

            const imageUrl = storage.getFileView({
                bucketId: QUESTION_IMAGES_BUCKET_ID,
                fileId: fileId
            });

            img.src = imageUrl.toString();

        } catch (error) {

            console.error(
                "Unable to load quiz question image:",
                error
            );

        }

    });

    // Render mathematical expressions if MathJax is available.
    if (
        window.MathJax &&
        typeof window.MathJax.typesetPromise === "function"
    ) {

        window.MathJax.typesetPromise([element]).catch(
            function (error) {
                console.error(
                    "Quiz MathJax rendering error:",
                    error
                );
            }
        );

    }

}
/*
    Show page message.
*/
function showQuizMessage(
    message,
    type = "info"
) {

    if (!quizPageMessage) {
        return;
    }

    quizPageMessage.textContent =
        quizSafeString(message);

    quizPageMessage.className =
        "quiz-page-message";

    if (type) {
        quizPageMessage.classList.add(type);
    }

    quizPageMessage.hidden = false;
}


/*
    Hide page message.
*/
function hideQuizMessage() {

    if (!quizPageMessage) {
        return;
    }

    quizPageMessage.hidden = true;

    quizPageMessage.textContent = "";

    quizPageMessage.className =
        "quiz-page-message";
}


/*
    Show an element safely.
*/
function showQuizElement(element) {

    if (!element) {
        return;
    }

    element.hidden = false;
}


/*
    Hide an element safely.
*/
function hideQuizElement(element) {

    if (!element) {
        return;
    }

    element.hidden = true;
}


/*
    Set loading state.
*/
function setQuizLoading(
    element,
    loading
) {

    if (!element) {
        return;
    }

    if (loading) {
        element.hidden = false;
    } else {
        element.hidden = true;
    }
}


/*
    Get selected configuration values.
*/
function readQuizConfiguration() {

    quizQuestionCount =
        quizSafeNumber(
            quizQuestionCountElement?.value,
            10
        );

    quizTimePerQuestion =
        quizSafeNumber(
            quizTimePerQuestionElement?.value,
            60
        );

    /*
        The pass mark is currently displayed
        as 50% in a div rather than a select.
    */

    const passMarkText =
        quizSafeString(
            quizPassMarkElement?.textContent
        );

    const parsedPassMark =
        parseFloat(
            passMarkText.replace(
                "%",
                ""
            )
        );

    quizPassMark =
        Number.isFinite(parsedPassMark)
            ? parsedPassMark
            : 50;
}


/* =========================================================
   BUTTON STATE MANAGEMENT
   ========================================================= */

/*
    Disable Start Quiz button.

    This function is intentionally defined
    globally because the previous version
    produced:

    ReferenceError:
    disableStartButton is not defined
*/
function disableStartButton(
    loading = false
) {

    if (!startQuizBtn) {
        return;
    }

    startQuizBtn.disabled = true;

    if (loading) {

        startQuizBtn.classList.add(
            "loading"
        );

    } else {

        startQuizBtn.classList.remove(
            "loading"
        );
    }
}


/*
    Enable Start Quiz button.
*/
function enableStartButton() {

    if (!startQuizBtn) {
        return;
    }

    startQuizBtn.disabled = false;

    startQuizBtn.classList.remove(
        "loading"
    );
}


/*
    Disable navigation buttons.
*/
function disableQuizNavigation() {

    if (previousQuestionBtn) {
        previousQuestionBtn.disabled = true;
    }

    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = true;
    }

    if (submitQuizBtn) {
        submitQuizBtn.disabled = true;
    }
}


/*
    Enable navigation buttons.

    Individual states will later be controlled
    by renderQuizQuestion().
*/
function enableQuizNavigation() {

    if (previousQuestionBtn) {
        previousQuestionBtn.disabled = false;
    }

    if (nextQuestionBtn) {
        nextQuestionBtn.disabled = false;
    }

    if (submitQuizBtn) {
        submitQuizBtn.disabled = false;
    }
}


/* =========================================================
   QUIZ SECTION VISIBILITY
   ========================================================= */

/*
    Hide all major quiz sections.
*/
function hideAllQuizSections() {

    hideQuizElement(
        quizSetup
    );

    hideQuizElement(
        activeQuiz
    );

    hideQuizElement(
        quizResult
    );

    hideQuizElement(
        quizReview
    );
}


/*
    Show quiz setup.
*/
function showQuizSetup() {

    hideQuizElement(
        activeQuiz
    );

    hideQuizElement(
        quizResult
    );

    hideQuizElement(
        quizReview
    );

    showQuizElement(
        quizSetup
    );
}


/*
    Show active quiz.
*/
function showActiveQuiz() {

    hideQuizElement(
        quizSetup
    );

    hideQuizElement(
        quizResult
    );

    hideQuizElement(
        quizReview
    );

    showQuizElement(
        activeQuiz
    );
}


/*
    Show result.
*/
function showQuizResult() {

    hideQuizElement(
        quizSetup
    );

    hideQuizElement(
        activeQuiz
    );

    hideQuizElement(
        quizReview
    );

    showQuizElement(
        quizResult
    );
}


/*
    Show review.
*/
function showQuizReview() {

    hideQuizElement(
        quizSetup
    );

    hideQuizElement(
        activeQuiz
    );

    hideQuizElement(
        quizResult
    );

    showQuizElement(
        quizReview
    );
}


/* =========================================================
   TIMER CLEANUP
   ========================================================= */

/*
    Stop any existing quiz timer.
*/
function stopQuizTimer() {

    if (quizTimerInterval !== null) {

        clearInterval(
            quizTimerInterval
        );

        quizTimerInterval = null;
    }
}


/*
    Reset timer visual state.
*/
function resetQuizTimerVisual() {

    if (!quizTimer) {
        return;
    }

    quizTimer.classList.remove(
        "warning",
        "danger"
    );
}


/* =========================================================
   INITIAL STATE
   ========================================================= */

/*
    Prepare the page before loading data.
*/
function prepareQuizPage() {

    hideQuizMessage();

    hideQuizElement(
        quizTopicSection
    );

    hideQuizElement(
        quizConfiguration
    );

    hideQuizElement(
        activeQuiz
    );

    hideQuizElement(
        quizResult
    );

    hideQuizElement(
        quizReview
    );

    disableStartButton();

    stopQuizTimer();

    resetQuizTimerVisual();

    quizInitialized = false;

    quizLoading = false;

    quizSubmitting = false;

    currentQuizAttemptId = null;

    currentQuestionIndex = 0;
    
    quizStartedAt = null;

    quizCompletedAt = null;

    quizAnswers = [];

    quizQuestions = [];

    selectedQuizSubject = null;

    selectedQuizTopic = null;

    availableQuizSubjects = [];

    availableQuizTopics = [];

    availableQuestions = [];
}


/* =========================================================
   INITIAL PAGE PREPARATION
   ========================================================= */

prepareQuizPage();



/* =========================================================
   PHASE 2 — STUDENT PROFILE & SUBJECT SELECTION
   ========================================================= */


/* =========================================================
   LOAD ALL ROWS
   ========================================================= */

/*
    Local pagination helper.

    We use this instead of depending on another helper
    from student-dashboard.js.

    This makes student-quiz.js more self-contained.
*/
async function getAllQuizRows(
    tableId,
    queries = []
) {

    const rows = [];

    let cursor = null;

    const limit = 100;

    try {

        while (true) {

            const currentQueries = [
                ...queries,
                Query.limit(limit)
            ];

            if (cursor) {

                currentQueries.push(
                    Query.cursorAfter(cursor)
                );
            }

            const response =
                await tablesDB.listRows(
                    DATABASE_ID,
                    tableId,
                    currentQueries
                );

            const currentRows =
                response?.rows || [];

            rows.push(
                ...currentRows
            );

            if (
                currentRows.length < limit
            ) {
                break;
            }

            const lastRow =
                currentRows[
                    currentRows.length - 1
                ];

            if (!lastRow?.$id) {
                break;
            }

            cursor =
                lastRow.$id;
        }

        return rows;

    } catch (error) {

        console.error(
            "Error loading Appwrite rows:",
            error
        );

        throw error;
    }
}


/* =========================================================
   LOAD AUTHENTICATED STUDENT
   ========================================================= */

/*
    Gets the currently authenticated
    Appwrite account.
*/
async function loadCurrentQuizUser() {

    try {

        currentQuizUser =
            await account.get();

        if (
            !currentQuizUser ||
            !currentQuizUser.$id
        ) {

            throw new Error(
                "Unable to identify the current student."
            );
        }

        return currentQuizUser;

    } catch (error) {

        console.error(
            "Unable to get authenticated user:",
            error
        );

        throw new Error(
            "Your session could not be verified. Please log in again."
        );
    }
}


/* =========================================================
   LOAD STUDENT PROFILE
   ========================================================= */

/*
    Loads the student's row from the users table.

    Primary method:
        Query.equal("$id", user.$id)

    Fallback:
        Query.equal("email", user.email)

    The fallback makes the quiz page more tolerant
    if the users row was created with its own document ID.
*/
async function loadCurrentQuizStudent() {

    if (!currentQuizUser) {

        throw new Error(
            "Student account has not been loaded."
        );
    }


    try {

        /*
            First attempt:
            Appwrite users row ID matches
            authenticated Appwrite user ID.
        */

        let rows =
            await getAllQuizRows(
                USERS_TABLE_ID,
                [
                    Query.equal(
                        "$id",
                        currentQuizUser.$id
                    )
                ]
            );


        /*
            Fallback:
            Find the student by email.
        */

        if (
            rows.length === 0 &&
            currentQuizUser.email
        ) {

            rows =
                await getAllQuizRows(
                    USERS_TABLE_ID,
                    [
                        Query.equal(
                            "email",
                            currentQuizUser.email
                        )
                    ]
                );
        }


        if (rows.length === 0) {

            throw new Error(
                "Your student profile could not be found."
            );
        }


        currentQuizStudent =
            rows[0];


        /*
            Make sure the student has a department.
        */

        const department =
            quizSafeString(
                currentQuizStudent.department
            );


        if (!department) {

            throw new Error(
                "Your student profile does not have a department assigned. Please contact Aplus Tutors."
            );
        }


        console.log(
            "Quiz student profile loaded:",
            currentQuizStudent
        );


        return currentQuizStudent;

    } catch (error) {

        console.error(
            "Unable to load student profile:",
            error
        );

        throw error;
    }
}


/* =========================================================
   NORMALIZE DEPARTMENT
   ========================================================= */

/*
    Converts department names into a consistent
    comparison format.

    Examples:

        Science  -> science
        Sciences -> science
        Commercial -> commercial
        Arts -> arts
        General -> general
*/
function normalizeQuizDepartment(
    department
) {

    let value =
        quizSafeString(
            department
        ).toLowerCase();


    /*
        Remove unnecessary spaces.
    */

    value =
        value.replace(
            /\s+/g,
            " "
        );


    /*
        Handle common singular/plural
        variations.

        This is important because your
        subjects may contain "Sciences"
        while the student profile contains
        "Science".
    */

    if (
        value === "sciences"
    ) {
        value = "science";
    }


    if (
        value === "commercials"
    ) {
        value = "commercial";
    }


    if (
        value === "arts"
    ) {
        value = "arts";
    }


    return value;
}


/* =========================================================
   CHECK SUBJECT DEPARTMENT
   ========================================================= */

/*
    Determines whether a subject should be
    available to the current student.

    A subject is available when:

    1. Its status is active
    2. Its department is General
       OR
    3. Its department matches the
       student's department
*/
function isQuizSubjectAvailable(
    subject
) {

    if (!subject) {
        return false;
    }


    /*
        Only active subjects should appear.
    */

    const status =
        quizSafeString(
            subject.status
        ).toLowerCase();


    if (
        status !== "active"
    ) {
        return false;
    }


    const subjectDepartment =
        normalizeQuizDepartment(
            subject.department
        );


    const studentDepartment =
        normalizeQuizDepartment(
            currentQuizStudent?.department
        );


    /*
        General subjects are available
        to every student.
    */

    if (
        subjectDepartment === "general"
    ) {
        return true;
    }


    /*
        Empty department should not
        accidentally become available.
    */

    if (
        !subjectDepartment ||
        !studentDepartment
    ) {
        return false;
    }


    return (
        subjectDepartment ===
        studentDepartment
    );
}


/* =========================================================
   LOAD ACTIVE SUBJECTS
   ========================================================= */

async function loadQuizSubjects() {

    if (!currentQuizStudent) {

        throw new Error(
            "Student profile has not been loaded."
        );
    }


    showQuizElement(
        quizSubjectsLoading
    );

    hideQuizElement(
        quizNoSubjects
    );


    if (quizSubjectsGrid) {

        quizSubjectsGrid.innerHTML = "";
    }


    try {

        /*
            Load subjects.

            We intentionally load the subject rows
            and filter them in JavaScript.

            This allows us to safely support:

                Science
                Sciences
                General

            without relying on an exact database
            spelling.
        */

        const subjects =
            await getAllQuizRows(
                SUBJECTS_TABLE_ID
            );


        availableQuizSubjects =
            subjects.filter(
                isQuizSubjectAvailable
            );


        /*
            Sort alphabetically.
        */

        availableQuizSubjects.sort(
            (a, b) => {

                const nameA =
                    quizSafeString(
                        a.name
                    ).toLowerCase();

                const nameB =
                    quizSafeString(
                        b.name
                    ).toLowerCase();

                return nameA.localeCompare(
                    nameB
                );
            }
        );


        hideQuizElement(
            quizSubjectsLoading
        );


        if (
            availableQuizSubjects.length === 0
        ) {

            showQuizElement(
                quizNoSubjects
            );

            return;
        }


        renderQuizSubjects();

    } catch (error) {

        console.error(
            "Unable to load quiz subjects:",
            error
        );


        hideQuizElement(
            quizSubjectsLoading
        );


        showQuizElement(
            quizNoSubjects
        );


        showQuizMessage(
            error?.message ||
            "Unable to load subjects. Please try again.",
            "error"
        );
    }
}


/* =========================================================
   SUBJECT ICON
   ========================================================= */

/*
    Select an appropriate Font Awesome icon
    based on the subject name/code.
*/
function getQuizSubjectIcon(
    subject
) {

    const name =
        quizSafeString(
            subject?.name
        ).toLowerCase();


    const code =
        quizSafeString(
            subject?.code
        ).toLowerCase();


    const value =
        `${name} ${code}`;


    if (
        value.includes("math")
    ) {
        return "fa-calculator";
    }


    if (
        value.includes("english")
    ) {
        return "fa-language";
    }


    if (
        value.includes("physics")
    ) {
        return "fa-atom";
    }


    if (
        value.includes("chem")
    ) {
        return "fa-flask";
    }


    if (
        value.includes("biology") ||
        value.includes("bio")
    ) {
        return "fa-dna";
    }


    if (
        value.includes("agric")
    ) {
        return "fa-seedling";
    }


    if (
        value.includes("econom")
    ) {
        return "fa-chart-line";
    }


    if (
        value.includes("commerce") ||
        value.includes("business")
    ) {
        return "fa-briefcase";
    }


    if (
        value.includes("account")
    ) {
        return "fa-file-invoice-dollar";
    }


    if (
        value.includes("government")
    ) {
        return "fa-landmark";
    }


    if (
        value.includes("literature")
    ) {
        return "fa-book-open";
    }


    if (
        value.includes("computer") ||
        value.includes("ict") ||
        value.includes("coding")
    ) {
        return "fa-laptop-code";
    }


    if (
        value.includes("general")
    ) {
        return "fa-book-open";
    }


    return "fa-book";
}


/* =========================================================
   RENDER SUBJECTS
   ========================================================= */

function renderQuizSubjects() {

    if (!quizSubjectsGrid) {
        return;
    }


    quizSubjectsGrid.innerHTML = "";


    availableQuizSubjects.forEach(
        (subject) => {

            const subjectId =
                quizSafeString(
                    subject.$id
                );


            if (!subjectId) {
                return;
            }


            const subjectName =
                quizSafeString(
                    subject.name
                ) ||
                "Unnamed Subject";


            const subjectCode =
                quizSafeString(
                    subject.code
                );


            const subjectDescription =
                quizSafeString(
                    subject.description
                );


            const icon =
                getQuizSubjectIcon(
                    subject
                );


            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "quiz-subject-card";


            card.dataset.subjectId =
                subjectId;


            /*
                This keeps the card accessible
                to keyboard users.
            */

            card.setAttribute(
                "aria-label",
                `Select ${subjectName}`
            );


            card.innerHTML = `

                <span class="quiz-subject-icon">

                    <i class="fa-solid ${icon}"></i>

                </span>

                <span class="quiz-subject-content">

                    <span class="quiz-subject-name">
                        ${escapeQuizHTML(subjectName)}
                    </span>

                    ${
                        subjectCode
                            ? `
                                <span class="quiz-subject-code">
                                    ${escapeQuizHTML(subjectCode)}
                                </span>
                              `
                            : ""
                    }

                    ${
                        subjectDescription
                            ? `
                                <span class="quiz-subject-description">
                                    ${escapeQuizHTML(subjectDescription)}
                                </span>
                              `
                            : ""
                    }

                </span>

                <span class="quiz-subject-arrow">

                    <i class="fa-solid fa-chevron-right"></i>

                </span>

            `;


            /*
                Subject selection.
            */

            card.addEventListener(
                "click",
                () => {

                    handleQuizSubjectSelection(
                        subjectId
                    );

                }
            );


            quizSubjectsGrid.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   FIND SUBJECT
   ========================================================= */

function findQuizSubjectById(
    subjectId
) {

    return availableQuizSubjects.find(
        (subject) =>
            subject.$id === subjectId
    );
}


/* =========================================================
   SELECT SUBJECT
   ========================================================= */

async function handleQuizSubjectSelection(
    subjectId
) {

    const subject =
        findQuizSubjectById(
            subjectId
        );


    if (!subject) {

        showQuizMessage(
            "The selected subject could not be found.",
            "error"
        );

        return;
    }


    /*
        Store selected subject.
    */

    selectedQuizSubject =
        subject;


    /*
        Update selected card visual.
    */

    if (quizSubjectsGrid) {

        const cards =
            quizSubjectsGrid.querySelectorAll(
                ".quiz-subject-card"
            );


        cards.forEach(
            (card) => {

                const isSelected =
                    card.dataset.subjectId ===
                    subjectId;


                card.classList.toggle(
                    "selected",
                    isSelected
                );


                card.classList.toggle(
                    "active",
                    isSelected
                );


                card.classList.toggle(
                    "is-selected",
                    isSelected
                );


                card.setAttribute(
                    "aria-pressed",
                    String(isSelected)
                );
            }
        );
    }


    /*
        Display selected subject.
    */

    renderSelectedQuizSubject(
        subject
    );


    /*
        Hide configuration until a topic
        has been selected.
    */

    hideQuizElement(
        quizConfiguration
    );


    /*
        Show topic section.
    */

    showQuizElement(
        quizTopicSection
    );


    /*
        Load topics belonging to this subject.

        IMPORTANT:
        Your topics table uses:

            subjectId

        NOT:

            subject
    */

    await loadQuizTopics(
        subjectId
    );
}


/* =========================================================
   RENDER SELECTED SUBJECT
   ========================================================= */

function renderSelectedQuizSubject(
    subject
) {

    if (!selectedQuizSubjectElement) {
        return;
    }


    const subjectName =
        quizSafeString(
            subject?.name
        ) ||
        "Selected Subject";


    const subjectCode =
        quizSafeString(
            subject?.code
        );


    const icon =
        getQuizSubjectIcon(
            subject
        );


    selectedQuizSubjectElement.innerHTML = `

        <span class="selected-quiz-subject-icon">

            <i class="fa-solid ${icon}"></i>

        </span>

        <span class="selected-quiz-subject-content">

            <span class="selected-quiz-subject-label">
                SELECTED SUBJECT
            </span>

            <strong>
                ${escapeQuizHTML(subjectName)}
            </strong>

            ${
                subjectCode
                    ? `
                        <small>
                            ${escapeQuizHTML(subjectCode)}
                        </small>
                      `
                    : ""
            }

        </span>

        <span class="selected-quiz-subject-check">

            <i class="fa-solid fa-check"></i>

        </span>

    `;
}


/* =========================================================
   INITIALIZE SUBJECT SELECTION
   ========================================================= */

async function initializeQuizPage() {

    if (quizInitialized) {
        return;
    }


    if (quizLoading) {
        return;
    }


    quizLoading = true;


    try {

        hideQuizMessage();


        /*
            Load authenticated user.
        */

        await loadCurrentQuizUser();


        /*
            Load corresponding student profile.
        */

        await loadCurrentQuizStudent();


        /*
            Load available subjects.
        */

        await loadQuizSubjects();


        quizInitialized = true;

    } catch (error) {

        console.error(
            "Quiz initialization failed:",
            error
        );


        showQuizMessage(
            error?.message ||
            "Unable to load the quiz page. Please refresh and try again.",
            "error"
        );

    } finally {

        quizLoading = false;
    }
}


/* =========================================================
   START PHASE 2
   ========================================================= */

initializeQuizPage();


/* =========================================================
   PHASE 3 — TOPIC LOADING & TOPIC SELECTION
   ========================================================= */


/* =========================================================
   LOAD TOPICS FOR SUBJECT
   ========================================================= */

/*
    Loads active topics belonging to the selected subject.

    IMPORTANT:
    Your topics table uses:

        subjectId

    Therefore the query below uses:

        Query.equal("subjectId", subjectId)
*/
async function loadQuizTopics(
    subjectId
) {

    if (!subjectId) {

        console.error(
            "loadQuizTopics: subjectId is missing."
        );

        return;
    }


    /*
        Reset previous topic state.
    */

    availableQuizTopics = [];

    selectedQuizTopic = null;


    /*
        Hide quiz configuration until
        a topic is selected.
    */

    hideQuizElement(
        quizConfiguration
    );


    /*
        Clear previous topic cards.
    */

    if (quizTopicsGrid) {

        quizTopicsGrid.innerHTML = "";
    }


    /*
        Hide empty state.
    */

    hideQuizElement(
        quizNoTopics
    );


    /*
        Show topic loading state.
    */

    showQuizElement(
        quizTopicsLoading
    );


    try {

        /*
            Query topics belonging to
            the selected subject.

            Only active topics are loaded.
        */

        const topics =
            await getAllQuizRows(
                TOPICS_TABLE_ID,
                [
                    Query.equal(
                        "subjectId",
                        subjectId
                    ),
                    Query.equal(
                        "status",
                        "active"
                    )
                ]
            );


        /*
            Store topics globally.
        */

        availableQuizTopics =
            topics || [];


        /*
            Sort topics by order if your
            topic records have an "order"
            attribute.

            If no order exists, fall back
            to topic name.
        */

        availableQuizTopics.sort(
            (a, b) => {

                const orderA =
                    quizSafeNumber(
                        a.order,
                        Number.MAX_SAFE_INTEGER
                    );

                const orderB =
                    quizSafeNumber(
                        b.order,
                        Number.MAX_SAFE_INTEGER
                    );


                if (
                    orderA !== orderB
                ) {

                    return orderA - orderB;
                }


                const nameA =
                    quizSafeString(
                        a.name ||
                        a.title ||
                        a.topic
                    ).toLowerCase();


                const nameB =
                    quizSafeString(
                        b.name ||
                        b.title ||
                        b.topic
                    ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );
            }
        );


        /*
            Hide loading state.
        */

        hideQuizElement(
            quizTopicsLoading
        );


        /*
            No topics available.
        */

        if (
            availableQuizTopics.length === 0
        ) {

            showQuizElement(
                quizNoTopics
            );

            disableStartButton();

            return;
        }


        /*
            Render topic cards.
        */

        renderQuizTopics();


    } catch (error) {

        console.error(
            "Unable to load quiz topics:",
            error
        );


        hideQuizElement(
            quizTopicsLoading
        );


        /*
            Clear old topics.
        */

        if (quizTopicsGrid) {

            quizTopicsGrid.innerHTML = "";
        }


        showQuizElement(
            quizNoTopics
        );


        disableStartButton();


        showQuizMessage(
            error?.message ||
            "Unable to load topics. Please try again.",
            "error"
        );
    }
}


/* =========================================================
   GET TOPIC NAME
   ========================================================= */

/*
    Returns the topic name safely.

    The primary expected field is "name".

    The fallbacks make the renderer tolerant
    if an older topic record uses "title" or
    "topic".
*/
function getQuizTopicName(
    topic
) {

    return (
        quizSafeString(
            topic?.name
        ) ||
        quizSafeString(
            topic?.title
        ) ||
        quizSafeString(
            topic?.topic
        ) ||
        "Unnamed Topic"
    );
}


/* =========================================================
   GET TOPIC DESCRIPTION
   ========================================================= */

function getQuizTopicDescription(
    topic
) {

    return (
        quizSafeString(
            topic?.description
        ) ||
        quizSafeString(
            topic?.details
        ) ||
        ""
    );
}


/* =========================================================
   TOPIC ICON
   ========================================================= */

/*
    Selects a suitable icon based on
    the topic name.

    The quiz does not depend on the icon.
    It is purely visual.
*/
function getQuizTopicIcon(
    topic
) {

    const name =
        getQuizTopicName(
            topic
        ).toLowerCase();


    if (
        name.includes("measurement") ||
        name.includes("unit")
    ) {
        return "fa-ruler-combined";
    }


    if (
        name.includes("motion") ||
        name.includes("movement")
    ) {
        return "fa-person-running";
    }


    if (
        name.includes("force") ||
        name.includes("friction")
    ) {
        return "fa-weight-hanging";
    }


    if (
        name.includes("energy") ||
        name.includes("power")
    ) {
        return "fa-bolt";
    }


    if (
        name.includes("heat") ||
        name.includes("temperature")
    ) {
        return "fa-temperature-half";
    }


    if (
        name.includes("wave") ||
        name.includes("sound")
    ) {
        return "fa-water";
    }


    if (
        name.includes("electric") ||
        name.includes("current")
    ) {
        return "fa-bolt";
    }


    if (
        name.includes("atom") ||
        name.includes("nuclear")
    ) {
        return "fa-atom";
    }


    if (
        name.includes("organic") ||
        name.includes("carbon")
    ) {
        return "fa-flask";
    }


    if (
        name.includes("cell") ||
        name.includes("biology")
    ) {
        return "fa-dna";
    }


    if (
        name.includes("grammar") ||
        name.includes("english")
    ) {
        return "fa-language";
    }


    if (
        name.includes("algebra") ||
        name.includes("equation") ||
        name.includes("calculation")
    ) {
        return "fa-square-root-variable";
    }


    if (
        name.includes("number")
    ) {
        return "fa-hashtag";
    }


    if (
        name.includes("geometry") ||
        name.includes("shape")
    ) {
        return "fa-shapes";
    }


    return "fa-layer-group";
}


/* =========================================================
   RENDER TOPIC CARDS
   ========================================================= */

function renderQuizTopics() {

    if (!quizTopicsGrid) {
        return;
    }


    quizTopicsGrid.innerHTML = "";


    availableQuizTopics.forEach(
        (topic, index) => {

            const topicId =
                quizSafeString(
                    topic?.$id
                );


            if (!topicId) {
                return;
            }


            const topicName =
                getQuizTopicName(
                    topic
                );


            const topicDescription =
                getQuizTopicDescription(
                    topic
                );


            const topicIcon =
                getQuizTopicIcon(
                    topic
                );


            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "quiz-topic-card";


            card.dataset.topicId =
                topicId;


            /*
                Store subject ID too.

                This is useful for debugging and
                confirms the relationship between
                the topic and selected subject.
            */

            card.dataset.subjectId =
                quizSafeString(
                    topic.subjectId
                );


            card.setAttribute(
                "aria-label",
                `Select ${topicName}`
            );


            card.setAttribute(
                "aria-pressed",
                "false"
            );


            card.innerHTML = `

                <span class="quiz-topic-icon">

                    <i class="fa-solid ${topicIcon}"></i>

                </span>


                <span class="quiz-topic-content">

                    <span class="quiz-topic-number">
                        TOPIC ${index + 1}
                    </span>

                    <span class="quiz-topic-name">
                        ${escapeQuizHTML(topicName)}
                    </span>

                    ${
                        topicDescription
                            ? `
                                <span class="quiz-topic-description">
                                    ${escapeQuizHTML(topicDescription)}
                                </span>
                              `
                            : ""
                    }

                </span>


                <span class="quiz-topic-arrow">

                    <i class="fa-solid fa-chevron-right"></i>

                </span>

            `;


            /*
                Topic selection.
            */

            card.addEventListener(
                "click",
                () => {

                    handleQuizTopicSelection(
                        topicId
                    );

                }
            );


            quizTopicsGrid.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   FIND TOPIC
   ========================================================= */

function findQuizTopicById(
    topicId
) {

    return availableQuizTopics.find(
        (topic) =>
            topic.$id === topicId
    );
}


/* =========================================================
   SELECT TOPIC
   ========================================================= */

function handleQuizTopicSelection(
    topicId
) {

    const topic =
        findQuizTopicById(
            topicId
        );


    if (!topic) {

        showQuizMessage(
            "The selected topic could not be found.",
            "error"
        );

        return;
    }


    /*
        Make sure the topic belongs to
        the currently selected subject.

        This is an additional safety check
        even though Appwrite already filtered
        the query using subjectId.
    */

    if (
        selectedQuizSubject &&
        topic.subjectId !==
        selectedQuizSubject.$id
    ) {

        console.error(
            "Topic/subject mismatch:",
            {
                topicSubjectId:
                    topic.subjectId,

                selectedSubjectId:
                    selectedQuizSubject.$id
            }
        );


        showQuizMessage(
            "This topic does not belong to the selected subject.",
            "error"
        );

        return;
    }


    /*
        Store selected topic.
    */

    selectedQuizTopic =
        topic;


    /*
        Update topic card states.
    */

    if (quizTopicsGrid) {

        const cards =
            quizTopicsGrid.querySelectorAll(
                ".quiz-topic-card"
            );


        cards.forEach(
            (card) => {

                const isSelected =
                    card.dataset.topicId ===
                    topicId;


                card.classList.toggle(
                    "selected",
                    isSelected
                );


                card.classList.toggle(
                    "active",
                    isSelected
                );


                card.classList.toggle(
                    "is-selected",
                    isSelected
                );


                card.setAttribute(
                    "aria-pressed",
                    String(isSelected)
                );
            }
        );
    }


    /*
        Render selected topic.
    */

    renderSelectedQuizTopic(
        topic
    );


    /*
        Show configuration.
    */

    showQuizElement(
        quizConfiguration
    );


    /*
        Reset the Start Quiz button.

        The button will remain disabled until
        the question-loading phase confirms
        that enough questions are available.
    */

    disableStartButton();


    /*
        Clear any previous message.
    */

    hideQuizMessage();


    /*
        Read current configuration values.
    */

    readQuizConfiguration();


    /*
        The configuration section is now visible.

        Question availability will be checked
        by the next phase.
    */
}


/* =========================================================
   RENDER SELECTED TOPIC
   ========================================================= */

function renderSelectedQuizTopic(
    topic
) {

    if (!selectedQuizTopicElement) {
        return;
    }


    const topicName =
        getQuizTopicName(
            topic
        );


    const topicDescription =
        getQuizTopicDescription(
            topic
        );


    const icon =
        getQuizTopicIcon(
            topic
        );


    const subjectName =
        getQuizTopicSubjectName(
            topic
        );


    selectedQuizTopicElement.innerHTML = `

        <span class="selected-quiz-topic-icon">

            <i class="fa-solid ${icon}"></i>

        </span>


        <span class="selected-quiz-topic-content">

            <span class="selected-quiz-topic-label">
                SELECTED TOPIC
            </span>

            <strong>
                ${escapeQuizHTML(topicName)}
            </strong>

            ${
                subjectName
                    ? `
                        <small>
                            ${escapeQuizHTML(subjectName)}
                        </small>
                      `
                    : ""
            }

            ${
                topicDescription
                    ? `
                        <em>
                            ${escapeQuizHTML(topicDescription)}
                        </em>
                      `
                    : ""
            }

        </span>


        <span class="selected-quiz-topic-check">

            <i class="fa-solid fa-check"></i>

        </span>

    `;
}


/* =========================================================
   GET TOPIC SUBJECT NAME
   ========================================================= */

function getQuizTopicSubjectName(
    topic
) {

    /*
        First use the selected subject because
        it is already available and guaranteed
        to be the current subject.
    */

    if (
        selectedQuizSubject
    ) {

        return (
            quizSafeString(
                selectedQuizSubject.name
            )
        );
    }


    /*
        Fallback if selected subject is
        somehow unavailable.
    */

    return "";
}


/* =========================================================
   RESET TOPIC SELECTION
   ========================================================= */

function resetQuizTopicSelection() {

    selectedQuizTopic = null;

    availableQuizTopics = [];


    if (quizTopicsGrid) {

        quizTopicsGrid.innerHTML = "";
    }


    if (selectedQuizTopicElement) {

        selectedQuizTopicElement.innerHTML = "";
    }


    hideQuizElement(
        quizConfiguration
    );


    disableStartButton();
}


/* =========================================================
   TOPIC SECTION SCROLL
   ========================================================= */

function scrollToQuizTopics() {

    if (!quizTopicSection) {
        return;
    }


    /*
        Small delay allows the browser to
        finish rendering the section first.
    */

    window.setTimeout(
        () => {

            quizTopicSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        80
    );
}


/* =========================================================
   CONFIGURATION CHANGE HANDLERS
   ========================================================= */

/*
    Question count changed.
*/
if (quizQuestionCountElement) {

    quizQuestionCountElement.addEventListener(
        "change",
        () => {

            readQuizConfiguration();

            /*
                The next phase will verify whether
                enough questions are available.
            */

            if (
                selectedQuizTopic
            ) {

                disableStartButton();
            }
        }
    );
}


/*
    Time per question changed.
*/
if (quizTimePerQuestionElement) {

    quizTimePerQuestionElement.addEventListener(
        "change",
        () => {

            readQuizConfiguration();

        }
    );
}


/* =========================================================
   TOPIC DEBUG INFORMATION
   ========================================================= */

/*
    Useful during development.

    This does not affect the user interface.
*/
function logSelectedQuizTopic() {

    if (!selectedQuizTopic) {
        return;
    }


    console.log(
        "Selected quiz topic:",
        {
            id:
                selectedQuizTopic.$id,

            name:
                getQuizTopicName(
                    selectedQuizTopic
                ),

            subjectId:
                selectedQuizTopic.subjectId,

            selectedSubjectId:
                selectedQuizSubject?.$id || null
        }
    );
}



/* =========================================================
   PHASE 4
   LOAD & PREPARE QUIZ QUESTIONS
   ========================================================= */

/* =========================================================
   QUESTION HELPERS
   ========================================================= */

/*
 * Normalize the correct answer so the quiz can consistently
 * work with A, B, C or D.
 */
function normalizeQuizCorrectAnswer(value) {

    if (value === null || value === undefined) {
        return "";
    }

    const answer =
        String(value)
            .trim()
            .toUpperCase();

    if (
        answer === "A" ||
        answer === "B" ||
        answer === "C" ||
        answer === "D"
    ) {
        return answer;
    }

    if (
        answer === "OPTIONA" ||
        answer === "OPTION A"
    ) {
        return "A";
    }

    if (
        answer === "OPTIONB" ||
        answer === "OPTION B"
    ) {
        return "B";
    }

    if (
        answer === "OPTIONC" ||
        answer === "OPTION C"
    ) {
        return "C";
    }

    if (
        answer === "OPTIOND" ||
        answer === "OPTION D"
    ) {
        return "D";
    }

    return "";
}


/*
 * Check whether a question contains everything required
 * by the current A-D quiz interface.
 */
function isValidQuizQuestion(question) {

    if (!question || !question.$id) {
        return false;
    }

    const questionText =
        quizSafeString(question.question).trim();

    const optionA =
        quizSafeString(question.optionA).trim();

    const optionB =
        quizSafeString(question.optionB).trim();

    const optionC =
        quizSafeString(question.optionC).trim();

    const optionD =
        quizSafeString(question.optionD).trim();

    const correctAnswer =
        normalizeQuizCorrectAnswer(
            question.correctAnswer
        );

    if (!questionText) {
        return false;
    }

    if (!optionA || !optionB || !optionC || !optionD) {
        return false;
    }

    if (!correctAnswer) {
        return false;
    }

    return true;
}


/*
 * Convert an Appwrite question row into the clean structure
 * used by the quiz.
 */
function normalizeQuizQuestion(question) {

    return {

        $id: question.$id,

        subjectId:
            quizSafeString(
                question.subjectId
            ),

        topicId:
            quizSafeString(
                question.topicId
            ),

        question:
            quizSafeString(
                question.question
            ),

        optionA:
            quizSafeString(
                question.optionA
            ),

        optionB:
            quizSafeString(
                question.optionB
            ),

        optionC:
            quizSafeString(
                question.optionC
            ),

        optionD:
            quizSafeString(
                question.optionD
            ),

        correctAnswer:
            normalizeQuizCorrectAnswer(
                question.correctAnswer
            ),

        explanation:
            quizSafeString(
                question.explanation
            ),

        difficulty:
            quizSafeString(
                question.difficulty
            ),

        questionType:
            quizSafeString(
                question.questionType
            ),

        status:
            quizSafeString(
                question.status
            )
    };
}


/* =========================================================
   SHUFFLE QUESTIONS
   ========================================================= */

function shuffleQuizQuestions(questions) {

    const shuffled = [
        ...questions
    ];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[randomIndex]
        ] = [
            shuffled[randomIndex],
            shuffled[i]
        ];
    }

    return shuffled;
}


/* =========================================================
   LOAD QUESTIONS FOR TOPIC
   ========================================================= */

async function loadQuestionsForTopic(topicId) {

    availableQuestions = [];

    quizQuestions = [];

    quizAnswers = [];

    currentQuestionIndex = 0;

    disableStartButton(true);

    hideQuizMessage();

    if (
        !topicId ||
        !selectedQuizSubject ||
        !selectedQuizSubject.$id
    ) {

        disableStartButton(false);

        showQuizMessage(
            "Please select a valid subject and topic.",
            "error"
        );

        return;
    }

    setQuizLoading(
        quizTopicsLoading,
        false
    );

    try {

        const questions =
            await getAllQuizRows(
                QUESTIONS_TABLE_ID,
                [

                    Query.equal(
                        "topicId",
                        topicId
                    ),

                    Query.equal(
                        "subjectId",
                        selectedQuizSubject.$id
                    ),

                    Query.equal(
                        "status",
                        "active"
                    )
                ]
            );


        const validQuestions =
            questions
                .filter(
                    isValidQuizQuestion
                )
                .map(
                    normalizeQuizQuestion
                );


        availableQuestions =
            shuffleQuizQuestions(
                validQuestions
            );


        const requestedCount =
            quizQuestionCount;


        /*
         * Make sure there are enough questions
         * for the selected quiz length.
         */
        if (
            availableQuestions.length <
            requestedCount
        ) {

            disableStartButton(false);

            showQuizMessage(
                `This topic currently has only ${availableQuestions.length} valid question${availableQuestions.length === 1 ? "" : "s"}. You selected ${requestedCount}. Please select a smaller question count or choose another topic.`,
                "warning"
            );

            return;
        }


        /*
         * Keep only the number of questions selected
         * by the student.
         */
        quizQuestions =
            availableQuestions.slice(
                0,
                requestedCount
            );


        /*
         * Prepare an empty answer slot for every question.
         */
        quizAnswers =
            quizQuestions.map(
                () => null
            );


        /*
         * The quiz is now ready to start.
         */
        enableStartButton();

    } catch (error) {

        console.error(
            "Error loading quiz questions:",
            error
        );

        availableQuestions = [];

        quizQuestions = [];

        quizAnswers = [];

        disableStartButton(false);

        showQuizMessage(
            "Unable to load questions for this topic. Please try again.",
            "error"
        );
    }
}


/* =========================================================
   QUESTION COUNT CHANGE
   ========================================================= */

/*
 * Re-check the number of available questions whenever
 * the selected question count changes.
 */
async function refreshQuizQuestionSelection() {

    if (
        !selectedQuizTopic ||
        !selectedQuizTopic.$id
    ) {
        disableStartButton(false);
        return;
    }

    readQuizConfiguration();

    await loadQuestionsForTopic(
        selectedQuizTopic.$id
    );
}


/* =========================================================
   TOPIC GRID LISTENER
   ========================================================= */

/*
 * Phase 3 handles topic selection itself.
 *
 * This delegated listener waits for that selection to
 * complete, then loads the questions belonging to the
 * selected topic.
 */
if (quizTopicsGrid) {

    quizTopicsGrid.addEventListener(
        "click",
        async function (event) {

            const topicCard =
                event.target.closest(
                    ".quiz-topic-card"
                );

            if (!topicCard) {
                return;
            }

            const topicId =
                topicCard.dataset.topicId;

            if (!topicId) {
                return;
            }

            /*
             * Allow Phase 3's topic-selection handler
             * to finish first.
             */
            await new Promise(
                resolve => setTimeout(
                    resolve,
                    0
                )
            );

            if (
                selectedQuizTopic &&
                selectedQuizTopic.$id === topicId
            ) {

                await loadQuestionsForTopic(
                    topicId
                );
            }

        }
    );
}


/* =========================================================
   QUESTION COUNT LISTENER
   ========================================================= */

if (quizQuestionCountSelect) {

    quizQuestionCountSelect.addEventListener(
        "change",
        async function () {

            readQuizConfiguration();

            if (
                selectedQuizTopic &&
                selectedQuizTopic.$id
            ) {

                await refreshQuizQuestionSelection();
            }

        }
    );
}


/* =========================================================
   INITIAL QUESTION STATE
   ========================================================= */

availableQuestions = [];

quizQuestions = [];

quizAnswers = [];

currentQuestionIndex = 0;

disableStartButton(false);

/* =========================================================
   PHASE 5
   START QUIZ & RENDER FIRST QUESTION
   ========================================================= */


/* =========================================================
   RESET ACTIVE QUIZ STATE
   ========================================================= */

function resetActiveQuizState() {

    stopQuizTimer();

    currentQuestionIndex = 0;

    quizAnswers =
        quizQuestions.map(
            () => null
        );

    quizTimeRemaining =
        quizTimePerQuestion;

    quizSubmitting = false;

    currentQuizAttemptId = null;

    currentQuizResult = null;

    quizStartedAt = null;

    quizCompletedAt = null;

    resetQuizTimerVisual();

    if (quizQuestion) {
        quizQuestion.innerHTML = "";
    }

    if (quizOptions) {
        quizOptions.innerHTML = "";
    }

    if (quizQuestionCounter) {
        quizQuestionCounter.textContent =
            `Question 1 of ${quizQuestions.length}`;
    }

    if (quizProgressPercent) {
        quizProgressPercent.textContent =
            "0%";
    }

    if (quizProgressBar) {
        quizProgressBar.style.width =
            "0%";
    }
}


/* =========================================================
   START QUIZ VALIDATION
   ========================================================= */

function canStartQuiz() {

    if (
        !selectedQuizSubject ||
        !selectedQuizSubject.$id
    ) {
        showQuizMessage(
            "Please select a subject first.",
            "warning"
        );

        return false;
    }


    if (
        !selectedQuizTopic ||
        !selectedQuizTopic.$id
    ) {
        showQuizMessage(
            "Please select a topic first.",
            "warning"
        );

        return false;
    }


    readQuizConfiguration();


    if (
        !quizQuestionCount ||
        quizQuestionCount < 1
    ) {
        showQuizMessage(
            "Please select the number of questions.",
            "warning"
        );

        return false;
    }


    if (
        !quizTimePerQuestion ||
        quizTimePerQuestion < 1
    ) {
        showQuizMessage(
            "Please select the time allowed for each question.",
            "warning"
        );

        return false;
    }


    if (
        !quizQuestions ||
        quizQuestions.length <
        quizQuestionCount
    ) {
        showQuizMessage(
            "There are not enough questions available for this quiz.",
            "warning"
        );

        return false;
    }


    return true;
}


/* =========================================================
   START QUIZ
   ========================================================= */

async function startQuiz() {

    if (quizSubmitting) {
        return;
    }


    if (!canStartQuiz()) {
        return;
    }


    quizSubmitting = true;

    disableStartButton(true);

    hideQuizMessage();


    try {

        /*
         * Make sure the question set exactly matches
         * the current configuration.
         */
        if (
            quizQuestions.length !==
            quizQuestionCount
        ) {

            await loadQuestionsForTopic(
                selectedQuizTopic.$id
            );
        }


        if (
            quizQuestions.length <
            quizQuestionCount
        ) {

            quizSubmitting = false;

            disableStartButton(false);

            return;
        }


        /*
         * Reset all active quiz state.
         */
        resetActiveQuizState();


        /*
         * Create a fresh answer array.
         */
        quizAnswers =
            quizQuestions.map(
                () => null
            );
            
            
        /*
 * Record the exact time the quiz starts.
 */
quizStartedAt = new Date();

quizCompletedAt = null;

console.log(
    "Quiz started at:",
    quizStartedAt.toISOString()
);
        /*
         * Show the active quiz interface.
         */
        showActiveQuiz();


        /*
         * Update the quiz title.
         */
        updateActiveQuizTitle();


        /*
         * Render the first question.
         */
        renderCurrentQuizQuestion();


        /*
         * Start the timer.
         */
        startQuizTimer();


        /*
         * Enable navigation buttons.
         */
        enableQuizNavigation();


        quizSubmitting = false;

    } catch (error) {

        console.error(
            "Error starting quiz:",
            error
        );

        quizSubmitting = false;

        disableStartButton(false);

        showQuizSetup();

        showQuizMessage(
            "Unable to start the quiz. Please try again.",
            "error"
        );
    }
}


/* =========================================================
   ACTIVE QUIZ TITLE
   ========================================================= */

function updateActiveQuizTitle() {

    if (!activeQuizTitle) {
        return;
    }


    const subjectName =
        selectedQuizSubject
            ? quizSafeString(
                selectedQuizSubject.name
            )
            : "Quiz";


    const topicName =
        selectedQuizTopic
            ? getQuizTopicName(
                selectedQuizTopic
            )
            : "";


    if (topicName) {

        activeQuizTitle.textContent =
            `${subjectName} — ${topicName}`;

    } else {

        activeQuizTitle.textContent =
            subjectName;
    }
}


/* =========================================================
   GET CURRENT QUESTION
   ========================================================= */

function getCurrentQuizQuestion() {

    if (
        !quizQuestions ||
        !quizQuestions.length
    ) {
        return null;
    }


    return quizQuestions[
        currentQuestionIndex
    ] || null;
}


/* =========================================================
   RENDER CURRENT QUESTION
   ========================================================= */

function renderCurrentQuizQuestion() {

    const question =
        getCurrentQuizQuestion();


    if (!question) {

        console.error(
            "No current quiz question found."
        );

        return;
    }


    /*
     * Question number.
     */
    const questionNumber =
        currentQuestionIndex + 1;


    const totalQuestions =
        quizQuestions.length;


    if (quizQuestionCounter) {

        quizQuestionCounter.textContent =
            `Question ${questionNumber} of ${totalQuestions}`;
    }


    /*
     * Progress percentage.
     */
    const progress =
        Math.round(
            (
                questionNumber /
                totalQuestions
            ) * 100
        );


    if (quizProgressPercent) {

        quizProgressPercent.textContent =
            `${progress}%`;
    }


    if (quizProgressBar) {

        quizProgressBar.style.width =
            `${progress}%`;
    }


    /*
     * Render question text and rich content.
     */
    if (quizQuestion) {

        quizQuestion.innerHTML = `
            <div class="quiz-question-number">
                Question ${questionNumber}
            </div>

            <div class="quiz-question-text"></div>
        `;

        const questionTextElement =
            quizQuestion.querySelector(
                ".quiz-question-text"
            );

        renderQuizRichContent(
            questionTextElement,
            question.question
        );
    }


    /*
     * Render answer options.
     */
    renderQuizOptions(
        question
    );


    /*
     * Restore previously selected answer.
     */
    restoreQuizAnswer(
        currentQuestionIndex
    );


    /*
     * Update navigation state.
     */
    updateQuizNavigation();


    /*
     * Reset timer for this question.
     */
    quizTimeRemaining =
        quizTimePerQuestion;

    resetQuizTimerVisual();
}
/* =========================================================
   RENDER OPTIONS
   ========================================================= */

function renderQuizOptions(question) {

    if (!quizOptions) {
        return;
    }


    const options = [

        {
            key: "A",
            text: question.optionA
        },

        {
            key: "B",
            text: question.optionB
        },

        {
            key: "C",
            text: question.optionC
        },

        {
            key: "D",
            text: question.optionD
        }

    ];


    quizOptions.innerHTML =
        options.map(
            option => `

                <button
                    type="button"
                    class="quiz-option"
                    data-option="${option.key}"
                    aria-label="Option ${option.key}"
                >

                    <span class="quiz-option-letter">
                        ${option.key}
                    </span>

                    <span class="quiz-option-text">
                        ${escapeQuizHTML(
                            option.text
                        )}
                    </span>

                </button>

            `
        ).join("");


    /*
     * Add option listeners.
     */
    const optionButtons =
        quizOptions.querySelectorAll(
            ".quiz-option"
        );


    optionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    selectQuizAnswer(
                        button.dataset.option
                    );

                }
            );

        }
    );
}


/* =========================================================
   SELECT ANSWER
   ========================================================= */

function selectQuizAnswer(answer) {

    const normalizedAnswer =
        normalizeQuizCorrectAnswer(
            answer
        );


    if (
        !normalizedAnswer ||
        !quizQuestions[currentQuestionIndex]
    ) {
        return;
    }


    /*
     * Store answer.
     */
    quizAnswers[
        currentQuestionIndex
    ] = normalizedAnswer;


    /*
     * Update visual selection.
     */
    if (quizOptions) {

        const buttons =
            quizOptions.querySelectorAll(
                ".quiz-option"
            );


        buttons.forEach(
            button => {

                const buttonAnswer =
                    button.dataset.option;


                button.classList.toggle(
                    "selected",
                    buttonAnswer ===
                    normalizedAnswer
                );


                button.setAttribute(
                    "aria-pressed",
                    buttonAnswer ===
                    normalizedAnswer
                        ? "true"
                        : "false"
                );

            }
        );
    }


    /*
     * Enable navigation after answering.
     */
    updateQuizNavigation();
}


/* =========================================================
   RESTORE ANSWER
   ========================================================= */

function restoreQuizAnswer(questionIndex) {

    if (
        !quizOptions ||
        questionIndex < 0 ||
        questionIndex >= quizAnswers.length
    ) {
        return;
    }


    const savedAnswer =
        quizAnswers[
            questionIndex
        ];


    if (!savedAnswer) {
        return;
    }


    const button =
        quizOptions.querySelector(
            `.quiz-option[data-option="${savedAnswer}"]`
        );


    if (!button) {
        return;
    }


    button.classList.add(
        "selected"
    );


    button.setAttribute(
        "aria-pressed",
        "true"
    );
}


/* =========================================================
   NAVIGATION STATE
   ========================================================= */

function updateQuizNavigation() {

    const isFirstQuestion =
        currentQuestionIndex === 0;


    const isLastQuestion =
        currentQuestionIndex ===
        quizQuestions.length - 1;


    /*
     * Previous button
     */

    if (previousQuestionBtn) {

        previousQuestionBtn.disabled =
            isFirstQuestion;

    }


    /*
     * Next button
     */

    if (nextQuestionBtn) {

        nextQuestionBtn.disabled =
            isLastQuestion;

        nextQuestionBtn.hidden =
            isLastQuestion;

    }


    /*
     * Submit button
     */

    if (submitQuizBtn) {

        submitQuizBtn.hidden =
            !isLastQuestion;

        submitQuizBtn.disabled =
            !isLastQuestion ||
            quizSubmitting;

    }

}


/* =========================================================
   NEXT QUESTION
   ========================================================= */

function goToNextQuizQuestion() {

    if (
        currentQuestionIndex >=
        quizQuestions.length - 1
    ) {
        updateQuizNavigation();
        return;
    }


    currentQuestionIndex += 1;

    renderCurrentQuizQuestion();

    startQuizTimer();
}


/* =========================================================
   PREVIOUS QUESTION
   ========================================================= */

function goToPreviousQuizQuestion() {

    if (
        currentQuestionIndex <= 0
    ) {
        updateQuizNavigation();
        return;
    }


    currentQuestionIndex -= 1;

    renderCurrentQuizQuestion();

    startQuizTimer();
}


/* =========================================================
   BUTTON LISTENERS
   ========================================================= */

if (startQuizBtn) {

    startQuizBtn.addEventListener(
        "click",
        startQuiz
    );
}


if (nextQuestionBtn) {

    nextQuestionBtn.addEventListener(
        "click",
        goToNextQuizQuestion
    );
}


if (previousQuestionBtn) {

    previousQuestionBtn.addEventListener(
        "click",
        goToPreviousQuizQuestion
    );
}


/* =========================================================
   INITIAL ACTIVE QUIZ STATE
   ========================================================= */

if (activeQuiz) {
    hideQuizElement(activeQuiz);
}

if (quizResult) {
    hideQuizElement(quizResult);
}

if (quizReview) {
    hideQuizElement(quizReview);
}




/* =========================================================
   PHASE 6
   QUIZ TIMER & AUTOMATIC TIME HANDLING
   ========================================================= */


/* =========================================================
   START QUIZ TIMER
   ========================================================= */

function startQuizTimer() {

    /*
     * Always clear an existing timer before starting
     * another one. This prevents multiple countdowns
     * running at the same time.
     */
    stopQuizTimer();


    if (
        !quizQuestions ||
        !quizQuestions.length
    ) {
        return;
    }


    quizTimeRemaining =
        quizTimePerQuestion;


    updateQuizTimerDisplay();


    quizTimerInterval =
        setInterval(
            function () {

                quizTimeRemaining -= 1;


                if (
                    quizTimeRemaining <= 0
                ) {

                    quizTimeRemaining = 0;

                    updateQuizTimerDisplay();

                    stopQuizTimer();

                    handleQuizQuestionTimeout();

                    return;
                }


                updateQuizTimerDisplay();

            },
            1000
        );
}


/* =========================================================
   STOP QUIZ TIMER
   ========================================================= */

function stopQuizTimer() {

    if (quizTimerInterval !== null) {

        clearInterval(
            quizTimerInterval
        );

        quizTimerInterval = null;
    }
}


/* =========================================================
   UPDATE TIMER DISPLAY
   ========================================================= */

function updateQuizTimerDisplay() {

    if (!quizTimerValue) {
        return;
    }


    const totalSeconds =
        Math.max(
            0,
            quizTimeRemaining
        );


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    const formattedMinutes =
        String(minutes).padStart(
            2,
            "0"
        );


    const formattedSeconds =
        String(seconds).padStart(
            2,
            "0"
        );


    quizTimerValue.textContent =
        `${formattedMinutes}:${formattedSeconds}`;


    updateQuizTimerState();
}


/* =========================================================
   TIMER VISUAL STATE
   ========================================================= */

function updateQuizTimerState() {

    if (!quizTimer) {
        return;
    }


    const warningThreshold =
        Math.min(
            10,
            Math.max(
                5,
                Math.floor(
                    quizTimePerQuestion * 0.25
                )
            )
        );


    const dangerThreshold =
        Math.min(
            5,
            Math.max(
                3,
                Math.floor(
                    quizTimePerQuestion * 0.10
                )
            )
        );


    quizTimer.classList.remove(
        "warning",
        "danger"
    );


    if (
        quizTimeRemaining <=
        dangerThreshold
    ) {

        quizTimer.classList.add(
            "danger"
        );

    } else if (
        quizTimeRemaining <=
        warningThreshold
    ) {

        quizTimer.classList.add(
            "warning"
        );
    }
}


/* =========================================================
   RESET TIMER VISUAL
   ========================================================= */

function resetQuizTimerVisual() {

    if (quizTimerValue) {

        const totalSeconds =
            Math.max(
                0,
                quizTimePerQuestion
            );


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const seconds =
            totalSeconds % 60;


        quizTimerValue.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }


    if (quizTimer) {

        quizTimer.classList.remove(
            "warning",
            "danger"
        );
    }
}


/* =========================================================
   HANDLE QUESTION TIMEOUT
   ========================================================= */

function handleQuizQuestionTimeout() {

    /*
     * Do not process timeout if the quiz has already
     * been submitted.
     */
    if (quizSubmitting) {
        return;
    }


    /*
     * If there is another question, automatically move
     * to it. The current answer remains null if the
     * student did not select an option.
     */
    if (
        currentQuestionIndex <
        quizQuestions.length - 1
    ) {

        currentQuestionIndex += 1;

        renderCurrentQuizQuestion();

        startQuizTimer();

        return;
    }


    /*
     * The last question has timed out.
     *
     * At this point the quiz is complete and the final
     * submission process will be handled by the next phase.
     */
    handleQuizTimeExpiredOnLastQuestion();
}


/* =========================================================
   LAST QUESTION TIMEOUT
   ========================================================= */

function handleQuizTimeExpiredOnLastQuestion() {

    if (quizSubmitting) {
        return;
    }


    stopQuizTimer();


    quizTimeRemaining = 0;


    updateQuizTimerDisplay();


    /*
     * Automatically submit the quiz.
     */

    submitQuiz(true);

}




/* =========================================================
   PREVENT TIMER FROM RUNNING OUTSIDE ACTIVE QUIZ
   ========================================================= */

function isQuizCurrentlyActive() {

    if (!activeQuiz) {
        return false;
    }


    return (
        !activeQuiz.hidden &&
        quizQuestions.length > 0
    );
}


/* =========================================================
   TIMER SAFETY CHECK
   ========================================================= */

function quizTimerSafetyCheck() {

    if (
        !isQuizCurrentlyActive() &&
        quizTimerInterval !== null
    ) {

        stopQuizTimer();
    }
}


/* =========================================================
   VISIBILITY CHANGE HANDLER
   ========================================================= */

/*
 * If the student switches tabs or minimizes the browser,
 * JavaScript timers may be throttled by the browser.
 *
 * We therefore recalculate the display whenever the page
 * becomes visible again.
 */
document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            if (
                isQuizCurrentlyActive()
            ) {

                updateQuizTimerDisplay();
            }
        }
    }
);


/* =========================================================
   WINDOW UNLOAD SAFETY
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        stopQuizTimer();

    }
);


/* =========================================================
   TIMER INITIAL STATE
   ========================================================= */

stopQuizTimer();

quizTimeRemaining =
    quizTimePerQuestion;

resetQuizTimerVisual();




/* =========================================================
   PHASE 7
   QUIZ SUBMISSION AND SCORING
========================================================= */


/* =========================================================
   SUBMIT QUIZ
========================================================= */

/* =========================================================
   SUBMIT QUIZ
========================================================= */

async function submitQuiz(
    autoSubmitted = false
) {

    if (quizSubmitting) {
        return;
    }


    if (
        !quizQuestions ||
        !quizQuestions.length
    ) {

        showQuizMessage(
            "There are no questions to submit.",
            "warning"
        );

        return;
    }


    quizSubmitting = true;


    /*
     * Stop the timer immediately.
     */
    stopQuizTimer();


    if (submitQuizBtn) {

        submitQuizBtn.disabled =
            true;

    }


    try {

        /* =====================================================
           CALCULATE SCORE
        ===================================================== */

        let correctCount = 0;

        let wrongCount = 0;

        let unansweredCount = 0;


        for (
            let index = 0;
            index < quizQuestions.length;
            index++
        ) {

            const question =
                quizQuestions[index];


            const userAnswer =
                quizAnswers[index];


            const correctAnswer =
                normalizeQuizCorrectAnswer(
                    question.correctAnswer
                );


            if (!userAnswer) {

                unansweredCount++;

            }

            else if (
                userAnswer ===
                correctAnswer
            ) {

                correctCount++;

            }

            else {

                wrongCount++;

            }

        }


        const totalQuestions =
            quizQuestions.length;


        const calculatedScore =
            totalQuestions > 0
                ? Math.round(
                    (
                        correctCount /
                        totalQuestions
                    ) * 100
                )
                : 0;


        const calculatedPassed =
            calculatedScore >=
            quizPassMark;


        /*
         * Store the result in global state.
         *
         * saveQuizAttempt() will use this.
         */
        currentQuizResult = {

            score:
                calculatedScore,

            correctCount:
                correctCount,

            wrongCount:
                wrongCount,

            unansweredCount:
                unansweredCount,

            totalQuestions:
                totalQuestions,

            passed:
                calculatedPassed,

            autoSubmitted:
                autoSubmitted
        };


        console.log(
            "QUIZ RESULT:",
            currentQuizResult
        );


        /* =====================================================
           SAVE QUIZ ATTEMPT
        ===================================================== */

        try {

            await saveQuizAttempt();


            console.log(
                "Quiz attempt created:",
                currentQuizAttemptId
            );


        }

        catch (attemptError) {

            console.error(
                "QUIZ ATTEMPT SAVE FAILED:",
                attemptError
            );


            /*
             * We stop here because quiz_answers
             * require an attemptId.
             */
            throw new Error(
                "Your quiz result could not be saved. Please try submitting again."
            );
        }


        /* =====================================================
           SAVE INDIVIDUAL ANSWERS
        ===================================================== */

        try {

            await saveQuizAnswers();


            console.log(
                "All quiz answers processed successfully."
            );

        }

        catch (answerError) {

            console.error(
                "QUIZ ANSWERS SAVE FAILED:",
                answerError
            );

            /*
             * The attempt itself is already saved.
             *
             * We still allow the student to see
             * the result.
             */
        }


        /* =====================================================
           UPDATE RESULT HTML
        ===================================================== */

        if (quizResultScore) {

            quizResultScore.textContent =
                `${calculatedScore}%`;

        }


        if (quizCorrectCount) {

            quizCorrectCount.textContent =
                correctCount;

        }


        if (quizWrongCount) {

            quizWrongCount.textContent =
                wrongCount;

        }


        if (quizUnansweredCount) {

            quizUnansweredCount.textContent =
                unansweredCount;

        }


        if (quizResultTitle) {

            quizResultTitle.textContent =
                calculatedPassed
                    ? "Well Done!"
                    : "Keep Practising!";

        }


        if (quizResultMessage) {

            if (autoSubmitted) {

                quizResultMessage.textContent =
                    calculatedPassed
                        ? `Time expired. You scored ${calculatedScore}% and passed the quiz.`
                        : `Time expired. You scored ${calculatedScore}%. Keep practising and try again.`;

            }

            else {

                quizResultMessage.textContent =
                    calculatedPassed
                        ? `You scored ${calculatedScore}% and passed the quiz.`
                        : `You scored ${calculatedScore}%. Keep practising and try again.`;

            }

        }


        /* =====================================================
           HIDE ACTIVE QUIZ
        ===================================================== */

        if (activeQuiz) {

            activeQuiz.hidden =
                true;

        }


        if (quizReview) {

            quizReview.hidden =
                true;

        }


        if (quizResult) {

            quizResult.hidden =
                false;


            quizResult.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        console.log(
            "QUIZ SUBMISSION COMPLETED SUCCESSFULLY"
        );

    }

    catch (error) {

        console.error(
            "Quiz submission error:",
            error
        );


        showQuizMessage(
            error.message ||
            "Unable to submit the quiz. Please try again.",
            "danger"
        );


        if (submitQuizBtn) {

            submitQuizBtn.disabled =
                false;

        }

    }

    finally {

        quizSubmitting =
            false;

    }

}


/* =========================================================
   SAVE QUIZ ATTEMPT
========================================================= */

/* =========================================================
   SAVE QUIZ ATTEMPT
========================================================= */

async function saveQuizAttempt() {

    if (!currentQuizUser) {

        throw new Error(
            "Current quiz user is missing."
        );

    }


    if (!currentQuizUser.$id) {

        throw new Error(
            "Current student ID is missing."
        );

    }


    if (!selectedQuizSubject) {

        throw new Error(
            "Selected subject is missing."
        );

    }


    if (!selectedQuizTopic) {

        throw new Error(
            "Selected topic is missing."
        );

    }


    if (!currentQuizResult) {

        throw new Error(
            "Quiz result is missing."
        );

    }


    /*
     * Make sure we have a start time.
     */
    if (!quizStartedAt) {

        throw new Error(
            "Quiz start time is missing."
        );

    }


    /*
     * Record completion time.
     */
    quizCompletedAt =
        new Date();


    /*
     * Calculate total time allowed.
     *
     * quizTimePerQuestion is in seconds.
     */
    const totalQuestions =
        quizQuestions.length;


    const timeAllowed =
        totalQuestions *
        quizTimePerQuestion;


    /*
     * Calculate actual time used.
     *
     * This is measured from the moment the
     * quiz started until submission.
     */
    let timeUsed =
        Math.floor(
            (
                quizCompletedAt.getTime() -
                quizStartedAt.getTime()
            ) / 1000
        );


    /*
     * Prevent timeUsed from exceeding
     * the total allowed quiz time.
     */
    timeUsed =
        Math.max(
            0,
            Math.min(
                timeUsed,
                timeAllowed
            )
        );


    /*
     * Determine percentage.
     *
     * Your score is already calculated
     * as a percentage.
     */
    const percentage =
        Number(
            currentQuizResult.score
        ) || 0;


    /*
     * Determine status.
     *
     * Example:
     * passed
     * failed
     */
    const status =
        currentQuizResult.passed
            ? "passed"
            : "failed";


    /*
     * Data must match the exact
     * quiz_attempts table columns.
     */
    const attemptData = {

        studentId:
            currentQuizUser.$id,

        subjectId:
            selectedQuizSubject.$id,

        topicId:
            selectedQuizTopic.$id,

        totalQuestions:
            totalQuestions,

        correctAnswers:
            currentQuizResult.correctCount,

        wrongAnswers:
            currentQuizResult.wrongCount,

        unanswered:
            currentQuizResult.unansweredCount,

        score:
            currentQuizResult.score,

        timeAllowed:
            timeAllowed,

        percentage:
            percentage,

        timeUsed:
            timeUsed,

        status:
            status,

        startedAt:
            quizStartedAt.toISOString(),

        completedAt:
            quizCompletedAt.toISOString()
    };


    console.log(
        "Saving quiz attempt:",
        attemptData
    );


    try {

        const response =
            await tablesDB.createRow(
                DATABASE_ID,
                QUIZ_ATTEMPTS_TABLE_ID,
                ID.unique(),
                attemptData
            );


        /*
         * Store the newly-created
         * attempt ID.
         */
        currentQuizAttemptId =
            response.$id;


        console.log(
            "Quiz attempt saved successfully:",
            currentQuizAttemptId
        );


        return response;

    }

    catch (error) {

        console.error(
            "Unable to save quiz attempt:",
            error
        );


        throw error;
    }
}


/* =========================================================
   SAVE QUIZ ANSWERS
========================================================= */

/* =========================================================
   SAVE QUIZ ANSWERS
========================================================= */

async function saveQuizAnswers() {

    if (!currentQuizAttemptId) {

        throw new Error(
            "No quiz attempt ID. Answers cannot be saved."
        );

    }


    if (
        !quizQuestions ||
        !quizQuestions.length
    ) {

        console.warn(
            "No quiz questions to save."
        );

        return;
    }


    /*
     * Save every question.
     */
    for (
        let index = 0;
        index < quizQuestions.length;
        index++
    ) {

        const question =
            quizQuestions[index];


        if (
            !question ||
            !question.$id
        ) {

            console.warn(
                `Skipping invalid question at index ${index}.`
            );

            continue;
        }


        /*
         * Student's selected answer.
         *
         * Empty string means unanswered.
         */
        const selectedAnswer =
            quizAnswers[index] || "";


        /*
         * Correct answer from question table.
         */
        const correctAnswer =
            normalizeQuizCorrectAnswer(
                question.correctAnswer
            );


        /*
         * Determine whether the student's
         * answer is correct.
         */
        const isCorrect =
            Boolean(
                selectedAnswer &&
                selectedAnswer ===
                correctAnswer
            );


        /*
         * Data must match the exact
         * quiz_answers columns.
         */
        const answerData = {

            attemptId:
                currentQuizAttemptId,

            questionId:
                question.$id,

            studentAnswer:
                selectedAnswer,

            correctAnswer:
                correctAnswer,

            isCorrect:
                isCorrect
        };


        console.log(
            `Saving answer ${index + 1}:`,
            answerData
        );


        try {

            await tablesDB.createRow(
                DATABASE_ID,
                QUIZ_ANSWERS_TABLE_ID,
                ID.unique(),
                answerData
            );


            console.log(
                `Answer ${index + 1} saved successfully.`
            );

        }

        catch (error) {

            console.error(
                `Unable to save answer ${index + 1}:`,
                error
            );

            /*
             * Continue saving the remaining
             * answers even if one fails.
             */
        }

    }

}


/* =========================================================
   RENDER QUIZ RESULT
========================================================= */

function renderQuizResult() {

    if (!quizResult) {
        return;
    }


    const {
        score,
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions,
        passed,
        autoSubmitted
    } = quizResult;


    if (quizResultScore) {

        quizResultScore.textContent =
            `${score}%`;

    }


    if (quizCorrectCount) {

        quizCorrectCount.textContent =
            correctCount;

    }


    if (quizWrongCount) {

        quizWrongCount.textContent =
            wrongCount;

    }


    if (quizUnansweredCount) {

        quizUnansweredCount.textContent =
            unansweredCount;

    }


    if (quizResultTitle) {

        quizResultTitle.textContent =
            passed
                ? "Well Done!"
                : "Keep Practising!";

    }


    if (quizResultMessage) {

        if (autoSubmitted) {

            quizResultMessage.textContent =
                passed
                    ? `Time expired. You scored ${score}% and passed the quiz.`
                    : `Time expired. You scored ${score}%. Keep practising and try again.`;

        }

        else {

            quizResultMessage.textContent =
                passed
                    ? `You scored ${score}% and passed the quiz.`
                    : `You scored ${score}%. Keep practising and try again.`;

        }

    }

}


/* =========================================================
   RENDER QUIZ REVIEW
========================================================= */

function renderQuizReview() {

    if (!quizReviewList) {

        console.error(
            "quizReviewList element was not found."
        );

        return;
    }


    /*
     * Make sure there are questions
     * available for review.
     */
    if (
        !quizQuestions ||
        quizQuestions.length === 0
    ) {

        quizReviewList.innerHTML = `

            <div class="quiz-review-empty">
                <p>
                    No questions are available for review.
                </p>
            </div>

        `;

        return;
    }


    /*
     * Build each review item.
     */
    quizReviewList.innerHTML =
        quizQuestions.map(
            (question, index) => {

                const studentAnswer =
                    normalizeQuizCorrectAnswer(
                        quizAnswers[index]
                    );


                const correctAnswer =
                    normalizeQuizCorrectAnswer(
                        question.correctAnswer
                    );


                /*
                 * Determine result.
                 */
                let resultStatus;

                if (!studentAnswer) {

                    resultStatus = "unanswered";

                } else if (
                    studentAnswer === correctAnswer
                ) {

                    resultStatus = "correct";

                } else {

                    resultStatus = "wrong";

                }


                /*
                 * Get option text.
                 */
                const studentAnswerText =
                    getQuizOptionText(
                        question,
                        studentAnswer
                    );


                const correctAnswerText =
                    getQuizOptionText(
                        question,
                        correctAnswer
                    );


                /*
                 * Human-readable status.
                 */
                let statusLabel;

                if (resultStatus === "correct") {

                    statusLabel = "Correct";

                } else if (resultStatus === "wrong") {

                    statusLabel = "Wrong";

                } else {

                    statusLabel = "Unanswered";

                }


                /*
                 * Explanation remains escaped
                 * because it is plain text.
                 */
                const explanation =
                    quizSafeString(
                        question.explanation
                    );


                const explanationHTML =
                    explanation
                        ? `
                            <div class="quiz-review-explanation">

                                <div class="quiz-review-label">
                                    Explanation
                                </div>

                                <div class="quiz-review-explanation-text">
                                    ${escapeQuizHTML(explanation)}
                                </div>

                            </div>
                        `
                        : "";


                /*
                 * Student answer display.
                 */
                let studentAnswerHTML;

                if (studentAnswer) {

                    studentAnswerHTML = `

                        <div class="quiz-review-answer quiz-review-student-answer">

                            <span class="quiz-review-answer-label">
                                Your answer
                            </span>

                            <span class="quiz-review-answer-value">

                                <strong>
                                    ${escapeQuizHTML(studentAnswer)}
                                </strong>

                                ${escapeQuizHTML(studentAnswerText)}

                            </span>

                        </div>

                    `;

                } else {

                    studentAnswerHTML = `

                        <div class="quiz-review-answer quiz-review-student-answer unanswered">

                            <span class="quiz-review-answer-label">
                                Your answer
                            </span>

                            <span class="quiz-review-answer-value">
                                Not answered
                            </span>

                        </div>

                    `;

                }


                /*
                 * Correct answer display.
                 */
                const correctAnswerHTML = `

                    <div class="quiz-review-answer quiz-review-correct-answer">

                        <span class="quiz-review-answer-label">
                            Correct answer
                        </span>

                        <span class="quiz-review-answer-value">

                            <strong>
                                ${escapeQuizHTML(correctAnswer)}
                            </strong>

                            ${escapeQuizHTML(correctAnswerText)}

                        </span>

                    </div>

                `;


                /*
                 * Return review card.
                 *
                 * Question content is inserted into
                 * a separate element below.
                 */
                return `

                    <article
                        class="quiz-review-card ${resultStatus}"
                        data-question-index="${index}"
                    >

                        <div class="quiz-review-card-header">

                            <div class="quiz-review-question-number">
                                Question ${index + 1}
                            </div>

                            <div class="quiz-review-status ${resultStatus}">
                                ${statusLabel}
                            </div>

                        </div>

                        <div class="quiz-review-question"></div>

                        <div class="quiz-review-options">

                            ${renderQuizReviewOptions(
                                question,
                                studentAnswer,
                                correctAnswer
                            )}

                        </div>

                        <div class="quiz-review-answers">

                            ${studentAnswerHTML}

                            ${correctAnswerHTML}

                        </div>

                        ${explanationHTML}

                    </article>

                `;

            }
        ).join("");


    /*
     * Render each question as safe HTML.
     * This supports formatting and images.
     */
    const reviewCards =
        quizReviewList.querySelectorAll(
            ".quiz-review-card"
        );


    reviewCards.forEach(function (card) {

        const index =
            Number(card.dataset.questionIndex);


        const question =
            quizQuestions[index];


        const questionElement =
            card.querySelector(
                ".quiz-review-question"
            );


        if (question && questionElement) {

            renderQuizRichContent(
                questionElement,
                question.question
            );

        }

    });


    /*
     * Render MathJax across the review,
     * including answers and explanations.
     */
    if (
        window.MathJax &&
        typeof window.MathJax.typesetPromise === "function"
    ) {

        window.MathJax.typesetPromise(
            [quizReviewList]
        ).catch(function (error) {

            console.error(
                "Quiz review MathJax error:",
                error
            );

        });

    }

}






/* =========================================================
   RENDER REVIEW OPTIONS
========================================================= */

function renderQuizReviewOptions(
    question,
    studentAnswer,
    correctAnswer
) {

    const options = [

        {
            key: "A",
            text: question.optionA
        },

        {
            key: "B",
            text: question.optionB
        },

        {
            key: "C",
            text: question.optionC
        },

        {
            key: "D",
            text: question.optionD
        }

    ];


    return options.map(
        option => {

            const isStudentAnswer =
                option.key ===
                studentAnswer;


            const isCorrectAnswer =
                option.key ===
                correctAnswer;


            let classes =
                "quiz-review-option";


            if (isCorrectAnswer) {

                classes +=
                    " correct";

            }


            if (
                isStudentAnswer &&
                !isCorrectAnswer
            ) {

                classes +=
                    " wrong";

            }


            if (isStudentAnswer) {

                classes +=
                    " selected";

            }


            let markers = "";


            if (isCorrectAnswer) {

                markers += `

                    <span class="quiz-review-option-marker correct-marker">
                        Correct
                    </span>

                `;

            }


            if (
                isStudentAnswer &&
                !isCorrectAnswer
            ) {

                markers += `

                    <span class="quiz-review-option-marker wrong-marker">
                        Your answer
                    </span>

                `;

            }


            return `

                <div class="${classes}">

                    <span class="quiz-review-option-letter">
                        ${option.key}
                    </span>

                    <span class="quiz-review-option-text">
                        ${escapeQuizHTML(
                            option.text
                        )}
                    </span>

                    ${markers}

                </div>

            `;

        }
    ).join("");
}



/* =========================================================
   GET OPTION TEXT
========================================================= */

function getQuizOptionText(
    question,
    option
) {

    const normalizedOption =
        normalizeQuizCorrectAnswer(
            option
        );


    if (!normalizedOption) {

        return "";

    }


    switch (
        normalizedOption
    ) {

        case "A":

            return quizSafeString(
                question.optionA
            );


        case "B":

            return quizSafeString(
                question.optionB
            );


        case "C":

            return quizSafeString(
                question.optionC
            );


        case "D":

            return quizSafeString(
                question.optionD
            );


        default:

            return "";

    }

}




/* =========================================================
   SUBMIT BUTTON LISTENER
========================================================= */

if (submitQuizBtn) {

    submitQuizBtn.addEventListener(
        "click",
        () => {

            submitQuiz(false);

        }
    );

}


/* =========================================================
   RESULT BUTTONS
========================================================= */

if (reviewQuizBtn) {

    reviewQuizBtn.addEventListener(
        "click",
        () => {

            renderQuizReview();

            showQuizReview();

        }
    );

}


if (closeReviewBtn) {

    closeReviewBtn.addEventListener(
        "click",
        () => {

            showQuizResult();

        }
    );

}



if (retryQuizBtn) {

    retryQuizBtn.addEventListener(
        "click",
        async () => {

            hideQuizSection(
                quizResultSection
            );

            hideQuizSection(
                quizReviewSection
            );

            showQuizSection(
                activeQuiz
            );


            resetActiveQuizState();


            quizAnswers =
                quizQuestions.map(
                    () => null
                );


            currentQuestionIndex = 0;


            renderCurrentQuizQuestion();


            startQuizTimer();

        }
    );

}


if (backToQuizSetupBtn) {

    backToQuizSetupBtn.addEventListener(
        "click",
        () => {

            stopQuizTimer();


            hideQuizSection(
                activeQuiz
            );

            hideQuizSection(
                quizResultSection
            );

            hideQuizSection(
                quizReviewSection
            );


            showQuizSection(
                quizSetup
            );


            resetActiveQuizState();

        }
    );

}


/* =========================================================
   END PHASE 7
========================================================= */