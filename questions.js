/* ==================================================
   APLUS TUTORS
   ADMIN QUESTION BANK
   PHASE 3 — INITIALIZATION, SUBJECTS, TOPICS
   AND QUESTION LOADING
================================================== */


/* ==================================================
   QUESTION STATE
================================================== */

let questionsData = [];

let questionSubjectsData = [];

let questionTopicsData = [];

let currentQuestion = null;

let editingQuestionId = null;

let questionModalInstance = null;


/* ==================================================
   INITIALIZE QUESTION PAGE
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            await initializeQuestionPage();

        }
        catch (error) {

            console.error(
                "========================================"
            );

            console.error(
                "QUESTION PAGE INITIALIZATION ERROR"
            );

            console.error(
                "========================================"
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
                "Error stack:",
                error?.stack
            );

            console.error(
                "Full error:",
                error
            );

        }

    }
);


/* ==================================================
   INITIALIZE QUESTION PAGE
================================================== */

async function initializeQuestionPage() {

    /*
        Authentication is already handled by
        guard.js.

        We still retrieve the current admin
        because createdBy will be stored with
        each question.
    */

    await loadCurrentQuestionAdmin();


    /*
        Prepare Bootstrap modal.
    */

    initializeQuestionModal();


    /*
        Load subjects.
    */

    await loadQuestionSubjects();


    /*
        Load topics.
    */

    await loadQuestionTopics();


    /*
        Prepare page controls.
    */

    initializeQuestionControls();


    /*
        Load questions.
    */

    await loadQuestions();


    console.log(
        "Question page initialized successfully."
    );

}


/* ==================================================
   CURRENT ADMIN
================================================== */

let currentQuestionAdmin = null;


/* ==================================================
   LOAD CURRENT ADMIN
================================================== */

async function loadCurrentQuestionAdmin() {

    try {

        currentQuestionAdmin =
            await account.get();


        console.log(
            "Current Question Admin:",
            currentQuestionAdmin
        );


    } catch (error) {

        console.error(
            "Unable to load current admin:",
            error
        );

        throw error;

    }

}


/* ==================================================
   INITIALIZE QUESTION MODAL
================================================== */

function initializeQuestionModal() {

    const modalElement =
        document.getElementById(
            "questionModal"
        );


    if (!modalElement) {

        console.warn(
            "Question modal was not found."
        );

        return;

    }


    questionModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

}


/* ==================================================
   LOAD QUESTION SUBJECTS
================================================== */

async function loadQuestionSubjects() {

    try {

        const allSubjects = [];

        let lastId = null;


        /*
            Use pagination so the page is not
            limited to Appwrite's default page size.
        */

        while (true) {

            const queries = [

                Query.limit(100),

                Query.orderAsc("name")

            ];


            if (lastId) {

                queries.push(
                    Query.cursorAfter(lastId)
                );

            }


            const response =
                await tablesDB.listRows(
                    DATABASE_ID,
                    SUBJECTS_TABLE_ID,
                    queries
                );


            const rows =
                response.rows || [];


            allSubjects.push(
                ...rows
            );


            if (rows.length < 100) {

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


            lastId =
                lastRow.$id;

        }


        /*
            Only active subjects should be
            available when creating questions.
        */

        questionSubjectsData =
            allSubjects.filter(
                function (subject) {

                    return String(
                        subject.status || ""
                    ).toLowerCase() === "active";

                }
            );


        console.log(
            "Question subjects loaded:",
            questionSubjectsData
        );


        /*
            Populate subject dropdowns.
        */

        populateQuestionSubjectDropdowns();


        /*
            Update subject statistic.
        */

        updateQuestionStatistics();


    } catch (error) {

        console.error(
            "Unable to load question subjects:",
            error
        );

    }

}


/* ==================================================
   POPULATE SUBJECT DROPDOWNS
================================================== */

function populateQuestionSubjectDropdowns() {

    const subjectInput =
        document.getElementById(
            "questionSubject"
        );


    const subjectFilter =
        document.getElementById(
            "questionSubjectFilter"
        );


    /*
        MODAL SUBJECT DROPDOWN
    */

    if (subjectInput) {

        subjectInput.innerHTML = `
            <option value="">
                Select subject
            </option>
        `;


        questionSubjectsData.forEach(
            function (subject) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject.$id;


                option.textContent =
                    subject.name;


                subjectInput.appendChild(
                    option
                );

            }
        );

    }


    /*
        FILTER SUBJECT DROPDOWN
    */

    if (subjectFilter) {

        subjectFilter.innerHTML = `
            <option value="">
                All Subjects
            </option>
        `;


        questionSubjectsData.forEach(
            function (subject) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    subject.$id;


                option.textContent =
                    subject.name;


                subjectFilter.appendChild(
                    option
                );

            }
        );

    }

}


/* ==================================================
   LOAD QUESTION TOPICS
================================================== */

async function loadQuestionTopics() {

    try {

        const allTopics = [];

        let lastId = null;


        /*
            Pagination.
        */

        while (true) {

            const queries = [

                Query.limit(100),

                Query.orderAsc("name")

            ];


            if (lastId) {

                queries.push(
                    Query.cursorAfter(lastId)
                );

            }


            const response =
                await tablesDB.listRows(
                    DATABASE_ID,
                    TOPICS_TABLE_ID,
                    queries
                );


            const rows =
                response.rows || [];


            allTopics.push(
                ...rows
            );


            if (rows.length < 100) {

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


            lastId =
                lastRow.$id;

        }


        /*
            Only active topics should be available
            for new questions.
        */

        questionTopicsData =
            allTopics.filter(
                function (topic) {

                    return String(
                        topic.status || ""
                    ).toLowerCase() === "active";

                }
            );


        console.log(
            "Question topics loaded:",
            questionTopicsData
        );


        /*
            Populate the topic filter.
        */

        populateQuestionTopicFilter();


    } catch (error) {

        console.error(
            "Unable to load question topics:",
            error
        );

    }

}


/* ==================================================
   POPULATE TOPIC FILTER
================================================== */

function populateQuestionTopicFilter() {

    const topicFilter =
        document.getElementById(
            "questionTopicFilter"
        );


    if (!topicFilter) {

        return;

    }


    topicFilter.innerHTML = `
        <option value="">
            All Topics
        </option>
    `;


    questionTopicsData.forEach(
        function (topic) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                topic.$id;


            option.textContent =
                topic.name;


            topicFilter.appendChild(
                option
            );

        }
    );

}


/* ==================================================
   POPULATE MODAL TOPICS
================================================== */

