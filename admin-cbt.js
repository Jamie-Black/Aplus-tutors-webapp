/* ==================================================
   APLUS TUTORS
   ADMIN CBT MANAGEMENT
   PHASE 1B — BATCH 1
   ================================================== */


/* ==================================================
   SECTION 1 — CBT CONFIGURATION
================================================== */

const CBT_SETTINGS_TABLE_ID = "cbt_settings";
const CBT_QUESTIONS_TABLE_ID = "questions";
const CBT_SUBJECTS_TABLE_ID = "subjects";


/* ==================================================
   SECTION 2 — DEFAULT VALUES
================================================== */

/*
    Only examType and status are required in the
    cbt_settings table.

    The remaining values are optional, so we provide
    sensible defaults whenever a new exam type is
    created.
*/

const CBT_DEFAULTS = {

    minSubjects: 1,

    maxSubjects: 4,

    minQuestions: 10,

    maxQuestions: 100,

    defaultQuestions: 40,

    minDuration: 10,

    maxDuration: 180,

    defaultDuration: 60,

    randomizeQuestions: true,

    randomizeOptions: false,

    allowPrevious: true,

    autoSubmit: true,

    showProgress: true,

    allowEarlySubmit: true,

    showResultImmediately: true,

    instructions:
        "Answer all questions carefully. Read each question before selecting your answer. You may review your answers before submitting if this option is enabled."

};


/* ==================================================
   SECTION 3 — PAGE STATE
================================================== */

let examTypes = [];

let currentEditingSettingId = null;

let cbtModal = null;

let isSavingExamType = false;

let isSavingBehaviour = false;


/* ==================================================
   SECTION 4 — QUESTION BANK STATE
================================================== */

let questionBankStats = {

    total: 0,

    active: 0,

    inactive: 0

};


let subjectStats = {

    total: 0

};


/* ==================================================
   SECTION 5 — DOM ELEMENTS
================================================== */

let elements = {};


/* ==================================================
   SECTION 6 — DOM INITIALIZATION
================================================== */

function initializeCBTDom() {

    elements = {

        /* ------------------------------------------
           OVERVIEW
        ------------------------------------------ */

        totalQuestions:
            document.getElementById("totalQuestions"),

        activeQuestions:
            document.getElementById("activeQuestions"),

        totalSubjects:
            document.getElementById("totalSubjects"),

        totalExamTypes:
            document.getElementById("totalExamTypes"),


        /* ------------------------------------------
           EXAM TYPES
        ------------------------------------------ */

        addExamTypeBtn:
            document.getElementById("addExamTypeBtn"),

        cbtAlert:
            document.getElementById("cbtAlert"),

        examTypesLoading:
            document.getElementById("examTypesLoading"),

        examTypesEmpty:
            document.getElementById("examTypesEmpty"),

        emptyAddExamTypeBtn:
            document.getElementById("emptyAddExamTypeBtn"),

        examTypesTableContainer:
            document.getElementById(
                "examTypesTableContainer"
            ),

        examTypesTableBody:
            document.getElementById(
                "examTypesTableBody"
            ),


        /* ------------------------------------------
           QUESTION BANK
        ------------------------------------------ */

        bankTotalQuestions:
            document.getElementById(
                "bankTotalQuestions"
            ),

        bankActiveQuestions:
            document.getElementById(
                "bankActiveQuestions"
            ),

        bankInactiveQuestions:
            document.getElementById(
                "bankInactiveQuestions"
            ),

        bankSubjects:
            document.getElementById(
                "bankSubjects"
            ),


        /* ------------------------------------------
           CBT BEHAVIOUR
        ------------------------------------------ */

        randomizeQuestions:
            document.getElementById(
                "randomizeQuestions"
            ),

        randomizeOptions:
            document.getElementById(
                "randomizeOptions"
            ),

        allowPrevious:
            document.getElementById(
                "allowPrevious"
            ),

        autoSubmit:
            document.getElementById(
                "autoSubmit"
            ),

        showProgress:
            document.getElementById(
                "showProgress"
            ),

        allowEarlySubmit:
            document.getElementById(
                "allowEarlySubmit"
            ),

        showResultImmediately:
            document.getElementById(
                "showResultImmediately"
            ),

        cbtInstructions:
            document.getElementById(
                "cbtInstructions"
            ),

        saveCbtBehaviourBtn:
            document.getElementById(
                "saveCbtBehaviourBtn"
            ),


        /* ------------------------------------------
           EXAM TYPE MODAL
        ------------------------------------------ */

        examTypeModal:
            document.getElementById(
                "examTypeModal"
            ),

        examTypeForm:
            document.getElementById(
                "examTypeForm"
            ),

        examType:
            document.getElementById(
                "examType"
            ),

        minSubjects:
            document.getElementById(
                "minSubjects"
            ),

        maxSubjects:
            document.getElementById(
                "maxSubjects"
            ),

        minQuestions:
            document.getElementById(
                "minQuestions"
            ),

        maxQuestions:
            document.getElementById(
                "maxQuestions"
            ),

        defaultQuestions:
            document.getElementById(
                "defaultQuestions"
            ),

        minDuration:
            document.getElementById(
                "minDuration"
            ),

        maxDuration:
            document.getElementById(
                "maxDuration"
            ),

        defaultDuration:
            document.getElementById(
                "defaultDuration"
            ),

        examStatus:
            document.getElementById(
                "examStatus"
            ),

        examTypeFormError:
            document.getElementById(
                "examTypeFormError"
            ),

        saveExamTypeBtn:
            document.getElementById(
                "saveExamTypeBtn"
            )

    };

}


/* ==================================================
   SECTION 7 — BASIC UTILITIES
================================================== */


/*
    Safely escape text before inserting it into
    HTML.

    This is especially important for values coming
    from Appwrite.
*/

