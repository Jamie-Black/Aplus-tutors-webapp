/* ==================================================
   APLUS TUTORS
   ADMIN QUIZ MANAGEMENT
   PHASE 1 — INITIALIZATION & SUBJECT LOADING
================================================== */


/* ==================================================
   ADMIN QUIZ STATE
================================================== */

let quizSubjects = [];

let quizTopics = [];

let editingTopicId = null;


/* ==================================================
   INITIALIZE QUIZ MANAGEMENT PAGE
================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    console.log(
        "Aplus Tutors admin quiz management started."
    );

    try {

        await initializeAdminQuiz();

    } catch (error) {

        console.error(
            "Quiz page initialization error:",
            error
        );

    }

});


/* ==================================================
   INITIALIZE ADMIN QUIZ
================================================== */

async function initializeAdminQuiz() {

    /*
        Authentication is already handled by guard.js.

        We still retrieve the current account here
        so we know which admin is creating topics.
    */

    await loadCurrentAdmin();

    /*
        Load subjects from the existing subjects table.
    */

    await loadQuizSubjects();

    /*
        Prepare topic controls.
    */

    initializeTopicControls();

    /*
        Load existing topics.
    */

    await loadQuizTopics();

}


/* ==================================================
   LOAD CURRENT ADMIN
================================================== */