function populateQuestionTopics(
    subjectId,
    selectedTopicId = ""
) {

    const topicInput =
        document.getElementById(
            "questionTopic"
        );


    if (!topicInput) {

        return;

    }


    topicInput.innerHTML = `
        <option value="">
            Select topic
        </option>
    `;


    if (!subjectId) {

        return;

    }


    const matchingTopics =
        questionTopicsData.filter(
            function (topic) {

                return topic.subjectId === subjectId;

            }
        );


    matchingTopics.forEach(
        function (topic) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                topic.$id;


            option.textContent =
                topic.name;


            topicInput.appendChild(
                option
            );

        }
    );


    if (selectedTopicId) {

        topicInput.value =
            selectedTopicId;

    }

}


/* ==================================================
   INITIALIZE QUESTION CONTROLS
================================================== */

function initializeQuestionControls() {

    /*
        ADD QUESTION BUTTON
    */

    const addQuestionBtn =
        document.getElementById(
            "addQuestionBtn"
        );


    if (addQuestionBtn) {

        addQuestionBtn.addEventListener(
            "click",
            openAddQuestionModal
        );

    }


    /*
        EMPTY STATE ADD BUTTON
    */

    const emptyAddQuestionBtn =
        document.getElementById(
            "emptyAddQuestionBtn"
        );


    if (emptyAddQuestionBtn) {

        emptyAddQuestionBtn.addEventListener(
            "click",
            openAddQuestionModal
        );

    }


    /*
        SUBJECT CHANGE
    */

    const questionSubject =
        document.getElementById(
            "questionSubject"
        );


    if (questionSubject) {

        questionSubject.addEventListener(
            "change",
            function () {

                populateQuestionTopics(
                    this.value
                );

            }
        );

    }


    /*
        SEARCH
    */

    const searchInput =
        document.getElementById(
            "questionSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterQuestions
        );

    }


    /*
        SUBJECT FILTER
    */

    const subjectFilter =
        document.getElementById(
            "questionSubjectFilter"
        );


    if (subjectFilter) {

        subjectFilter.addEventListener(
            "change",
            filterQuestions
        );

    }


    /*
        TOPIC FILTER
    */

    const topicFilter =
        document.getElementById(
            "questionTopicFilter"
        );


    if (topicFilter) {

        topicFilter.addEventListener(
            "change",
            filterQuestions
        );

    }


    /*
        DIFFICULTY FILTER
    */

    const difficultyFilter =
        document.getElementById(
            "questionDifficultyFilter"
        );


    if (difficultyFilter) {

        difficultyFilter.addEventListener(
            "change",
            filterQuestions
        );

    }


    /*
        STATUS FILTER
    */

    const statusFilter =
        document.getElementById(
            "questionStatusFilter"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterQuestions
        );

    }


    /*
        SAVE QUESTION
    */

    const saveQuestionBtn =
        document.getElementById(
            "saveQuestionBtn"
        );


    if (saveQuestionBtn) {

        saveQuestionBtn.addEventListener(
            "click",
            handleSaveQuestion
        );

    }


    /*
        QUESTION TABLE ACTIONS
    */

    const tableBody =
        document.getElementById(
            "questionsTableBody"
        );



}


/* ==================================================
   LOAD QUESTIONS
================================================== */