function escapeHTML(value) {

    if (value === null || value === undefined) {

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
   NUMBER FORMATTER
================================================== */

function formatNumber(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {

        return "0";

    }

    return number.toLocaleString();

}


/* ==================================================
   BOOLEAN CONVERTER
================================================== */

function toBoolean(value, fallback = false) {

    if (
        value === true ||
        value === false
    ) {

        return value;

    }

    if (value === 1 || value === "1") {

        return true;

    }

    if (
        typeof value === "string" &&
        value.toLowerCase() === "true"
    ) {

        return true;

    }

    if (
        typeof value === "string" &&
        value.toLowerCase() === "false"
    ) {

        return false;

    }

    return fallback;

}


/* ==================================================
   INTEGER READER
================================================== */

function getIntegerValue(

    element,

    fallback = 0

) {

    if (!element) {

        return fallback;

    }

    const value = parseInt(
        element.value,
        10
    );

    if (!Number.isFinite(value)) {

        return fallback;

    }

    return value;

}


/* ==================================================
   SAFE ELEMENT UPDATE
================================================== */

function setElementText(

    element,

    value

) {

    if (!element) {

        return;

    }

    element.textContent = value;

}


/* ==================================================
   SHOW ALERT
================================================== */

function showCBTAlert(

    message,

    type = "success"

) {

    const alertElement =
        elements.cbtAlert;

    if (!alertElement) {

        return;

    }

    alertElement.className =
        `alert alert-${type}`;

    alertElement.textContent =
        message;

    alertElement.classList.remove(
        "d-none"
    );


    /*
        Automatically hide normal
        success/info messages.
    */

    if (
        type === "success" ||
        type === "info"
    ) {

        window.setTimeout(() => {

            hideCBTAlert();

        }, 5000);

    }

}


/* ==================================================
   HIDE ALERT
================================================== */

function hideCBTAlert() {

    if (!elements.cbtAlert) {

        return;

    }

    elements.cbtAlert.classList.add(
        "d-none"
    );

    elements.cbtAlert.textContent = "";

}


/* ==================================================
   SHOW FORM ERROR
================================================== */

function showExamTypeFormError(

    message

) {

    if (!elements.examTypeFormError) {

        return;

    }

    elements.examTypeFormError.textContent =
        message;

    elements.examTypeFormError.classList.remove(
        "d-none"
    );

}


/* ==================================================
   HIDE FORM ERROR
================================================== */

function hideExamTypeFormError() {

    if (!elements.examTypeFormError) {

        return;

    }

    elements.examTypeFormError.textContent =
        "";

    elements.examTypeFormError.classList.add(
        "d-none"
    );

}


/* ==================================================
   SET BUTTON LOADING
================================================== */

function setButtonLoading(

    button,

    loading,

    loadingText = "Saving..."

) {

    if (!button) {

        return;

    }

    if (loading) {

        if (!button.dataset.originalHTML) {

            button.dataset.originalHTML =
                button.innerHTML;

        }

        button.disabled = true;

        button.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
            ></span>
            ${escapeHTML(loadingText)}
        `;

    } else {

        button.disabled = false;

        if (button.dataset.originalHTML) {

            button.innerHTML =
                button.dataset.originalHTML;

        }

    }

}


/* ==================================================
   SECTION 8 — APPWRITE VALIDATION
================================================== */

function checkAppwriteReady() {

    if (
        typeof tablesDB === "undefined"
    ) {

        console.error(
            "Aplus CBT: tablesDB is not available."
        );

        showCBTAlert(
            "Appwrite database is not ready. Please refresh the page.",
            "danger"
        );

        return false;

    }


    if (
        typeof DATABASE_ID === "undefined"
    ) {

        console.error(
            "Aplus CBT: DATABASE_ID is not available."
        );

        showCBTAlert(
            "Appwrite database configuration is missing.",
            "danger"
        );

        return false;

    }


    return true;

}


/* ==================================================
   SECTION 9 — LOAD EXAM TYPES
================================================== */

async function loadExamTypes() {

    if (!checkAppwriteReady()) {

        return;

    }


    showExamTypesLoading();


    try {

        const response =
            await tablesDB.listRows({

                databaseId:
                    DATABASE_ID,

                tableId:
                    CBT_SETTINGS_TABLE_ID,

                queries: []

            });


        examTypes =
            Array.isArray(response.rows)
                ? response.rows
                : [];


        /*
            Sort alphabetically by exam type.
        */

        examTypes.sort(
            (a, b) => {

                const first =
                    String(
                        a.examType || ""
                    ).toLowerCase();

                const second =
                    String(
                        b.examType || ""
                    ).toLowerCase();

                return first.localeCompare(
                    second
                );

            }
        );


        renderExamTypes();

        updateExamTypeCount();

        loadBehaviourFromExamTypes();


    } catch (error) {

        console.error(
            "Aplus CBT: Failed to load exam types.",
            error
        );


        examTypes = [];


        hideExamTypesLoading();


        if (elements.examTypesTableContainer) {

            elements.examTypesTableContainer.classList.add(
                "d-none"
            );

        }

        if (elements.examTypesEmpty) {

            elements.examTypesEmpty.classList.remove(
                "d-none"
            );

        }


        showCBTAlert(
            getAppwriteErrorMessage(
                error,
                "Unable to load CBT exam types."
            ),
            "danger"
        );

    }

}


/* ==================================================
   SECTION 10 — EXAM TYPE LOADING UI
================================================== */

function showExamTypesLoading() {

    if (elements.examTypesLoading) {

        elements.examTypesLoading.classList.remove(
            "d-none"
        );

    }

    if (elements.examTypesEmpty) {

        elements.examTypesEmpty.classList.add(
            "d-none"
        );

    }

    if (elements.examTypesTableContainer) {

        elements.examTypesTableContainer.classList.add(
            "d-none"
        );

    }

}


/* ==================================================
   HIDE EXAM TYPE LOADING
================================================== */

function hideExamTypesLoading() {

    if (elements.examTypesLoading) {

        elements.examTypesLoading.classList.add(
            "d-none"
        );

    }

}


/* ==================================================
   SECTION 11 — APPWRITE ERROR MESSAGE
================================================== */

function getAppwriteErrorMessage(

    error,

    fallback

) {

    if (
        error &&
        typeof error.message === "string" &&
        error.message.trim()
    ) {

        return error.message;

    }

    if (
        error &&
        typeof error === "string" &&
        error.trim()
    ) {

        return error;

    }

    return fallback;

}


/* ==================================================
   SECTION 12 — UPDATE EXAM TYPE COUNT
================================================== */

function updateExamTypeCount() {

    setElementText(

        elements.totalExamTypes,

        formatNumber(
            examTypes.length
        )

    );

}


/* ==================================================
   SECTION 13 — MODAL INITIALIZATION
================================================== */

function initializeCBTModal() {

    if (
        !elements.examTypeModal
    ) {

        console.warn(
            "Aplus CBT: #examTypeModal was not found."
        );

        return;

    }


    if (
        typeof bootstrap === "undefined" ||
        !bootstrap.Modal
    ) {

        console.warn(
            "Aplus CBT: Bootstrap Modal is not available."
        );

        return;

    }


    cbtModal =
        bootstrap.Modal.getOrCreateInstance(
            elements.examTypeModal
        );

}


/* ==================================================
   SECTION 14 — OPEN ADD EXAM TYPE MODAL
================================================== */

function openAddExamTypeModal() {

    currentEditingSettingId =
        null;


    resetExamTypeForm();


    if (!cbtModal) {

        initializeCBTModal();

    }


    if (cbtModal) {

        cbtModal.show();

    }

}


/* ==================================================
   SECTION 15 — RESET EXAM TYPE FORM
================================================== */

function resetExamTypeForm() {

    if (
        !elements.examTypeForm
    ) {

        return;

    }


    elements.examTypeForm.reset();


    currentEditingSettingId =
        null;


    hideExamTypeFormError();


    /*
        Restore sensible defaults.
    */

    if (elements.minSubjects) {

        elements.minSubjects.value =
            CBT_DEFAULTS.minSubjects;

    }


    if (elements.maxSubjects) {

        elements.maxSubjects.value =
            CBT_DEFAULTS.maxSubjects;

    }


    if (elements.minQuestions) {

        elements.minQuestions.value =
            CBT_DEFAULTS.minQuestions;

    }


    if (elements.maxQuestions) {

        elements.maxQuestions.value =
            CBT_DEFAULTS.maxQuestions;

    }


    if (elements.defaultQuestions) {

        elements.defaultQuestions.value =
            CBT_DEFAULTS.defaultQuestions;

    }


    if (elements.minDuration) {

        elements.minDuration.value =
            CBT_DEFAULTS.minDuration;

    }


    if (elements.maxDuration) {

        elements.maxDuration.value =
            CBT_DEFAULTS.maxDuration;

    }


    if (elements.defaultDuration) {

        elements.defaultDuration.value =
            CBT_DEFAULTS.defaultDuration;

    }


    if (elements.examStatus) {

        elements.examStatus.value =
            "active";

    }


    /*
        Update modal title if the HTML
        contains the expected heading.
    */

    updateModalTitle(
        "Add Exam Type"
    );

}


/* ==================================================
   SECTION 16 — UPDATE MODAL TITLE
================================================== */

function updateModalTitle(

    title

) {

    if (
        !elements.examTypeModal
    ) {

        return;

    }


    const titleElement =
        elements.examTypeModal.querySelector(
            ".modal-title"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }

}


/* ==================================================
   SECTION 17 — NORMALIZE EXAM TYPE DATA
================================================== */

function normalizeExamType(

    row

) {

    return {

        $id:
            row.$id || "",

        examType:
            row.examType || "",

        minSubjects:
            Number.isFinite(
                Number(row.minSubjects)
            )
                ? Number(row.minSubjects)
                : CBT_DEFAULTS.minSubjects,

        maxSubjects:
            Number.isFinite(
                Number(row.maxSubjects)
            )
                ? Number(row.maxSubjects)
                : CBT_DEFAULTS.maxSubjects,

        minQuestions:
            Number.isFinite(
                Number(row.minQuestions)
            )
                ? Number(row.minQuestions)
                : CBT_DEFAULTS.minQuestions,

        maxQuestions:
            Number.isFinite(
                Number(row.maxQuestions)
            )
                ? Number(row.maxQuestions)
                : CBT_DEFAULTS.maxQuestions,

        defaultQuestions:
            Number.isFinite(
                Number(row.defaultQuestions)
            )
                ? Number(row.defaultQuestions)
                : CBT_DEFAULTS.defaultQuestions,

        minDuration:
            Number.isFinite(
                Number(row.minDuration)
            )
                ? Number(row.minDuration)
                : CBT_DEFAULTS.minDuration,

        maxDuration:
            Number.isFinite(
                Number(row.maxDuration)
            )
                ? Number(row.maxDuration)
                : CBT_DEFAULTS.maxDuration,

        defaultDuration:
            Number.isFinite(
                Number(row.defaultDuration)
            )
                ? Number(row.defaultDuration)
                : CBT_DEFAULTS.defaultDuration,

        randomizeQuestions:
            toBoolean(
                row.randomizeQuestions,
                CBT_DEFAULTS.randomizeQuestions
            ),

        randomizeOptions:
            toBoolean(
                row.randomizeOptions,
                CBT_DEFAULTS.randomizeOptions
            ),

        allowPrevious:
            toBoolean(
                row.allowPrevious,
                CBT_DEFAULTS.allowPrevious
            ),

        autoSubmit:
            toBoolean(
                row.autoSubmit,
                CBT_DEFAULTS.autoSubmit
            ),

        showProgress:
            toBoolean(
                row.showProgress,
                CBT_DEFAULTS.showProgress
            ),

        allowEarlySubmit:
            toBoolean(
                row.allowEarlySubmit,
                CBT_DEFAULTS.allowEarlySubmit
            ),

        showResultImmediately:
            toBoolean(
                row.showResultImmediately,
                CBT_DEFAULTS.showResultImmediately
            ),

        instructions:
            row.instructions ||
            CBT_DEFAULTS.instructions,

        status:
            row.status || "active",

        $createdAt:
            row.$createdAt || "",

        $updatedAt:
            row.$updatedAt || ""

    };

}


/* ==================================================
   SECTION 18 — PREPARE EXAM TYPE FORM
================================================== */

function populateExamTypeForm(

    row

) {

    const data =
        normalizeExamType(row);


    currentEditingSettingId =
        data.$id;


    hideExamTypeFormError();


    if (elements.examType) {

        elements.examType.value =
            data.examType;

    }


    if (elements.minSubjects) {

        elements.minSubjects.value =
            data.minSubjects;

    }


    if (elements.maxSubjects) {

        elements.maxSubjects.value =
            data.maxSubjects;

    }


    if (elements.minQuestions) {

        elements.minQuestions.value =
            data.minQuestions;

    }


    if (elements.maxQuestions) {

        elements.maxQuestions.value =
            data.maxQuestions;

    }


    if (elements.defaultQuestions) {

        elements.defaultQuestions.value =
            data.defaultQuestions;

    }


    if (elements.minDuration) {

        elements.minDuration.value =
            data.minDuration;

    }


    if (elements.maxDuration) {

        elements.maxDuration.value =
            data.maxDuration;

    }


    if (elements.defaultDuration) {

        elements.defaultDuration.value =
            data.defaultDuration;

    }


    if (elements.examStatus) {

        elements.examStatus.value =
            data.status === "inactive"
                ? "inactive"
                : "active";

    }


    updateModalTitle(
        "Edit Exam Type"
    );

}


/* ==================================================
   SECTION 19 — OPEN EDIT EXAM TYPE MODAL
================================================== */

function openEditExamTypeModal(

    settingId

) {

    const row =
        examTypes.find(
            item =>
                item.$id === settingId
        );


    if (!row) {

        showCBTAlert(
            "The selected exam type could not be found.",
            "danger"
        );

        return;

    }


    populateExamTypeForm(row);


    if (!cbtModal) {

        initializeCBTModal();

    }


    if (cbtModal) {

        cbtModal.show();

    }

}


/* ==================================================
   SECTION 20 — EXAM TYPE VALIDATION
================================================== */

function validateExamTypeForm() {

    hideExamTypeFormError();


    const examType =
        elements.examType
            ? elements.examType.value.trim()
            : "";


    /*
        Only examType and status are required
        at database level, but numeric values
        are important for CBT functionality.
    */

    if (!examType) {

        showExamTypeFormError(
            "Please enter an exam type."
        );

        return false;

    }


    const minSubjects =
        getIntegerValue(
            elements.minSubjects,
            CBT_DEFAULTS.minSubjects
        );


    const maxSubjects =
        getIntegerValue(
            elements.maxSubjects,
            CBT_DEFAULTS.maxSubjects
        );


    const minQuestions =
        getIntegerValue(
            elements.minQuestions,
            CBT_DEFAULTS.minQuestions
        );


    const maxQuestions =
        getIntegerValue(
            elements.maxQuestions,
            CBT_DEFAULTS.maxQuestions
        );


    const defaultQuestions =
        getIntegerValue(
            elements.defaultQuestions,
            CBT_DEFAULTS.defaultQuestions
        );


    const minDuration =
        getIntegerValue(
            elements.minDuration,
            CBT_DEFAULTS.minDuration
        );


    const maxDuration =
        getIntegerValue(
            elements.maxDuration,
            CBT_DEFAULTS.maxDuration
        );


    const defaultDuration =
        getIntegerValue(
            elements.defaultDuration,
            CBT_DEFAULTS.defaultDuration
        );


    if (minSubjects < 1) {

        showExamTypeFormError(
            "Minimum subjects must be at least 1."
        );

        return false;

    }


    if (maxSubjects < minSubjects) {

        showExamTypeFormError(
            "Maximum subjects cannot be less than minimum subjects."
        );

        return false;

    }


    if (minQuestions < 1) {

        showExamTypeFormError(
            "Minimum questions must be at least 1."
        );

        return false;

    }


    if (maxQuestions < minQuestions) {

        showExamTypeFormError(
            "Maximum questions cannot be less than minimum questions."
        );

        return false;

    }


    if (
        defaultQuestions < minQuestions ||
        defaultQuestions > maxQuestions
    ) {

        showExamTypeFormError(
            "Default questions must be between the minimum and maximum questions."
        );

        return false;

    }


    if (minDuration < 1) {

        showExamTypeFormError(
            "Minimum duration must be at least 1 minute."
        );

        return false;

    }


    if (maxDuration < minDuration) {

        showExamTypeFormError(
            "Maximum duration cannot be less than minimum duration."
        );

        return false;

    }


    if (
        defaultDuration < minDuration ||
        defaultDuration > maxDuration
    ) {

        showExamTypeFormError(
            "Default duration must be between the minimum and maximum duration."
        );

        return false;

    }


    /*
        Prevent duplicate exam types when creating
        a new record or changing the name.
    */

    const duplicate =
        examTypes.find(row => {

            if (
                currentEditingSettingId &&
                row.$id === currentEditingSettingId
            ) {

                return false;

            }

            return (
                String(
                    row.examType || ""
                ).trim().toLowerCase()
                ===
                examType.toLowerCase()
            );

        });


    if (duplicate) {

        showExamTypeFormError(
            "This exam type already exists."
        );

        return false;

    }


    return true;

}


/* ==================================================
   SECTION 21 — BUILD EXAM TYPE PAYLOAD
================================================== */

function buildExamTypePayload() {

    return {

        examType:
            elements.examType
                ? elements.examType.value.trim()
                : "",

        minSubjects:
            getIntegerValue(
                elements.minSubjects,
                CBT_DEFAULTS.minSubjects
            ),

        maxSubjects:
            getIntegerValue(
                elements.maxSubjects,
                CBT_DEFAULTS.maxSubjects
            ),

        minQuestions:
            getIntegerValue(
                elements.minQuestions,
                CBT_DEFAULTS.minQuestions
            ),

        maxQuestions:
            getIntegerValue(
                elements.maxQuestions,
                CBT_DEFAULTS.maxQuestions
            ),

        defaultQuestions:
            getIntegerValue(
                elements.defaultQuestions,
                CBT_DEFAULTS.defaultQuestions
            ),

        minDuration:
            getIntegerValue(
                elements.minDuration,
                CBT_DEFAULTS.minDuration
            ),

        maxDuration:
            getIntegerValue(
                elements.maxDuration,
                CBT_DEFAULTS.maxDuration
            ),

        defaultDuration:
            getIntegerValue(
                elements.defaultDuration,
                CBT_DEFAULTS.defaultDuration
            ),

        randomizeQuestions:
            CBT_DEFAULTS.randomizeQuestions,

        randomizeOptions:
            CBT_DEFAULTS.randomizeOptions,

        allowPrevious:
            CBT_DEFAULTS.allowPrevious,

        autoSubmit:
            CBT_DEFAULTS.autoSubmit,

        showProgress:
            CBT_DEFAULTS.showProgress,

        allowEarlySubmit:
            CBT_DEFAULTS.allowEarlySubmit,

        showResultImmediately:
            CBT_DEFAULTS.showResultImmediately,

        instructions:
            CBT_DEFAULTS.instructions,

        status:
            elements.examStatus
                ? elements.examStatus.value
                : "active"

    };

}


/* ==================================================
   END OF BATCH 1
================================================== */



/* ==================================================
   APLUS TUTORS
   ADMIN CBT MANAGEMENT
   PHASE 1B — BATCH 2
   ================================================== */


/* ==================================================
   SECTION 22 — RENDER EXAM TYPES
================================================== */

function renderExamTypes() {

    hideExamTypesLoading();


    /*
        No exam types
    */

    if (!examTypes.length) {

        if (elements.examTypesTableContainer) {

            elements.examTypesTableContainer.classList.add(
                "d-none"
            );

        }

        if (elements.examTypesEmpty) {

            elements.examTypesEmpty.classList.remove(
                "d-none"
            );

        }

        if (elements.examTypesTableBody) {

            elements.examTypesTableBody.innerHTML = "";

        }

        return;

    }


    /*
        Exam types exist
    */

    if (elements.examTypesEmpty) {

        elements.examTypesEmpty.classList.add(
            "d-none"
        );

    }


    if (elements.examTypesTableContainer) {

        elements.examTypesTableContainer.classList.remove(
            "d-none"
        );

    }


    if (!elements.examTypesTableBody) {

        console.warn(
            "Aplus CBT: examTypesTableBody was not found."
        );

        return;

    }


    elements.examTypesTableBody.innerHTML =
        examTypes
            .map(
                row =>
                    createExamTypeRow(row)
            )
            .join("");

}


/* ==================================================
   SECTION 23 — CREATE EXAM TYPE TABLE ROW
================================================== */

function createExamTypeRow(

    row

) {

    const data =
        normalizeExamType(row);


    const status =
        data.status === "active"
            ? "active"
            : "inactive";


    const statusLabel =
        status === "active"
            ? "Active"
            : "Inactive";


    const statusClass =
        status === "active"
            ? "bg-success"
            : "bg-secondary";


    return `

        <tr
            data-setting-id="${escapeHTML(data.$id)}"
        >

            <!-- EXAM TYPE -->

            <td>

                <div class="fw-semibold">

                    ${escapeHTML(
                        data.examType
                    )}

                </div>

            </td>


            <!-- SUBJECTS -->

            <td>

                ${formatNumber(
                    data.minSubjects
                )}

                -

                ${formatNumber(
                    data.maxSubjects
                )}

            </td>


            <!-- QUESTIONS -->

            <td>

                <div>

                    ${formatNumber(
                        data.minQuestions
                    )}

                    -

                    ${formatNumber(
                        data.maxQuestions
                    )}

                </div>

                <small class="text-muted">

                    Default:

                    ${formatNumber(
                        data.defaultQuestions
                    )}

                </small>

            </td>


            <!-- DURATION -->

            <td>

                <div>

                    ${formatNumber(
                        data.minDuration
                    )}

                    -

                    ${formatNumber(
                        data.maxDuration
                    )}

                    min

                </div>

                <small class="text-muted">

                    Default:

                    ${formatNumber(
                        data.defaultDuration
                    )}

                    min

                </small>

            </td>


            <!-- STATUS -->

            <td>

                <span
                    class="badge ${statusClass}"
                >

                    ${statusLabel}

                </span>

            </td>


            <!-- ACTIONS -->

            <td>

                <div
                    class="d-flex gap-2 flex-wrap"
                >

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        data-action="edit"
                        data-setting-id="${escapeHTML(
                            data.$id
                        )}"
                        title="Edit exam type"
                    >

                        <i
                            class="fa-solid fa-pen"
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        data-action="toggle-status"
                        data-setting-id="${escapeHTML(
                            data.$id
                        )}"
                        title="${
                            status === "active"
                                ? "Deactivate exam type"
                                : "Activate exam type"
                        }"
                    >

                        <i
                            class="fa-solid ${
                                status === "active"
                                    ? "fa-toggle-on"
                                    : "fa-toggle-off"
                            }"
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        data-action="delete"
                        data-setting-id="${escapeHTML(
                            data.$id
                        )}"
                        title="Delete exam type"
                    >

                        <i
                            class="fa-solid fa-trash"
                        ></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* ==================================================
   SECTION 24 — ADD EXAM TYPE BUTTON
