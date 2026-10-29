"use strict";

/* ==================================================
   APLUS TUTORS
   STUDENT CBT
   PHASE 1 — CBT SETUP
================================================== */


/* ==================================================
   CONFIGURATION
================================================== */

const STUDENT_CBT_SETTINGS_TABLE_ID =
    "cbt_settings";

const STUDENT_CBT_SUBJECTS_TABLE_ID =
    "subjects";


/* ==================================================
   DEFAULTS
================================================== */

const STUDENT_CBT_DEFAULTS = {

    minSubjects: 1,

    maxSubjects: 4,

    minQuestions: 10,

    maxQuestions: 100,

    defaultQuestions: 40,

    minDuration: 10,

    maxDuration: 180,

    defaultDuration: 60,

    randomizeQuestions: true,

    randomizeOptions: true,

    allowPrevious: true,

    autoSubmit: true,

    showProgress: true,

    allowEarlySubmit: true,

    showResultImmediately: true,

    instructions:
        "Answer all questions carefully. Read each question before selecting your answer. You may review your answers before submitting if this option is enabled."
};


/* ==================================================
   STATE
================================================== */

let studentCbtExamTypes = [];

let studentCbtSubjects = [];

let studentCbtCurrentExam = null;

let studentCbtSelectedSubjects = [];

let studentCbtInitialized = false;

let studentCbtInitializing = false;


/* ==================================================
   DOM
================================================== */

let studentCbtElements = {};


/* ==================================================
   CACHE DOM ELEMENTS
================================================== */

function cacheStudentCbtElements() {

    studentCbtElements = {

        page:
            document.querySelector(
                ".student-cbt-page"
            ),

        alert:
            document.getElementById(
                "studentCbtAlert"
            ),

        loading:
            document.getElementById(
                "studentCbtLoading"
            ),

        setup:
            document.getElementById(
                "studentCbtSetup"
            ),

        empty:
            document.getElementById(
                "studentCbtEmpty"
            ),

        error:
            document.getElementById(
                "studentCbtError"
            ),

        errorMessage:
            document.getElementById(
                "studentCbtErrorMessage"
            ),

        retryButton:
            document.getElementById(
                "retryCbtBtn"
            ),

        examType:
            document.getElementById(
                "studentCbtExamType"
            ),

        examTypeHelp:
            document.getElementById(
                "studentCbtExamTypeHelp"
            ),

        subjects:
            document.getElementById(
                "studentCbtSubjects"
            ),

        subjectInstruction:
            document.getElementById(
                "studentCbtSubjectInstruction"
            ),

        subjectCount:
            document.getElementById(
                "studentCbtSubjectCount"
            ),

        questionCount:
            document.getElementById(
                "studentCbtQuestionCount"
            ),

        questionHelp:
            document.getElementById(
                "studentCbtQuestionHelp"
            ),

        duration:
            document.getElementById(
                "studentCbtDuration"
            ),

        durationHelp:
            document.getElementById(
                "studentCbtDurationHelp"
            ),

        instructions:
            document.getElementById(
                "studentCbtInstructions"
            ),

        startButton:
            document.getElementById(
                "startCbtBtn"
            ),

        summaryExamType:
            document.getElementById(
                "summaryExamType"
            ),

        summarySubjects:
            document.getElementById(
                "summarySubjects"
            ),

        summaryQuestions:
            document.getElementById(
                "summaryQuestions"
            ),

        summaryDuration:
            document.getElementById(
                "summaryDuration"
            ),
            
                /* ==================================================
           PHASE 2 — QUESTION ENGINE
        ================================================== */

        questionScreen:
            document.getElementById(
                "studentCbtQuestionScreen"
            ),
        
        subjectTabs:
            document.getElementById(        "studentCbtSubjectTabs"
            ),

        questionNumber:
            document.getElementById(
                "studentCbtQuestionNumber"
            ),

        questionText:
            document.getElementById(
                "studentCbtQuestionText"
            ),

        options:
            document.getElementById(
                "studentCbtOptions"
            ),

        previousButton:
            document.getElementById(
                "studentCbtPreviousBtn"
            ),

        nextButton:
            document.getElementById(
                "studentCbtNextBtn"
            ),

        submitButton:
            document.getElementById(
                "studentCbtSubmitBtn"
            ),

        progress:
            document.getElementById(
                "studentCbtProgress"
            ),

        progressBar:
            document.getElementById(
                "studentCbtProgressBar"
            ),
            
        submitButton: document.getElementById(
    "studentCbtSubmitBtn"
),

    };

}


/* ==================================================
   APPWRITE CHECK
================================================== */

function checkStudentCbtAppwrite() {

    if (
        typeof tablesDB === "undefined"
    ) {

        console.error(
            "Aplus Student CBT: tablesDB is unavailable."
        );

        showStudentCbtError(
            "The database service is not ready. Please refresh the page."
        );

        return false;

    }


    if (
        typeof DATABASE_ID === "undefined" ||
        !DATABASE_ID
    ) {

        console.error(
            "Aplus Student CBT: DATABASE_ID is unavailable."
        );

        showStudentCbtError(
            "The database configuration is missing."
        );

        return false;

    }


    return true;

}


/* ==================================================
   UTILITIES
================================================== */