async function loadQuestions() {

    try {

        showQuestionsLoading();


        const allQuestions = [];

        let lastId = null;


        /*
            Pagination.
        */

        while (true) {

            const queries = [

                Query.limit(100),

                Query.orderDesc("$createdAt")

            ];


            if (lastId) {

                queries.push(
                    Query.cursorAfter(lastId)
                );

            }


            const response =
                await tablesDB.listRows(
                    DATABASE_ID,
                    QUESTIONS_TABLE_ID,
                    queries
                );


            const rows =
                response.rows || [];


            allQuestions.push(
                ...rows
            );


            if (rows.length < 100) {

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


            lastId =
                lastRow.$id;

        }


        questionsData =
            allQuestions;


        console.log(
            "Questions loaded:",
            questionsData
        );


        updateQuestionStatistics();

        filterQuestions();


    } catch (error) {

        console.error(
            "Unable to load questions:",
            error
        );


        showQuestionsError(error);

    }

}



/* ==================================================
   QUESTIONS LOADING STATE
================================================== */

function showQuestionsLoading() {

    const tableBody =
        document.getElementById(
            "questionsTableBody"
        );

    const emptyState =
        document.getElementById(
            "questionsEmptyState"
        );

    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="questions-loading"
            >

                <div>

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                    <span>
                        Loading questions...
                    </span>

                </div>

            </td>

        </tr>

    `;

}


/* ==================================================
   QUESTIONS ERROR STATE
================================================== */

function showQuestionsError(error) {

    const tableBody =
        document.getElementById(
            "questionsTableBody"
        );

    const emptyState =
        document.getElementById(
            "questionsEmptyState"
        );

    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="text-center py-5"
            >

                <div class="py-4">

                    <div class="mb-3">

                        <i
                            class="fa-solid fa-triangle-exclamation fa-2x text-danger"
                        ></i>

                    </div>

                    <h5>
                        Unable to load questions
                    </h5>

                    <p class="text-muted mb-3">
                        ${escapeQuestionHtml(
                            error?.message ||
                            "An unexpected error occurred."
                        )}
                    </p>

                    <button
                        type="button"
                        class="btn btn-primary"
                        onclick="loadQuestions()"
                    >

                        <i class="fa-solid fa-rotate-right"></i>

                        Try Again

                    </button>

                </div>

            </td>

        </tr>

    `;

}
/* ==================================================
   FILTER QUESTIONS
================================================== */

function filterQuestions() {

    const searchInput =
        document.getElementById(
            "questionSearch"
        );


    const subjectFilter =
        document.getElementById(
            "questionSubjectFilter"
        );


    const topicFilter =
        document.getElementById(
            "questionTopicFilter"
        );


    const difficultyFilter =
        document.getElementById(
            "questionDifficultyFilter"
        );


    const statusFilter =
        document.getElementById(
            "questionStatusFilter"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const subjectId =
        subjectFilter
            ? subjectFilter.value
            : "";


    const topicId =
        topicFilter
            ? topicFilter.value
            : "";


    const difficulty =
        difficultyFilter
            ? difficultyFilter.value
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const filteredQuestions =
        questionsData.filter(
            function (question) {


                /*
                    SEARCH
                */

                const questionText =
                    String(
                        question.questionText ||
                        question.question ||
                        ""
                    ).toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    questionText.includes(
                        searchTerm
                    );


                /*
                    SUBJECT
                */

                const matchesSubject =
                    !subjectId ||
                    question.subjectId === subjectId;


                /*
                    TOPIC
                */

                const matchesTopic =
                    !topicId ||
                    question.topicId === topicId;


                /*
                    DIFFICULTY
                */

                const matchesDifficulty =
                    !difficulty ||
                    String(
                        question.difficulty || ""
                    ).toLowerCase() ===
                    difficulty.toLowerCase();


                /*
                    STATUS
                */

                const matchesStatus =
                    !status ||
                    String(
                        question.status || ""
                    ).toLowerCase() ===
                    status.toLowerCase();


                return (
                    matchesSearch &&
                    matchesSubject &&
                    matchesTopic &&
                    matchesDifficulty &&
                    matchesStatus
                );

            }
        );


renderQuestionsTable(
    filteredQuestions
);


    updateVisibleQuestionCount(
        filteredQuestions.length
    );

}


/* ==================================================
UPDATE QUESTION STATISTICS
================================================== */

function updateQuestionStatistics() {

const totalElement =
    document.getElementById(
        "totalQuestions"
    );


const activeElement =
    document.getElementById(
        "activeQuestions"
    );


const subjectsElement =
    document.getElementById(
        "questionSubjects"
    );


const topicsElement =
    document.getElementById(
        "questionTopics"
    );


const total =
    questionsData.length;


const active =
    questionsData.filter(
        function (question) {

            return String(
                question.status || ""
            ).toLowerCase() === "active";

        }
    ).length;


const subjectIds =
    new Set(
        questionsData
            .map(
                question =>
                    question.subjectId
            )
            .filter(Boolean)
    );


const topicIds =
    new Set(
        questionsData
            .map(
                question =>
                    question.topicId
            )
            .filter(Boolean)
    );


if (totalElement) {

    totalElement.textContent =
        total;

}


if (activeElement) {

    activeElement.textContent =
        active;

}


if (subjectsElement) {

    subjectsElement.textContent =
        subjectIds.size;

}


if (topicsElement) {

    topicsElement.textContent =
        topicIds.size;

}

}

/* ==================================================
UPDATE VISIBLE QUESTION COUNT
================================================== */

function updateVisibleQuestionCount(
visibleQuestions
) {

const countElement =
    document.getElementById(
        "visibleQuestionCount"
    );


if (!countElement) {

    return;

}


countElement.textContent =
    visibleQuestions.length;

}

/* ==================================================
GET SUBJECT NAME
================================================== */

function getQuestionSubjectName(
subjectId
) {

const subject =
    questionSubjectsData.find(
        function (item) {

            return item.$id === subjectId;

        }
    );


return subject
    ? subject.name
    : "Unknown subject";

}

/* ==================================================
GET TOPIC NAME
================================================== */

function getQuestionTopicName(
topicId
) {

const topic =
    questionTopicsData.find(
        function (item) {

            return item.$id === topicId;

        }
    );


return topic
    ? topic.name
    : "Unknown topic";

}

/* ==================================================
END OF PHASE 3
================================================== */


/* ==================================================
   APLUS TUTORS
   ADMIN QUESTION BANK
   PHASE 4 — ADD AND SAVE QUESTIONS
================================================== */


/* ==================================================
   OPEN ADD QUESTION MODAL
================================================== */

function openAddQuestionModal() {

    editingQuestionId = null;

    currentQuestion = null;


    const modalTitle =
        document.getElementById(
            "questionModalLabel"
        );


    const saveButtonText =
        document.getElementById(
            "saveQuestionText"
        );


    const form =
        document.getElementById(
            "questionForm"
        );


    /*
        Set modal title.
    */

    if (modalTitle) {

        modalTitle.textContent =
            "Add Question";

    }


    /*
        Set save button text.
    */

    if (saveButtonText) {

        saveButtonText.textContent =
            "Save Question";

    }


    /*
        Reset form.
    */

    if (form) {

        form.reset();

        clearQuestionFormValidation();

    }
    
    const questionEditor =
    document.getElementById(
        "questionText"
    );


if (questionEditor) {

    questionEditor.innerHTML = "";

}



    /*
        Clear hidden question ID.
    */

    const questionId =
        document.getElementById(
            "questionId"
        );


    if (questionId) {

        questionId.value = "";

    }


    /*
        Reset topic dropdown.
    */

    populateQuestionTopics("");


    /*
        Default status to active.
    */

    const status =
        document.getElementById(
            "questionStatus"
        );


    if (status) {

        status.checked = true;

    }


    /*
        Show modal.
    */

    if (questionModalInstance) {

        questionModalInstance.show();

    }

}


/* ==================================================
   HANDLE SAVE QUESTION
================================================== */

async function handleSaveQuestion() {

    /*
        Prevent accidental double-clicks.
    */

    if (
        handleSaveQuestion.isSaving
    ) {

        return;

    }


    const form =
        document.getElementById(
            "questionForm"
        );


    if (!form) {

        return;

    }


/* ==================================================
   READ FORM VALUES
================================================== */

const subjectId =
    document.getElementById(
        "questionSubject"
    )?.value || "";


const topicId =
    document.getElementById(
        "questionTopic"
    )?.value || "";


/* ==================================================
   RICH QUESTION EDITOR
================================================== */

const questionEditor =
    document.getElementById(
        "questionText"
    );

const question =
    questionEditor
        ? questionEditor.innerHTML.trim()
        : "";


const optionA =
    document.getElementById(
        "optionA"
    )?.value?.trim() || "";


const optionB =
    document.getElementById(
        "optionB"
    )?.value?.trim() || "";


const optionC =
    document.getElementById(
        "optionC"
    )?.value?.trim() || "";


const optionD =
    document.getElementById(
        "optionD"
    )?.value?.trim() || "";


const correctAnswer =
    document.getElementById(
        "correctAnswer"
    )?.value || "";


const explanation =
    document.getElementById(
        "questionExplanation"
    )?.value?.trim() || "";


const difficulty =
    document.getElementById(
        "questionDifficulty"
    )?.value || "";


const questionType =
    document.getElementById(
        "questionType"
    )?.value || "";


const statusElement =
    document.getElementById(
        "questionStatus"
    );


const status =
    statusElement &&
    statusElement.checked
        ? "active"
        : "inactive";


const saveButton =
    document.getElementById(
        "saveQuestionBtn"
    );

    /* ==================================================
       VALIDATION
    ================================================== */

    clearQuestionFormValidation();


    let isValid = true;


    if (!subjectId) {

        markQuestionFieldInvalid(
            "questionSubject"
        );

        isValid = false;

    }


    if (!topicId) {

        markQuestionFieldInvalid(
            "questionTopic"
        );

        isValid = false;

    }


    if (!question) {

        markQuestionFieldInvalid(
            "questionText"
        );

        isValid = false;

    }


    if (!optionA) {

        markQuestionFieldInvalid(
            "optionA"
        );

        isValid = false;

    }


    if (!optionB) {

        markQuestionFieldInvalid(
            "optionB"
        );

        isValid = false;

    }


    if (!optionC) {

        markQuestionFieldInvalid(
            "optionC"
        );

        isValid = false;

    }


    if (!optionD) {

        markQuestionFieldInvalid(
            "optionD"
        );

        isValid = false;

    }


    if (!correctAnswer) {

        markQuestionFieldInvalid(
            "correctAnswer"
        );

        isValid = false;

    }


    if (!difficulty) {

        markQuestionFieldInvalid(
            "questionDifficulty"
        );

        isValid = false;

    }


    if (!questionType) {

        markQuestionFieldInvalid(
            "questionType"
        );

        isValid = false;

    }


    if (!isValid) {

        showQuestionMessage(
            "Please complete all required question fields.",
            "warning"
        );

        return;

    }


    /* ==================================================
       ADMIN CHECK
    ================================================== */

    if (!currentQuestionAdmin) {

        showQuestionMessage(
            "Unable to identify the current administrator.",
            "danger"
        );

        return;

    }


    /* ==================================================
       DUPLICATE CHECK
    ================================================== */

    const duplicateQuestion =
        questionsData.find(
            function (item) {

                const existingQuestion =
                    String(
                        item.question || ""
                    )
                        .trim()
                        .toLowerCase();


                const currentQuestionText =
                    question
                        .trim()
                        .toLowerCase();


                /*
                    During editing, don't compare
                    the question with itself.
                */

                if (
                    editingQuestionId &&
                    item.$id === editingQuestionId
                ) {

                    return false;

                }


                return (
                    existingQuestion ===
                    currentQuestionText
                    &&
                    item.subjectId === subjectId
                    &&
                    item.topicId === topicId
                );

            }
        );


    if (duplicateQuestion) {

        showQuestionMessage(
            "This question already exists for the selected subject and topic.",
            "warning"
        );

        return;

    }


    /* ==================================================
       START SAVING
    ================================================== */

    handleSaveQuestion.isSaving = true;


    if (saveButton) {

        saveButton.disabled = true;


        saveButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
            ></span>

            <span>
                Saving...
            </span>
        `;

    }


    try {


        /* ==================================================
           QUESTION DATA
        ================================================== */

        const questionData = {

            subjectId: subjectId,

            topicId: topicId,

            question: question,

            optionA: optionA,

            optionB: optionB,

            optionC: optionC,

            optionD: optionD,

            correctAnswer: correctAnswer,

            explanation: explanation,

            difficulty: difficulty,

            questionType: questionType,

            status: status,

            createdBy:
                currentQuestionAdmin.$id

        };


        /* ==================================================
           CREATE QUESTION
        ================================================== */

        let savedQuestion;


if (editingQuestionId) {

    /*
        UPDATE EXISTING QUESTION
    */
    savedQuestion =
        await tablesDB.updateRow(
            DATABASE_ID,
            QUESTIONS_TABLE_ID,
            editingQuestionId,
            questionData
        );

}
else {

    /*
        CREATE NEW QUESTION
    */
    savedQuestion =
        await tablesDB.createRow(
            DATABASE_ID,
            QUESTIONS_TABLE_ID,
            ID.unique(),
            questionData
        );

}


        console.log(
    editingQuestionId
        ? "Question updated successfully:"
        : "Question created successfully:",
    savedQuestion
);


        /* ==================================================
           ADD TO LOCAL STATE
        ================================================== */

        if (editingQuestionId) {

    const index =
        questionsData.findIndex(
            function (item) {

                return item.$id ===
                    editingQuestionId;

            }
        );


    if (index !== -1) {

        questionsData[index] =
            savedQuestion;

    }

}
else {

    questionsData.unshift(
        savedQuestion
    );

}


        /* ==================================================
           UPDATE UI
        ================================================== */

        updateQuestionStatistics();

        filterQuestions();


        /* ==================================================
           CLOSE MODAL
        ================================================== */

        closeQuestionModal();


        /* ==================================================
           SUCCESS MESSAGE
        ================================================== */

        showQuestionMessage(
    editingQuestionId
        ? "Question updated successfully."
        : "Question created successfully.",
    "success"
);


    } catch (error) {

        console.error(
            "Unable to create question:",
            error
        );


        showQuestionMessage(
            getQuestionErrorMessage(error),
            "danger"
        );


    } finally {

        handleSaveQuestion.isSaving = false;


        if (saveButton) {

            saveButton.disabled = false;


            saveButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>

                <span id="saveQuestionText">
                    Save Question
                </span>
            `;

        }

    }

}


/* ==================================================
   CLOSE QUESTION MODAL
================================================== */

function closeQuestionModal() {

    const modalElement =
        document.getElementById(
            "questionModal"
        );


    if (!modalElement) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {

        modal.hide();

    }


    const form =
        document.getElementById(
            "questionForm"
        );


    if (form) {

        form.reset();

    }


    /*
        Reset topic dropdown.
    */

    populateQuestionTopics("");


    /*
        Reset status.
    */

    const status =
        document.getElementById(
            "questionStatus"
        );


    if (status) {

        status.checked = true;

    }


    editingQuestionId = null;

    currentQuestion = null;

}


/* ==================================================
   CLEAR FORM VALIDATION
================================================== */

function clearQuestionFormValidation() {

    const form =
        document.getElementById(
            "questionForm"
        );


    if (!form) {

        return;

    }


    const fields =
        form.querySelectorAll(
            ".is-invalid"
        );


    fields.forEach(
        function (field) {

            field.classList.remove(
                "is-invalid"
            );

        }
    );

}


/* ==================================================
   MARK QUESTION FIELD INVALID
================================================== */

function markQuestionFieldInvalid(
    fieldId
) {

    const field =
        document.getElementById(
            fieldId
        );


    if (!field) {

        return;

    }


    field.classList.add(
        "is-invalid"
    );

}


/* ==================================================
   QUESTION MESSAGE
================================================== */

function showQuestionMessage(
    message,
    type = "info"
) {

    /*
        Remove an existing message.
    */

    const existingAlert =
        document.getElementById(
            "questionPageAlert"
        );


    if (existingAlert) {

        existingAlert.remove();

    }


    const alert =
        document.createElement(
            "div"
        );


    alert.id =
        "questionPageAlert";


    alert.className =
        `alert alert-${type} question-page-alert`;


    alert.setAttribute(
        "role",
        "alert"
    );


    const icon =
        type === "success"
            ? "fa-circle-check"
            : type === "warning"
                ? "fa-triangle-exclamation"
                : type === "danger"
                    ? "fa-circle-xmark"
                    : "fa-circle-info";


    alert.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        <span>
            ${escapeQuestionHtml(message)}
        </span>

        <button
            type="button"
            class="btn-close"
            aria-label="Close"
        ></button>

    `;


    /*
        Insert into the questions page.
    */

    const page =
        document.querySelector(
            ".questions-page"
        );


    if (page) {

        page.prepend(
            alert
        );

    }


    /*
        Close button.
    */

    const closeButton =
        alert.querySelector(
            ".btn-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                alert.remove();

            }
        );

    }


    /*
        Automatically remove message.
    */

    setTimeout(
        function () {

            if (alert.parentNode) {

                alert.remove();

            }

        },
        5000
    );

}


/* ==================================================
   APPWRITE ERROR MESSAGE
================================================== */

function getQuestionErrorMessage(
    error
) {

    if (!error) {

        return "An unexpected error occurred.";

    }


    /*
        Permission error.
    */

    if (
        error.code === 401 ||
        error.code === 403
    ) {

        return (
            "You do not have permission to create questions."
        );

    }


    /*
        Conflict.
    */

    if (error.code === 409) {

        return (
            "This question already exists."
        );

    }


    /*
        Validation error.
    */

    if (error.code === 400) {

        return (
            error.message ||
            "Some question information is invalid."
        );

    }


    return (
        error.message ||
        "Unable to save the question. Please try again."
    );

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeQuestionHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}




/* ==================================================
PHASE 5 — RENDER QUESTIONS TABLE
================================================== */

/* ==================================================
RENDER QUESTION TABLE
================================================== */

function renderQuestionsTable(
questions
) {

const tableBody =
    document.getElementById(
        "questionsTableBody"
    );


const emptyState =
    document.getElementById(
        "questionsEmptyState"
    );


if (!tableBody) {

    return;

}


tableBody.innerHTML = "";


if (
    !questions ||
    questions.length === 0
) {

    if (emptyState) {

        emptyState.classList.remove(
            "d-none"
        );

    }


    return;

}


if (emptyState) {

    emptyState.classList.add(
        "d-none"
    );

}


questions.forEach(
    function (question, index) {

        const row =
            document.createElement("tr");


        const subjectName =
            getQuestionSubjectName(
                question.subjectId
            );


        const topicName =
            getQuestionTopicName(
                question.topicId
            );


        const difficulty =
            String(
                question.difficulty || ""
            ).toLowerCase();


        const questionType =
            String(
                question.questionType || ""
            ).toLowerCase();


        const status =
            String(
                question.status || ""
            ).toLowerCase();


        let difficultyBadge =
            "secondary";


        if (
            difficulty === "easy"
        ) {

            difficultyBadge =
                "success";

        }
        else if (
            difficulty === "medium"
        ) {

            difficultyBadge =
                "warning";

        }
        else if (
            difficulty === "hard"
        ) {

            difficultyBadge =
                "danger";

        }


        let statusBadge =
            "secondary";


        if (
            status === "active"
        ) {

            statusBadge =
                "success";

        }
        else if (
            status === "inactive"
        ) {

            statusBadge =
                "secondary";

        }


        const questionNumber =
            index + 1;


        const questionText =
            question.question || "";


        const shortQuestion =
            questionText.length > 90
                ? questionText.substring(
                    0,
                    90
                ) + "..."
                : questionText;


        row.innerHTML = `

            <td>
                <span class="question-number">
                    ${questionNumber}
                </span>
            </td>


            <td>

                <div class="question-preview">

                    <div
                        class="question-preview-text"
                        title="${escapeQuestionHtml(questionText)}"
                    >
                        ${escapeQuestionHtml(
                            shortQuestion
                        )}
                    </div>

                </div>

            </td>


            <td>

                <span class="question-subject">
                    ${escapeQuestionHtml(
                        subjectName
                    )}
                </span>

            </td>


            <td>

                <span class="question-topic">
                    ${escapeQuestionHtml(
                        topicName
                    )}
                </span>

            </td>


            <td>

                <span
                    class="badge text-bg-${difficultyBadge}"
                >
                    ${escapeQuestionHtml(
                        difficulty
                            ? difficulty.charAt(0).toUpperCase()
                                + difficulty.slice(1)
                            : "—"
                    )}
                </span>

            </td>


            <td>

                <span class="question-type-badge">

                    ${
                        questionType === "multiple_choice"
                            ? "Multiple Choice"
                            : escapeQuestionHtml(
                                question.questionType || "—"
                            )
                    }

                </span>

            </td>


            <td>

                <span
                    class="badge text-bg-${statusBadge}"
                >
                    ${
                        status === "active"
                            ? "Active"
                            : "Inactive"
                    }
                </span>

            </td>


            <td>

                <div class="question-actions">

                    <button
                        type="button"
                        class="btn btn-sm btn-light view-question-btn"
                        data-question-id="${question.$id}"
                        title="View question"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-light edit-question-btn"
                        data-question-id="${question.$id}"
                        title="Edit question"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-light delete-question-btn"
                        data-question-id="${question.$id}"
                        title="Delete question"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    }
);

}