================================================== */

function initializeAddExamTypeButtons() {

    if (elements.addExamTypeBtn) {

        elements.addExamTypeBtn.addEventListener(
            "click",
            () => {

                openAddExamTypeModal();

            }
        );

    }


    if (elements.emptyAddExamTypeBtn) {

        elements.emptyAddExamTypeBtn.addEventListener(
            "click",
            () => {

                openAddExamTypeModal();

            }
        );

    }

}


/* ==================================================
   SECTION 25 — EXAM TYPE TABLE ACTIONS
================================================== */

function initializeExamTypeTableActions() {

    if (!elements.examTypesTableBody) {

        return;

    }


    elements.examTypesTableBody.addEventListener(

        "click",

        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.action;


            const settingId =
                button.dataset.settingId;


            if (!settingId) {

                console.warn(
                    "Aplus CBT: No setting ID found for table action."
                );

                return;

            }


            if (action === "edit") {

                openEditExamTypeModal(
                    settingId
                );

                return;

            }


            if (action === "toggle-status") {

                await toggleExamTypeStatus(
                    settingId
                );

                return;

            }


            if (action === "delete") {

                await deleteExamType(
                    settingId
                );

                return;

            }

        }

    );

}


/* ==================================================
   SECTION 26 — SAVE EXAM TYPE
================================================== */

async function saveExamType() {

    if (isSavingExamType) {

        return;

    }


    if (!checkAppwriteReady()) {

        return;

    }


    if (!validateExamTypeForm()) {

        return;

    }


    const payload =
        buildExamTypePayload();


    isSavingExamType = true;


    setButtonLoading(

        elements.saveExamTypeBtn,

        true,

        currentEditingSettingId
            ? "Updating..."
            : "Saving..."

    );


    try {

        let savedRow;


        /*
            EDIT EXISTING EXAM TYPE
        */

        if (currentEditingSettingId) {

            savedRow =
                await tablesDB.updateRow({

                    databaseId:
                        DATABASE_ID,

                    tableId:
                        CBT_SETTINGS_TABLE_ID,

                    rowId:
                        currentEditingSettingId,

                    data:
                        payload

                });


            /*
                Replace the existing row
                in local state.
            */

            const index =
                examTypes.findIndex(
                    row =>
                        row.$id ===
                        currentEditingSettingId
                );


            if (index !== -1) {

                examTypes[index] =
                    savedRow;

            }


            showCBTAlert(
                "Exam type updated successfully.",
                "success"
            );

        }


        /*
            CREATE NEW EXAM TYPE
        */

        else {

            savedRow =
                await tablesDB.createRow({

                    databaseId:
                        DATABASE_ID,

                    tableId:
                        CBT_SETTINGS_TABLE_ID,

                    rowId:
                        Appwrite.ID.unique(),

                    data:
                        payload

                });


            examTypes.push(
                savedRow
            );


            /*
                Keep the table sorted.
            */

            examTypes.sort(
                (a, b) => {

                    const first =
                        String(
                            a.examType || ""
                        ).toLowerCase();

                    const second =
                        String(
                            b.examType || ""
                        ).toLowerCase();

                    return first.localeCompare(
                        second
                    );

                }
            );


            showCBTAlert(
                "Exam type created successfully.",
                "success"
            );

        }


        /*
            Refresh UI.
        */

        renderExamTypes();

        updateExamTypeCount();


        /*
            Close modal.
        */

        if (cbtModal) {

            cbtModal.hide();

        }


        /*
            Reset editing state.
        */

        currentEditingSettingId =
            null;


    } catch (error) {

        console.error(
            "Aplus CBT: Failed to save exam type.",
            error
        );


        showExamTypeFormError(
            getAppwriteErrorMessage(
                error,
                "Unable to save the exam type."
            )
        );

    } finally {

        isSavingExamType = false;


        setButtonLoading(

            elements.saveExamTypeBtn,

            false

        );

    }

}