async function loadCurrentAdmin() {

    try {

        currentAdmin = await account.get();

        console.log(
            "Current Admin:",
            currentAdmin
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
   LOAD SUBJECTS
================================================== */

async function loadQuizSubjects() {

    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                SUBJECTS_TABLE_ID,
                [
                    Query.limit(100)
                ]
            );


        quizSubjects = (response.rows || []).filter(
  function(subject) {
    
    return subject.status === "active";
    
  }
);

        console.log(
            "Quiz subjects loaded:",
            quizSubjects
        );


        /*
            Update subject statistic.
        */

        updateSubjectCount();


        /*
            Populate both subject dropdowns.
        */

        populateSubjectDropdowns();


    } catch (error) {

        console.error(
            "Unable to load quiz subjects:",
            error
        );

    }

}


/* ==================================================
   UPDATE SUBJECT COUNT
================================================== */

function updateSubjectCount() {

    const subjectCount =
        document.getElementById(
            "quizSubjectCount"
        );


    if (!subjectCount) {

        return;

    }


    subjectCount.textContent =
        quizSubjects.length;

}


/* ==================================================
   POPULATE SUBJECT DROPDOWNS
================================================== */

function populateSubjectDropdowns() {

    const topicSubject =
        document.getElementById(
            "topicSubject"
        );


    const topicSubjectFilter =
        document.getElementById(
            "topicSubjectFilter"
        );


    /*
        MODAL SUBJECT DROPDOWN
    */

    if (topicSubject) {

        topicSubject.innerHTML = `
            <option value="">
                Select subject
            </option>
        `;


        quizSubjects.forEach(function (subject) {

            const option =
                document.createElement("option");


            option.value =
                subject.$id;


            option.textContent =
                subject.name;


            topicSubject.appendChild(option);

        });

    }


    /*
        FILTER SUBJECT DROPDOWN
    */

    if (topicSubjectFilter) {

        topicSubjectFilter.innerHTML = `
            <option value="">
                All Subjects
            </option>
        `;


        quizSubjects.forEach(function (subject) {

            const option =
                document.createElement("option");


            option.value =
                subject.$id;


            option.textContent =
                subject.name;


            topicSubjectFilter.appendChild(option);

        });

    }

}


/* ==================================================
   INITIALIZE TOPIC CONTROLS
================================================== */

function initializeTopicControls() {

    const addTopicBtn =
        document.getElementById(
            "addTopicBtn"
        );


    const emptyAddTopicBtn =
        document.getElementById(
            "emptyAddTopicBtn"
        );


    const saveTopicBtn =
        document.getElementById(
            "saveTopicBtn"
        );


    const topicSearch =
        document.getElementById(
            "topicSearch"
        );


    const topicSubjectFilter =
        document.getElementById(
            "topicSubjectFilter"
        );


    const topicStatusFilter =
        document.getElementById(
            "topicStatusFilter"
        );


    /*
        ADD TOPIC BUTTON
    */

    if (addTopicBtn) {

        addTopicBtn.addEventListener(
            "click",
            openAddTopicModal
        );

    }


    /*
        EMPTY STATE ADD TOPIC BUTTON
    */

    if (emptyAddTopicBtn) {

        emptyAddTopicBtn.addEventListener(
            "click",
            openAddTopicModal
        );

    }


    /*
        SAVE TOPIC BUTTON

        The actual save functionality will be
        implemented in the next phase.
    */

    if (saveTopicBtn) {

        saveTopicBtn.addEventListener(
            "click",
            handleSaveTopic
        );

    }


    /*
        SEARCH
    */

    if (topicSearch) {

        topicSearch.addEventListener(
            "input",
            filterQuizTopics
        );

    }


    /*
        SUBJECT FILTER
    */

    if (topicSubjectFilter) {

        topicSubjectFilter.addEventListener(
            "change",
            filterQuizTopics
        );

    }


    /*
        STATUS FILTER
    */

    if (topicStatusFilter) {

        topicStatusFilter.addEventListener(
            "change",
            filterQuizTopics
        );

    }

}


/* ==================================================
   OPEN ADD TOPIC MODAL
================================================== */

function openAddTopicModal() {

    editingTopicId = null;


    const modalElement =
        document.getElementById(
            "topicModal"
        );


    const modalTitle =
        document.getElementById(
            "topicModalLabel"
        );


    const topicForm =
        document.getElementById(
            "topicForm"
        );


    if (modalTitle) {

        modalTitle.textContent =
            "Add Topic";

    }


    if (topicForm) {

        topicForm.reset();

    }


    /*
        Default new topics to active.
    */

    const topicStatus =
        document.getElementById(
            "topicStatus"
        );


    if (topicStatus) {

        topicStatus.value =
            "active";

    }


    if (modalElement) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

}


/* ==================================================
   SAVE TOPIC PLACEHOLDER
================================================== */

/* ==================================================
   SAVE TOPIC
================================================== */

async function handleSaveTopic() {

    /*
        Prevent accidental double submission.
    */

    if (
        handleSaveTopic.isSaving
    ) {

        return;

    }
    
    /* ==================================================
   EDIT MODE
================================================== */

if (editingTopicId) {

    await updateQuizTopic();

    return;

}


    const topicNameInput =
        document.getElementById(
            "topicName"
        );


    const topicSubjectInput =
        document.getElementById(
            "topicSubject"
        );


    const topicDescriptionInput =
        document.getElementById(
            "topicDescription"
        );


    const topicStatusInput =
        document.getElementById(
            "topicStatus"
        );


    const saveButton =
        document.getElementById(
            "saveTopicBtn"
        );


    /*
        Read values.
    */

    const topicName =
        topicNameInput
            ? topicNameInput.value.trim()
            : "";


    const subjectId =
        topicSubjectInput
            ? topicSubjectInput.value
            : "";


    const description =
        topicDescriptionInput
            ? topicDescriptionInput.value.trim()
            : "";


    const status =
        topicStatusInput
            ? topicStatusInput.value
            : "active";


    /* ==================================================
       VALIDATION
    ================================================== */

    if (!topicName) {

        showQuizMessage(
            "Please enter a topic name.",
            "warning"
        );


        if (topicNameInput) {

            topicNameInput.focus();

        }


        return;

    }


    if (!subjectId) {

        showQuizMessage(
            "Please select a subject.",
            "warning"
        );


        if (topicSubjectInput) {

            topicSubjectInput.focus();

        }


        return;

    }


    /*
        Make sure an admin account was loaded.
    */

    if (!currentAdmin) {

        showQuizMessage(
            "Unable to identify the current administrator.",
            "danger"
        );


        return;

    }


    /* ==================================================
       CHECK FOR DUPLICATE TOPIC
    ================================================== */

    const duplicateTopic =
        quizTopics.find(function (topic) {

            return (
                String(topic.name || "")
                    .trim()
                    .toLowerCase() ===
                topicName.toLowerCase()
                &&
                topic.subjectId === subjectId
            );

        });


    if (duplicateTopic) {

        showQuizMessage(
            "A topic with this name already exists for the selected subject.",
            "warning"
        );


        if (topicNameInput) {

            topicNameInput.focus();

        }


        return;

    }


    /* ==================================================
       START SAVING
    ================================================== */

    handleSaveTopic.isSaving = true;


    if (saveButton) {

        saveButton.disabled = true;


        saveButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
            ></span>

            Saving...
        `;

    }


    try {

        /* ==================================================
           CREATE TOPIC
        ================================================== */

        const newTopic =
            await tablesDB.createRow(
                DATABASE_ID,
                TOPICS_TABLE_ID,
                ID.unique(),
                {
                    name: topicName,

                    subjectId: subjectId,

                    description: description,

                    status: status,

                    createdBy: currentAdmin.$id
                }
            );


        console.log(
            "Topic created successfully:",
            newTopic
        );


        /* ==================================================
           ADD TO LOCAL STATE
        ================================================== */

        quizTopics.push(
            newTopic
        );


        /* ==================================================
           UPDATE UI
        ================================================== */

        updateTopicStatistics();

        filterQuizTopics();


        /* ==================================================
           CLOSE MODAL
        ================================================== */

        closeTopicModal();


        /*
            Show success message.
        */

        showQuizMessage(
            "Topic created successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unable to create topic:",
            error
        );


        showQuizMessage(
            getQuizErrorMessage(error),
            "danger"
        );


    } finally {

        handleSaveTopic.isSaving = false;


        if (saveButton) {

            saveButton.disabled = false;


            saveButton.innerHTML = `
                <i class="fa-solid fa-check"></i>

                Save Topic
            `;

        }

    }

}


/* ==================================================
   CLOSE TOPIC MODAL
================================================== */

function closeTopicModal() {

    const modalElement =
        document.getElementById(
            "topicModal"
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


    /*
        Reset the form after closing.
    */

    const topicForm =
        document.getElementById(
            "topicForm"
        );


    if (topicForm) {

        topicForm.reset();

    }


    /*
        Restore default status.
    */

    const topicStatus =
        document.getElementById(
            "topicStatus"
        );


    if (topicStatus) {

        topicStatus.value =
            "active";

    }


    editingTopicId = null;

}


/* ==================================================
   QUIZ MESSAGE
================================================== */

function showQuizMessage(
    message,
    type = "info"
) {

    /*
        Use Bootstrap alert.

        The alert is created dynamically so we
        don't need another HTML element.
    */

    const existingAlert =
        document.getElementById(
            "quizPageAlert"
        );


    if (existingAlert) {

        existingAlert.remove();

    }


    const alert =
        document.createElement(
            "div"
        );


    alert.id =
        "quizPageAlert";


    alert.className =
        `alert alert-${type} quiz-page-alert`;


    alert.setAttribute(
        "role",
        "alert"
    );


    alert.innerHTML = `
        <i class="fa-solid ${
            type === "success"
                ? "fa-circle-check"
                : type === "warning"
                    ? "fa-triangle-exclamation"
                    : type === "danger"
                        ? "fa-circle-xmark"
                        : "fa-circle-info"
        }"></i>

        <span>
            ${escapeQuizHtml(message)}
        </span>

        <button
            type="button"
            class="btn-close"
            aria-label="Close"
        ></button>
    `;


    /*
        Insert at the top of the quiz page.
    */

    const page =
        document.querySelector(
            ".quiz-management-page"
        );


    if (page) {

        page.prepend(alert);

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
        Automatically remove the message.
    */

    setTimeout(function () {

        if (alert.parentNode) {

            alert.remove();

        }

    }, 5000);

}


/* ==================================================
   APPWRITE ERROR MESSAGE
================================================== */

function getQuizErrorMessage(error) {

    if (!error) {

        return "An unexpected error occurred.";

    }


    /*
        Appwrite permission error.
    */

    if (
        error.code === 401 ||
        error.code === 403
    ) {

        return (
            "You do not have permission to create quiz topics."
        );

    }


    /*
        Duplicate/conflict error.
    */

    if (error.code === 409) {

        return (
            "This topic already exists."
        );

    }


    /*
        Validation error.
    */

    if (error.code === 400) {

        return (
            error.message ||
            "Some topic information is invalid."
        );

    }


    return (
        error.message ||
        "Unable to save the topic. Please try again."
    );

}


/* ==================================================
   LOAD QUIZ TOPICS
================================================== */

async function loadQuizTopics() {

    try {

        showTopicsLoading();


        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                TOPICS_TABLE_ID,
                [
                    Query.limit(100)
                ]
            );


        quizTopics =
            response.rows || [];


        console.log(
            "Quiz topics loaded:",
            quizTopics
        );


        updateTopicStatistics();

        filterQuizTopics();


    } catch (error) {

        console.error(
            "Unable to load quiz topics:",
            error
        );


        showTopicsEmpty();

    }

}


/* ==================================================
   UPDATE TOPIC STATISTICS
================================================== */

function updateTopicStatistics() {

    const totalTopics =
        document.getElementById(
            "totalTopics"
        );


    const activeTopics =
        document.getElementById(
            "activeTopics"
        );


    const inactiveTopics =
        document.getElementById(
            "inactiveTopics"
        );


    const total =
        quizTopics.length;


    const active =
        quizTopics.filter(function (topic) {

            return topic.status === "active";

        }).length;


    const inactive =
        quizTopics.filter(function (topic) {

            return topic.status === "inactive";

        }).length;


    if (totalTopics) {

        totalTopics.textContent =
            total;

    }


    if (activeTopics) {

        activeTopics.textContent =
            active;

    }


    if (inactiveTopics) {

        inactiveTopics.textContent =
            inactive;

    }

}


/* ==================================================
   FILTER QUIZ TOPICS
================================================== */

function filterQuizTopics() {

    const searchInput =
        document.getElementById(
            "topicSearch"
        );


    const subjectFilter =
        document.getElementById(
            "topicSubjectFilter"
        );


    const statusFilter =
        document.getElementById(
            "topicStatusFilter"
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


    const status =
        statusFilter
            ? statusFilter.value
            : "";


    const filteredTopics =
        quizTopics.filter(function (topic) {


            /*
                SEARCH
            */

            const matchesSearch =
                !searchTerm ||
                String(topic.name || "")
                    .toLowerCase()
                    .includes(searchTerm);


            /*
                SUBJECT
            */

            const matchesSubject =
                !subjectId ||
                topic.subjectId === subjectId;


            /*
                STATUS
            */

            const matchesStatus =
                !status ||
                topic.status === status;


            return (
                matchesSearch &&
                matchesSubject &&
                matchesStatus
            );

        });


    renderQuizTopics(
        filteredTopics
    );

}


/* ==================================================
   RENDER QUIZ TOPICS
================================================== */

function renderQuizTopics(topics) {

    const tableBody =
        document.getElementById(
            "topicsTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    /*
        No results
    */

    if (!topics.length) {

        showTopicsEmpty();

        return;

    }


    /*
        Show table
    */

    hideTopicsLoading();


    const tableWrapper =
        document.getElementById(
            "topicsTableWrapper"
        );


    const emptyState =
        document.getElementById(
            "topicsEmpty"
        );


    if (tableWrapper) {

        tableWrapper.classList.remove(
            "d-none"
        );

    }


    if (emptyState) {

        emptyState.classList.add(
            "d-none"
        );

    }


    /*
        Render rows
    */

    topics.forEach(function (topic) {

        const row =
            document.createElement("tr");


        const subject =
            quizSubjects.find(function (item) {

                return item.$id === topic.subjectId;

            });


        const subjectName =
            subject
                ? subject.name
                : "Unknown Subject";


        const statusClass =
            topic.status === "active"
                ? "quiz-status-active"
                : "quiz-status-inactive";


        const statusText =
            topic.status === "active"
                ? "Active"
                : "Inactive";


        row.innerHTML = `

            <td>

                <div class="quiz-topic-name">

                    <strong>
                        ${escapeQuizHtml(
                            topic.name
                        )}
                    </strong>

                </div>

            </td>


            <td>

                <span class="quiz-subject-name">

                    ${escapeQuizHtml(
                        subjectName
                    )}

                </span>

            </td>


            <td>

                <span class="quiz-topic-description">

                    ${
                        escapeQuizHtml(
                            topic.description ||
                            "No description"
                        )
                    }

                </span>

            </td>


            <td>

                <span class="quiz-status-badge ${statusClass}">

                    ${statusText}

                </span>

            </td>


            <td class="text-end">

                <button
                    type="button"
                    class="btn btn-sm quiz-edit-topic-btn"
                    data-topic-id="${topic.$id}"
                    title="Edit topic"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="btn btn-sm quiz-toggle-topic-btn"
                    data-topic-id="${topic.$id}"
                    title="${
                        topic.status === "active"
                            ? "Deactivate topic"
                            : "Activate topic"
                    }"
                >

                    <i class="fa-solid ${
                        topic.status === "active"
                            ? "fa-toggle-on"
                            : "fa-toggle-off"
                    }"></i>

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });


    attachTopicRowActions();

}