/* ==================================================
   RENDER SAVED QUESTION HTML SAFELY
================================================== */

function renderSavedQuestionContent(
    element,
    html
) {

    if (!element) {

        return;

    }


    /*
        Clear any previous MathJax rendering.
    */

    if (
        window.MathJax &&
        typeof window.MathJax.typesetClear ===
            "function"
    ) {

        window.MathJax.typesetClear([
            element
        ]);

    }


    /*
        IMPORTANT:
        Saved rich HTML must be sanitized
        before being inserted into the page.

        This function expects the DOMPurify
        library to be loaded.
    */

    if (
        !window.DOMPurify ||
        typeof window.DOMPurify.sanitize !==
            "function"
    ) {

        console.error(
            "DOMPurify is missing. Question HTML was not rendered."
        );

        element.textContent =
            html || "";

        return;

    }


    element.innerHTML =
        window.DOMPurify.sanitize(
            html || ""
        );


    /*
        Typeset mathematics after the
        saved HTML has been inserted.
    */

    if (
        window.MathJax &&
        typeof window.MathJax.typesetPromise ===
            "function"
    ) {

        window.MathJax
            .typesetPromise([
                element
            ])
            .catch(
                function(error) {

                    console.error(
                        "Question viewer MathJax error:",
                        error
                    );

                }
            );

    }

}