/* ==================================================
   SECTION 27 — EXAM TYPE FORM SUBMISSION
================================================== */

function initializeExamTypeForm() {

    if (!elements.examTypeForm) {

        console.warn(
            "Aplus CBT: examTypeForm was not found."
        );

        return;

    }


    elements.examTypeForm.addEventListener(

        "submit",

        async event => {

            event.preventDefault();

            await saveExamType();

        }

    );

}


/* ==================================================
   SECTION 28 — RESET MODAL WHEN CLOSED
================================================== */

function initializeExamTypeModalEvents() {

    if (!elements.examTypeModal) {

        return;

    }


    elements.examTypeModal.addEventListener(

        "hidden.bs.modal",

        () => {

            resetExamTypeForm();

        }

    );

}


/* ==================================================
   SECTION 29 — TOGGLE EXAM TYPE STATUS
================================================== */

async function toggleExamTypeStatus(

    settingId

) {

    if (!checkAppwriteReady()) {

        return;

    }


    const row =
        examTypes.find(
            item =>
                item.$id === settingId
        );


    if (!row) {

        showCBTAlert(
            "The selected exam type could not be found.",
            "danger"
        );

        return;

    }


    const currentStatus =
        row.status === "active"
            ? "active"
            : "inactive";


    const newStatus =
        currentStatus === "active"
            ? "inactive"
            : "active";


    const actionText =
        newStatus === "active"
            ? "activate"
            : "deactivate";


    const confirmed =
        window.confirm(

            `Are you sure you want to ${actionText} "${row.examType}"?`

        );


    if (!confirmed) {

        return;

    }


    /*
        Find the clicked button so it can
        show a loading state.
    */

    const rowElement =
        elements.examTypesTableBody
            ? elements.examTypesTableBody.querySelector(
                `tr[data-setting-id="${CSS.escape(settingId)}"]`
            )
            : null;


    const actionButton =
        rowElement
            ? rowElement.querySelector(
                '[data-action="toggle-status"]'
            )
            : null;


    setButtonLoading(

        actionButton,

        true,

        "Saving..."

    );


    try {

        const updatedRow =
            await tablesDB.updateRow({

                databaseId:
                    DATABASE_ID,

                tableId:
                    CBT_SETTINGS_TABLE_ID,

                rowId:
                    settingId,

                data: {

                    status:
                        newStatus

                }

            });


        /*
            Update local state.
        */

        const index =
            examTypes.findIndex(
                item =>
                    item.$id === settingId
            );


        if (index !== -1) {

            examTypes[index] =
                updatedRow;

        }


        renderExamTypes();


        showCBTAlert(

            `"${row.examType}" has been ${newStatus === "active"
                ? "activated"
                : "deactivated"
            } successfully.`,

            "success"

        );


    } catch (error) {

        console.error(
            "Aplus CBT: Failed to change exam type status.",
            error
        );


        showCBTAlert(

            getAppwriteErrorMessage(
                error,
                "Unable to change exam type status."
            ),

            "danger"

        );

    } finally {

        setButtonLoading(

            actionButton,

            false

        );

    }

}


/* ==================================================
   SECTION 30 — DELETE EXAM TYPE
================================================== */

async function deleteExamType(

    settingId

) {

    if (!checkAppwriteReady()) {

        return;

    }


    const row =
        examTypes.find(
            item =>
                item.$id === settingId
        );


    if (!row) {

        showCBTAlert(
            "The selected exam type could not be found.",
            "danger"
        );

        return;

    }


    const confirmed =
        window.confirm(

            `Delete "${row.examType}"?\n\nThis will remove the CBT settings for this exam type. This action cannot be undone.`

        );


    if (!confirmed) {

        return;

    }


    const rowElement =
        elements.examTypesTableBody
            ? elements.examTypesTableBody.querySelector(
                `tr[data-setting-id="${CSS.escape(settingId)}"]`
            )
            : null;


    const deleteButton =
        rowElement
            ? rowElement.querySelector(
                '[data-action="delete"]'
            )
            : null;


    setButtonLoading(

        deleteButton,

        true,

        "Deleting..."

    );


    try {

        await tablesDB.deleteRow({

            databaseId:
                DATABASE_ID,

            tableId:
                CBT_SETTINGS_TABLE_ID,

            rowId:
                settingId

        });


        /*
            Remove from local state.
        */

        examTypes =
            examTypes.filter(
                item =>
                    item.$id !== settingId
            );


        renderExamTypes();

        updateExamTypeCount();


        /*
            Reload behaviour in case the
            deleted row was the row being
            used as the current global
            behaviour source.
        */

        loadBehaviourFromExamTypes();


        showCBTAlert(

            `"${row.examType}" was deleted successfully.`,

            "success"

        );


    } catch (error) {

        console.error(
            "Aplus CBT: Failed to delete exam type.",
            error
        );


        showCBTAlert(

            getAppwriteErrorMessage(
                error,
                "Unable to delete the exam type."
            ),

            "danger"

        );


        setButtonLoading(

            deleteButton,

            false

        );

    }

}


/* ==================================================
   SECTION 31 — CLEAN EXAM TYPE NAME
================================================== */

function cleanExamTypeName(

    value

) {

    return String(
        value || ""
    )
        .trim()
        .replace(/\s+/g, " ");

}


/* ==================================================
   SECTION 32 — NORMALIZE FORM TEXT
================================================== */

function normalizeExamTypeFormText() {

    if (!elements.examType) {

        return;

    }


    elements.examType.value =
        cleanExamTypeName(
            elements.examType.value
        );

}


/* ==================================================
   SECTION 33 — EXAM TYPE INPUT EVENTS
================================================== */

function initializeExamTypeInputEvents() {

    if (!elements.examType) {

        return;

    }


    elements.examType.addEventListener(

        "blur",

        () => {

            normalizeExamTypeFormText();

        }

    );

}


/* ==================================================
   SECTION 34 — NUMERIC FIELD VALIDATION
================================================== */

function initializeNumericFieldValidation() {

    const fields = [

        elements.minSubjects,

        elements.maxSubjects,

        elements.minQuestions,

        elements.maxQuestions,

        elements.defaultQuestions,

        elements.minDuration,

        elements.maxDuration,

        elements.defaultDuration

    ];


    fields.forEach(field => {

        if (!field) {

            return;

        }


        field.addEventListener(

            "input",

            () => {

                /*
                    Prevent negative values.
                */

                if (
                    Number(field.value) < 0
                ) {

                    field.value = 0;

                }

            }

        );

    });

}


/* ==================================================
   SECTION 35 — KEEP DEFAULT QUESTIONS IN RANGE
================================================== */

function adjustDefaultQuestions() {

    if (
        !elements.minQuestions ||
        !elements.maxQuestions ||
        !elements.defaultQuestions
    ) {

        return;

    }


    const minimum =
        getIntegerValue(
            elements.minQuestions,
            CBT_DEFAULTS.minQuestions
        );


    const maximum =
        getIntegerValue(
            elements.maxQuestions,
            CBT_DEFAULTS.maxQuestions
        );


    const current =
        getIntegerValue(
            elements.defaultQuestions,
            CBT_DEFAULTS.defaultQuestions
        );


    if (current < minimum) {

        elements.defaultQuestions.value =
            minimum;

    }


    if (current > maximum) {

        elements.defaultQuestions.value =
            maximum;

    }

}


/* ==================================================
   SECTION 36 — KEEP DEFAULT DURATION IN RANGE
================================================== */

function adjustDefaultDuration() {

    if (
        !elements.minDuration ||
        !elements.maxDuration ||
        !elements.defaultDuration
    ) {

        return;

    }


    const minimum =
        getIntegerValue(
            elements.minDuration,
            CBT_DEFAULTS.minDuration
        );


    const maximum =
        getIntegerValue(
            elements.maxDuration,
            CBT_DEFAULTS.maxDuration
        );


    const current =
        getIntegerValue(
            elements.defaultDuration,
            CBT_DEFAULTS.defaultDuration
        );


    if (current < minimum) {

        elements.defaultDuration.value =
            minimum;

    }


    if (current > maximum) {

        elements.defaultDuration.value =
            maximum;

    }

}


/* ==================================================
   SECTION 37 — RANGE INPUT EVENTS
================================================== */

function initializeRangeInputEvents() {

    if (elements.minQuestions) {

        elements.minQuestions.addEventListener(

            "input",

            adjustDefaultQuestions

        );

    }


    if (elements.maxQuestions) {

        elements.maxQuestions.addEventListener(

            "input",

            adjustDefaultQuestions

        );

    }


    if (elements.minDuration) {

        elements.minDuration.addEventListener(

            "input",

            adjustDefaultDuration

        );

    }


    if (elements.maxDuration) {

        elements.maxDuration.addEventListener(

            "input",

            adjustDefaultDuration

        );

    }

}


/* ==================================================
   SECTION 38 — EXAM TYPE KEYBOARD SUPPORT
================================================== */

function initializeExamTypeKeyboardSupport() {

    if (!elements.examType) {

        return;

    }


    elements.examType.addEventListener(

        "keydown",

        event => {

            /*
                Allow Enter to submit the form
                normally.

                Escape closes the modal.
            */

            if (
                event.key === "Escape" &&
                cbtModal
            ) {

                cbtModal.hide();

            }

        }

    );

}


/* ==================================================
   SECTION 39 — EXAM TYPE STATUS LABEL
================================================== */

function getStatusLabel(

    status

) {

    return status === "active"
        ? "Active"
        : "Inactive";

}


/* ==================================================
   SECTION 40 — EXAM TYPE STATUS CLASS
================================================== */

function getStatusClass(

    status

) {

    return status === "active"
        ? "bg-success"
        : "bg-secondary";

}


/* ==================================================
   SECTION 41 — REFRESH EXAM TYPES
================================================== */

async function refreshExamTypes() {

    await loadExamTypes();

}


/* ==================================================
   SECTION 42 — GLOBAL EXAM TYPE HELPERS
================================================== */

window.aplusCBT = {

    refreshExamTypes,

    loadExamTypes,

    openAddExamTypeModal,

    openEditExamTypeModal,

    getExamTypes: () =>
        [...examTypes]

};


/* ==================================================
   END OF BATCH 2
================================================== */