/* ==================================================
   ATTACH TOPIC ROW ACTIONS
================================================== */

/* ==================================================
   ATTACH TOPIC ROW ACTIONS
================================================== */

function attachTopicRowActions() {

    const editButtons =
        document.querySelectorAll(
            ".quiz-edit-topic-btn"
        );


    const toggleButtons =
        document.querySelectorAll(
            ".quiz-toggle-topic-btn"
        );


    /*
        EDIT BUTTONS
    */

    editButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const topicId =
                    button.dataset.topicId;


                openEditTopicModal(
                    topicId
                );

            }
        );

    });


    /*
        ACTIVATE / DEACTIVATE BUTTONS
    */

    toggleButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const topicId =
                    button.dataset.topicId;


                await toggleTopicStatus(
                    topicId
                );

            }
        );

    });

}


/* ==================================================
   OPEN EDIT TOPIC MODAL
================================================== */

function openEditTopicModal(topicId) {

    const topic =
        quizTopics.find(
            function (item) {

                return item.$id === topicId;

            }
        );


    if (!topic) {

        showQuizMessage(
            "The selected topic could not be found.",
            "danger"
        );


        return;

    }


    editingTopicId =
        topicId;


    const modalElement =
        document.getElementById(
            "topicModal"
        );


    const modalTitle =
        document.getElementById(
            "topicModalLabel"
        );


    const topicName =
        document.getElementById(
            "topicName"
        );


    const topicSubject =
        document.getElementById(
            "topicSubject"
        );


    const topicDescription =
        document.getElementById(
            "topicDescription"
        );


    const topicStatus =
        document.getElementById(
            "topicStatus"
        );


    /*
        Change modal title.
    */

    if (modalTitle) {

        modalTitle.textContent =
            "Edit Topic";

    }


    /*
        Populate form.
    */

    if (topicName) {

        topicName.value =
            topic.name || "";

    }


    if (topicSubject) {

        topicSubject.value =
            topic.subjectId || "";

    }


    if (topicDescription) {

        topicDescription.value =
            topic.description || "";

    }


    if (topicStatus) {

        topicStatus.value =
            topic.status || "active";

    }


    /*
        Show modal.
    */

    if (modalElement) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );


        modal.show();

    }

}