/* ==================================================
VIEW QUESTION
================================================== */

function viewQuestion(
questionId
) {

const question =
    questionsData.find(
        function (item) {

            return item.$id === questionId;

        }
    );


if (!question) {

    showQuestionMessage(
        "Question not found.",
        "danger"
    );

    return;

}


currentQuestion =
    question;


const subjectName =
    getQuestionSubjectName(
        question.subjectId
    );


const topicName =
    getQuestionTopicName(
        question.topicId
    );


const difficulty =
    String(
        question.difficulty || ""
    );


const status =
    String(
        question.status || ""
    );


const type =
    String(
        question.questionType || ""
    );


const modalElement =
    document.getElementById(
        "viewQuestionModal"
    );


if (!modalElement) {

    showQuestionMessage(
        "View question modal is not available.",
        "danger"
    );

    return;

}


const setText =
    function (
        id,
        value
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value || "—";

        }

    };


setText(
    "viewQuestionSubject",
    subjectName
);


setText(
    "viewQuestionTopic",
    topicName
);


setText(
    "viewQuestionDifficulty",
    difficulty
);


setText(
    "viewQuestionType",
    type === "multiple_choice"
        ? "Multiple Choice"
        : type
);


setText(
    "viewQuestionStatus",
    status === "active"
        ? "Active"
        : "Inactive"
);