/* ==================================================
   APLUS TUTORS
   ADMIN CBT MANAGEMENT
   PHASE 1B — BATCH 3
   ================================================== */


/* ==================================================
   SECTION 43 — LOAD QUESTION BANK
================================================== */

async function loadQuestionBankStats() {

    if (!checkAppwriteReady()) {

        return;

    }


    try {

        /*
            Load all questions from the existing
            questions table.

            We are only reading the table here.
            No question records are modified.
        */

        const response =
            await tablesDB.listRows({

                databaseId:
                    DATABASE_ID,

                tableId:
                    CBT_QUESTIONS_TABLE_ID,

                queries: [],

            });


        const rows =
            Array.isArray(response.rows)
                ? response.rows
                : [];


        /*
            Calculate question statistics.
        */

        const total =
            rows.length;


        const active =
            rows.filter(
                row =>
                    String(
                        row.status || ""
                    ).toLowerCase() === "active"
            ).length;


        const inactive =
            rows.filter(
                row =>
                    String(
                        row.status || ""
                    ).toLowerCase() !== "active"
            ).length;


        questionBankStats = {

            total,

            active,

            inactive

        };


        /*
            Update the page.
        */

        updateQuestionBankDisplay();


    } catch (error) {

        console.error(
            "Aplus CBT: Failed to load question bank statistics.",
            error
        );


        questionBankStats = {

            total: 0,

            active: 0,

            inactive: 0

        };


        updateQuestionBankDisplay();


        showCBTAlert(

            getAppwriteErrorMessage(

                error,

                "Unable to load question bank statistics."

            ),

            "danger"

        );

    }

}


/* ==================================================
   SECTION 44 — UPDATE QUESTION BANK DISPLAY
================================================== */

function updateQuestionBankDisplay() {

    /*
        Main overview card.
    */

    setElementText(

        elements.totalQuestions,

        formatNumber(
            questionBankStats.total
        )

    );


    setElementText(

        elements.activeQuestions,

        formatNumber(
            questionBankStats.active
        )

    );


    /*
        Question Bank section.
    */

    setElementText(

        elements.bankTotalQuestions,

        formatNumber(
            questionBankStats.total
        )

    );


    setElementText(

        elements.bankActiveQuestions,

        formatNumber(
            questionBankStats.active
        )

    );


    setElementText(

        elements.bankInactiveQuestions,

        formatNumber(
            questionBankStats.inactive
        )

    );

}


/* ==================================================
   SECTION 45 — LOAD SUBJECT STATISTICS
================================================== */

async function loadSubjectStats() {

    if (!checkAppwriteReady()) {

        return;

    }


    try {

        /*
            Load subjects from the existing
            subjects table.

            The CBT page only needs the number
            of subjects at this stage.
        */

        const response =
            await tablesDB.listRows({

                databaseId:
                    DATABASE_ID,

                tableId:
                    CBT_SUBJECTS_TABLE_ID,

                queries: []

            });


        const rows =
            Array.isArray(response.rows)
                ? response.rows
                : [];


        /*
            Count unique subject IDs.

            This protects against accidentally
            counting duplicate records twice.
        */

        const uniqueSubjects =
            new Set();


        rows.forEach(row => {

            const subjectId =
                String(
                    row.subjectId ||
                    row.$id ||
                    ""
                ).trim();


            if (subjectId) {

                uniqueSubjects.add(
                    subjectId
                );

            }

        });


        subjectStats = {

            total:
                uniqueSubjects.size

        };


        updateSubjectStatsDisplay();


    } catch (error) {

        console.error(
            "Aplus CBT: Failed to load subject statistics.",
            error
        );


        subjectStats = {

            total: 0

        };


        updateSubjectStatsDisplay();


        showCBTAlert(

            getAppwriteErrorMessage(

                error,

                "Unable to load subject statistics."

            ),

            "danger"

        );

    }

}


/* ==================================================
   SECTION 46 — UPDATE SUBJECT STATISTICS DISPLAY
================================================== */

function updateSubjectStatsDisplay() {

    setElementText(

        elements.totalSubjects,

        formatNumber(
            subjectStats.total
        )

    );


    setElementText(

        elements.bankSubjects,

        formatNumber(
            subjectStats.total
        )

    );

}


/* ==================================================
   SECTION 47 — LOAD ALL CBT STATISTICS
================================================== */

async function loadAllCBTStatistics() {

    /*
        Run the question and subject requests
        together for better performance.
    */

    await Promise.all([

        loadQuestionBankStats(),

        loadSubjectStats()

    ]);

}


/* ==================================================
   SECTION 48 — REFRESH QUESTION STATISTICS
================================================== */

async function refreshQuestionBankStats() {

    await loadQuestionBankStats();

}


/* ==================================================
   SECTION 49 — REFRESH SUBJECT STATISTICS
================================================== */

async function refreshSubjectStats() {

    await loadSubjectStats();

}


/* ==================================================
   SECTION 50 — GET QUESTION BANK STATS
================================================== */

function getQuestionBankStats() {

    return {

        ...questionBankStats

    };

}


/* ==================================================
   SECTION 51 — GET SUBJECT STATS
================================================== */

function getSubjectStats() {

    return {

        ...subjectStats

    };

}


/* ==================================================
   SECTION 52 — CHECK QUESTION AVAILABILITY
================================================== */

function hasEnoughQuestions(

    requiredQuestions

) {

    const required =
        Number(requiredQuestions);


    if (
        !Number.isFinite(required) ||
        required < 1
    ) {

        return false;

    }


    return (
        questionBankStats.active >=
        required
    );

}


/* ==================================================
   SECTION 53 — QUESTION AVAILABILITY MESSAGE
================================================== */

function getQuestionAvailabilityMessage(

    requiredQuestions

) {

    const required =
        Number(requiredQuestions);


    if (
        !Number.isFinite(required) ||
        required < 1
    ) {

        return "Enter a valid number of questions.";

    }


    const available =
        questionBankStats.active;


    if (available >= required) {

        return (

            `${formatNumber(available)} active questions are available.`

        );

    }


    return (

        `Only ${formatNumber(available)} active questions are available, but ${formatNumber(required)} are required.`

    );

}


/* ==================================================
   SECTION 54 — QUESTION BANK STATUS
================================================== */

function getQuestionBankStatus() {

    const total =
        questionBankStats.total;


    const active =
        questionBankStats.active;


    if (total === 0) {

        return {

            status: "empty",

            label: "Empty",

            message:
                "No questions have been added to the question bank yet."

        };

    }


    if (active === 0) {

        return {

            status: "inactive",

            label: "No Active Questions",

            message:
                "Questions exist, but none are currently active."

        };

    }


    return {

        status: "ready",

        label: "Ready",

        message:
            `${formatNumber(active)} active questions are available for CBT.`

    };

}


/* ==================================================
   SECTION 55 — SUBJECT STATUS
================================================== */

function getSubjectStatus() {

    const total =
        subjectStats.total;


    if (total === 0) {

        return {

            status: "empty",

            label: "No Subjects",

            message:
                "No subjects have been created yet."

        };

    }


    return {

        status: "ready",

        label: "Ready",

        message:
            `${formatNumber(total)} subjects are available.`

    };

}


/* ==================================================
   SECTION 56 — QUESTION TABLE RECORD READER
================================================== */

function normalizeQuestionRecord(

    row

) {

    return {

        $id:
            row.$id || "",

        subjectId:
            row.subjectId || "",

        topicId:
            row.topicId || "",

        question:
            row.question || "",

        optionA:
            row.optionA || "",

        optionB:
            row.optionB || "",

        optionC:
            row.optionC || "",

        optionD:
            row.optionD || "",

        correctAnswer:
            row.correctAnswer || "",

        explanation:
            row.explanation || "",

        difficulty:
            row.difficulty || "",

        questionType:
            row.questionType || "",

        status:
            row.status || ""

    };

}


/* ==================================================
   SECTION 57 — CHECK ACTIVE QUESTION
================================================== */

function isActiveQuestion(

    row

) {

    if (!row) {

        return false;

    }


    return (

        String(
            row.status || ""
        ).toLowerCase()
        ===
        "active"

    );

}


/* ==================================================
   SECTION 58 — COUNT ACTIVE QUESTIONS
================================================== */

function countActiveQuestions(

    rows

) {

    if (!Array.isArray(rows)) {

        return 0;

    }


    return rows.filter(

        row =>
            isActiveQuestion(row)

    ).length;

}


/* ==================================================
   SECTION 59 — COUNT QUESTIONS BY SUBJECT
================================================== */

function countQuestionsBySubject(

    rows

) {

    const counts = {};


    if (!Array.isArray(rows)) {

        return counts;

    }


    rows.forEach(row => {

        const subjectId =
            String(
                row.subjectId || ""
            ).trim();


        if (!subjectId) {

            return;

        }


        if (
            !counts[subjectId]
        ) {

            counts[subjectId] = 0;

        }


        counts[subjectId]++;

    });


    return counts;

}


/* ==================================================
   SECTION 60 — COUNT ACTIVE QUESTIONS BY SUBJECT
================================================== */

function countActiveQuestionsBySubject(

    rows

) {

    const counts = {};


    if (!Array.isArray(rows)) {

        return counts;

    }


    rows.forEach(row => {

        if (!isActiveQuestion(row)) {

            return;

        }


        const subjectId =
            String(
                row.subjectId || ""
            ).trim();


        if (!subjectId) {

            return;

        }


        if (
            !counts[subjectId]
        ) {

            counts[subjectId] = 0;

        }


        counts[subjectId]++;

    });


    return counts;

}


/* ==================================================
   SECTION 61 — COUNT QUESTIONS BY DIFFICULTY
================================================== */

function countQuestionsByDifficulty(

    rows

) {

    const counts = {

        easy: 0,

        medium: 0,

        hard: 0,

        other: 0

    };


    if (!Array.isArray(rows)) {

        return counts;

    }


    rows.forEach(row => {

        const difficulty =
            String(
                row.difficulty || ""
            )
                .trim()
                .toLowerCase();


        if (
            difficulty === "easy"
        ) {

            counts.easy++;

            return;

        }


        if (
            difficulty === "medium"
        ) {

            counts.medium++;

            return;

        }


        if (
            difficulty === "hard"
        ) {

            counts.hard++;

            return;

        }


        counts.other++;

    });


    return counts;

}


/* ==================================================
   SECTION 62 — COUNT QUESTIONS BY TYPE
================================================== */

function countQuestionsByType(

    rows

) {

    const counts = {};


    if (!Array.isArray(rows)) {

        return counts;

    }


    rows.forEach(row => {

        const type =
            String(
                row.questionType || ""
            )
                .trim();


        const key =
            type || "Unknown";


        if (
            !counts[key]
        ) {

            counts[key] = 0;

        }


        counts[key]++;

    });


    return counts;

}