/* ==================================================
   UPDATE EXISTING TOPIC
================================================== */

async function updateQuizTopic() {

    if (!editingTopicId) {

        return false;

    }


    const topicNameInput =
        document.getElementById(
            "topicName"
        );


    const topicSubjectInput =
        document.getElementById(
            "topicSubject"
        );


    const topicDescriptionInput =
        document.getElementById(
            "topicDescription"
        );


    const topicStatusInput =
        document.getElementById(
            "topicStatus"
        );


    const saveButton =
        document.getElementById(
            "saveTopicBtn"
        );


    const topicName =
        topicNameInput
            ? topicNameInput.value.trim()
            : "";


    const subjectId =
        topicSubjectInput
            ? topicSubjectInput.value
            : "";


    const description =
        topicDescriptionInput
            ? topicDescriptionInput.value.trim()
            : "";


    const status =
        topicStatusInput
            ? topicStatusInput.value
            : "active";


    /* ==================================================
       VALIDATION
    ================================================== */

    if (!topicName) {

        showQuizMessage(
            "Please enter a topic name.",
            "warning"
        );


        if (topicNameInput) {

            topicNameInput.focus();

        }


        return false;

    }


    if (!subjectId) {

        showQuizMessage(
            "Please select a subject.",
            "warning"
        );


        if (topicSubjectInput) {

            topicSubjectInput.focus();

        }


        return false;

    }


    /*
        Check duplicate topic.

        Ignore the topic currently being edited.
    */

    const duplicateTopic =
        quizTopics.find(
            function (topic) {

                return (
                    topic.$id !== editingTopicId
                    &&
                    String(topic.name || "")
                        .trim()
                        .toLowerCase()
                        ===
                    topicName.toLowerCase()
                    &&
                    topic.subjectId === subjectId
                );

            }
        );


    if (duplicateTopic) {

        showQuizMessage(
            "A topic with this name already exists for the selected subject.",
            "warning"
        );


        if (topicNameInput) {

            topicNameInput.focus();

        }


        return false;

    }


    if (!currentAdmin) {

        showQuizMessage(
            "Unable to identify the current administrator.",
            "danger"
        );


        return false;

    }


    /* ==================================================
       SAVE BUTTON
    ================================================== */

    if (saveButton) {

        saveButton.disabled = true;


        saveButton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
            ></span>

            Updating...
        `;

    }


    try {

        /* ==================================================
           UPDATE APPWRITE ROW
        ================================================== */

        const updatedTopic =
            await tablesDB.updateRow(
                DATABASE_ID,
                TOPICS_TABLE_ID,
                editingTopicId,
                {
                    name: topicName,

                    subjectId: subjectId,

                    description: description,

                    status: status,

                    createdBy:
                        currentAdmin.$id
                }
            );


        console.log(
            "Topic updated successfully:",
            updatedTopic
        );


        /* ==================================================
           UPDATE LOCAL STATE
        ================================================== */

        const topicIndex =
            quizTopics.findIndex(
                function (topic) {

                    return (
                        topic.$id ===
                        editingTopicId
                    );

                }
            );


        if (topicIndex !== -1) {

            quizTopics[topicIndex] =
                updatedTopic;

        }


        /* ==================================================
           UPDATE UI
        ================================================== */

        updateTopicStatistics();

        filterQuizTopics();


        /*
            Close modal.
        */

        closeTopicModal();


        showQuizMessage(
            "Topic updated successfully.",
            "success"
        );


        return true;


    } catch (error) {

        console.error(
            "Unable to update topic:",
            error
        );


        showQuizMessage(
            getQuizErrorMessage(error),
            "danger"
        );


        return false;


    } finally {

        if (saveButton) {

            saveButton.disabled = false;


            saveButton.innerHTML = `
                <i class="fa-solid fa-check"></i>

                Save Topic
            `;

        }

    }

}


/* ==================================================
   TOGGLE TOPIC STATUS
================================================== */

async function toggleTopicStatus(topicId) {

    const topic =
        quizTopics.find(
            function (item) {

                return item.$id === topicId;

            }
        );


    if (!topic) {

        showQuizMessage(
            "The selected topic could not be found.",
            "danger"
        );


        return;

    }


    const isCurrentlyActive =
        topic.status === "active";


    const newStatus =
        isCurrentlyActive
            ? "inactive"
            : "active";


    const actionText =
        isCurrentlyActive
            ? "deactivate"
            : "activate";


    /*
        Ask for confirmation.
    */

    const confirmed =
        window.confirm(
            `Are you sure you want to ${actionText} "${topic.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const updatedTopic =
            await tablesDB.updateRow(
                DATABASE_ID,
                TOPICS_TABLE_ID,
                topicId,
                {
                    status: newStatus
                }
            );


        console.log(
            "Topic status updated:",
            updatedTopic
        );


        /*
            Update local state.
        */

        const topicIndex =
            quizTopics.findIndex(
                function (item) {

                    return item.$id === topicId;

                }
            );


        if (topicIndex !== -1) {

            quizTopics[topicIndex] =
                updatedTopic;

        }


        /*
            Update statistics.
        */

        updateTopicStatistics();


        /*
            Re-render filtered topics.
        */

        filterQuizTopics();


        showQuizMessage(
            `Topic ${newStatus === "active" ? "activated" : "deactivated"} successfully.`,
            "success"
        );


    } catch (error) {

        console.error(
            "Unable to update topic status:",
            error
        );


        showQuizMessage(
            getQuizErrorMessage(error),
            "danger"
        );

    }

}