renderSavedQuestionContent(
    document.getElementById(
        "viewQuestionText"
    ),
    question.question
);


setText(
    "viewOptionA",
    question.optionA
);


setText(
    "viewOptionB",
    question.optionB
);


setText(
    "viewOptionC",
    question.optionC
);


setText(
    "viewOptionD",
    question.optionD
);


setText(
    "viewCorrectAnswer",
    question.correctAnswer
);


setText(
    "viewQuestionExplanation",
    question.explanation
);


const modal =
    bootstrap.Modal.getOrCreateInstance(
        modalElement
    );


modal.show();

}

/* ==================================================
EDIT QUESTION
================================================== */

function editQuestion(
questionId
) {

const question =
    questionsData.find(
        function (item) {

            return item.$id === questionId;

        }
    );


if (!question) {

    showQuestionMessage(
        "Question not found.",
        "danger"
    );

    return;

}


editingQuestionId =
    questionId;


currentQuestion =
    question;


const modalElement =
    document.getElementById(
        "questionModal"
    );


const modalTitle =
    document.getElementById(
        "questionModalLabel"
    );


const questionIdInput =
    document.getElementById(
        "questionId"
    );


if (modalTitle) {

    modalTitle.textContent =
        "Edit Question";

}

const subjectSelect =
    document.getElementById(
        "questionSubject"
    );


const topicSelect =
    document.getElementById(
        "questionTopic"
    );


const difficultySelect =
    document.getElementById(
        "questionDifficulty"
    );


const typeSelect =
    document.getElementById(
        "questionType"
    );


const questionInput =
    document.getElementById(
        "questionText"
    );


const optionAInput =
    document.getElementById(
        "optionA"
    );


const optionBInput =
    document.getElementById(
        "optionB"
    );


const optionCInput =
    document.getElementById(
        "optionC"
    );


const optionDInput =
    document.getElementById(
        "optionD"
    );


const correctAnswerInput =
    document.getElementById(
        "correctAnswer"
    );


const explanationInput =
    document.getElementById(
        "questionExplanation"
    );


const statusInput =
    document.getElementById(
        "questionStatus"
    );


if (subjectSelect) {

    subjectSelect.value =
        question.subjectId || "";

}


/*
   Populate topics for the selected subject
   before selecting the question topic.
*/

populateQuestionTopics(
    question.subjectId,
    question.topicId
);


if (difficultySelect) {

    difficultySelect.value =
        question.difficulty || "";

}


if (typeSelect) {

    typeSelect.value =
        question.questionType || "";

}


if (questionInput) {

    questionInput.innerHTML =
        question.question || "";

}

if (
    typeof window.aplusRenderQuestionMath ===
        "function"
) {

    window.aplusRenderQuestionMath();

}

if (optionAInput) {

    optionAInput.value =
        question.optionA || "";

}


if (optionBInput) {

    optionBInput.value =
        question.optionB || "";

}


if (optionCInput) {

    optionCInput.value =
        question.optionC || "";

}


if (optionDInput) {

    optionDInput.value =
        question.optionD || "";

}


if (correctAnswerInput) {

    correctAnswerInput.value =
        question.correctAnswer || "";

}


if (explanationInput) {

    explanationInput.value =
        question.explanation || "";

}


if (statusInput) {

    statusInput.checked =
        String(
            question.status || ""
        ).toLowerCase() === "active";

}


clearQuestionFormValidation();


const modal =
    bootstrap.Modal.getOrCreateInstance(
        modalElement
    );


modal.show();

}

/* ==================================================
DELETE QUESTION
================================================== */

async function deleteQuestion(
questionId
) {

const question =
    questionsData.find(
        function (item) {

            return item.$id === questionId;

        }
    );


if (!question) {

    showQuestionMessage(
        "Question not found.",
        "danger"
    );

    return;

}


const confirmed =
    window.confirm(
        "Are you sure you want to delete this question?\n\nThis action cannot be undone."
    );


if (!confirmed) {

    return;

}


try {

    showQuestionMessage(
        "Deleting question...",
        "info"
    );


    await tablesDB.deleteRow(
        DATABASE_ID,
        QUESTIONS_TABLE_ID,
        questionId
    );


    questionsData =
        questionsData.filter(
            function (item) {

                return item.$id !== questionId;

            }
        );


    currentQuestion =
        null;


    updateQuestionStatistics();


    filterQuestions();


    showQuestionMessage(
        "Question deleted successfully.",
        "success"
    );

}
catch (error) {

    console.error(
        "Delete question error:",
        error
    );


    showQuestionMessage(
        getQuestionErrorMessage(
            error,
            "Failed to delete question."
        ),
        "danger"
    );

}

}

/* ==================================================
QUESTION TABLE ACTION HANDLER
================================================== */

function initializeQuestionTableActions() {

const tableBody =
    document.getElementById(
        "questionsTableBody"
    );


if (!tableBody) {

    return;

}


tableBody.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "button[data-question-id]"
            );


        if (!button) {

            return;

        }


        const questionId =
            button.dataset.questionId;


        if (
            button.classList.contains(
                "view-question-btn"
            )
        ) {

            viewQuestion(
                questionId
            );

        }


        else if (
            button.classList.contains(
                "edit-question-btn"
            )
        ) {

            editQuestion(
                questionId
            );

        }


        else if (
            button.classList.contains(
                "delete-question-btn"
            )
        ) {

            deleteQuestion(
                questionId
            );

        }

    }
);

}