/* ==================================================
   SECTION 63 — CHECK SUBJECT AVAILABILITY
================================================== */

function hasSubjects() {

    return (
        subjectStats.total > 0
    );

}


/* ==================================================
   SECTION 64 — CHECK CBT READINESS
================================================== */

function getCBTReadiness() {

    const questionsReady =
        questionBankStats.active > 0;


    const subjectsReady =
        subjectStats.total > 0;


    const examTypesReady =
        examTypes.some(
            row =>
                String(
                    row.status || ""
                ).toLowerCase()
                ===
                "active"
        );


    return {

        questionsReady,

        subjectsReady,

        examTypesReady,

        ready:
            questionsReady &&
            subjectsReady &&
            examTypesReady

    };

}


/* ==================================================
   SECTION 65 — CBT READINESS MESSAGE
================================================== */

function getCBTReadinessMessage() {

    const readiness =
        getCBTReadiness();


    if (readiness.ready) {

        return (
            "CBT is ready. Active exam types, subjects and questions are available."
        );

    }


    const problems = [];


    if (!readiness.examTypesReady) {

        problems.push(
            "at least one active exam type"
        );

    }


    if (!readiness.subjectsReady) {

        problems.push(
            "at least one subject"
        );

    }


    if (!readiness.questionsReady) {

        problems.push(
            "at least one active question"
        );

    }


    return (

        "CBT setup requires " +
        problems.join(", ") +
        "."

    );

}


/* ==================================================
   SECTION 66 — UPDATE CBT READINESS
================================================== */

function updateCBTReadiness() {

    const readiness =
        getCBTReadiness();


    console.info(
        "Aplus CBT readiness:",
        readiness
    );


    return readiness;

}


/* ==================================================
   SECTION 67 — STATISTICS REFRESH HELPER
================================================== */

async function refreshCBTStatistics() {

    await loadAllCBTStatistics();

    updateCBTReadiness();

}


/* ==================================================
   SECTION 68 — QUESTION BANK INITIALIZATION
================================================== */

async function initializeQuestionBank() {

    await loadQuestionBankStats();

}


/* ==================================================
   SECTION 69 — SUBJECT INITIALIZATION
================================================== */

async function initializeSubjects() {

    await loadSubjectStats();

}


/* ==================================================
   SECTION 70 — EXPORT STATISTICS HELPERS
================================================== */

window.aplusCBT = {

    ...(window.aplusCBT || {}),

    refreshExamTypes,

    loadExamTypes,

    openAddExamTypeModal,

    openEditExamTypeModal,

    refreshQuestionBankStats,

    refreshSubjectStats,

    refreshCBTStatistics,

    getExamTypes: () =>
        [...examTypes],

    getQuestionBankStats,

    getSubjectStats,

    getCBTReadiness,

    getCBTReadinessMessage,

    hasEnoughQuestions,

    getQuestionAvailabilityMessage,

    getQuestionBankStatus,

    getSubjectStatus

};


/* ==================================================
   END OF BATCH 3
================================================== */


/* ==================================================
   APLUS TUTORS
   ADMIN CBT MANAGEMENT
   PHASE 1B — BATCH 4
   ================================================== */


/* ==================================================
   SECTION 71 — LOAD BEHAVIOUR FROM EXAM TYPES
================================================== */

function loadBehaviourFromExamTypes() {

    /*
        There is currently one Behaviour section
        on the admin page rather than one Behaviour
        section per exam type.

        Therefore, the first available exam type
        is used as the source for the current global
        behaviour settings.

        When behaviour is saved, the values are
        synchronized across all exam types.
    */

    if (!examTypes.length) {

        loadDefaultBehaviourValues();

        return;

    }


    /*
        Prefer an active exam type.
    */

    const sourceRow =
        examTypes.find(

            row =>
                String(
                    row.status || ""
                ).toLowerCase()
                ===
                "active"

        ) || examTypes[0];


    const data =
        normalizeExamType(sourceRow);


    applyBehaviourToForm(data);

}


/* ==================================================
   SECTION 72 — LOAD DEFAULT BEHAVIOUR VALUES
================================================== */

function loadDefaultBehaviourValues() {

    applyBehaviourToForm({

        randomizeQuestions:
            CBT_DEFAULTS.randomizeQuestions,

        randomizeOptions:
            CBT_DEFAULTS.randomizeOptions,

        allowPrevious:
            CBT_DEFAULTS.allowPrevious,

        autoSubmit:
            CBT_DEFAULTS.autoSubmit,

        showProgress:
            CBT_DEFAULTS.showProgress,

        allowEarlySubmit:
            CBT_DEFAULTS.allowEarlySubmit,

        showResultImmediately:
            CBT_DEFAULTS.showResultImmediately,

        instructions:
            CBT_DEFAULTS.instructions

    });

}


/* ==================================================
   SECTION 73 — APPLY BEHAVIOUR TO FORM
================================================== */

function applyBehaviourToForm(

    data

) {

    if (!data) {

        return;

    }


    if (elements.randomizeQuestions) {

        elements.randomizeQuestions.checked =
            toBoolean(

                data.randomizeQuestions,

                CBT_DEFAULTS.randomizeQuestions

            );

    }


    if (elements.randomizeOptions) {

        elements.randomizeOptions.checked =
            toBoolean(

                data.randomizeOptions,

                CBT_DEFAULTS.randomizeOptions

            );

    }


    if (elements.allowPrevious) {

        elements.allowPrevious.checked =
            toBoolean(

                data.allowPrevious,

                CBT_DEFAULTS.allowPrevious

            );

    }


    if (elements.autoSubmit) {

        elements.autoSubmit.checked =
            toBoolean(

                data.autoSubmit,

                CBT_DEFAULTS.autoSubmit

            );

    }


    if (elements.showProgress) {

        elements.showProgress.checked =
            toBoolean(

                data.showProgress,

                CBT_DEFAULTS.showProgress

            );

    }


    if (elements.allowEarlySubmit) {

        elements.allowEarlySubmit.checked =
            toBoolean(

                data.allowEarlySubmit,

                CBT_DEFAULTS.allowEarlySubmit

            );

    }


    if (elements.showResultImmediately) {

        elements.showResultImmediately.checked =
            toBoolean(

                data.showResultImmediately,

                CBT_DEFAULTS.showResultImmediately

            );

    }


    if (elements.cbtInstructions) {

        elements.cbtInstructions.value =
            data.instructions ||
            CBT_DEFAULTS.instructions;

    }

}


/* ==================================================
   SECTION 74 — READ BEHAVIOUR FROM FORM
================================================== */

function getBehaviourFormData() {

    return {

        randomizeQuestions:
            elements.randomizeQuestions
                ? elements.randomizeQuestions.checked
                : CBT_DEFAULTS.randomizeQuestions,

        randomizeOptions:
            elements.randomizeOptions
                ? elements.randomizeOptions.checked
                : CBT_DEFAULTS.randomizeOptions,

        allowPrevious:
            elements.allowPrevious
                ? elements.allowPrevious.checked
                : CBT_DEFAULTS.allowPrevious,

        autoSubmit:
            elements.autoSubmit
                ? elements.autoSubmit.checked
                : CBT_DEFAULTS.autoSubmit,

        showProgress:
            elements.showProgress
                ? elements.showProgress.checked
                : CBT_DEFAULTS.showProgress,

        allowEarlySubmit:
            elements.allowEarlySubmit
                ? elements.allowEarlySubmit.checked
                : CBT_DEFAULTS.allowEarlySubmit,

        showResultImmediately:
            elements.showResultImmediately
                ? elements.showResultImmediately.checked
                : CBT_DEFAULTS.showResultImmediately,

        instructions:
            elements.cbtInstructions
                ? elements.cbtInstructions.value.trim()
                : CBT_DEFAULTS.instructions

    };

}


/* ==================================================
   SECTION 75 — VALIDATE BEHAVIOUR
================================================== */

function validateBehaviourForm(

    data

) {

    if (!data) {

        return false;

    }


    if (
        typeof data.randomizeQuestions !==
        "boolean"
    ) {

        return false;

    }


    if (
        typeof data.randomizeOptions !==
        "boolean"
    ) {

        return false;

    }


    if (
        typeof data.allowPrevious !==
        "boolean"
    ) {

        return false;

    }


    if (
        typeof data.autoSubmit !==
        "boolean"
    ) {

        return false;

    }


    if (
        typeof data.showProgress !==
        "boolean"
    ) {

        return false;

    }


    if (
        typeof data.allowEarlySubmit !==
        "boolean"
    ) {

        return false;

    }


    if (
        typeof data.showResultImmediately !==
        "boolean"
    ) {

        return false;

    }


    /*
        Instructions are optional, so an empty
        value is allowed.

        However, when empty, the default text
        will be saved.
    */

    if (!data.instructions) {

        data.instructions =
            CBT_DEFAULTS.instructions;

    }


    return true;

}


/* ==================================================
   SECTION 76 — BUILD BEHAVIOUR PAYLOAD
================================================== */

function buildBehaviourPayload() {

    const behaviour =
        getBehaviourFormData();


    return {

        randomizeQuestions:
            behaviour.randomizeQuestions,

        randomizeOptions:
            behaviour.randomizeOptions,

        allowPrevious:
            behaviour.allowPrevious,

        autoSubmit:
            behaviour.autoSubmit,

        showProgress:
            behaviour.showProgress,

        allowEarlySubmit:
            behaviour.allowEarlySubmit,

        showResultImmediately:
            behaviour.showResultImmediately,

        instructions:
            behaviour.instructions

    };

}


/* ==================================================
   SECTION 77 — SAVE CBT BEHAVIOUR
================================================== */

async function saveCBTBehaviour() {

    if (isSavingBehaviour) {

        return;

    }


    if (!checkAppwriteReady()) {

        return;

    }


    /*
        There must be at least one exam type
        before global behaviour can be saved.
    */

    if (!examTypes.length) {

        showCBTAlert(

            "Create at least one exam type before saving CBT behaviour.",

            "warning"

        );

        return;

    }


    const behaviour =
        buildBehaviourPayload();


    if (
        !validateBehaviourForm(
            behaviour
        )
    ) {

        showCBTAlert(

            "Please check the CBT behaviour settings.",

            "danger"

        );

        return;

    }


    isSavingBehaviour = true;


    setButtonLoading(

        elements.saveCbtBehaviourBtn,

        true,

        "Saving..."

    );


    try {

        /*
            Update every existing exam type so
            behaviour remains synchronized.
        */

        const updateRequests =
            examTypes.map(

                row =>

                    tablesDB.updateRow({

                        databaseId:
                            DATABASE_ID,

                        tableId:
                            CBT_SETTINGS_TABLE_ID,

                        rowId:
                            row.$id,

                        data:
                            behaviour

                    })

            );


        const updatedRows =
            await Promise.all(
                updateRequests
            );


        /*
            Replace local exam type data with
            the updated Appwrite records.
        */

        examTypes =
            updatedRows;


        /*
            Preserve alphabetical order.
        */

        examTypes.sort(

            (a, b) => {

                const first =
                    String(
                        a.examType || ""
                    ).toLowerCase();


                const second =
                    String(
                        b.examType || ""
                    ).toLowerCase();


                return first.localeCompare(
                    second
                );

            }

        );


        renderExamTypes();


        showCBTAlert(

            "CBT behaviour and instructions saved successfully.",

            "success"

        );


    } catch (error) {

        console.error(

            "Aplus CBT: Failed to save CBT behaviour.",

            error

        );


        showCBTAlert(

            getAppwriteErrorMessage(

                error,

                "Unable to save CBT behaviour."

            ),

            "danger"

        );

    } finally {

        isSavingBehaviour = false;


        setButtonLoading(

            elements.saveCbtBehaviourBtn,

            false

        );

    }

}