/* ==================================================
   TOPICS LOADING STATE
================================================== */

function showTopicsLoading() {

    const loading =
        document.getElementById(
            "topicsLoading"
        );


    const empty =
        document.getElementById(
            "topicsEmpty"
        );


    const table =
        document.getElementById(
            "topicsTableWrapper"
        );


    if (loading) {

        loading.classList.remove(
            "d-none"
        );

    }


    if (empty) {

        empty.classList.add(
            "d-none"
        );

    }


    if (table) {

        table.classList.add(
            "d-none"
        );

    }

}


/* ==================================================
   HIDE TOPICS LOADING
================================================== */

function hideTopicsLoading() {

    const loading =
        document.getElementById(
            "topicsLoading"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }

}


/* ==================================================
   SHOW TOPICS EMPTY
================================================== */

function showTopicsEmpty() {

    const loading =
        document.getElementById(
            "topicsLoading"
        );


    const empty =
        document.getElementById(
            "topicsEmpty"
        );


    const table =
        document.getElementById(
            "topicsTableWrapper"
        );


    if (loading) {

        loading.classList.add(
            "d-none"
        );

    }


    if (empty) {

        empty.classList.remove(
            "d-none"
        );

    }


    if (table) {

        table.classList.add(
            "d-none"
        );

    }

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeQuizHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==================================================
   ADMIN QUIZ PAGE LOADER
================================================== */

window.addEventListener(
    "load",
    function () {

        const loader =
            document.getElementById(
                "pageLoader"
            );


        if (!loader) {

            return;

        }


        setTimeout(function () {

            loader.classList.add(
                "hidden"
            );

        }, 300);

    }
);