/* ==================================================
INITIALIZE TABLE ACTIONS
================================================== */

document.addEventListener(
"DOMContentLoaded",
function () {

    initializeQuestionTableActions();

}

);

/* ==================================================
END OF PHASE 5
================================================== */


/* =========================================================
   APLUS TUTORS
   MATHJAX QUESTION EDITOR
   IMPROVED PREVIEW RENDERING
========================================================= */

(function initializeMathQuestionEditor() {

    let previewTimer = null;

    let renderQueue = Promise.resolve();


    /* ==================================================
       GET EDITOR
    ================================================== */

    function getEditor() {

        return document.getElementById(
            "questionText"
        );

    }


    /* ==================================================
       GET PREVIEW
    ================================================== */

    function getPreview() {

        return document.getElementById(
            "questionMathPreview"
        );

    }


    /* ==================================================
       INSERT TEXT AT CURSOR
    ================================================== */

    function insertAtCursor(
        editor,
        text
    ) {

        if (!editor) {

            return;

        }


        editor.focus();


        const selection =
            window.getSelection();


        if (
            !selection ||
            selection.rangeCount === 0
        ) {

            editor.appendChild(
                document.createTextNode(
                    text
                )
            );

            editor.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );

            return;

        }


        const range =
            selection.getRangeAt(0);


        /*
            Ensure the selection belongs
            to the question editor.
        */

        if (
            !editor.contains(
                range.commonAncestorContainer
            )
        ) {

            editor.appendChild(
                document.createTextNode(
                    text
                )
            );

            editor.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );

            return;

        }


        range.deleteContents();


        const textNode =
            document.createTextNode(
                text
            );


        range.insertNode(
            textNode
        );


        range.setStartAfter(
            textNode
        );

        range.collapse(true);


        selection.removeAllRanges();

        selection.addRange(
            range
        );


        editor.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );

    }


    /* ==================================================
       MATH TOOLBAR TEMPLATES
    ================================================== */

    function getMathTemplate(type) {

        switch (type) {

            case "fraction":

                return "\\(\\frac{a}{b}\\)";


            case "power":

                return "\\(x^2\\)";


            case "square-root":

                return "\\(\\sqrt{x}\\)";


            case "subscript":

                return "\\(x_1\\)";


            case "equation":

                return "\\[x^2 + y^2 = z^2\\]";


            case "degree":

                return "\\(45^\\circ\\)";


            case "pi":

                return "\\(\\pi\\)";


            case "theta":

                return "\\(\\theta\\)";


            case "plus-minus":

                return "\\(\\pm\\)";


            case "multiply":

                return "\\(\\times\\)";


            case "not-equal":

                return "\\(\\neq\\)";


            case "less-equal":

                return "\\(\\leq\\)";


            case "greater-equal":

                return "\\(\\geq\\)";


            default:

                return "";

        }

    }


    /* ==================================================
       WAIT FOR MATHJAX
    ================================================== */

    async function waitForMathJax() {

        if (
            window.MathJax &&
            typeof window.MathJax.typesetPromise ===
                "function"
        ) {

            return true;

        }


        /*
            Wait briefly for the MathJax
            library to finish loading.
        */

        for (
            let attempt = 0;
            attempt < 40;
            attempt++
        ) {

            await new Promise(
                function(resolve) {

                    setTimeout(
                        resolve,
                        100
                    );

                }
            );


            if (
                window.MathJax &&
                typeof window.MathJax.typesetPromise ===
                    "function"
            ) {

                return true;

            }

        }


        return false;

    }


    /* ==================================================
       RENDER MATH PREVIEW
    ================================================== */

    async function renderMathPreview() {

        const editor =
            getEditor();


        const preview =
            getPreview();


        if (
            !editor ||
            !preview
        ) {

            return;

        }


        const html =
            editor.innerHTML.trim();


        /*
            Empty editor.
        */

        if (!html) {

            if (
                window.MathJax &&
                typeof window.MathJax.typesetClear ===
                    "function"
            ) {

                window.MathJax.typesetClear([
                    preview
                ]);

            }


            preview.innerHTML = `
                Your formatted question will appear here.
            `;


            return;

        }


        /*
            Queue rendering operations so
            they do not overlap.
        */

        renderQueue =
            renderQueue
                .catch(
                    function() {}
                )
                .then(
                    async function() {

                        const mathJaxReady =
                            await waitForMathJax();


                        /*
                            Clear the previous
                            MathJax rendering.
                        */

                        if (
                            window.MathJax &&
                            typeof window.MathJax.typesetClear ===
                                "function"
                        ) {

                            window.MathJax.typesetClear([
                                preview
                            ]);

                        }


                        /*
                            Update the preview HTML.
                        */

                        preview.innerHTML =
                            editor.innerHTML.trim();


                        /*
                            Render the mathematics.
                        */

                        if (mathJaxReady) {

                            await window.MathJax
                                .typesetPromise([
                                    preview
                                ]);

                        }

                    }
                );


        try {

            await renderQueue;

        }
        catch (error) {

            console.error(
                "MathJax preview rendering failed:",
                error
            );

        }

    }


    /* ==================================================
       SCHEDULE PREVIEW UPDATE
    ================================================== */

    function scheduleMathPreview() {

        clearTimeout(
            previewTimer
        );


        previewTimer =
            setTimeout(
                function() {

                    renderMathPreview();

                },
                150
            );

    }


    /* ==================================================
       INITIALIZE EDITOR
    ================================================== */

    function initialize() {

        const editor =
            getEditor();


        if (!editor) {

            return;

        }


        /*
            Live preview.
        */

        editor.addEventListener(
            "input",
            scheduleMathPreview
        );


        /*
            Math toolbar buttons.
        */

        document
            .querySelectorAll(
                "[data-math-insert]"
            )
            .forEach(
                function(button) {

                    button.addEventListener(
                        "click",
                        function() {

                            const type =
                                button.dataset.mathInsert;


                            const template =
                                getMathTemplate(
                                    type
                                );


                            if (!template) {

                                return;

                            }


                            insertAtCursor(
                                editor,
                                template
                            );

                        }
                    );

                }
            );


        /*
            Clear preview button.
        */

        const clearButton =
            document.getElementById(
                "clearMathPreviewBtn"
            );


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                function() {

                    editor.innerHTML = "";


                    renderMathPreview();


                    editor.focus();

                }
            );

        }


        /*
            Initial preview.
        */

        renderMathPreview();

    }


    /* ==================================================
       DOM READY
    ================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    }
    else {

        initialize();

    }


    /* ==================================================
       PUBLIC PREVIEW FUNCTION
    ================================================== */

    window.aplusRenderQuestionMath =
        renderMathPreview;

})();