/* ==================================================
   SECTION 78 — INITIALIZE BEHAVIOUR SAVE BUTTON
================================================== */

function initializeBehaviourControls() {

    if (
        !elements.saveCbtBehaviourBtn
    ) {

        console.warn(

            "Aplus CBT: saveCbtBehaviourBtn was not found."

        );

        return;

    }


    elements.saveCbtBehaviourBtn.addEventListener(

        "click",

        async () => {

            await saveCBTBehaviour();

        }

    );

}


/* ==================================================
   SECTION 79 — BEHAVIOUR SWITCH VALIDATION
================================================== */

function initializeBehaviourSwitches() {

    const switches = [

        elements.randomizeQuestions,

        elements.randomizeOptions,

        elements.allowPrevious,

        elements.autoSubmit,

        elements.showProgress,

        elements.allowEarlySubmit,

        elements.showResultImmediately

    ];


    switches.forEach(

        checkbox => {

            if (!checkbox) {

                return;

            }


            checkbox.addEventListener(

                "change",

                () => {

                    /*
                        Keep related settings logically
                        consistent.
                    */

                    handleBehaviourDependencies();

                }

            );

        }

    );

}


/* ==================================================
   SECTION 80 — BEHAVIOUR DEPENDENCIES
================================================== */

function handleBehaviourDependencies() {

    /*
        If early submission is disabled,
        the student cannot manually submit
        before the timer finishes.

        autoSubmit remains independent because
        it controls what happens when time expires.
    */

    if (
        elements.allowEarlySubmit &&
        elements.autoSubmit
    ) {

        /*
            No forced change is needed here.

            Both settings can independently
            be true or false.
        */

    }


    /*
        If previous-question navigation is
        disabled, there is no need to change
        the progress setting.

        showProgress controls the progress
        indicator independently.
    */

}


/* ==================================================
   SECTION 81 — BEHAVIOUR CHANGE WARNING
================================================== */

function hasBehaviourChanged() {

    if (!examTypes.length) {

        return false;

    }


    const sourceRow =
        examTypes.find(

            row =>
                String(
                    row.status || ""
                ).toLowerCase()
                ===
                "active"

        ) || examTypes[0];


    const saved =
        normalizeExamType(
            sourceRow
        );


    const current =
        getBehaviourFormData();


    return (

        saved.randomizeQuestions !==
            current.randomizeQuestions ||

        saved.randomizeOptions !==
            current.randomizeOptions ||

        saved.allowPrevious !==
            current.allowPrevious ||

        saved.autoSubmit !==
            current.autoSubmit ||

        saved.showProgress !==
            current.showProgress ||

        saved.allowEarlySubmit !==
            current.allowEarlySubmit ||

        saved.showResultImmediately !==
            current.showResultImmediately ||

        String(
            saved.instructions || ""
        ) !==
        String(
            current.instructions || ""
        )

    );

}


/* ==================================================
   SECTION 82 — UNSAVED BEHAVIOUR WARNING
================================================== */

function initializeBehaviourUnloadWarning() {

    window.addEventListener(

        "beforeunload",

        event => {

            if (
                !hasBehaviourChanged()
            ) {

                return;

            }


            event.preventDefault();


            /*
                Required by some browsers to
                display the native warning.
            */

            event.returnValue = "";

        }

    );

}


/* ==================================================
   SECTION 83 — RESET BEHAVIOUR FORM
================================================== */

function resetBehaviourForm() {

    loadBehaviourFromExamTypes();

}


/* ==================================================
   SECTION 84 — REFRESH BEHAVIOUR
================================================== */

async function refreshCBTBehaviour() {

    await loadExamTypes();

    loadBehaviourFromExamTypes();

}


/* ==================================================
   SECTION 85 — GET CURRENT BEHAVIOUR
================================================== */

function getCurrentCBTBehaviour() {

    return {

        ...getBehaviourFormData()

    };

}


/* ==================================================
   SECTION 86 — GET SAVED BEHAVIOUR
================================================== */

function getSavedCBTBehaviour() {

    if (!examTypes.length) {

        return {

            randomizeQuestions:
                CBT_DEFAULTS.randomizeQuestions,

            randomizeOptions:
                CBT_DEFAULTS.randomizeOptions,

            allowPrevious:
                CBT_DEFAULTS.allowPrevious,

            autoSubmit:
                CBT_DEFAULTS.autoSubmit,

            showProgress:
                CBT_DEFAULTS.showProgress,

            allowEarlySubmit:
                CBT_DEFAULTS.allowEarlySubmit,

            showResultImmediately:
                CBT_DEFAULTS.showResultImmediately,

            instructions:
                CBT_DEFAULTS.instructions

        };

    }


    const sourceRow =
        examTypes.find(

            row =>
                String(
                    row.status || ""
                ).toLowerCase()
                ===
                "active"

        ) || examTypes[0];


    const data =
        normalizeExamType(
            sourceRow
        );


    return {

        randomizeQuestions:
            data.randomizeQuestions,

        randomizeOptions:
            data.randomizeOptions,

        allowPrevious:
            data.allowPrevious,

        autoSubmit:
            data.autoSubmit,

        showProgress:
            data.showProgress,

        allowEarlySubmit:
            data.allowEarlySubmit,

        showResultImmediately:
            data.showResultImmediately,

        instructions:
            data.instructions

    };

}


/* ==================================================
   SECTION 87 — BEHAVIOUR SUMMARY
================================================== */

function getBehaviourSummary() {

    const behaviour =
        getCurrentCBTBehaviour();


    return {

        questionOrder:
            behaviour.randomizeQuestions
                ? "Random"
                : "Fixed",

        optionOrder:
            behaviour.randomizeOptions
                ? "Random"
                : "Fixed",

        navigation:
            behaviour.allowPrevious
                ? "Previous questions allowed"
                : "Forward only",

        timer:
            behaviour.autoSubmit
                ? "Auto-submit enabled"
                : "Manual handling",

        progress:
            behaviour.showProgress
                ? "Visible"
                : "Hidden",

        earlySubmit:
            behaviour.allowEarlySubmit
                ? "Allowed"
                : "Not allowed",

        result:
            behaviour.showResultImmediately
                ? "Immediate result"
                : "Result hidden",

        instructions:
            behaviour.instructions

    };

}


/* ==================================================
   SECTION 88 — EXPORT BEHAVIOUR HELPERS
================================================== */

window.aplusCBT = {

    ...(window.aplusCBT || {}),

    saveCBTBehaviour,

    refreshCBTBehaviour,

    resetBehaviourForm,

    getCurrentCBTBehaviour,

    getSavedCBTBehaviour,

    getBehaviourSummary,

    hasBehaviourChanged

};


/* ==================================================
   END OF BATCH 4
================================================== */



/* ==================================================
   APLUS TUTORS
   ADMIN CBT MANAGEMENT
   PHASE 1B — BATCH 5
   FINAL INITIALIZATION + PAGE CONTROL
================================================== */


/* ==================================================
   CBT PAGE STATE
================================================== */

let cbtPageInitialized = false;
let cbtPageInitializing = false;


/* ==================================================
   INITIALIZE CBT PAGE
================================================== */

async function initializeCBTPage() {

    if (cbtPageInitialized || cbtPageInitializing) {
        return;
    }

    cbtPageInitializing = true;

    try {

        console.log("========================================");
        console.log("APLUS CBT PAGE INITIALIZATION");
        console.log("========================================");


        /* ------------------------------------------
           STEP 1 — INITIALIZE DOM
        ------------------------------------------ */

        initializeCBTDom();

        console.log("CBT DOM initialized");


        /* ------------------------------------------
           STEP 2 — INITIALIZE MODAL
        ------------------------------------------ */

        initializeCBTModal();

        console.log("CBT modal initialized");


        /* ------------------------------------------
           STEP 3 — EXAM TYPE CONTROLS
        ------------------------------------------ */

        initializeAddExamTypeButtons();

        initializeExamTypeForm();

        initializeExamTypeModalEvents();

        initializeExamTypeInputEvents();

        initializeNumericFieldValidation();

        initializeRangeInputEvents();

        initializeExamTypeKeyboardSupport();

        console.log("Exam type controls initialized");


        /* ------------------------------------------
           STEP 4 — EXAM TYPE TABLE
        ------------------------------------------ */

        initializeExamTypeTableActions();

        console.log("Exam type table initialized");


        /* ------------------------------------------
           STEP 5 — CBT BEHAVIOUR
        ------------------------------------------ */

        initializeBehaviourControls();

        initializeBehaviourSwitches();

        initializeBehaviourUnloadWarning();

        console.log("CBT behaviour controls initialized");


        /* ------------------------------------------
           STEP 6 — INITIAL DISPLAY STATE
        ------------------------------------------ */

        showExamTypesLoading();

        updateQuestionBankDisplay();

        updateSubjectStatsDisplay();

        updateExamTypeCount();

        updateCBTReadiness();

        console.log("Initial display state prepared");


        /* ------------------------------------------
           STEP 7 — LOAD DATA
        ------------------------------------------ */

        await Promise.all([
            loadExamTypes(),
            loadAllCBTStatistics()
        ]);

        console.log("CBT data loaded successfully");


        /* ------------------------------------------
           STEP 8 — FINAL DISPLAY UPDATE
        ------------------------------------------ */

        updateExamTypeCount();

        updateQuestionBankDisplay();

        updateSubjectStatsDisplay();

        updateCBTReadiness();


        /* ------------------------------------------
           STEP 9 — MARK INITIALIZED
        ------------------------------------------ */

        cbtPageInitialized = true;

        console.log("========================================");
        console.log("CBT PAGE READY");
        console.log("========================================");

    } catch (error) {

        console.error("========================================");
        console.error("CBT PAGE INITIALIZATION ERROR");
        console.error("========================================");
        console.error(error);

        showCBTAlert(
            "The CBT page could not be initialized. Please refresh the page and try again.",
            "danger"
        );

    } finally {

        cbtPageInitializing = false;

    }
}