function studentCbtEscapeHTML(value) {

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
   SAFELY RENDER CBT QUESTION HTML
================================================== */

/* ==================================================
   SAFELY RENDER CBT QUESTION HTML
   SUPPORTS MATHJAX AND APPWRITE IMAGES
================================================== */

function renderStudentCbtRichContent(
    element,
    content
) {

    /* =========================================
       VALIDATE ELEMENT
    ========================================= */

    if (!element) {
        return;
    }


    /* =========================================
       PREPARE CONTENT
    ========================================= */

    const html =
        content === null || content === undefined
            ? ""
            : String(content);


    /* =========================================
       CLEAR PREVIOUS MATHJAX RENDERING
    ========================================= */

    if (
        window.MathJax &&
        typeof window.MathJax.typesetClear === "function"
    ) {

        window.MathJax.typesetClear([
            element
        ]);

    }


    /* =========================================
       SAFELY RENDER QUESTION HTML
    ========================================= */

    if (window.DOMPurify) {

        element.innerHTML =
            window.DOMPurify.sanitize(
                html,
                {
                    USE_PROFILES: {
                        html: true
                    },

                    ADD_ATTR: [
                        "data-appwrite-file-id"
                    ]
                }
            );

    } else {

        element.textContent = html;

        console.error(
            "Student CBT: DOMPurify is unavailable."
        );

        return;

    }


    /* =========================================
       RESTORE APPWRITE QUESTION IMAGES
    ========================================= */

    const images =
        element.querySelectorAll(
            "img[data-appwrite-file-id]"
        );


    images.forEach(function (img) {

        const fileId =
            img.dataset.appwriteFileId;


        if (!fileId) {
            return;
        }


        if (
            typeof storage === "undefined" ||
            typeof QUESTION_IMAGES_BUCKET_ID === "undefined"
        ) {

            console.warn(
                "Student CBT: Image storage configuration is unavailable."
            );

            return;

        }


        try {

            const imageUrl =
                storage.getFileView({

                    bucketId:
                        QUESTION_IMAGES_BUCKET_ID,

                    fileId:
                        fileId

                });


            img.src =
                imageUrl.toString();


            img.style.maxWidth = "100%";

            img.style.height = "auto";

        } catch (error) {

            console.error(
                "Student CBT: Unable to load question image.",
                error
            );

        }

    });


    /* =========================================
       RENDER MATHJAX
    ========================================= */

function renderMathJax() {

    if (!element || !element.isConnected) {
        return;
    }

    if (
        !window.MathJax ||
        typeof window.MathJax.typesetPromise !== "function"
    ) {
        console.error(
            "Student CBT: MathJax has not loaded. " +
            "Check the MathJax script and internet connection."
        );

        return;
    }

    /*
     * Render mathematical expressions inside
     * the updated question element.
     */

    window.MathJax.typesetPromise([element])
        .then(function () {

            if (!element.isConnected) {
                return;
            }

        })
        .catch(function (error) {

            console.error(
                "Student CBT: MathJax rendering failed.",
                error
            );

        });

}


    /* =========================================
       WAIT FOR MATHJAX INITIALISATION
    ========================================= */

    if (
        window.MathJax &&
        window.MathJax.startup &&
        window.MathJax.startup.promise
    ) {

        window.MathJax.startup.promise
            .then(function () {

                renderMathJax();

            })
            .catch(function (error) {

                console.error(
                    "Student CBT: MathJax failed to initialise.",
                    error
                );

            });

    } else {

        renderMathJax();

    }

}

function studentCbtNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function studentCbtBoolean(
    value,
    fallback = false
) {

    if (
        value === true ||
        value === false
    ) {

        return value;

    }


    if (
        value === 1 ||
        value === "1" ||
        value === "true"
    ) {

        return true;

    }


    if (
        value === 0 ||
        value === "0" ||
        value === "false"
    ) {

        return false;

    }


    return fallback;

}


/* ==================================================
   ALERT
================================================== */

function showStudentCbtAlert(
    message,
    type = "danger"
) {

    const element =
        studentCbtElements.alert;

    if (!element) {

        return;

    }


    element.className =
        `alert alert-${type}`;


    element.textContent =
        message;


    element.classList.remove(
        "d-none"
    );

}


function hideStudentCbtAlert() {

    const element =
        studentCbtElements.alert;

    if (!element) {

        return;

    }


    element.classList.add(
        "d-none"
    );


    element.textContent =
        "";

}


/* ==================================================
   LOADING / STATES
================================================== */

function showStudentCbtLoading() {

    if (
        studentCbtElements.loading
    ) {

        studentCbtElements.loading.classList.remove(
            "d-none"
        );

    }


/* ==================================================
   SHOW CBT SETUP
================================================== */

if (
    studentCbtElements.setup
) {

    studentCbtElements.setup.classList.remove(
        "d-none"
    );

}


    if (
        studentCbtElements.empty
    ) {

        studentCbtElements.empty.classList.add(
            "d-none"
        );

    }


    if (
        studentCbtElements.error
    ) {

        studentCbtElements.error.classList.add(
            "d-none"
        );

    }

}


function hideStudentCbtLoading() {

    if (
        studentCbtElements.loading
    ) {

        studentCbtElements.loading.classList.add(
            "d-none"
        );

    }

}


function showStudentCbtSetup() {

    hideStudentCbtLoading();


    if (
        studentCbtElements.setup
    ) {

        studentCbtElements.setup.classList.remove(
            "d-none"
        );

    }

}


function showStudentCbtEmpty() {

    hideStudentCbtLoading();


    if (
        studentCbtElements.setup
    ) {

        studentCbtElements.setup.classList.add(
            "d-none"
        );

    }


    if (
        studentCbtElements.empty
    ) {

        studentCbtElements.empty.classList.remove(
            "d-none"
        );

    }

}


function showStudentCbtError(
    message
) {

    hideStudentCbtLoading();


    if (
        studentCbtElements.setup
    ) {

        studentCbtElements.setup.classList.add(
            "d-none"
        );

    }


    if (
        studentCbtElements.error
    ) {

        studentCbtElements.error.classList.remove(
            "d-none"
        );

    }


    if (
        studentCbtElements.errorMessage
    ) {

        studentCbtElements.errorMessage.textContent =
            message;

    }

}


/* ==================================================
   NORMALIZE EXAM TYPE
================================================== */

function normalizeStudentCbtExam(
    row
) {

    return {

        $id:
            row.$id || "",

        examType:
            String(
                row.examType || ""
            ).trim(),

        minSubjects:
            studentCbtNumber(
                row.minSubjects,
                STUDENT_CBT_DEFAULTS.minSubjects
            ),

        maxSubjects:
            studentCbtNumber(
                row.maxSubjects,
                STUDENT_CBT_DEFAULTS.maxSubjects
            ),

        minQuestions:
            studentCbtNumber(
                row.minQuestions,
                STUDENT_CBT_DEFAULTS.minQuestions
            ),

        maxQuestions:
            studentCbtNumber(
                row.maxQuestions,
                STUDENT_CBT_DEFAULTS.maxQuestions
            ),

        defaultQuestions:
            studentCbtNumber(
                row.defaultQuestions,
                STUDENT_CBT_DEFAULTS.defaultQuestions
            ),

        minDuration:
            studentCbtNumber(
                row.minDuration,
                STUDENT_CBT_DEFAULTS.minDuration
            ),

        maxDuration:
            studentCbtNumber(
                row.maxDuration,
                STUDENT_CBT_DEFAULTS.maxDuration
            ),

        defaultDuration:
            studentCbtNumber(
                row.defaultDuration,
                STUDENT_CBT_DEFAULTS.defaultDuration
            ),

        randomizeQuestions:
            studentCbtBoolean(
                row.randomizeQuestions,
                STUDENT_CBT_DEFAULTS.randomizeQuestions
            ),

        randomizeOptions:
            studentCbtBoolean(
                row.randomizeOptions,
                STUDENT_CBT_DEFAULTS.randomizeOptions
            ),

        allowPrevious:
            studentCbtBoolean(
                row.allowPrevious,
                STUDENT_CBT_DEFAULTS.allowPrevious
            ),

        autoSubmit:
            studentCbtBoolean(
                row.autoSubmit,
                STUDENT_CBT_DEFAULTS.autoSubmit
            ),

        showProgress:
            studentCbtBoolean(
                row.showProgress,
                STUDENT_CBT_DEFAULTS.showProgress
            ),

        allowEarlySubmit:
            studentCbtBoolean(
                row.allowEarlySubmit,
                STUDENT_CBT_DEFAULTS.allowEarlySubmit
            ),

        showResultImmediately:
            studentCbtBoolean(
                row.showResultImmediately,
                STUDENT_CBT_DEFAULTS.showResultImmediately
            ),

        instructions:
            String(
                row.instructions ||
                STUDENT_CBT_DEFAULTS.instructions
            ),

        status:
            String(
                row.status || "inactive"
            )
                .toLowerCase()
                .trim()

    };

}


/* ==================================================
   LOAD CBT EXAM TYPES
================================================== */

async function loadStudentCbtExamTypes() {

    const response =
        await tablesDB.listRows({

            databaseId:
                DATABASE_ID,

            tableId:
                STUDENT_CBT_SETTINGS_TABLE_ID,

            queries: []

        });


    console.log(
        "Aplus Student CBT settings response:",
        response
    );


    const rows =
        Array.isArray(response?.rows)
            ? response.rows
            : [];


    const activeExamTypes =
        rows

            .filter(
                row =>
                    String(
                        row.status || ""
                    )
                        .toLowerCase()
                        .trim() === "active"
            )

            .map(
                normalizeStudentCbtExam
            );


    activeExamTypes.sort(
        (a, b) =>
            String(
                a.examType || ""
            ).localeCompare(
                String(
                    b.examType || ""
                )
            )
    );


    return activeExamTypes;

}


/* ==================================================
   RENDER EXAM TYPES
================================================== */

function renderStudentCbtExamTypes() {

    const select =
        studentCbtElements.examType;

    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            Select examination
        </option>

    `;


    studentCbtExamTypes.forEach(
        exam => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                exam.$id;


            option.textContent =
                exam.examType;


            select.appendChild(
                option
            );

        }
    );

}


/* ==================================================
   LOAD STUDENT CBT SUBJECTS
================================================== */

async function loadStudentCbtSubjects() {

    console.log(
        "Aplus Student CBT: Loading all subjects..."
    );


    if (
        !tablesDB
    ) {

        throw new Error(
            "Appwrite TablesDB is not available."
        );

    }


    if (
        !DATABASE_ID
    ) {

        throw new Error(
            "Appwrite database ID is not configured."
        );

    }


    const response =
        await tablesDB.listRows(
            DATABASE_ID,
            STUDENT_CBT_SUBJECTS_TABLE_ID
        );


    console.log(
        "Aplus Student CBT subjects response:",
        response
    );


    const rows =
        response.rows || [];


    console.log(
        "Aplus Student CBT: ALL 9 SUBJECT RECORDS:",
        rows.map(
            subject => ({

                id:
                    subject.$id,

                name:
                    subject.name,

                department:
                    subject.department,

                status:
                    subject.status,

                active:
                    subject.active

            })
        )
    );


    studentCbtSubjects =
        rows;


    console.log(
        "Aplus Student CBT: Student department at subject load:",
        getStudentDepartment()
    );


    return studentCbtSubjects;

}




/* ==================================================
   LOAD CBT QUESTIONS
   FIXED — LOAD ALL APPWRITE RECORDS
================================================== */

async function loadStudentCbtQuestions(subjectIds) {

    if (
        !Array.isArray(subjectIds) ||
        subjectIds.length === 0
    ) {
        throw new Error(
            "No subjects were selected for this CBT."
        );
    }

    console.log(
        "Aplus Student CBT: Loading questions for subjects:",
        subjectIds
    );

    if (typeof tablesDB === "undefined") {
        throw new Error(
            "Appwrite TablesDB is not available."
        );
    }

    if (!DATABASE_ID) {
        throw new Error(
            "Appwrite database ID is not configured."
        );
    }

    const allRows = [];
    const pageSize = 100;
    let cursorAfter = null;

    /*
     * LOAD ALL PAGES
     */

    while (true) {

        const queries = [
            Query.limit(pageSize)
        ];

        if (cursorAfter) {
            queries.push(
                Query.cursorAfter(cursorAfter)
            );
        }

        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: STUDENT_CBT_QUESTIONS_TABLE_ID,
            queries: queries
        });

        const rows = Array.isArray(response?.rows)
            ? response.rows
            : [];

        allRows.push(...rows);

        console.log(
            "Aplus Student CBT: Loaded page:",
            {
                pageRecords: rows.length,
                totalLoaded: allRows.length,
                databaseTotal: response?.total
            }
        );

        /*
         * STOP WHEN THE LAST PAGE IS REACHED.
         */

        if (
            rows.length < pageSize ||
            rows.length === 0
        ) {
            break;
        }

        cursorAfter = rows[rows.length - 1].$id;

        if (!cursorAfter) {
            throw new Error(
                "Could not continue loading CBT questions because the last record has no ID."
            );
        }
    }

    console.log(
        "Aplus Student CBT: Total questions loaded:",
        allRows.length
    );

    /*
     * FILTER BY SELECTED SUBJECTS
     */

    const selectedSubjectIds = subjectIds.map(
        id => String(id)
    );

    const selectedQuestions = allRows.filter(
        question => {

            const status = String(
                question.status || ""
            )
                .trim()
                .toLowerCase();

            /*
             * Accept active questions and
             * records without a status.
             */

            if (
                status &&
                status !== "active"
            ) {
                return false;
            }

            return selectedSubjectIds.includes(
                String(question.subjectId || "")
            );
        }
    );

    console.log(
        "Aplus Student CBT: Questions after filtering:",
        selectedQuestions.length
    );

    /*
     * LOG QUESTION COUNTS BY SUBJECT
     */

    const countsBySubject = {};

    selectedSubjectIds.forEach(subjectId => {
        countsBySubject[subjectId] = 0;
    });

    selectedQuestions.forEach(question => {

        const subjectId = String(
            question.subjectId || ""
        );

        countsBySubject[subjectId] =
            (countsBySubject[subjectId] || 0) + 1;
    });

    console.log(
        "Aplus Student CBT: Questions by subject:",
        countsBySubject
    );

    if (selectedQuestions.length === 0) {
        throw new Error(
            "No eligible questions are available for the selected subjects."
        );
    }

    return selectedQuestions;
}


/* ==================================================
   SHUFFLE ARRAY
================================================== */

function shuffleStudentCbtArray(
    array
) {

    const shuffled =
        [...array];


    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];

    }


    return shuffled;

}



/* ==================================================
   PREPARE CBT QUESTIONS
   QUESTION COUNT IS PER SUBJECT
================================================== */

function prepareStudentCbtQuestions(
    questions,
    configuration
) {

    /* ==================================================
       VALIDATE QUESTION DATA
    ================================================== */

    if (!Array.isArray(questions)) {

        throw new Error(
            "Invalid CBT question data."
        );

    }


    /* ==================================================
       QUESTION COUNT PER SUBJECT
    ================================================== */

    const questionsPerSubject =
        Number(configuration.questionCount);


    if (
        !Number.isInteger(questionsPerSubject) ||
        questionsPerSubject <= 0
    ) {

        throw new Error(
            "Please enter a valid number of questions per subject."
        );

    }


    /* ==================================================
       GET SELECTED SUBJECTS
    ================================================== */

    const selectedSubjectIds =
        Array.isArray(configuration.subjectIds)
            ? [
                ...new Set(
                    configuration.subjectIds.map(
                        subjectId => String(subjectId)
                    )
                )
            ]
            : [];


    if (selectedSubjectIds.length === 0) {

        throw new Error(
            "Please select at least one CBT subject."
        );

    }


    /* ==================================================
       GROUP QUESTIONS BY SUBJECT
    ================================================== */

    const questionsBySubject = {};


    selectedSubjectIds.forEach(
        subjectId => {

            questionsBySubject[subjectId] = [];

        }
    );


    questions.forEach(
        question => {

            const subjectId =
                String(question.subjectId || "");


            if (
                selectedSubjectIds.includes(subjectId)
            ) {

                questionsBySubject[subjectId].push(
                    question
                );

            }

        }
    );


    console.log(
        "Aplus Student CBT: Questions available per subject:",
        Object.fromEntries(
            selectedSubjectIds.map(
                subjectId => [
                    subjectId,
                    questionsBySubject[subjectId].length
                ]
            )
        )
    );


    /* ==================================================
       CHECK THAT EVERY SELECTED SUBJECT HAS ENOUGH
       QUESTIONS BEFORE STARTING THE EXAMINATION
    ================================================== */

    const insufficientSubjects = [];


    selectedSubjectIds.forEach(
        subjectId => {

            const availableCount =
                questionsBySubject[subjectId].length;


            if (
                availableCount < questionsPerSubject
            ) {

                const subject =
                    studentCbtSubjects.find(
                        item =>
                            String(item.$id) === subjectId
                    );


                const subjectName =
                    subject
                        ? (
                            subject.name ||
                            subject.subjectName ||
                            subject.title ||
                            subject.code ||
                            "Selected subject"
                        )
                        : "Selected subject";


                insufficientSubjects.push({

                    subjectId: subjectId,

                    subjectName: subjectName,

                    available: availableCount,

                    required: questionsPerSubject

                });

            }

        }
    );


    if (insufficientSubjects.length > 0) {

        const shortageMessage =
            insufficientSubjects.map(
                subject =>
                    `${subject.subjectName}: ${subject.available} available, ${subject.required} required`
            ).join("; ");


        throw new Error(
            "This CBT cannot start because some selected subjects do not have enough questions. " +
            shortageMessage +
            ". Please reduce the questions per subject or contact your administrator."
        );

    }


    /* ==================================================
       SELECT QUESTIONS FROM EACH SUBJECT
    ================================================== */

    const selectedQuestions = [];


    selectedSubjectIds.forEach(
        subjectId => {

            let subjectQuestions = [
                ...questionsBySubject[subjectId]
            ];


  /* ------------------------------------------
   RANDOMISE QUESTIONS ACROSS ALL TOPICS
   WITHIN THE SELECTED SUBJECT
------------------------------------------ */

subjectQuestions =
    shuffleStudentCbtArray(
        subjectQuestions
    );


            /* ------------------------------------------
               TAKE THE REQUESTED NUMBER FOR THIS SUBJECT
            ------------------------------------------ */

            const subjectSelection =
                subjectQuestions.slice(
                    0,
                    questionsPerSubject
                );


            /* ------------------------------------------
               KEEP THE SUBJECT ID WITH EACH QUESTION
            ------------------------------------------ */

            selectedQuestions.push(
                ...subjectSelection.map(
                    question => ({

                        ...question,

                        subjectId: subjectId

                    })
                )
            );

        }
    );


    /* ==================================================
       VERIFY FINAL QUESTION COUNT
    ================================================== */

    const expectedTotal =
        selectedSubjectIds.length *
        questionsPerSubject;


    if (
        selectedQuestions.length !== expectedTotal
    ) {

        throw new Error(
            `The CBT requires ${expectedTotal} questions, but only ${selectedQuestions.length} could be selected. Please check the question bank.`
        );

    }


    /* ==================================================
       RANDOMISE THE ORDER OF SUBJECTS/QUESTIONS
       WHILE KEEPING THE REQUIRED SUBJECT COUNTS
    ================================================== */

    if (
        configuration.randomizeQuestions
    ) {

        shuffleStudentCbtArray(
            selectedQuestions
        );

    }


    console.log(
        "Aplus Student CBT: Question selection completed.",
        {

            selectedSubjects:
                selectedSubjectIds.length,

            questionsPerSubject:
                questionsPerSubject,

            expectedTotal:
                expectedTotal,

            actualTotal:
                selectedQuestions.length

        }
    );


    return selectedQuestions;

}


/* ==================================================
   PREPARE CBT QUESTION OPTIONS
   SUPPORTS SAFE OPTION SHUFFLING
================================================== */

function prepareStudentCbtQuestionOptions(
    question,
    randomizeOptions = false
) {

    const originalOptions = [

        {
            originalKey: "A",
            text: question.optionA || ""
        },

        {
            originalKey: "B",
            text: question.optionB || ""
        },

        {
            originalKey: "C",
            text: question.optionC || ""
        },

        {
            originalKey: "D",
            text: question.optionD || ""
        }

    ];


    let preparedOptions =
        originalOptions.filter(
            option =>
                String(option.text).trim() !== ""
        );


    /*
     * SHUFFLE OPTION POSITIONS
     */

    if (randomizeOptions) {

        preparedOptions =
            shuffleStudentCbtArray(
                [...preparedOptions]
            );

    }


    /*
     * ASSIGN NEW DISPLAY LABELS
     *
     * originalKey is retained internally so
     * the correct answer can be remapped.
     */

    const displayLabels = [
        "A",
        "B",
        "C",
        "D"
    ];


    return preparedOptions.map(
        (option, index) => ({

            key:
                displayLabels[index],

            originalKey:
                option.originalKey,

            text:
                option.text

        })
    );

}




/* ==================================================
   STUDENT DEPARTMENT
================================================== */

function getStudentDepartment() {

    if (
        typeof window.aplusUser !==
        "undefined" &&
        window.aplusUser
    ) {

        return String(
            window.aplusUser.department || ""
        )
            .trim()
            .toLowerCase();

    }


    if (
        typeof aplusUser !==
        "undefined" &&
        aplusUser
    ) {

        return String(
            aplusUser.department || ""
        )
            .trim()
            .toLowerCase();

    }


    return "";

}


/* ==================================================
   CHECK SUBJECT AVAILABILITY
================================================== */

function isStudentCbtSubjectAvailable(
    subject
) {

    if (
        !subject
    ) {

        return false;

    }


    /* ==================================================
       SUBJECT STATUS
    ================================================== */

    const subjectStatus =
        String(
            subject.status || ""
        )
            .trim()
            .toLowerCase();


    /*
       If a status exists and it is not active,
       do not show the subject.
    */

    if (
        subjectStatus &&
        subjectStatus !== "active"
    ) {

        return false;

    }


    /* ==================================================
       SUBJECT DEPARTMENT
    ================================================== */

    const subjectDepartment =
        String(
            subject.department || ""
        )
            .trim()
            .toLowerCase();


    /* ==================================================
       GENERAL SUBJECTS
       AVAILABLE TO EVERY STUDENT
    ================================================== */

    if (
        subjectDepartment === "general"
    ) {

        return true;

    }


    /* ==================================================
       STUDENT DEPARTMENT
    ================================================== */

    const studentDepartment =
        getStudentDepartment();


    /*
       If we cannot determine the student's
       department, do NOT expose department-specific
       subjects.
    */

    if (
        !studentDepartment
    ) {

        return false;

    }


    /* ==================================================
       SCIENCE / SCIENCES
    ================================================== */

    if (
        studentDepartment === "science" ||
        studentDepartment === "sciences"
    ) {

        return (
            subjectDepartment === "science" ||
            subjectDepartment === "sciences"
        );

    }


    /* ==================================================
       COMMERCIAL
    ================================================== */

    if (
        studentDepartment === "commercial"
    ) {

        return (
            subjectDepartment === "commercial"
        );

    }


    /* ==================================================
       ARTS
    ================================================== */

    if (
        studentDepartment === "arts"
    ) {

        return (
            subjectDepartment === "arts"
        );

    }


    /* ==================================================
       OTHER DEPARTMENTS
    ================================================== */

    return (
        subjectDepartment ===
        studentDepartment
    );

}


/* ==================================================
   GET SUBJECT NAME
================================================== */

function getStudentCbtSubjectName(
    subject
) {

    return (
        subject.name ||
        subject.subjectName ||
        subject.title ||
        "Subject"
    );

}


/* ==================================================
   GET SUBJECT CODE
================================================== */

function getStudentCbtSubjectCode(
    subject
) {

    return (
        subject.code ||
        subject.subjectCode ||
        ""
    );

}


/* ==================================================
   RENDER STUDENT CBT SUBJECTS
================================================== */

function renderStudentCbtSubjects() {

    if (
        !studentCbtElements.subjects
    ) {

        console.error(
            "Aplus Student CBT: Subjects container not found."
        );

        return;

    }


    studentCbtElements.subjects.innerHTML = "";


    console.log(
        "Aplus Student CBT: Rendering subjects..."
    );


    console.log(
        "Aplus Student CBT: Department used for filtering:",
        getStudentDepartment()
    );


    console.log(
        "Aplus Student CBT: Subjects available for rendering:",
        studentCbtSubjects
    );


    const availableSubjects =
        studentCbtSubjects.filter(
            subject =>
                isStudentCbtSubjectAvailable(
                    subject
                )
        );


    console.log(
        "Aplus Student CBT: Subjects AFTER filtering:",
        availableSubjects.map(
            subject => ({

                id:
                    subject.$id,

                name:
                    subject.name,

                department:
                    subject.department,

                status:
                    subject.status

            })
        )
    );


    if (
        availableSubjects.length === 0
    ) {

        studentCbtElements.subjects.innerHTML = `
            <div class="alert alert-warning">
                No subjects are currently available for your department.
            </div>
        `;

        return;

    }


    availableSubjects.forEach(
        subject => {

            const wrapper =
                document.createElement("div");


            wrapper.className =
                "student-cbt-subject-option";


            wrapper.innerHTML = `

                <label>

                    <input
                        type="checkbox"
                        value="${subject.$id}"
                        class="student-cbt-subject"
                    >

                    <span>
                        ${subject.name || "Unnamed subject"}
                    </span>

                </label>

            `;


            const checkbox =
                wrapper.querySelector(
                    "input"
                );


            if (
                checkbox
            ) {

                checkbox.addEventListener(
                    "change",
                    handleStudentCbtSubjectChange
                );

            }


            studentCbtElements.subjects.appendChild(
                wrapper
            );

        }
    );


    updateStudentCbtSummary();

    validateStudentCbtSetup();

}


/* ==================================================
   SUBJECT CHANGE
================================================== */

function handleStudentCbtSubjectChange(
    event
) {

    const checkbox =
        event.target;


    if (
        !checkbox ||
        checkbox.type !== "checkbox"
    ) {

        return;

    }


    const subjectId =
        checkbox.value;


    if (
        checkbox.checked
    ) {

        if (
            !studentCbtSelectedSubjects.includes(
                subjectId
            )
        ) {

            studentCbtSelectedSubjects.push(
                subjectId
            );

        }

    } else {

        studentCbtSelectedSubjects =
            studentCbtSelectedSubjects.filter(
                id =>
                    id !== subjectId
            );

    }


    /*
       Enforce the maximum subject limit.
    */

    if (
        studentCbtCurrentExam &&
        studentCbtSelectedSubjects.length >
        studentCbtCurrentExam.maxSubjects
    ) {

        checkbox.checked =
            false;


        studentCbtSelectedSubjects =
            studentCbtSelectedSubjects.filter(
                id =>
                    id !== subjectId
            );


        showStudentCbtAlert(
            `You can select a maximum of ${studentCbtCurrentExam.maxSubjects} subjects.`,
            "warning"
        );

    }


    updateStudentCbtSubjectCount();

    validateStudentCbtSetup();

}


/* ==================================================
   SUBJECT COUNT
================================================== */

function updateStudentCbtSubjectCount() {

    const count =
        studentCbtSelectedSubjects.length;


    if (
        studentCbtElements.subjectCount
    ) {

        studentCbtElements.subjectCount.textContent =
            `${count} subject${count === 1 ? "" : "s"} selected`;

    }


    updateStudentCbtSummary();

}


/* ==================================================
   QUESTION COUNT
================================================== */

function updateStudentCbtQuestionCount() {

    if (
        !studentCbtElements.questionCount ||
        !studentCbtCurrentExam
    ) {

        return;

    }


    const min =
        Number(
            studentCbtCurrentExam.minQuestions
        );


    const max =
        Number(
            studentCbtCurrentExam.maxQuestions
        );


    studentCbtElements.questionCount.min =
        min;


    studentCbtElements.questionCount.max =
        max;


    let value =
        Number(
            studentCbtElements.questionCount.value
        );


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        value =
            Number(
                studentCbtCurrentExam.defaultQuestions
            );

    }


    value =
        Math.max(
            min,
            Math.min(
                max,
                value
            )
        );


    studentCbtElements.questionCount.value =
        value;


    if (
    studentCbtElements.questionHelp
) {
    
    studentCbtElements.questionHelp.textContent =
        `Choose between ${min} and ${max} questions per subject.`;
    
}

    updateStudentCbtSummary();

}


/* ==================================================
   DURATION
================================================== */

function updateStudentCbtDuration() {

    if (
        !studentCbtElements.duration ||
        !studentCbtCurrentExam
    ) {

        return;

    }


    const min =
        Number(
            studentCbtCurrentExam.minDuration
        );


    const max =
        Number(
            studentCbtCurrentExam.maxDuration
        );


    studentCbtElements.duration.min =
        min;


    studentCbtElements.duration.max =
        max;


    let value =
        Number(
            studentCbtElements.duration.value
        );


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        value =
            Number(
                studentCbtCurrentExam.defaultDuration
            );

    }


    value =
        Math.max(
            min,
            Math.min(
                max,
                value
            )
        );


    studentCbtElements.duration.value =
        value;


    if (
        studentCbtElements.durationHelp
    ) {

        studentCbtElements.durationHelp.textContent =
            `Choose between ${min} and ${max} minutes.`;

    }


    updateStudentCbtSummary();

}


/* ==================================================
   SUMMARY
================================================== */

function updateStudentCbtSummary() {

    if (
        !studentCbtCurrentExam
    ) {

        return;

    }


    if (
        studentCbtElements.summaryExamType
    ) {

        studentCbtElements.summaryExamType.textContent =
            studentCbtCurrentExam.examType ||
            "—";

    }


    if (
        studentCbtElements.summarySubjects
    ) {

        const count =
            studentCbtSelectedSubjects.length;


        studentCbtElements.summarySubjects.textContent =
            count > 0
                ? `${count} subject${count === 1 ? "" : "s"}`
                : "None selected";

    }


    if (
    studentCbtElements.summaryQuestions
) {

    const questionsPerSubject =
        Number(
            studentCbtElements.questionCount
                ? studentCbtElements.questionCount.value
                : 0
        );


    const selectedSubjectCount =
        studentCbtSelectedSubjects.length;


    const totalQuestions =
        questionsPerSubject *
        selectedSubjectCount;


    if (
        questionsPerSubject > 0 &&
        selectedSubjectCount > 0
    ) {

        studentCbtElements.summaryQuestions.textContent =
            `${questionsPerSubject} per subject (${totalQuestions} total)`;

    } else {

        studentCbtElements.summaryQuestions.textContent =
            "—";

    }

}

    if (
        studentCbtElements.summaryDuration
    ) {

        const duration =
            studentCbtElements.duration
                ? studentCbtElements.duration.value
                : "";


        studentCbtElements.summaryDuration.textContent =
            duration
                ? `${duration} minutes`
                : "—";

    }

}


/* ==================================================
   VALIDATE SETUP
================================================== */

function validateStudentCbtSetup() {

    if (
        !studentCbtCurrentExam
    ) {

        if (
            studentCbtElements.startButton
        ) {

            studentCbtElements.startButton.disabled =
                true;

        }

        return false;

    }


    const selectedSubjects =
        studentCbtSelectedSubjects.length;


    const questionCount =
        Number(
            studentCbtElements.questionCount
                ? studentCbtElements.questionCount.value
                : 0
        );


    const duration =
        Number(
            studentCbtElements.duration
                ? studentCbtElements.duration.value
                : 0
        );


    let valid =
        true;


    let message =
        "";


    /* ==================================================
       SUBJECT VALIDATION
    ================================================== */

    if (
        selectedSubjects <
        Number(
            studentCbtCurrentExam.minSubjects
        )
    ) {

        valid =
            false;


        message =
            `Please select at least ${studentCbtCurrentExam.minSubjects} subject${Number(studentCbtCurrentExam.minSubjects) === 1 ? "" : "s"}.`;

    }


    if (
        selectedSubjects >
        Number(
            studentCbtCurrentExam.maxSubjects
        )
    ) {

        valid =
            false;


        message =
            `You can select a maximum of ${studentCbtCurrentExam.maxSubjects} subjects.`;

    }


    /* ==================================================
       QUESTION VALIDATION
    ================================================== */

    if (
        questionCount <
        Number(
            studentCbtCurrentExam.minQuestions
        )
    ) {

        valid =
            false;


        message =
            `Question count must be at least ${studentCbtCurrentExam.minQuestions}.`;

    }


    if (
        questionCount >
        Number(
            studentCbtCurrentExam.maxQuestions
        )
    ) {

        valid =
            false;


        message =
            `Question count cannot exceed ${studentCbtCurrentExam.maxQuestions}.`;

    }


    /* ==================================================
       DURATION VALIDATION
    ================================================== */

    if (
        duration <
        Number(
            studentCbtCurrentExam.minDuration
        )
    ) {

        valid =
            false;


        message =
            `Duration must be at least ${studentCbtCurrentExam.minDuration} minutes.`;

    }


    if (
        duration >
        Number(
            studentCbtCurrentExam.maxDuration
        )
    ) {

        valid =
            false;


        message =
            `Duration cannot exceed ${studentCbtCurrentExam.maxDuration} minutes.`;

    }


    /* ==================================================
       ALERT
    ================================================== */

    if (
        !valid
    ) {

        showStudentCbtAlert(
            message,
            "warning"
        );

    } else {

        hideStudentCbtAlert();

    }


    /* ==================================================
       START BUTTON
    ================================================== */

    if (
        studentCbtElements.startButton
    ) {

        studentCbtElements.startButton.disabled =
            !valid;

    }


    updateStudentCbtSummary();


    return valid;

}


/* ==================================================
   EXAM TYPE CHANGE
================================================== */

function handleStudentCbtExamTypeChange() {

    const examId =
        studentCbtElements.examType
            ? studentCbtElements.examType.value
            : "";


    studentCbtCurrentExam =
        studentCbtExamTypes.find(
            exam =>
                exam.$id === examId
        ) || null;


    studentCbtSelectedSubjects =
        [];


    /* ==================================================
       RESET SUBJECT CHECKBOXES
    ================================================== */

    if (
        studentCbtElements.subjects
    ) {

        const checkboxes =
            studentCbtElements.subjects.querySelectorAll(
                "input[type='checkbox']"
            );


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );

    }


/* ==================================================
   NO EXAM SELECTED
================================================== */

if (
    !studentCbtCurrentExam
) {

    if (
        studentCbtElements.setup
    ) {

        studentCbtElements.setup.classList.remove(
            "d-none"
        );

    }


    if (
        studentCbtElements.instructions
    ) {

        studentCbtElements.instructions.textContent =
            "Please select an examination to view the instructions.";

    }


    if (
        studentCbtElements.startButton
    ) {

        studentCbtElements.startButton.disabled =
            true;

    }


    updateStudentCbtSubjectCount();

    return;

}

    /* ==================================================
       SHOW SETUP
    ================================================== */

    showStudentCbtSetup();


    /* ==================================================
       DEFAULT QUESTION COUNT
    ================================================== */

    if (
        studentCbtElements.questionCount
    ) {

        studentCbtElements.questionCount.value =
            studentCbtCurrentExam.defaultQuestions;

    }


    /* ==================================================
       DEFAULT DURATION
    ================================================== */

    if (
        studentCbtElements.duration
    ) {

        studentCbtElements.duration.value =
            studentCbtCurrentExam.defaultDuration;

    }


    /* ==================================================
       INSTRUCTIONS
    ================================================== */

    if (
        studentCbtElements.instructions
    ) {

        studentCbtElements.instructions.textContent =
            studentCbtCurrentExam.instructions ||
            STUDENT_CBT_DEFAULTS.instructions;

    }


    /* ==================================================
       SUBJECTS
    ================================================== */

    renderStudentCbtSubjects();


    /* ==================================================
       UPDATE SETTINGS
    ================================================== */

    updateStudentCbtQuestionCount();

    updateStudentCbtDuration();

    updateStudentCbtSubjectCount();

    updateStudentCbtSummary();

    validateStudentCbtSetup();

}

/* ==================================================
START CBT
FULL-SCREEN FIX
================================================== */

async function handleStudentCbtStart() {

/* ==================================================
   VALIDATE SETUP
================================================== */

if (!validateStudentCbtSetup()) {
    return;
}

if (!studentCbtCurrentExam) {
    return;
}

const configuration =
    window.aplusStudentCBT.getConfiguration();

if (!configuration) {

    showStudentCbtAlert(
        "Unable to prepare the CBT configuration.",
        "danger"
    );

    return;
}

/* ==================================================
   PREVENT DUPLICATE STARTS
================================================== */

if (studentCbtStarted) {
    return;
}

try {

    /* ==================================================
       DISABLE START BUTTON
    ================================================== */

    if (studentCbtElements.startButton) {

        studentCbtElements.startButton.disabled = true;

        studentCbtElements.startButton.textContent =
            "Loading questions...";

    }

    hideStudentCbtAlert();

    /* ==================================================
       REQUEST FULL-SCREEN IMMEDIATELY
       
       IMPORTANT:
       Do not await question loading before
       requesting native full-screen mode.
    ================================================== */

    const fullscreenPromise =
        enterStudentCbtFullscreen();

    /* ==================================================
       LOAD AND PREPARE QUESTIONS
    ================================================== */

    await initializeStudentCbtQuestionEngine(
        configuration
    );
    
    /* ==================================================
   CREATE APPWRITE ATTEMPT
================================================== */

await createStudentCbtAttempt(
    configuration
);

    /* ==================================================
       SHOW QUESTION SCREEN
    ================================================== */

    if (studentCbtElements.setup) {

        studentCbtElements.setup.classList.add(
            "d-none"
        );

    }

    if (studentCbtElements.questionScreen) {

        studentCbtElements.questionScreen.classList.remove(
            "d-none"
        );

    }

    /* ==================================================
       FINISH FULL-SCREEN REQUEST
    ================================================== */

    await fullscreenPromise;

    /* ==================================================
       RENDER FIRST QUESTION
    ================================================== */

    renderStudentCbtCurrentQuestion();

    /* ==================================================
       START COUNTDOWN TIMER
    ================================================== */

    startStudentCbtTimer(
        configuration.duration
    );

    console.log(
        "Aplus Student CBT: CBT started successfully."
    );

} catch (error) {

    console.error(
        "Aplus Student CBT: Failed to start CBT:",
        error
    );

    /* ==================================================
       STOP TIMER IF NECESSARY
    ================================================== */

    stopStudentCbtTimer();

    /* ==================================================
       RESET QUESTION ENGINE STATE
    ================================================== */

    studentCbtStarted = false;

    studentCbtSubmissionInProgress = false;

    /* ==================================================
       EXIT FULL-SCREEN
    ================================================== */

    await exitStudentCbtFullscreen();

    /* ==================================================
       RESTORE SETUP SCREEN
    ================================================== */

    if (studentCbtElements.questionScreen) {

        studentCbtElements.questionScreen.classList.add(
            "d-none"
        );

    }

    if (studentCbtElements.setup) {

        studentCbtElements.setup.classList.remove(
            "d-none"
        );

    }

    /* ==================================================
       DISPLAY ERROR
    ================================================== */

    showStudentCbtAlert(
        error?.message ||
        "We could not load the CBT questions. Please try again.",
        "danger"
    );

    /* ==================================================
       RESTORE START BUTTON
    ================================================== */

    if (studentCbtElements.startButton) {

        studentCbtElements.startButton.disabled = false;

        studentCbtElements.startButton.textContent =
            "Start CBT";

    }

}

}




/* ==================================================
   RETRY
================================================== */

function handleStudentCbtRetry() {

    studentCbtInitialized =
        false;

    studentCbtInitializing =
        false;

    studentCbtExamTypes =
        [];

    studentCbtSubjects =
        [];

    studentCbtCurrentExam =
        null;

    studentCbtSelectedSubjects =
        [];


    initializeStudentCbt();

}


/* ==================================================
   EVENT LISTENERS
================================================== */

/* ==================================================
   EVENT LISTENERS
================================================== */

/* =========================================================
   BIND STUDENT CBT EVENTS
   ========================================================= */

function bindStudentCbtEvents() {

    /* ==================================================
       EXAM TYPE
    ================================================== */

    if (studentCbtElements.examType) {

        studentCbtElements.examType.addEventListener(
            "change",
            handleStudentCbtExamTypeChange
        );

    }


    /* ==================================================
       QUESTION COUNT
    ================================================== */

    if (studentCbtElements.questionCount) {

        studentCbtElements.questionCount.addEventListener(
            "input",
            () => {

                updateStudentCbtSummary();

                validateStudentCbtSetup();

            }
        );

    }


    /* ==================================================
       DURATION
    ================================================== */

    if (studentCbtElements.duration) {

        studentCbtElements.duration.addEventListener(
            "input",
            () => {

                updateStudentCbtSummary();

                validateStudentCbtSetup();

            }
        );

    }


    /* ==================================================
       START CBT
    ================================================== */

    if (studentCbtElements.startButton) {

        studentCbtElements.startButton.addEventListener(
            "click",
            handleStudentCbtStart
        );

    }


    /* ==================================================
       RETRY
    ================================================== */

    if (studentCbtElements.retryButton) {

        studentCbtElements.retryButton.addEventListener(
            "click",
            handleStudentCbtRetry
        );

    }


    /* ==================================================
       PREVIOUS QUESTION
    ================================================== */

    if (studentCbtElements.previousButton) {

        studentCbtElements.previousButton.addEventListener(
            "click",
            goToPreviousStudentCbtQuestion
        );

    }


    /* ==================================================
       NEXT QUESTION
    ================================================== */

    if (studentCbtElements.nextButton) {

        studentCbtElements.nextButton.addEventListener(
            "click",
            goToNextStudentCbtQuestion
        );

    }


    /* ==================================================
       SUBMIT CBT
    ================================================== */

    if (studentCbtElements.submitButton) {

        studentCbtElements.submitButton.addEventListener(
            "click",
            () => submitStudentCbtExam(false)
        );

    }

}


/* ==================================================
   INITIALIZE STUDENT CBT
================================================== */

async function initializeStudentCbt() {

    if (
        studentCbtInitialized
    ) {

        return;

    }


    if (
        studentCbtInitializing
    ) {

        return;

    }


    studentCbtInitializing =
        true;


    try {

        showStudentCbtLoading();


        /* ==================================================
           APPWRITE CHECK
        ================================================== */

        if (
            !checkStudentCbtAppwrite()
        ) {

            return;

        }


        console.log(
            "Aplus Student CBT: Loading exam types..."
        );


        /* ==================================================
           LOAD EXAM TYPES
        ================================================== */

        const examTypes =
            await loadStudentCbtExamTypes();


        console.log(
            "Aplus Student CBT: Exam types loaded:",
            examTypes
        );


        /* ==================================================
           LOAD SUBJECTS
        ================================================== */

        const subjects =
            await loadStudentCbtSubjects();


        console.log(
            "Aplus Student CBT: Subjects loaded:",
            subjects
        );


        /* ==================================================
           SAVE DATA
        ================================================== */

        studentCbtExamTypes =
            Array.isArray(examTypes)
                ? examTypes
                : [];


        studentCbtSubjects =
            Array.isArray(subjects)
                ? subjects
                : [];
                
        

        studentCbtInitialized =
            true;


        hideStudentCbtLoading();


        /* ==================================================
           NO ACTIVE EXAM
        ================================================== */

        if (
            studentCbtExamTypes.length === 0
        ) {

            showStudentCbtEmpty();

            return;

        }


/* ==================================================
   RENDER EXAM TYPES
================================================== */

renderStudentCbtExamTypes();


/* ==================================================
   SHOW CBT SETUP
================================================== */

if (
    studentCbtElements.setup
) {

    studentCbtElements.setup.classList.remove(
        "d-none"
    );

}


console.log(
    "Aplus Student CBT initialized successfully."
);

    } catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "APLUS STUDENT CBT INITIALIZATION ERROR"
        );

        console.error(
            "========================================"
        );

        console.error(
            "Error:",
            error
        );

        console.error(
            "Error name:",
            error?.name
        );

        console.error(
            "Error message:",
            error?.message
        );

        console.error(
            "Error code:",
            error?.code
        );

        console.error(
            "========================================"
        );


        showStudentCbtError(
            error?.message ||
            "We could not load the CBT setup. Please try again."
        );

    } finally {

        studentCbtInitializing =
            false;

    }

}


/* ==================================================
   AUTH READY
================================================== */

function startStudentCbtWhenReady() {

    /* ==================================================
       CHECK IF GUARD HAS ALREADY FINISHED
    ================================================== */

    if (
        window.aplusUser
    ) {

        console.log(
            "Aplus Student CBT: Existing authenticated user found."
        );


        console.log(
            "Aplus Student CBT: Student profile:",
            window.aplusUser
        );


        console.log(
            "Aplus Student CBT: Student department:",
            window.aplusUser.department
        );


        initializeStudentCbt();

        return;

    }


    /* ==================================================
       WAIT FOR AUTH GUARD EVENT
    ================================================== */

    console.log(
        "Aplus Student CBT: Waiting for authentication guard..."
    );


    document.addEventListener(
        "aplusAuthReady",
        handleStudentCbtAuthReady,
        {
            once: true
        }
    );

}


/* ==================================================
   HANDLE AUTH READY
================================================== */

function handleStudentCbtAuthReady(
    event
) {

    console.log(
        "Aplus Student CBT: Authentication guard ready."
    );


    const user =
        event?.detail?.user ||
        window.aplusUser;


    console.log(
        "Aplus Student CBT: Auth user profile:",
        user
    );


    console.log(
        "Aplus Student CBT: Student department:",
        user?.department
    );


    if (
        !user
    ) {

        showStudentCbtError(
            "Your student session could not be verified."
        );

        return;

    }


    initializeStudentCbt();

}

/* ==================================================
   DOM READY
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cacheStudentCbtElements();

        bindStudentCbtEvents();

        startStudentCbtWhenReady();

    }
);


/* ==================================================
   GLOBAL CBT API
================================================== */

window.aplusStudentCBT = {

    initialize:
        initializeStudentCbt,


    validate:
        validateStudentCbtSetup,


    getConfiguration:
        () => {

            if (
                !studentCbtCurrentExam
            ) {

                return null;

            }


            return {

                examTypeId:
                    studentCbtCurrentExam.$id,


                examType:
                    studentCbtCurrentExam.examType,


                subjectIds:
                    [
                        ...studentCbtSelectedSubjects
                    ],


                questionCount:
                    Number(
                        studentCbtElements.questionCount
                            ? studentCbtElements.questionCount.value
                            : 0
                    ),


                duration:
                    Number(
                        studentCbtElements.duration
                            ? studentCbtElements.duration.value
                            : 0
                    )

            };

        }

};




/* ==================================================
   APLUS TUTORS
   STUDENT CBT
   PHASE 2 — QUESTION ENGINE
================================================== */


/* ==================================================
   CONFIGURATION
================================================== */

const STUDENT_CBT_QUESTIONS_TABLE_ID =
    "questions";


/* ==================================================
   QUESTION STATE
================================================== */

let studentCbtQuestions = [];

let studentCbtCurrentQuestionIndex = 0;

let studentCbtAnswers = {};

let studentCbtQuestionOptions = {};

let studentCbtStarted = false;


/* ==================================================
   QUESTION ENGINE STATE
================================================== */

let studentCbtTotalQuestions = 0;

let studentCbtAnsweredQuestions = 0;




/* ==================================================
   CBT TIMER AND FULL-SCREEN STATE
================================================== */

let studentCbtTimerInterval = null;

let studentCbtRemainingSeconds = 0;

let studentCbtTimerDisplay = null;

let studentCbtSubmissionInProgress = false;

let studentCbtAttemptId = null;

let studentCbtIsFullscreen = false;

let studentCbtAttemptStartedAt = null;





/* =========================================================
   CREATE STUDENT CBT ATTEMPT
   APLUS TUTORS
========================================================= */

async function createStudentCbtAttempt(configuration) {

    /*
     * VERIFY APPWRITE
     */

    if (
        !tablesDB ||
        typeof tablesDB.createRow !== "function"
    ) {
        throw new Error(
            "Appwrite TablesDB is not available."
        );
    }

    if (!DATABASE_ID) {
        throw new Error(
            "The Appwrite database ID is missing."
        );
    }

    if (!CBT_ATTEMPTS_TABLE_ID) {
        throw new Error(
            "The CBT attempts table ID is missing."
        );
    }


    /*
     * VERIFY STUDENT
     */

    const currentAccount =
        await account.get();

    if (!currentAccount || !currentAccount.$id) {
        throw new Error(
            "Your student account could not be verified."
        );
    }


    /*
     * VERIFY PREPARED QUESTIONS
     *
     * The question engine must finish preparing
     * the questions before an attempt is created.
     */

    if (
        !Array.isArray(studentCbtQuestions) ||
        studentCbtQuestions.length === 0
    ) {
        throw new Error(
            "No examination questions have been prepared."
        );
    }


    /*
     * CALCULATE THE ACTUAL TOTAL
     *
     * This is the combined number of questions
     * across every selected subject.
     */

    const totalQuestions =
        studentCbtQuestions.length;


    /*
     * VALIDATE DURATION
     */

    const allowedTime =
        Number(configuration.duration);

    if (
        !Number.isFinite(allowedTime) ||
        allowedTime <= 0
    ) {
        throw new Error(
            "The examination duration is invalid."
        );
    }


    /*
     * PREPARE ATTEMPT DATA
     */

    const startedAt =
        new Date().toISOString();

    const attemptData = {

        studentId:
            currentAccount.$id,

        examTypeId:
            configuration.examTypeId,

        totalQuestions:
            totalQuestions,

        correctAnswers:
            0,

        wrongAnswers:
            0,

        unanswered:
            totalQuestions,

        score:
            0,

        allowedTime:
            allowedTime,

        percentage:
            0,

        status:
            "in_progress",

        startedAt:
            startedAt,

        completedAt:
            null

    };


    /*
     * CREATE ATTEMPT RECORD
     */

    const attempt =
        await tablesDB.createRow({

            databaseId:
                DATABASE_ID,

            tableId:
                CBT_ATTEMPTS_TABLE_ID,

            rowId:
                ID.unique(),

            data:
                attemptData

        });


    /*
     * SAVE ATTEMPT STATE
     */

    studentCbtAttemptId =
        attempt.$id;

    studentCbtAttemptStartedAt =
        Date.now();


    /*
     * LOG CONFIRMATION
     */

    console.log(
        "Aplus CBT: Attempt created successfully.",
        {
            attemptId:
                studentCbtAttemptId,

            selectedSubjects:
                configuration.subjectIds.length,

            questionsPerSubject:
                configuration.questionCount,

            actualTotalQuestions:
                totalQuestions,

            durationMinutes:
                allowedTime
        }
    );


    return attempt;

}

/* ==================================================
   APLUS TUTORS
   STUDENT CBT
   FULL-SCREEN MANAGEMENT
================================================== */


/* ==================================================
ENTER FULL-SCREEN
================================================== */

async function enterStudentCbtFullscreen() {

const cbtPage =
    document.querySelector(".student-cbt-page");

if (!cbtPage) {

    console.error(
        "Aplus Student CBT: .student-cbt-page was not found."
    );

    return false;
}

/* ==================================================
   APPLY CSS FALLBACK
================================================== */

cbtPage.classList.add(
    "student-cbt-fullscreen-active"
);

document.body.classList.add(
    "student-cbt-fullscreen-body"
);

/* ==================================================
   CHECK NATIVE FULL-SCREEN SUPPORT
================================================== */

if (!cbtPage.requestFullscreen) {

    studentCbtIsFullscreen = false;

    console.warn(
        "Aplus Student CBT: Native full-screen is unsupported. CSS fallback enabled."
    );

    return false;
}

/* ==================================================
   REQUEST NATIVE FULL-SCREEN
================================================== */

try {

    await cbtPage.requestFullscreen();

    studentCbtIsFullscreen =
        document.fullscreenElement === cbtPage;

    console.log(
        "Aplus Student CBT: Native full-screen result:",
        studentCbtIsFullscreen
    );

    return studentCbtIsFullscreen;

} catch (error) {

    studentCbtIsFullscreen = false;

    console.warn(
        "Aplus Student CBT: Native full-screen request failed. CSS fallback remains active.",
        error
    );

    return false;
}

}


/* ==================================================
   EXIT FULL-SCREEN
================================================== */

async function exitStudentCbtFullscreen() {

    const cbtPage =
        document.querySelector(".student-cbt-page");

    if (
        document.fullscreenElement &&
        document.exitFullscreen
    ) {

        try {

            await document.exitFullscreen();

        } catch (error) {

            console.warn(
                "Could not exit native full-screen.",
                error
            );

        }
    }

    if (cbtPage) {

        cbtPage.classList.remove(
            "student-cbt-fullscreen-active"
        );

    }

    document.body.classList.remove(
        "student-cbt-fullscreen-body"
    );

    studentCbtIsFullscreen = false;
}


/* ==================================================
   TRACK FULL-SCREEN CHANGES
================================================== */

document.addEventListener(
    "fullscreenchange",
    () => {

        studentCbtIsFullscreen =
            Boolean(
                document.fullscreenElement
            );

        console.log(
            "Aplus Student CBT: Full-screen state:",
            studentCbtIsFullscreen
        );

    }
);


/* ==================================================
   APLUS TUTORS
   STUDENT CBT
   COUNTDOWN TIMER
================================================== */


/* ==================================================
   CREATE TIMER DISPLAY
================================================== */

function createStudentCbtTimerDisplay() {

    const questionScreen =
        studentCbtElements.questionScreen;

    if (!questionScreen) {

        console.error(
            "Aplus Student CBT: Question screen not found."
        );

        return null;
    }

    /*
     * Reuse an existing timer if one exists.
     */

    let timer =
        questionScreen.querySelector(
            "#studentCbtTimer"
        );

    if (timer) {

        studentCbtTimerDisplay = timer;

        return timer;
    }

    /*
     * Create the timer.
     */

    timer = document.createElement("div");

    timer.id = "studentCbtTimer";

    timer.className =
        "student-cbt-timer";

    timer.setAttribute(
        "role",
        "timer"
    );

    timer.setAttribute(
        "aria-live",
        "off"
    );

    timer.innerHTML = `
        <span class="student-cbt-timer-label">
            Time Remaining
        </span>

        <strong
            id="studentCbtTimerValue"
            class="student-cbt-timer-value"
        >
            00:00:00
        </strong>
    `;

    /*
     * Place the timer at the beginning
     * of the question screen.
     */

    questionScreen.prepend(timer);

    studentCbtTimerDisplay =
        timer.querySelector(
            "#studentCbtTimerValue"
        );

    return timer;
}


/* ==================================================
   FORMAT REMAINING TIME
================================================== */

function formatStudentCbtTime(
    totalSeconds
) {

    const seconds =
        Math.max(
            0,
            Math.floor(totalSeconds)
        );

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const remainingSeconds =
        seconds % 60;

    return [
        String(hours).padStart(2, "0"),

        String(minutes).padStart(2, "0"),

        String(remainingSeconds).padStart(2, "0")

    ].join(":");
}


/* ==================================================
   UPDATE TIMER DISPLAY
================================================== */

function updateStudentCbtTimerDisplay() {

    if (!studentCbtTimerDisplay) {

        createStudentCbtTimerDisplay();

    }

    if (!studentCbtTimerDisplay) {

        return;
    }

    studentCbtTimerDisplay.textContent =
        formatStudentCbtTime(
            studentCbtRemainingSeconds
        );

    const timerContainer =
        studentCbtTimerDisplay.closest(
            ".student-cbt-timer"
        );

    if (timerContainer) {

        timerContainer.classList.toggle(
            "student-cbt-timer-warning",
            studentCbtRemainingSeconds <= 300 &&
            studentCbtRemainingSeconds > 60
        );

        timerContainer.classList.toggle(
            "student-cbt-timer-critical",
            studentCbtRemainingSeconds <= 60
        );

    }
}


/* ==================================================
   STOP TIMER
================================================== */

function stopStudentCbtTimer() {

    if (
        studentCbtTimerInterval !== null
    ) {

        clearInterval(
            studentCbtTimerInterval
        );

        studentCbtTimerInterval = null;
    }
}


/* ==================================================
   START TIMER
================================================== */

function startStudentCbtTimer(
    durationMinutes
) {

    /*
     * Prevent multiple countdown intervals.
     */

    stopStudentCbtTimer();

    const duration =
        Number(durationMinutes);

    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        throw new Error(
            "The examination duration is invalid."
        );
    }

    /*
     * Convert minutes to seconds.
     */

    studentCbtRemainingSeconds =
        Math.round(duration * 60);

    /*
     * Create and update the timer.
     */

    createStudentCbtTimerDisplay();

    updateStudentCbtTimerDisplay();

    console.log(
        "Aplus Student CBT: Timer started.",
        {
            durationMinutes: duration,
            remainingSeconds:
                studentCbtRemainingSeconds
        }
    );

    /*
     * Start the countdown.
     */

    studentCbtTimerInterval =
        setInterval(
            () => {

                if (
                    studentCbtRemainingSeconds > 0
                ) {

                    studentCbtRemainingSeconds--;

                }

                updateStudentCbtTimerDisplay();

                /*
                 * Handle expiry.
                 *
                 * The actual submission function
                 * will be added in a later phase.
                 */

                if (
                    studentCbtRemainingSeconds <= 0
                ) {

                    stopStudentCbtTimer();

                    console.log(
                        "Aplus Student CBT: Time has expired."
                    );

                    if (
                        typeof submitStudentCbtExam ===
                        "function"
                    ) {

                        const autoSubmit =
                            studentCbtCurrentExam
                                ? studentCbtCurrentExam.autoSubmit
                                : true;

                        if (autoSubmit) {

                            submitStudentCbtExam(true);

                        } else {

                            console.warn(
                                "Time expired, but automatic submission is disabled."
                            );

                        }

                    } else {

                        console.warn(
                            "The submission function has not been added yet."
                        );

                    }

                }

            },
            1000
        );
}









/* ==================================================
   INITIALIZE CBT QUESTION ENGINE
================================================== */

async function initializeStudentCbtQuestionEngine(
    configuration
) {

    console.log(
        "Aplus Student CBT: Initializing question engine..."
    );


    if (
        !configuration
    ) {

        throw new Error(
            "CBT configuration is missing."
        );

    }


    if (
        !Array.isArray(
            configuration.subjectIds
        ) ||
        configuration.subjectIds.length === 0
    ) {

        throw new Error(
            "No CBT subjects were selected."
        );

    }


    /* ==================================================
       LOAD QUESTIONS
    ================================================== */

    const questions =
        await loadStudentCbtQuestions(
            configuration.subjectIds
        );


    /* ==================================================
       SELECT QUESTIONS
    ================================================== */

    const preparedQuestions =
        prepareStudentCbtQuestions(
            questions,
            configuration
        );


/* ==================================================
   PREPARE QUESTIONS AND SHUFFLED OPTIONS
================================================== */

studentCbtQuestionOptions = {};

const subjectQuestionCounters = {};
const subjectQuestionTotals = {};


/*
 * COUNT QUESTIONS PER SUBJECT
 */

preparedQuestions.forEach(question => {

    const subjectId =
        String(question.subjectId || "");

    subjectQuestionTotals[subjectId] =
        (subjectQuestionTotals[subjectId] || 0) + 1;

});


/*
 * PREPARE EACH QUESTION
 */

studentCbtQuestions =
    preparedQuestions.map(
        (question, index) => {

            const questionId =
                question.$id ||
                `question-${index + 1}`;


            const subjectId =
                String(question.subjectId || "");


            /*
             * SUBJECT-SPECIFIC QUESTION NUMBER
             */

            subjectQuestionCounters[subjectId] =
                (subjectQuestionCounters[subjectId] || 0) + 1;


            const subjectQuestionNumber =
                subjectQuestionCounters[subjectId];


            /*
             * PREPARE OPTIONS
             */

            const options =
                prepareStudentCbtQuestionOptions(
                    question,
                    configuration.randomizeOptions
                );


            studentCbtQuestionOptions[
                questionId
            ] = options;


            /*
             * REMAP CORRECT ANSWER
             *
             * Example:
             * Original correct answer: C
             * After shuffling, original option C
             * may now have display label A.
             */

            const originalCorrectAnswer =
                String(
                    question.correctAnswer ?? ""
                )
                    .trim()
                    .toUpperCase();


            const correctOption =
                options.find(
                    option =>
                        option.originalKey ===
                        originalCorrectAnswer
                );


            const remappedCorrectAnswer =
                correctOption
                    ? correctOption.key
                    : question.correctAnswer;


            /*
             * RETURN PREPARED QUESTION
             */

            return {

                ...question,

                correctAnswer:
                    remappedCorrectAnswer,

                questionNumber:
                    index + 1,

                subjectQuestionNumber:
                    subjectQuestionNumber,

                subjectQuestionTotal:
                    subjectQuestionTotals[subjectId],

                questionId:
                    questionId

            };

        }
    );


    /* ==================================================
       RESET ANSWERS
    ================================================== */

    studentCbtAnswers =
        {};


    studentCbtCurrentQuestionIndex =
        0;


    studentCbtTotalQuestions =
        studentCbtQuestions.length;


    studentCbtAnsweredQuestions =
        0;


    studentCbtStarted =
        true;
        
        
    renderStudentCbtSubjectTabs();
    
    createStudentCbtQuestionPalette();


    console.log(
        "Aplus Student CBT: Question engine initialized.",
        {

            totalQuestions:
                studentCbtTotalQuestions,

            questions:
                studentCbtQuestions

        }
    );


    return studentCbtQuestions;

}

/* ==================================================
   RENDER CURRENT QUESTION
================================================== */

function renderStudentCbtCurrentQuestion() {

    if (!studentCbtStarted) {
        return;
    }
    
    if (studentCbtSubmissionInProgress) {
    return;
}

    if (
        !Array.isArray(studentCbtQuestions) ||
        studentCbtQuestions.length === 0
    ) {
        return;
    }

    const question =
        studentCbtQuestions[
            studentCbtCurrentQuestionIndex
        ];

    if (!question) {
        return;
    }

    const questionNumber =
        studentCbtCurrentQuestionIndex + 1;

    const totalQuestions =
        studentCbtQuestions.length;


/* ==================================================
   DISPLAY SUBJECT-SPECIFIC QUESTION NUMBER
================================================== */

if (studentCbtElements.questionNumber) {

    const subjectName =
        getStudentCbtSubjectName(
            question.subjectId
        );


    const subjectNumber =
        question.subjectQuestionNumber ||
        questionNumber;


    const subjectTotal =
        question.subjectQuestionTotal ||
        totalQuestions;


    studentCbtElements.questionNumber.textContent =
        `${subjectName} — Question ${subjectNumber} of ${subjectTotal}`;

}


    /* ==================================================
       QUESTION TEXT, FORMATTING AND IMAGES
    ================================================== */

    if (studentCbtElements.questionText) {

        renderStudentCbtRichContent(
            studentCbtElements.questionText,
            question.question
        );

    }


    /* ==================================================
       OPTIONS
    ================================================== */

    renderStudentCbtQuestionOptions(
        question
    );


    /* ==================================================
       NAVIGATION
    ================================================== */

    updateStudentCbtNavigation();

    updateStudentCbtSubjectTabs();


    /* ==================================================
       PROGRESS
    ================================================== */

    /* ==================================================
   UPDATE QUESTION PROGRESS
================================================== */

updateStudentCbtQuestionProgress();


/* ==================================================
   REFRESH SUBJECT-SPECIFIC QUESTION PALETTE
================================================== */

renderStudentCbtQuestionPalette();

}


/* ==================================================
   RENDER QUESTION OPTIONS
================================================== */

function renderStudentCbtQuestionOptions(
    question
) {

    const container =
        studentCbtElements.options;


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const questionId =
        question.questionId;


    const options =
        studentCbtQuestionOptions[
            questionId
        ] || [];


    const savedAnswer =
        studentCbtAnswers[
            questionId
        ] || "";


    options.forEach(
        option => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "student-cbt-answer-option";


            const label =
                document.createElement(
                    "label"
                );


            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "radio";


            input.name =
                `question-${questionId}`;


            input.value =
                option.key;


            input.className =
                "student-cbt-answer";


            input.checked =
                savedAnswer ===
                option.key;


            input.addEventListener(
                "change",
                handleStudentCbtAnswerChange
            );


            const text =
                document.createElement(
                    "span"
                );


            text.innerHTML =
                `<strong>${option.key}.</strong> ${option.text}`;


            label.appendChild(
                input
            );


            label.appendChild(
                text
            );


            wrapper.appendChild(
                label
            );


            container.appendChild(
                wrapper
            );

        }
    );

}

/* ==================================================
   HANDLE ANSWER CHANGE
================================================== */

function handleStudentCbtAnswerChange(
    event
) {

    const input =
        event.target;


    if (
        !input ||
        !input.checked
    ) {

        return;

    }


    const question =
        studentCbtQuestions[
            studentCbtCurrentQuestionIndex
        ];


    if (
        !question
    ) {

        return;

    }


    studentCbtAnswers[
        question.questionId
    ] =
        input.value;


    studentCbtAnsweredQuestions =
        Object.keys(
            studentCbtAnswers
        ).length;


    console.log(
        "Aplus Student CBT: Answer saved:",
        {

            questionId:
                question.questionId,

            answer:
                input.value

        }
    );


    updateStudentCbtQuestionProgress();
    
    updateStudentCbtQuestionPalette();

}


/* ==================================================
   CBT SUBJECT NAVIGATION
================================================== */


/* ==================================================
   GET SUBJECT NAME
================================================== */

function getStudentCbtSubjectName(
    subjectId
) {

    const subject =
        studentCbtSubjects.find(
            item =>
                item.$id === subjectId
        );


    return subject
        ? (
            subject.name ||
            subject.title ||
            "Subject"
        )
        : "Subject";

}


/* ==================================================
   GET CURRENT QUESTION SUBJECT
================================================== */

function getCurrentStudentCbtSubjectId() {

    const question =
        studentCbtQuestions[
            studentCbtCurrentQuestionIndex
        ];


    if (!question) {

        return null;

    }


    return question.subjectId || null;

}


/* ==================================================
   RENDER SUBJECT TABS
================================================== */

function renderStudentCbtSubjectTabs() {

    const container =
        studentCbtElements.subjectTabs;


    if (!container) {

        return;

    }


    container.innerHTML = "";


    /*
     * Get subjects that actually have
     * questions in the current CBT.
     */

    const subjectIds = [];


    studentCbtQuestions.forEach(
        question => {

            const subjectId =
                question.subjectId;


            if (
                subjectId &&
                !subjectIds.includes(
                    subjectId
                )
            ) {

                subjectIds.push(
                    subjectId
                );

            }

        }
    );


    subjectIds.forEach(
        subjectId => {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "student-cbt-subject-tab";


            button.dataset.subjectId =
                subjectId;


            button.textContent =
                getStudentCbtSubjectName(
                    subjectId
                );


            button.addEventListener(
                "click",
                () => {

                    goToStudentCbtSubject(
                        subjectId
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    updateStudentCbtSubjectTabs();

}





/* ==================================================
   QUESTION NAVIGATION PALETTE
================================================== */

function createStudentCbtQuestionPalette() {

    const questionScreen =
        document.getElementById(
            "studentCbtQuestionScreen"
        );


    const subjectTabs =
        document.getElementById(
            "studentCbtSubjectTabs"
        );


    if (!questionScreen) {

        console.error(
            "CBT question screen was not found."
        );

        return;

    }


    /*
     * PREVENT DUPLICATE PALETTES
     */

    let palette =
        document.getElementById(
            "studentCbtQuestionPalette"
        );


    if (palette) {

        palette.remove();

    }


    /*
     * CREATE PALETTE CONTAINER
     */

    palette =
        document.createElement("section");


    palette.id =
        "studentCbtQuestionPalette";


    palette.className =
        "student-cbt-question-palette";


    palette.setAttribute(
        "aria-label",
        "Question navigation"
    );


    /*
     * PALETTE HEADING
     */

    const heading =
        document.createElement("h3");


    heading.className =
        "student-cbt-palette-heading";


    heading.textContent =
        "Question Navigation";


    palette.appendChild(
        heading
    );


    /*
     * LEGEND
     */

    const legend =
        document.createElement("div");


    legend.className =
        "student-cbt-palette-legend";


    legend.innerHTML = `
        <span>
            <i class="palette-dot palette-current"></i>
            Current
        </span>

        <span>
            <i class="palette-dot palette-answered"></i>
            Answered
        </span>

        <span>
            <i class="palette-dot palette-unanswered"></i>
            Unanswered
        </span>
    `;


    palette.appendChild(
        legend
    );


    /*
     * QUESTION BUTTON GRID
     */

    const grid =
        document.createElement("div");


    grid.id =
        "studentCbtQuestionPaletteGrid";


    grid.className =
        "student-cbt-question-palette-grid";


    palette.appendChild(
        grid
    );


/* ==================================================
   PLACE PALETTE BELOW CBT NAVIGATION BUTTONS
================================================== */

const navigationContainer =
    document.querySelector(
        ".student-cbt-navigation"
    );


if (
    navigationContainer &&
    navigationContainer.parentNode
) {
    
    navigationContainer.insertAdjacentElement(
        "afterend",
        palette
    );
    
} else if (
    studentCbtElements.submitButton &&
    studentCbtElements.submitButton.parentNode
) {
    
    /*
     * FALLBACK IF THE NAVIGATION WRAPPER
     * CANNOT BE FOUND
     */
    
    studentCbtElements.submitButton.parentNode
        .insertAdjacentElement(
            "afterend",
            palette
        );
    
} else {
    
    questionScreen.appendChild(
        palette
    );
    
}


    /*
     * INITIALISE BUTTONS
     */

    renderStudentCbtQuestionPalette();

}


/* ==================================================
   RENDER SUBJECT-SPECIFIC QUESTION PALETTE
================================================== */

function renderStudentCbtQuestionPalette() {

    const grid =
        document.getElementById(
            "studentCbtQuestionPaletteGrid"
        );


    if (!grid) {

        return;

    }


    /*
     * IDENTIFY THE CURRENT SUBJECT
     */

    const currentQuestion =
        studentCbtQuestions[
            studentCbtCurrentQuestionIndex
        ];


    if (!currentQuestion) {

        grid.innerHTML = "";

        return;

    }


    const currentSubjectId =
        String(
            currentQuestion.subjectId || ""
        );


    /*
     * FILTER QUESTIONS TO THE ACTIVE SUBJECT
     */

    const subjectQuestions =
        studentCbtQuestions
            .map(
                (question, globalIndex) => ({

                    question: question,

                    globalIndex: globalIndex

                })
            )
            .filter(
                item =>
                    String(
                        item.question.subjectId || ""
                    ) === currentSubjectId
            );


    /*
     * CLEAR THE PREVIOUS SUBJECT'S PALETTE
     */

    grid.innerHTML = "";


    /*
     * CREATE BUTTONS FOR THIS SUBJECT ONLY
     */

    subjectQuestions.forEach(
        item => {

            const question =
                item.question;


            const globalIndex =
                item.globalIndex;


            const button =
                document.createElement("button");


            button.type = "button";


            button.className =
                "student-cbt-palette-question";


            /*
             * DISPLAY SUBJECT-SPECIFIC NUMBER
             */

            button.textContent =
                String(
                    question.subjectQuestionNumber ||
                    (
                        subjectQuestions.findIndex(
                            entry =>
                                entry.globalIndex ===
                                globalIndex
                        ) + 1
                    )
                );


            /*
             * KEEP THE REAL EXAMINATION INDEX
             *
             * This ensures clicking a number opens
             * the correct question in the full exam.
             */

            button.dataset.questionIndex =
                String(globalIndex);


            button.setAttribute(
                "aria-label",
                `${getStudentCbtSubjectName(currentSubjectId)}, question ${button.textContent}`
            );


            /*
             * NAVIGATE TO THE SELECTED QUESTION
             */

            button.addEventListener(
                "click",
                () => {

                    if (
                        studentCbtSubmissionInProgress
                    ) {

                        return;

                    }


                    studentCbtCurrentQuestionIndex =
                        globalIndex;


                    renderStudentCbtCurrentQuestion();

                }
            );


            grid.appendChild(button);

        }
    );


    /*
     * APPLY ANSWERED, UNANSWERED AND CURRENT COLOURS
     */

    updateStudentCbtQuestionPalette();

}


/* ==================================================
   UPDATE QUESTION PALETTE STATUS
================================================== */

function updateStudentCbtQuestionPalette() {

    const grid =
        document.getElementById(
            "studentCbtQuestionPaletteGrid"
        );


    if (!grid) {

        return;

    }


    const buttons =
        grid.querySelectorAll(
            ".student-cbt-palette-question"
        );


    buttons.forEach(
        button => {

            const index =
                Number(
                    button.dataset.questionIndex
                );


            const question =
                studentCbtQuestions[index];


            if (!question) {

                return;

            }


            const isCurrent =
                index ===
                studentCbtCurrentQuestionIndex;


            const isAnswered =
                Boolean(
                    studentCbtAnswers[
                        question.questionId
                    ]
                );


            /*
             * RESET STATUS CLASSES
             */

            button.classList.remove(
                "is-current",
                "is-answered",
                "is-unanswered"
            );


            /*
             * APPLY CURRENT STATUS
             */

            if (isCurrent) {

                button.classList.add(
                    "is-current"
                );

            } else if (isAnswered) {

                button.classList.add(
                    "is-answered"
                );

            } else {

                button.classList.add(
                    "is-unanswered"
                );

            }


            button.setAttribute(
                "aria-current",
                isCurrent ? "step" : "false"
            );


            button.setAttribute(
                "aria-label",
                `${getStudentCbtSubjectName(question.subjectId)}, question ${question.subjectQuestionNumber || index + 1}, ${isAnswered ? "answered" : "unanswered"}${isCurrent ? ", current question" : ""}`
            );

        }
    );

}

/* ==================================================
   GO TO SUBJECT
================================================== */

function goToStudentCbtSubject(subjectId) {

    if (
        !Array.isArray(studentCbtQuestions) ||
        studentCbtQuestions.length === 0
    ) {

        console.warn(
            "CBT: No questions are available for navigation."
        );

        return;

    }

    if (studentCbtSubmissionInProgress) {
        return;
    }

    const selectedSubjectId =
        String(subjectId ?? "").trim();

    // Find the first question belonging to the selected subject.

    const questionIndex =
        studentCbtQuestions.findIndex(
            question =>
                String(
                    question.subjectId ?? ""
                ).trim() === selectedSubjectId
        );

    // Stop if the subject has no questions.

    if (questionIndex === -1) {

        console.warn(
            "CBT: No questions found for the selected subject.",
            {
                selectedSubjectId: selectedSubjectId,

                availableSubjectIds: [
                    ...new Set(
                        studentCbtQuestions.map(
                            question =>
                                String(
                                    question.subjectId ?? ""
                                ).trim()
                        )
                    )
                ]
            }
        );

        return;

    }

    // Navigate to the first question in that subject.

    studentCbtCurrentQuestionIndex =
        questionIndex;

    renderStudentCbtCurrentQuestion();

}


/* ==================================================
   UPDATE ACTIVE SUBJECT TAB
================================================== */

function updateStudentCbtSubjectTabs() {

    const container =
        studentCbtElements.subjectTabs;


    if (!container) {

        return;

    }


    const currentSubjectId =
    String(
        getCurrentStudentCbtSubjectId() ?? ""
    ).trim();


    const tabs =
        container.querySelectorAll(
            ".student-cbt-subject-tab"
        );


    tabs.forEach(
        tab => {

            const isActive =
    String(
        tab.dataset.subjectId ?? ""
    ).trim() === currentSubjectId;


            tab.classList.toggle(
                "active",
                isActive
            );

        }
    );

}


/* ==================================================
   NEXT QUESTION
================================================== */

function goToNextStudentCbtQuestion() {

    if (
        studentCbtCurrentQuestionIndex >=
        studentCbtQuestions.length - 1
    ) {

        return;

    }


    studentCbtCurrentQuestionIndex++;


    renderStudentCbtCurrentQuestion();

}


/* ==================================================
   PREVIOUS QUESTION
================================================== */

function goToPreviousStudentCbtQuestion() {

    if (
        studentCbtCurrentQuestionIndex <= 0
    ) {

        return;

    }


    studentCbtCurrentQuestionIndex--;


    renderStudentCbtCurrentQuestion();

}


/* ==================================================
   UPDATE CBT NAVIGATION
================================================== */

function updateStudentCbtNavigation() {

    const index =
        studentCbtCurrentQuestionIndex;


    const lastIndex =
        studentCbtQuestions.length - 1;


    /* ==================================================
       PREVIOUS
    ================================================== */

    if (
        studentCbtElements.previousButton
    ) {

        const allowPrevious =
            studentCbtCurrentExam
                ? studentCbtCurrentExam.allowPrevious
                : true;


        studentCbtElements.previousButton.disabled =
            !allowPrevious ||
            index <= 0;

    }


    /* ==================================================
       NEXT
    ================================================== */

    if (
        studentCbtElements.nextButton
    ) {

        studentCbtElements.nextButton.disabled =
            index >= lastIndex;

    }


/* ==================================================
   SUBMIT — ALWAYS VISIBLE DURING THE EXAM
================================================== */

if (
    studentCbtElements.submitButton
) {

    studentCbtElements.submitButton.classList.remove(
        "d-none"
    );

}

}


/* ==================================================
   UPDATE QUESTION PROGRESS
================================================== */

function updateStudentCbtQuestionProgress() {

    const total =
        studentCbtQuestions.length;


    const current =
        studentCbtCurrentQuestionIndex + 1;


    const answered =
        Object.keys(
            studentCbtAnswers
        ).length;


    /* ==================================================
       TEXT
    ================================================== */

    if (
        studentCbtElements.progress
    ) {

        studentCbtElements.progress.textContent =
            `${answered} of ${total} answered`;

    }


    /* ==================================================
       PROGRESS BAR
    ================================================== */

    if (
        studentCbtElements.progressBar
    ) {

        const percentage =
            total > 0
                ? (
                    answered /
                    total
                ) * 100
                : 0;


        studentCbtElements.progressBar.style.width =
            `${percentage}%`;


        studentCbtElements.progressBar.setAttribute(
            "aria-valuenow",
            percentage
        );

    }

}




/* =========================================================
   NORMALIZE CBT ANSWER
   ========================================================= */

function normalizeStudentCbtAnswer(answer) {

    if (
        answer === null ||
        answer === undefined
    ) {
        return "";
    }

    const normalized = String(answer)
        .trim()
        .toUpperCase();

    const match = normalized.match(
        /^(?:OPTION\s*)?([A-D])$/
    );

    if (match) {
        return match[1];
    }

    return normalized;
}

/* =========================================================
   SAVE STUDENT CBT ANSWERS
   DUPLICATE-SAFE VERSION
========================================================= */

async function saveStudentCbtAnswers() {

    /* ==================================================
       VERIFY ACTIVE ATTEMPT
    ================================================== */

    if (!studentCbtAttemptId) {

        throw new Error(
            "No active CBT attempt was found."
        );

    }


    /* ==================================================
       VERIFY QUESTIONS
    ================================================== */

    if (
        !Array.isArray(studentCbtQuestions) ||
        studentCbtQuestions.length === 0
    ) {

        throw new Error(
            "No CBT questions are available to save."
        );

    }


    /* ==================================================
       PREPARE ANSWER RESULTS
    ================================================== */

    const answerResults = [];


    /* ==================================================
       PROCESS EACH QUESTION
    ================================================== */

    for (const question of studentCbtQuestions) {

        const questionId =
            question.questionId ||
            question.$id;


        if (!questionId) {

            throw new Error(
                "A CBT question is missing its question ID."
            );

        }


        /* ==============================================
           GET STUDENT ANSWER
        ============================================== */

        const studentAnswer =
            studentCbtAnswers[questionId] ?? "";


        /* ==============================================
           GET CORRECT ANSWER
        ============================================== */

        const correctAnswer =
            question.correctAnswer ?? "";


        /* ==============================================
           NORMALIZE ANSWERS
        ============================================== */

        const normalizedStudentAnswer =
            normalizeStudentCbtAnswer(
                studentAnswer
            );


        const normalizedCorrectAnswer =
            normalizeStudentCbtAnswer(
                correctAnswer
            );


        /* ==============================================
           CHECK ANSWER
        ============================================== */

        const isAnswered =
            normalizedStudentAnswer !== "";


        const isCorrect =
            isAnswered &&
            normalizedStudentAnswer ===
                normalizedCorrectAnswer;


        /* ==============================================
           PREPARE APPWRITE DATA
        ============================================== */

        const answerData = {

            attemptId:
                studentCbtAttemptId,

            questionId:
                questionId,

            subjectId:
                question.subjectId || "",

            studentAnswer:
                String(studentAnswer),

            correctAnswer:
                String(correctAnswer),

            isCorrect:
                Boolean(isCorrect)

        };


        /* ==============================================
           CHECK FOR AN EXISTING ANSWER

           Reuse an existing row belonging to this
           attempt and question instead of creating
           a duplicate.
        ============================================== */

        let existingAnswer = null;

        try {

            const existingResponse =
                await tablesDB.listRows({

                    databaseId:
                        DATABASE_ID,

                    tableId:
                        CBT_ANSWERS_TABLE_ID,

                    queries: [

                        Query.equal(
                            "attemptId",
                            studentCbtAttemptId
                        ),

                        Query.equal(
                            "questionId",
                            questionId
                        ),

                        Query.limit(1)

                    ]

                });


            existingAnswer =
                existingResponse.rows &&
                existingResponse.rows.length > 0
                    ? existingResponse.rows[0]
                    : null;

        } catch (error) {

            console.error(
                "Aplus CBT: Could not check existing answer.",
                {
                    questionId,
                    error
                }
            );

            /*
             * Do not create a new row when the lookup
             * fails. Doing so could create duplicates.
             */
            throw new Error(
                "Could not verify whether an answer was already saved. Please try submitting again."
            );

        }


        /* ==============================================
           UPDATE OR CREATE ANSWER
        ============================================== */

        if (existingAnswer) {

            await tablesDB.updateRow({

                databaseId:
                    DATABASE_ID,

                tableId:
                    CBT_ANSWERS_TABLE_ID,

                rowId:
                    existingAnswer.$id,

                data:
                    answerData

            });

        } else {

            await tablesDB.createRow({

                databaseId:
                    DATABASE_ID,

                tableId:
                    CBT_ANSWERS_TABLE_ID,

                rowId:
                    ID.unique(),

                data:
                    answerData

            });

        }


        /* ==============================================
           PREPARE CORRECTION OPTIONS
        ============================================== */

        const questionOptions =
            studentCbtQuestionOptions[questionId] || [];


        /* ==============================================
           COLLECT COMPLETE CORRECTION DATA
        ============================================== */

        answerResults.push({

            questionId:
                questionId,

            subjectId:
                question.subjectId || "",

            subjectName:
                getStudentCbtSubjectName(
                    question.subjectId || ""
                ),

            questionText:
                question.question || "",

            options:
                questionOptions.map(option => ({

                    key:
                        String(option.key),

                    text:
                        String(option.text ?? "")

                })),

            studentAnswer:
                String(studentAnswer),

            correctAnswer:
                String(correctAnswer),

            explanation:
                question.explanation || "",

            isAnswered:
                isAnswered,

            isCorrect:
                Boolean(isCorrect)

        });

    }


    /* ==================================================
       RETURN ANSWER RESULTS
    ================================================== */

    console.log(
        "Aplus CBT: Answers saved or updated successfully.",
        {
            attemptId: studentCbtAttemptId,
            totalAnswers: answerResults.length
        }
    );


    return answerResults;

}

/* =========================================================
SUBMIT STUDENT CBT EXAM
APLUS TUTORS — RESULTS AND CORRECTIONS
========================================================= */

/* =========================================================
SUBMIT STUDENT CBT EXAM
APLUS TUTORS — RESULTS AND CORRECTIONS
========================================================= */

async function submitStudentCbtExam(isAutoSubmit = false) {

/*
 * PREVENT DUPLICATE SUBMISSION
 */

if (studentCbtSubmissionInProgress) {
    return;
}


/*
 * VERIFY ACTIVE ATTEMPT
 */

if (!studentCbtAttemptId) {

    console.error(
        "Cannot submit CBT: no active attempt exists."
    );

    return;

}


/*
 * CONFIRM MANUAL SUBMISSION
 */

if (!isAutoSubmit) {

    const confirmed = window.confirm(
        "Are you sure you want to submit your examination?"
    );

    if (!confirmed) {
        return;
    }

}


/*
 * LOCK SUBMISSION
 */

studentCbtSubmissionInProgress = true;


showStudentCbtResultsLoading();


/*
 * DISABLE SUBMIT BUTTON
 */

const submitButton =
    document.getElementById(
        "studentCbtSubmitBtn"
    );

if (submitButton) {
    submitButton.disabled = true;
}


try {

    console.log(
        "Aplus CBT: Submitting examination..."
    );


    /*
     * STOP COUNTDOWN TIMER
     */

    stopStudentCbtTimer();


    /*
     * SAVE ANSWERS
     */

    const answerResults =
        await saveStudentCbtAnswers();


    if (
        !Array.isArray(answerResults) ||
        answerResults.length === 0
    ) {

        throw new Error(
            "No answer results were returned."
        );

    }


    /*
     * CALCULATE OVERALL RESULTS
     */

    const totalQuestions =
        answerResults.length;

    const correctAnswers =
        answerResults.filter(
            answer => answer.isCorrect
        ).length;

    const answeredQuestions =
        answerResults.filter(
            answer => answer.isAnswered
        ).length;

    const wrongAnswers =
        answeredQuestions - correctAnswers;

    const unanswered =
        totalQuestions - answeredQuestions;

    const percentage =
        (
            correctAnswers /
            totalQuestions
        ) * 100;

    const score =
        correctAnswers;


    /*
     * CALCULATE TIME USED
     */

    let timeUsed = 0;

    if (studentCbtAttemptStartedAt) {

        timeUsed = Math.floor(
            (
                Date.now() -
                studentCbtAttemptStartedAt
            ) / 1000
        );

    }


    /*
     * CALCULATE SUBJECT RESULTS
     */

    const subjectResults =
        calculateStudentCbtSubjectResults(
            answerResults
        );


    /*
     * UPDATE APPWRITE ATTEMPT
     */

    const completedAt =
        new Date().toISOString();

    await tablesDB.updateRow({

        databaseId:
            DATABASE_ID,

        tableId:
            CBT_ATTEMPTS_TABLE_ID,

        rowId:
            studentCbtAttemptId,

        data: {

            totalQuestions:
                totalQuestions,

            correctAnswers:
                correctAnswers,

            wrongAnswers:
                wrongAnswers,

            unanswered:
                unanswered,

            score:
                score,

            percentage:
                Number(
                    percentage.toFixed(2)
                ),

            timeUsed:
                timeUsed,

            status:
                "completed",

            completedAt:
                completedAt

        }

    });


    /*
     * RENDER OVERALL RESULTS
     */
     
     
    hideStudentCbtResultsLoading();

    renderStudentCbtResults({

        totalQuestions:
            totalQuestions,

        correctAnswers:
            correctAnswers,

        wrongAnswers:
            wrongAnswers,

        unanswered:
            unanswered,

        percentage:
            Number(
                percentage.toFixed(2)
            ),

        timeUsed:
            timeUsed,

        subjectResults:
            subjectResults

    });


    /*
     * RENDER DETAILED CORRECTIONS
     */

    renderStudentCbtCorrections(
        answerResults
    );


    /*
     * DISPLAY RESULTS SCREEN
     */

    showStudentCbtResultsScreen();


    /*
     * EXIT FULLSCREEN
     */

    if (
        typeof exitStudentCbtFullscreen ===
        "function"
    ) {

        await exitStudentCbtFullscreen();

    }


    /*
     * MARK EXAM AS FINISHED
     */

    studentCbtStarted = false;


    console.log(
        "Aplus CBT: Examination completed successfully.",
        {

            attemptId:
                studentCbtAttemptId,

            totalQuestions:
                totalQuestions,

            correctAnswers:
                correctAnswers,

            wrongAnswers:
                wrongAnswers,

            unanswered:
                unanswered,

            percentage:
                Number(
                    percentage.toFixed(2)
                ),

            timeUsed:
                timeUsed,

            subjectResults:
                subjectResults

        }
    );


} catch (error) {
    
    hideStudentCbtResultsLoading();

    console.error(
        "Aplus CBT: Submission failed.",
        error
    );


    /*
     * RESTORE SUBMISSION STATE
     */

    studentCbtSubmissionInProgress = false;


    /*
     * RESTORE SUBMIT BUTTON
     */

    if (submitButton) {
        submitButton.disabled = false;
    }


    /*
     * RESTART TIMER ONLY IF TIME REMAINS
     */

    if (
        studentCbtStarted &&
        studentCbtRemainingSeconds > 0
    ) {

        startStudentCbtTimer(
            studentCbtRemainingSeconds / 60
        );

    }


    window.alert(
        "We could not complete your submission. " +
        "Please try again. If the problem continues, " +
        "contact Aplus Tutors."
    );

    return;

} finally {

    /*
     * Keep the submission lock active after success.
     * Release it only when submission fails.
     */

    if (!studentCbtStarted) {
        studentCbtSubmissionInProgress = true;
    }

}

}



/* ==================================================
   CBT RESULTS LOADING OVERLAY
================================================== */

function showStudentCbtResultsLoading() {

    let overlay =
        document.getElementById(
            "studentCbtResultsLoading"
        );


    /*
     * PREVENT DUPLICATE OVERLAYS
     */

    if (!overlay) {

        overlay =
            document.createElement("div");


        overlay.id =
            "studentCbtResultsLoading";


        overlay.className =
            "student-cbt-results-loading";


        overlay.setAttribute(
            "role",
            "status"
        );


        overlay.setAttribute(
            "aria-live",
            "polite"
        );


        overlay.innerHTML = `
            <div class="student-cbt-results-loading-card">

                <div
                    class="student-cbt-results-spinner"
                    aria-hidden="true">
                </div>

                <h3>Preparing Your Results</h3>

                <p>
                    Please wait while we save your answers
                    and calculate your examination results.
                </p>

                <span>
                    Do not close this page.
                </span>

            </div>
        `;


        document.body.appendChild(
            overlay
        );

    }


    overlay.classList.add("is-visible");

    document.body.style.overflow = "hidden";

}


/* ==================================================
   HIDE RESULTS LOADING OVERLAY
================================================== */

function hideStudentCbtResultsLoading() {

    const overlay =
        document.getElementById(
            "studentCbtResultsLoading"
        );


    if (overlay) {

        overlay.classList.remove(
            "is-visible"
        );

    }


    document.body.style.overflow = "";

}
/* =========================================================
   APLUS TUTORS
   STUDENT CBT
   PHASE 2 — CALCULATE SUBJECT RESULTS
========================================================= */

function calculateStudentCbtSubjectResults(answerResults) {

    const subjectResults = {};

    if (!Array.isArray(answerResults)) {
        return [];
    }

    /*
     * GROUP ANSWERS BY SUBJECT
     */

    answerResults.forEach(answer => {

        const subjectId =
            answer.subjectId || "unknown";

        if (!subjectResults[subjectId]) {

            subjectResults[subjectId] = {

                subjectId: subjectId,

                subjectName:
                    subjectId === "unknown"
                        ? "Other"
                        : getStudentCbtSubjectName(subjectId),

                totalQuestions: 0,

                correctAnswers: 0,

                wrongAnswers: 0,

                unanswered: 0,

                percentage: 0

            };

        }

        const result =
            subjectResults[subjectId];

        result.totalQuestions++;


        /*
         * COUNT CORRECT, WRONG
         * AND UNANSWERED QUESTIONS
         */

        if (answer.isCorrect) {

            result.correctAnswers++;

        } else if (answer.isAnswered) {

            result.wrongAnswers++;

        } else {

            result.unanswered++;

        }

    });


    /*
     * CALCULATE EACH SUBJECT'S PERCENTAGE
     */

    return Object.values(subjectResults).map(
        result => {

            result.percentage =
                result.totalQuestions > 0
                    ? Number(
                        (
                            result.correctAnswers /
                            result.totalQuestions
                        * 100).toFixed(2)
                    )
                    : 0;

            return result;

        }
    );

}



/* =========================================================
   RENDER SUBJECT RESULTS
========================================================= */

function renderStudentCbtSubjectResults(subjectResults) {

    const container =
        document.getElementById(
            "studentCbtSubjectResults"
        );

    if (!container) {

        console.error(
            "Aplus CBT: Subject results container not found."
        );

        return;

    }

    container.replaceChildren();


    if (
        !Array.isArray(subjectResults) ||
        subjectResults.length === 0
    ) {

        const message =
            document.createElement("p");

        message.textContent =
            "No subject results are available.";

        container.appendChild(message);

        return;

    }


    /*
     * CREATE A RESULT CARD FOR EACH SUBJECT
     */

    subjectResults.forEach(subject => {

        const card =
            document.createElement("div");

        card.className =
            "student-cbt-subject-result-card";


        /*
         * SUBJECT HEADING
         */

        const heading =
            document.createElement("h4");

        heading.className =
            "student-cbt-subject-result-title";

        heading.textContent =
            subject.subjectName;


        /*
         * SUBJECT SCORE
         */

        const percentage =
            document.createElement("div");

        percentage.className =
            "student-cbt-subject-result-percentage";

        percentage.textContent =
            `${subject.percentage}%`;


        /*
         * PROGRESS BAR
         */

        const progressTrack =
            document.createElement("div");

        progressTrack.className =
            "student-cbt-subject-progress-track";


        const progressBar =
            document.createElement("div");

        progressBar.className =
            "student-cbt-subject-progress-bar";

        progressBar.style.width =
            `${Math.min(
                100,
                Math.max(0, subject.percentage)
            )}%`;

        progressTrack.appendChild(progressBar);


        /*
         * SUBJECT STATISTICS
         */

        const statistics =
            document.createElement("div");

        statistics.className =
            "student-cbt-subject-result-stats";


        const total =
            document.createElement("p");

        total.textContent =
            `Total Questions: ${subject.totalQuestions}`;


        const correct =
            document.createElement("p");

        correct.textContent =
            `Correct: ${subject.correctAnswers}`;


        const wrong =
            document.createElement("p");

        wrong.textContent =
            `Wrong: ${subject.wrongAnswers}`;


        const unanswered =
            document.createElement("p");

        unanswered.textContent =
            `Unanswered: ${subject.unanswered}`;


        statistics.append(
            total,
            correct,
            wrong,
            unanswered
        );


        /*
         * ASSEMBLE CARD
         */

        card.append(
            heading,
            percentage,
            progressTrack,
            statistics
        );

        container.appendChild(card);

    });

}


/* =========================================================
   RENDER OVERALL CBT RESULTS
========================================================= */

function renderStudentCbtResults(resultData) {

    const {
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        percentage,
        timeUsed,
        subjectResults
    } = resultData;


    /*
     * FORMAT TIME USED
     */

    const safeTimeUsed =
        Math.max(0, Number(timeUsed) || 0);

    const hours =
        Math.floor(safeTimeUsed / 3600);

    const minutes =
        Math.floor(
            (safeTimeUsed % 3600) / 60
        );

    const seconds =
        safeTimeUsed % 60;

    const formattedTime =
        hours > 0
            ? `${hours}h ${minutes}m ${seconds}s`
            : minutes > 0
                ? `${minutes}m ${seconds}s`
                : `${seconds}s`;


    /*
     * OVERALL PERCENTAGE
     */

    const percentageElement =
        document.getElementById(
            "studentCbtOverallPercentage"
        );

    if (percentageElement) {

        percentageElement.textContent =
            `${percentage.toFixed(2)}%`;

    }


    /*
     * OVERALL SUMMARY
     */

    const summaryElement =
        document.getElementById(
            "studentCbtOverallSummary"
        );

    if (summaryElement) {

        summaryElement.textContent =
            `You scored ${correctAnswers} out of ` +
            `${totalQuestions} questions correctly.`;

    }


    /*
     * CORRECT ANSWERS
     */

    const correctElement =
        document.getElementById(
            "studentCbtResultCorrect"
        );

    if (correctElement) {

        correctElement.textContent =
            correctAnswers;

    }


    /*
     * WRONG ANSWERS
     */

    const wrongElement =
        document.getElementById(
            "studentCbtResultWrong"
        );

    if (wrongElement) {

        wrongElement.textContent =
            wrongAnswers;

    }


    /*
     * UNANSWERED QUESTIONS
     */

    const unansweredElement =
        document.getElementById(
            "studentCbtResultUnanswered"
        );

    if (unansweredElement) {

        unansweredElement.textContent =
            unanswered;

    }


    /*
     * TOTAL QUESTIONS
     */

    const totalElement =
        document.getElementById(
            "studentCbtResultTotal"
        );

    if (totalElement) {

        totalElement.textContent =
            totalQuestions;

    }


    /*
     * TIME USED
     */

    const timeElement =
        document.getElementById(
            "studentCbtResultTime"
        );

    if (timeElement) {

        timeElement.textContent =
            formattedTime;

    }


    /*
     * NUMBER OF SUBJECTS
     */

    const subjectsElement =
        document.getElementById(
            "studentCbtResultSubjectsCount"
        );

    if (subjectsElement) {

        subjectsElement.textContent =
            subjectResults.length;

    }


    /*
     * RENDER SUBJECT BREAKDOWN
     */

    renderStudentCbtSubjectResults(
        subjectResults
    );


    console.log(
        "Aplus CBT: Results rendered.",
        resultData
    );

}


/* =========================================================
   SHOW CBT RESULTS SCREEN
========================================================= */

function showStudentCbtResultsScreen() {

    const resultsScreen =
        document.getElementById(
            "studentCbtResultsScreen"
        );

    const questionScreen =
        document.getElementById(
            "studentCbtQuestionScreen"
        );

    if (!resultsScreen) {

        throw new Error(
            "The CBT results screen was not found in the HTML."
        );

    }


    /*
     * STOP COUNTDOWN TIMER
     */

    if (
        typeof stopStudentCbtTimer === "function"
    ) {

        stopStudentCbtTimer();

    }


    /*
     * HIDE QUESTION SCREEN
     */

    if (questionScreen) {

        questionScreen.classList.add("d-none");

    }


    /*
     * HIDE SETUP SCREEN
     */

    if (
        studentCbtElements &&
        studentCbtElements.setupScreen
    ) {

        studentCbtElements.setupScreen.classList.add(
            "d-none"
        );

    }


    /*
     * DISPLAY RESULTS
     */

    resultsScreen.classList.remove("d-none");

    resultsScreen.setAttribute(
        "aria-live",
        "polite"
    );


    /*
     * SCROLL TO RESULTS
     */

    resultsScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}



/* =========================================================
   APLUS TUTORS
   STUDENT CBT
   PHASE 3 — CREATE CORRECTIONS SECTION
========================================================= */

function createStudentCbtCorrectionsSection() {

    const resultsScreen =
        document.getElementById(
            "studentCbtResultsScreen"
        );

    if (!resultsScreen) {

        throw new Error(
            "The CBT results screen was not found."
        );

    }


    /*
     * REUSE EXISTING SECTION
     */

    let container =
        document.getElementById(
            "studentCbtCorrections"
        );

    if (container) {
        return container;
    }


    /*
     * CREATE CORRECTIONS CONTAINER
     */

    container =
        document.createElement("section");

    container.id =
        "studentCbtCorrections";

    container.className =
        "student-cbt-corrections";

    container.setAttribute(
        "aria-label",
        "Examination corrections"
    );


    /*
     * CREATE HEADING
     */

    const heading =
        document.createElement("h2");

    heading.className =
        "student-cbt-corrections-heading";

    heading.textContent =
        "Review Your Answers";


    /*
     * CREATE INTRODUCTION
     */

    const introduction =
        document.createElement("p");

    introduction.className =
        "student-cbt-corrections-intro";

    introduction.textContent =
        "Review each question, compare your answer " +
        "with the correct answer, and read the explanation.";


    /*
     * CREATE FILTER
     */

    const filterLabel =
        document.createElement("label");

    filterLabel.className =
        "student-cbt-corrections-filter-label";

    filterLabel.htmlFor =
        "studentCbtCorrectionFilter";

    filterLabel.textContent =
        "Show questions: ";


    const filter =
        document.createElement("select");

    filter.id =
        "studentCbtCorrectionFilter";

    filter.className =
        "student-cbt-corrections-filter";


    const filterOptions = [
        {
            value: "all",
            label: "All questions"
        },
        {
            value: "correct",
            label: "Correct answers"
        },
        {
            value: "wrong",
            label: "Wrong answers"
        },
        {
            value: "unanswered",
            label: "Unanswered questions"
        }
    ];


    filterOptions.forEach(item => {

        const option =
            document.createElement("option");

        option.value =
            item.value;

        option.textContent =
            item.label;

        filter.appendChild(option);

    });


    filterLabel.appendChild(filter);


    /*
     * CREATE QUESTION LIST
     */

    const list =
        document.createElement("div");

    list.id =
        "studentCbtCorrectionList";

    list.className =
        "student-cbt-correction-list";


    /*
     * ASSEMBLE SECTION
     */

    container.append(
        heading,
        introduction,
        filterLabel,
        list
    );


    /*
     * PLACE AFTER SUBJECT RESULTS
     */

    const subjectResults =
        document.getElementById(
            "studentCbtSubjectResults"
        );

    if (
        subjectResults &&
        subjectResults.parentNode
    ) {

        subjectResults.insertAdjacentElement(
            "afterend",
            container
        );

    } else {

        resultsScreen.appendChild(container);

    }


    return container;

}



/* =========================================================
   RENDER STUDENT CBT CORRECTIONS
========================================================= */

function renderStudentCbtCorrections(answerResults) {

    const container =
        createStudentCbtCorrectionsSection();

    const list =
        container.querySelector(
            "#studentCbtCorrectionList"
        );

    const filter =
        container.querySelector(
            "#studentCbtCorrectionFilter"
        );


    if (!list) {

        console.error(
            "Aplus CBT: Corrections list not found."
        );

        return;

    }


    /*
     * KEEP RESULTS AVAILABLE FOR FILTERING
     */

    const results =
        Array.isArray(answerResults)
            ? answerResults
            : [];


    /*
     * RENDER A SINGLE CORRECTION
     */

    function createCorrectionCard(answer, index) {

        const card =
            document.createElement("article");

        card.className =
            "student-cbt-correction-card";


        /*
         * DETERMINE ANSWER STATUS
         */

        let status;
        let statusLabel;

        if (!answer.isAnswered) {

            status = "unanswered";

            statusLabel = "Unanswered";

        } else if (answer.isCorrect) {

            status = "correct";

            statusLabel = "Correct";

        } else {

            status = "wrong";

            statusLabel = "Incorrect";

        }

        card.classList.add(
            `student-cbt-correction-${status}`
        );


        /*
         * QUESTION HEADER
         */

        const header =
            document.createElement("div");

        header.className =
            "student-cbt-correction-header";


        const questionNumber =
            document.createElement("h3");

        questionNumber.className =
            "student-cbt-correction-number";

        questionNumber.textContent =
            `Question ${index + 1}`;


        const subject =
            document.createElement("span");

        subject.className =
            "student-cbt-correction-subject";

        subject.textContent =
            answer.subjectName ||
            getStudentCbtSubjectName(
                answer.subjectId
            );


        header.append(
            questionNumber,
            subject
        );


        /*
         * STATUS BADGE
         */

        const badge =
            document.createElement("span");

        badge.className =
            "student-cbt-correction-badge";

        badge.textContent =
            statusLabel;

        badge.setAttribute(
            "aria-label",
            `Answer status: ${statusLabel}`
        );


        /*
         * QUESTION TEXT
         */

        const questionText =
            document.createElement("div");

        questionText.className =
            "student-cbt-correction-question";


        renderStudentCbtRichContent(
            questionText,
            answer.questionText || "Question text unavailable."
        );


        /*
         * OPTIONS
         */

        const optionsContainer =
            document.createElement("div");

        optionsContainer.className =
            "student-cbt-correction-options";


        const normalizedCorrect =
            normalizeStudentCbtAnswer(
                answer.correctAnswer
            );

        const normalizedStudent =
            normalizeStudentCbtAnswer(
                answer.studentAnswer
            );


        const options =
            Array.isArray(answer.options)
                ? answer.options
                : [];


        options.forEach(option => {

            const optionRow =
                document.createElement("div");

            optionRow.className =
                "student-cbt-correction-option";


            const optionKey =
                normalizeStudentCbtAnswer(
                    option.key
                );


            const isCorrectOption =
                optionKey === normalizedCorrect;

            const isSelectedOption =
                answer.isAnswered &&
                optionKey === normalizedStudent;


            if (isCorrectOption) {

                optionRow.classList.add(
                    "is-correct-answer"
                );

            }

            if (
                isSelectedOption &&
                !answer.isCorrect
            ) {

                optionRow.classList.add(
                    "is-student-answer"
                );

            }


            /*
             * OPTION LABEL
             */

            const optionLabel =
                document.createElement("span");

            optionLabel.className =
                "student-cbt-correction-option-key";

            optionLabel.textContent =
                `${option.key}.`;


            /*
             * OPTION TEXT
             */

            const optionText =
                document.createElement("div");

            optionText.className =
                "student-cbt-correction-option-text";


            renderStudentCbtRichContent(
                optionText,
                option.text
            );


            optionRow.append(
                optionLabel,
                optionText
            );


            /*
             * CORRECT ANSWER INDICATOR
             */

            if (isCorrectOption) {

                const indicator =
                    document.createElement("span");

                indicator.className =
                    "student-cbt-correction-indicator";

                indicator.textContent =
                    "Correct answer";

                optionRow.appendChild(
                    indicator
                );

            }


            /*
             * STUDENT ANSWER INDICATOR
             */

            if (isSelectedOption) {

                const indicator =
                    document.createElement("span");

                indicator.className =
                    "student-cbt-correction-indicator";

                indicator.textContent =
                    "Your answer";

                optionRow.appendChild(
                    indicator
                );

            }


            optionsContainer.appendChild(
                optionRow
            );

        });


        /*
         * ANSWER SUMMARY
         */

        const answerSummary =
            document.createElement("div");

        answerSummary.className =
            "student-cbt-correction-answer-summary";


        const yourAnswer =
            document.createElement("p");

        yourAnswer.className =
            "student-cbt-correction-your-answer";


        if (answer.isAnswered) {

            yourAnswer.textContent =
                `Your answer: ${normalizedStudent}`;

        } else {

            yourAnswer.textContent =
                "Your answer: Not answered";

        }


        const correctAnswer =
            document.createElement("p");

        correctAnswer.className =
            "student-cbt-correction-correct-answer";

        correctAnswer.textContent =
            `Correct answer: ${normalizedCorrect || "Not provided"}`;


        answerSummary.append(
            yourAnswer,
            correctAnswer
        );


        /*
         * EXPLANATION
         */

        const explanation =
            document.createElement("div");

        explanation.className =
            "student-cbt-correction-explanation";


        if (
            answer.explanation &&
            String(answer.explanation).trim()
        ) {

            const explanationHeading =
                document.createElement("h4");

            explanationHeading.textContent =
                "Explanation";


            const explanationContent =
                document.createElement("div");

            explanationContent.className =
                "student-cbt-correction-explanation-content";


            renderStudentCbtRichContent(
                explanationContent,
                answer.explanation
            );


            explanation.append(
                explanationHeading,
                explanationContent
            );

        }


        /*
         * ASSEMBLE CARD
         */

        card.append(
            header,
            badge,
            questionText,
            optionsContainer,
            answerSummary
        );


        if (explanation.childNodes.length > 0) {

            card.appendChild(explanation);

        }


        return card;

    }


    /*
     * DISPLAY MATCHING QUESTIONS
     */

    function applyFilter() {

        const selectedFilter =
            filter ? filter.value : "all";

        list.replaceChildren();


        const filteredResults =
            results
                .map((answer, index) => ({
                    answer,
                    index
                }))
                .filter(item => {

                    if (selectedFilter === "correct") {

                        return item.answer.isCorrect;

                    }

                    if (selectedFilter === "wrong") {

                        return (
                            item.answer.isAnswered &&
                            !item.answer.isCorrect
                        );

                    }

                    if (selectedFilter === "unanswered") {

                        return !item.answer.isAnswered;

                    }

                    return true;

                });


        if (filteredResults.length === 0) {

            const message =
                document.createElement("p");

            message.className =
                "student-cbt-corrections-empty";

            message.textContent =
                "No questions match this filter.";

            list.appendChild(message);

            return;

        }


        filteredResults.forEach(item => {

            list.appendChild(
                createCorrectionCard(
                    item.answer,
                    item.index
                )
            );

        });


        /*
         * RENDER ANY NEW MATHJAX CONTENT
         */

        if (
            window.MathJax &&
            typeof MathJax.typesetPromise === "function"
        ) {

            MathJax.typesetPromise([list])
                .catch(error => {

                    console.error(
                        "Aplus CBT: Correction MathJax rendering failed.",
                        error
                    );

                });

        }

    }


    /*
     * BIND FILTER
     */

    if (filter) {

        filter.onchange =
            applyFilter;

    }


    /*
     * INITIAL RENDER
     */

    applyFilter();

}