/* ==================================================
   APLUS TUTORS
   QUESTION IMAGE UPLOAD
================================================== */

(function initializeQuestionImageUpload() {

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    let savedSelectionRange = null;
    let isUploadingImage = false;


    /* ==================================================
       GET ELEMENTS
    ================================================== */

    function getQuestionEditor() {

        return document.getElementById(
            "questionText"
        );

    }


    function getImageButton() {

        return document.getElementById(
            "insertQuestionImageBtn"
        );

    }


    function getImageInput() {

        return document.getElementById(
            "questionImageFile"
        );

    }


    /* ==================================================
       SAVE EDITOR CURSOR POSITION
    ================================================== */

    function saveEditorSelection() {

        const editor = getQuestionEditor();

        const selection = window.getSelection();

        if (
            !editor ||
            !selection ||
            selection.rangeCount === 0
        ) {
            return;
        }

        const range = selection.getRangeAt(0);

        if (
            !editor.contains(
                range.commonAncestorContainer
            )
        ) {
            return;
        }

        savedSelectionRange = range.cloneRange();

    }


    /* ==================================================
       RESTORE EDITOR CURSOR POSITION
    ================================================== */

    function restoreEditorSelection() {

        const editor = getQuestionEditor();

        if (!editor) {
            return;
        }

        editor.focus();

        const selection = window.getSelection();

        if (
            !selection ||
            !savedSelectionRange
        ) {

            return;

        }

        if (
            !editor.contains(
                savedSelectionRange.commonAncestorContainer
            )
        ) {

            return;

        }

        selection.removeAllRanges();

        selection.addRange(
            savedSelectionRange
        );

    }


    /* ==================================================
       VALIDATE SELECTED IMAGE
    ================================================== */

    function validateImage(file) {

        if (!file) {

            return false;

        }

        if (
            !ALLOWED_IMAGE_TYPES.includes(
                file.type
            )
        ) {

            showQuestionMessage(
                "Please select a JPG, PNG, WEBP or GIF image.",
                "warning"
            );

            return false;

        }

        if (
            file.size > MAX_IMAGE_SIZE
        ) {

            showQuestionMessage(
                "The image must not exceed 5 MB.",
                "warning"
            );

            return false;

        }

        return true;

    }


    /* ==================================================
       CREATE IMAGE ELEMENT
    ================================================== */

    function createQuestionImage(
        fileId,
        altText
    ) {

        const imageUrl =
            storage.getFileView({
                bucketId: QUESTION_IMAGES_BUCKET_ID,
                fileId: fileId
            });

        const image =
            document.createElement("img");

        image.src = imageUrl.toString();

        image.alt = altText || "Question image";

        image.dataset.appwriteFileId = fileId;

        image.className = "question-content-image";

        image.style.maxWidth = "100%";

        image.style.height = "auto";

        image.style.display = "block";

        image.style.margin = "12px auto";

        image.style.objectFit = "contain";

        image.style.maxHeight = "500px";

        image.loading = "lazy";

        return image;

    }


    /* ==================================================
       INSERT IMAGE INTO EDITOR
    ================================================== */

    function insertQuestionImage(
        fileId,
        fileName
    ) {

        const editor = getQuestionEditor();

        if (!editor) {

            throw new Error(
                "Question editor was not found."
            );

        }

        restoreEditorSelection();

        const image =
            createQuestionImage(
                fileId,
                fileName
            );

        const selection = window.getSelection();

        if (
            selection &&
            selection.rangeCount > 0 &&
            editor.contains(
                selection.getRangeAt(0).commonAncestorContainer
            )
        ) {

            const range =
                selection.getRangeAt(0);

            range.deleteContents();

            range.insertNode(image);

            range.setStartAfter(image);

            range.collapse(true);

            selection.removeAllRanges();

            selection.addRange(range);

            savedSelectionRange =
                range.cloneRange();

        } else {

            editor.appendChild(image);

        }

        editor.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );

        if (
            typeof window.aplusRenderQuestionMath ===
            "function"
        ) {

            window.aplusRenderQuestionMath();

        }

    }


    /* ==================================================
       UPLOAD IMAGE TO APPWRITE
    ================================================== */

    async function uploadQuestionImage(file) {

        if (!validateImage(file)) {

            return;

        }

        if (isUploadingImage) {

            return;

        }

        const button = getImageButton();

        isUploadingImage = true;

        if (button) {

            button.disabled = true;

            button.dataset.originalText =
                button.innerHTML;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Uploading...</span>
            `;

        }

        try {

            const uploadedFile =
                await storage.createFile({
                    bucketId: QUESTION_IMAGES_BUCKET_ID,
                    fileId: ID.unique(),
                    file: file
                });

            insertQuestionImage(
                uploadedFile.$id,
                file.name
            );

            showQuestionMessage(
                "Image uploaded and inserted into the question.",
                "success"
            );

            console.log(
                "Question image uploaded:",
                uploadedFile
            );

        } catch (error) {

            console.error(
                "Question image upload failed:",
                error
            );

            showQuestionMessage(
                error?.message ||
                "Unable to upload the question image.",
                "danger"
            );

        } finally {

            isUploadingImage = false;

            if (button) {

                button.disabled = false;

                button.innerHTML =
                    button.dataset.originalText ||
                    '<i class="fa-solid fa-image"></i><span>Insert Image</span>';

            }

            const input = getImageInput();

            if (input) {

                input.value = "";

            }

        }

    }


    /* ==================================================
       INITIALIZE IMAGE CONTROLS
    ================================================== */

    function initialize() {

        const button = getImageButton();

        const input = getImageInput();

        const editor = getQuestionEditor();

        if (
            !button ||
            !input ||
            !editor
        ) {

            console.warn(
                "Question image controls could not initialize. Check the HTML element IDs."
            );

            return;

        }

        button.addEventListener(
            "mousedown",
            saveEditorSelection
        );

        button.addEventListener(
            "click",
            function () {

                saveEditorSelection();

                input.click();

            }
        );

        editor.addEventListener(
            "keyup",
            saveEditorSelection
        );

        editor.addEventListener(
            "mouseup",
            saveEditorSelection
        );

        editor.addEventListener(
            "focus",
            saveEditorSelection
        );

        input.addEventListener(
            "change",
            async function () {

                const file =
                    input.files &&
                    input.files[0];

                if (!file) {

                    return;

                }

                await uploadQuestionImage(file);

            }
        );

        console.log(
            "Question image upload initialized."
        );

    }


    /* ==================================================
       DOM READY
    ================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();