/* ==================================================
   INITIALIZATION SAFETY CHECK
================================================== */

function canInitializeCBTPage() {

    if (!document.body) {
        return false;
    }

    if (document.body.dataset.role !== "admin") {
        console.warn(
            "CBT initialization stopped: page is not marked as admin."
        );

        return false;
    }

    return true;
}


/* ==================================================
   START CBT PAGE
================================================== */

function startCBTPageInitialization() {

    if (!canInitializeCBTPage()) {
        return;
    }

    initializeCBTPage();

}


/* ==================================================
   DOM READY HANDLER
================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("CBT DOMContentLoaded event received");

    /*
       The authentication guard may dispatch
       aplusAuthReady after this event.

       If the event has already happened or no
       authentication delay exists, this starts
       the page normally.

       The initialization flag prevents duplicate
       execution.
    */

    setTimeout(function () {

        if (!cbtPageInitialized && !cbtPageInitializing) {
            startCBTPageInitialization();
        }

    }, 0);

});


/* ==================================================
   AUTH READY HANDLER
================================================== */

window.addEventListener("aplusAuthReady", function () {

    console.log("CBT received aplusAuthReady");

    if (!cbtPageInitialized && !cbtPageInitializing) {
        startCBTPageInitialization();
    }

});


/* ==================================================
   MANUAL PAGE INITIALIZATION
================================================== */

window.initializeCBTPage = initializeCBTPage;


/* ==================================================
   REFRESH COMPLETE CBT PAGE
================================================== */

async function refreshCBTPage() {

    if (cbtPageInitializing) {
        console.warn(
            "CBT page is currently initializing."
        );

        return;
    }

    if (!checkAppwriteReady()) {
        return;
    }

    console.log("Refreshing CBT page...");

    try {

        showExamTypesLoading();

        await Promise.all([
            loadExamTypes(),
            loadAllCBTStatistics()
        ]);

        updateExamTypeCount();

        updateQuestionBankDisplay();

        updateSubjectStatsDisplay();

        updateCBTReadiness();

        showCBTAlert(
            "CBT information refreshed successfully.",
            "success"
        );

        console.log("CBT page refreshed");

    } catch (error) {

        console.error(
            "CBT page refresh failed:",
            error
        );

        showCBTAlert(
            getAppwriteErrorMessage(
                error,
                "Unable to refresh CBT information."
            ),
            "danger"
        );

    }

}


/* ==================================================
   REFRESH EXAM TYPES ONLY
================================================== */

async function refreshExamTypesOnly() {

    try {

        await loadExamTypes();

        updateExamTypeCount();

        updateCBTReadiness();

    } catch (error) {

        console.error(
            "Unable to refresh exam types:",
            error
        );

    }

}


/* ==================================================
   REFRESH QUESTION BANK ONLY
================================================== */

async function refreshQuestionBankOnly() {

    try {

        await loadQuestionBankStats();

        updateQuestionBankDisplay();

        updateCBTReadiness();

    } catch (error) {

        console.error(
            "Unable to refresh question bank:",
            error
        );

    }

}


/* ==================================================
   REFRESH SUBJECTS ONLY
================================================== */

async function refreshSubjectsOnly() {

    try {

        await loadSubjectStats();

        updateSubjectStatsDisplay();

        updateCBTReadiness();

    } catch (error) {

        console.error(
            "Unable to refresh subjects:",
            error
        );

    }

}


/* ==================================================
   PAGE STATUS
================================================== */

function getCBTPageStatus() {

    return {

        initialized: cbtPageInitialized,

        initializing: cbtPageInitializing,

        examTypes: examTypes.length,

        questions: questionBankStats.total,

        activeQuestions: questionBankStats.active,

        inactiveQuestions: questionBankStats.inactive,

        subjects: subjectStats.total,

        ready: getCBTReadiness()

    };

}


/* ==================================================
   DEBUG INFORMATION
================================================== */

function logCBTPageStatus() {

    const status = getCBTPageStatus();

    console.table({

        "Page Initialized": status.initialized,

        "Page Initializing": status.initializing,

        "Exam Types": status.examTypes,

        "Total Questions": status.questions,

        "Active Questions": status.activeQuestions,

        "Inactive Questions": status.inactiveQuestions,

        "Subjects": status.subjects,

        "CBT Ready": status.ready

    });

    return status;

}


/* ==================================================
   CHECK PAGE ELEMENTS
================================================== */

function checkCBTPageElements() {

    const requiredElements = [

        "totalQuestions",
        "activeQuestions",
        "totalSubjects",
        "totalExamTypes",

        "bankTotalQuestions",
        "bankActiveQuestions",
        "bankInactiveQuestions",
        "bankSubjects",

        "examTypesLoading",
        "examTypesEmpty",
        "examTypesTableContainer",
        "examTypesTableBody",

        "addExamTypeBtn",
        "emptyAddExamTypeBtn",

        "randomizeQuestions",
        "randomizeOptions",
        "allowPrevious",
        "autoSubmit",
        "showProgress",
        "allowEarlySubmit",
        "showResultImmediately",

        "cbtInstructions",
        "saveCbtBehaviourBtn",

        "examTypeModal",
        "examTypeForm",

        "examType",
        "minSubjects",
        "maxSubjects",
        "minQuestions",
        "maxQuestions",
        "defaultQuestions",
        "minDuration",
        "maxDuration",
        "defaultDuration",
        "examStatus",

        "examTypeFormError",
        "saveExamTypeBtn"

    ];

    const missing = [];

    requiredElements.forEach(function (id) {

        if (!document.getElementById(id)) {
            missing.push(id);
        }

    });

    if (missing.length) {

        console.warn(
            "CBT page is missing the following elements:",
            missing
        );

        return {
            valid: false,
            missing: missing
        };

    }

    return {
        valid: true,
        missing: []
    };

}


/* ==================================================
   SAFE MODAL CLOSE
================================================== */

function closeCBTModal() {

    if (!cbtModal) {
        return;
    }

    try {

        cbtModal.hide();

    } catch (error) {

        console.error(
            "Unable to close CBT modal:",
            error
        );

    }

}


/* ==================================================
   RESET PAGE ALERT
================================================== */

function clearCBTPageMessages() {

    hideCBTAlert();

    hideExamTypeFormError();

}


/* ==================================================
   RESET CURRENT EDITING STATE
================================================== */

function clearCurrentEditingSetting() {

    currentEditingSettingId = null;

}


/* ==================================================
   HANDLE PAGE VISIBILITY
================================================== */

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.visibilityState !== "visible") {
            return;
        }

        /*
           Do not automatically reload data every time
           the administrator returns to the tab.

           The admin can use the normal refresh functions
           when required.
        */

    }
);


/* ==================================================
   GLOBAL CBT REFRESH EVENT
================================================== */

window.addEventListener(
    "aplusCBTRefresh",
    function () {

        refreshCBTPage();

    }
);


/* ==================================================
   DISPATCH PAGE READY EVENT
================================================== */

function dispatchCBTReadyEvent() {

    try {

        window.dispatchEvent(
            new CustomEvent("aplusCBTReady", {
                detail: {
                    status: getCBTPageStatus()
                }
            })
        );

    } catch (error) {

        console.warn(
            "Unable to dispatch aplusCBTReady:",
            error
        );

    }

}


/* ==================================================
   WATCH FOR SUCCESSFUL INITIALIZATION
================================================== */

const originalInitializeCBTPageReference =
    initializeCBTPage;


/*
   Do not replace the initialization function here.

   Instead, the ready event is dispatched from a
   lightweight observer below after initialization.
*/

function watchCBTInitialization() {

    if (
        cbtPageInitialized &&
        !window.__aplusCBTReadyDispatched
    ) {

        window.__aplusCBTReadyDispatched = true;

        dispatchCBTReadyEvent();

    }

}


/* ==================================================
   CBT READY WATCHER
================================================== */

const cbtReadyWatcher = setInterval(
    function () {

        if (cbtPageInitialized) {

            watchCBTInitialization();

            clearInterval(cbtReadyWatcher);

        }

    },
    250
);


/* ==================================================
   FINAL PUBLIC CBT API
================================================== */

window.aplusCBT = {

    ...(window.aplusCBT || {}),

    /* Page */

    initialize: initializeCBTPage,

    refresh: refreshCBTPage,

    getPageStatus: getCBTPageStatus,

    logPageStatus: logCBTPageStatus,

    checkPageElements: checkCBTPageElements,


    /* Exam Types */

    refreshExamTypes: refreshExamTypesOnly,

    loadExamTypes: loadExamTypes,

    openAddExamTypeModal: openAddExamTypeModal,

    openEditExamTypeModal: openEditExamTypeModal,

    getExamTypes: function () {
        return [...examTypes];
    },


    /* Question Bank */

    refreshQuestionBank: refreshQuestionBankOnly,

    loadQuestionBankStats: loadQuestionBankStats,

    getQuestionBankStats: function () {
        return {
            ...questionBankStats
        };
    },

    getQuestionAvailabilityMessage:
        getQuestionAvailabilityMessage,

    getQuestionBankStatus:
        getQuestionBankStatus,

    countQuestionsBySubject:
        countQuestionsBySubject,

    countActiveQuestionsBySubject:
        countActiveQuestionsBySubject,

    countQuestionsByDifficulty:
        countQuestionsByDifficulty,

    countQuestionsByType:
        countQuestionsByType,


    /* Subjects */

    refreshSubjects: refreshSubjectsOnly,

    loadSubjectStats: loadSubjectStats,

    getSubjectStats: function () {
        return {
            ...subjectStats
        };
    },


    /* Readiness */

    getCBTReadiness: getCBTReadiness,

    getCBTReadinessMessage:
        getCBTReadinessMessage,

    getCBTReadinessDetails:
        function () {

            return {
                readiness: getCBTReadiness(),

                message: getCBTReadinessMessage(),

                examTypes: examTypes.length,

                subjects: subjectStats.total,

                questions: questionBankStats.total,

                activeQuestions:
                    questionBankStats.active,

                inactiveQuestions:
                    questionBankStats.inactive
            };

        },


    /* Behaviour */

    refreshBehaviour: refreshCBTBehaviour,

    getCurrentBehaviour:
        getCurrentCBTBehaviour,

    getSavedBehaviour:
        getSavedCBTBehaviour,

    getBehaviourSummary:
        getBehaviourSummary,

    saveBehaviour:
        saveCBTBehaviour,


    /* Utilities */

    closeModal: closeCBTModal,

    clearMessages: clearCBTPageMessages,

    clearEditingState:
        clearCurrentEditingSetting

};


console.log(
    "Aplus CBT management script loaded successfully."
);


/* ==================================================
   END OF BATCH 5
================================================== */