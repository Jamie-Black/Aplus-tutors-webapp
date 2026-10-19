// ==================================================
// APLUS TUTORS
// SUBJECTS PAGE
// ==================================================


// ==================================================
// PAGE INITIALIZATION
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    loadSubjects();

});


// ==================================================
// LOAD SUBJECTS
// ==================================================

async function loadSubjects() {

    const subjectsGrid =
        document.getElementById("subjectsGrid");


    if (!subjectsGrid) {
        console.error(
            "Subjects grid was not found."
        );

        return;
    }


    // Show loading state

    showSubjectsLoading();


    try {

        /*
         * Load all subjects from Appwrite.
         *
         * We use pagination so the page is not
         * limited to Appwrite's default number of rows.
         */

        const subjects =
            await getAllSubjects();


        console.log(
            "Subjects loaded:",
            subjects
        );


        // Update statistics

        updateSubjectStatistics(subjects);


        // No subjects found

        if (subjects.length === 0) {

            showSubjectsEmptyState();

            return;
        }


        // Display subjects

        renderSubjects(subjects);


    } catch (error) {

        console.error(
            "Error loading subjects:",
            error
        );


        showSubjectsError();

    }

}


// ==================================================
// GET ALL SUBJECTS
// ==================================================

async function getAllSubjects() {

    const allSubjects = [];

    let lastId = null;


    while (true) {

        const queries = [

            Query.limit(100),

            Query.orderAsc("name")

        ];


        /*
         * If there was a previous batch,
         * start from the last row.
         */

        if (lastId) {

            queries.push(
                Query.cursorAfter(lastId)
            );

        }


        const response =
            await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: SUBJECTS_TABLE_ID,
                queries: queries
            });


        const rows =
            response.rows || [];


        allSubjects.push(...rows);


        /*
         * If fewer than 100 rows were returned,
         * we have reached the end.
         */

        if (rows.length < 100) {
            break;
        }


        /*
         * Protect against an unexpected empty
         * response.
         */

        const lastRow =
            rows[rows.length - 1];


        if (!lastRow || !lastRow.$id) {
            break;
        }


        lastId =
            lastRow.$id;

    }


    return allSubjects;

}


// ==================================================
// UPDATE SUBJECT STATISTICS
// ==================================================

function updateSubjectStatistics(subjects) {

    const total =
        subjects.length;


    const active =
        subjects.filter(subject => {

            return String(
                subject.status || ""
            ).toLowerCase() === "active";

        }).length;


    const inactive =
        subjects.filter(subject => {

            return String(
                subject.status || ""
            ).toLowerCase() === "inactive";

        }).length;


    const totalElement =
        document.getElementById(
            "totalSubjects"
        );


    const activeElement =
        document.getElementById(
            "activeSubjects"
        );


    const inactiveElement =
        document.getElementById(
            "inactiveSubjects"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (activeElement) {

        activeElement.textContent =
            active;

    }


    if (inactiveElement) {

        inactiveElement.textContent =
            inactive;

    }

}


// ==================================================
// RENDER SUBJECTS
// ==================================================

function renderSubjects(subjects) {

    const subjectsGrid =
        document.getElementById(
            "subjectsGrid"
        );


    if (!subjectsGrid) {
        return;
    }


    subjectsGrid.innerHTML =
        subjects.map(subject => {

            return createSubjectCard(
                subject
            );

        }).join("");

}


// ==================================================
// CREATE SUBJECT CARD
// ==================================================

function createSubjectCard(subject) {

    const status =
        String(
            subject.status || ""
        ).toLowerCase();


    const isActive =
        status === "active";


    const subjectName =
        escapeHtml(
            subject.name || "Unnamed Subject"
        );


    const subjectCode =
        escapeHtml(
            subject.code || "N/A"
        );


    const department =
        escapeHtml(
            subject.department || "Not specified"
        );


    const description =
        subject.description &&
        String(subject.description).trim()
            ? escapeHtml(subject.description)
            : "No description has been added for this subject.";


    const statusClass =
        isActive
            ? "active"
            : "inactive";


    const statusText =
        isActive
            ? "Active"
            : "Inactive";


    const statusIcon =
        isActive
            ? "fa-circle-check"
            : "fa-circle-pause";


    return `

        <div class="col-12 col-md-6 col-xl-4">

            <div class="subject-card-wrapper">

                <article class="subject-card">


                    <!--======================================
                    CARD TOP
                    ======================================-->

                    <div class="subject-card-top">


                        <!-- SUBJECT ICON -->

                        <div class="subject-icon">

                            <i class="fa-solid fa-book-open"></i>

                        </div>


                        <!-- STATUS -->

                        <span
                            class="subject-status ${statusClass}"
                        >

                            <i
                                class="fa-solid ${statusIcon}"
                            ></i>

                            ${statusText}

                        </span>


                    </div>



                    <!--======================================
                    SUBJECT INFORMATION
                    ======================================-->

                    <h3>
                        ${subjectName}
                    </h3>


                    <span class="subject-code">
                        ${subjectCode}
                    </span>



                    <!--======================================
                    DESCRIPTION
                    ======================================-->

                    <p class="subject-description">

                        ${description}

                    </p>



                    <!--======================================
                    DEPARTMENT
                    ======================================-->

                    <div class="subject-department">

                        <i class="fa-solid fa-users"></i>

                        <span>
                            ${department}
                        </span>

                    </div>


                </article>

            </div>

        </div>

    `;

}


// ==================================================
// LOADING STATE
// ==================================================

function showSubjectsLoading() {

    const subjectsGrid =
        document.getElementById(
            "subjectsGrid"
        );


    if (!subjectsGrid) {
        return;
    }


    subjectsGrid.innerHTML = `

        <div class="col-12">

            <div class="subjects-state">

                <div class="subjects-state-icon">

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                </div>


                <h3>
                    Loading subjects...
                </h3>


                <p>
                    Please wait while we load the
                    subjects from Aplus Tutors.
                </p>

            </div>

        </div>

    `;

}


// ==================================================
// EMPTY STATE
// ==================================================

function showSubjectsEmptyState() {

    const subjectsGrid =
        document.getElementById(
            "subjectsGrid"
        );


    if (!subjectsGrid) {
        return;
    }


    subjectsGrid.innerHTML = `

        <div class="col-12">

            <div class="subjects-state">

                <div class="subjects-state-icon">

                    <i class="fa-solid fa-book"></i>

                </div>


                <h3>
                    No subjects found
                </h3>


                <p>
                    There are currently no subjects
                    registered in the Aplus Tutors system.
                </p>

            </div>

        </div>

    `;

}


// ==================================================
// ERROR STATE
// ==================================================

function showSubjectsError() {

    const subjectsGrid =
        document.getElementById(
            "subjectsGrid"
        );


    if (!subjectsGrid) {
        return;
    }


    subjectsGrid.innerHTML = `

        <div class="col-12">

            <div class="subjects-state">

                <div class="subjects-state-icon">

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                </div>


                <h3>
                    Unable to load subjects
                </h3>


                <p>
                    We couldn't retrieve the subjects
                    at the moment. Please refresh the
                    page and try again.
                </p>

            </div>

        </div>

    `;

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}




/* ==================================================
APLUS TUTORS
SUBJECTS PAGE
PHASE 2C — SUBJECT MANAGEMENT JAVASCRIPT
================================================== */

/* ==================================================
SUBJECT MANAGEMENT STATE
================================================== */

let subjectsData = [];

let currentSubject = null;

let addSubjectModalInstance = null;

let viewSubjectModalInstance = null;

let editSubjectModalInstance = null;

let subjectStatusModalInstance = null;

/* ==================================================
INITIALIZE SUBJECT MANAGEMENT
================================================== */

document.addEventListener("DOMContentLoaded", () => {

initializeSubjectManagement();

});

/* ==================================================
INITIALIZE
================================================== */

function initializeSubjectManagement() {

/*
 * Bootstrap modal instances
 */

const addModal =
    document.getElementById("addSubjectModal");

const viewModal =
    document.getElementById("viewSubjectModal");

const editModal =
    document.getElementById("editSubjectModal");

const statusModal =
    document.getElementById("subjectStatusModal");


if (addModal) {

    addSubjectModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            addModal
        );

}


if (viewModal) {

    viewSubjectModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            viewModal
        );

}


if (editModal) {

    editSubjectModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            editModal
        );

}


if (statusModal) {

    subjectStatusModalInstance =
        bootstrap.Modal.getOrCreateInstance(
            statusModal
        );

}


/*
 * Add subject button
 */

const addSubjectBtn =
    document.getElementById(
        "addSubjectBtn"
    );


if (addSubjectBtn) {

    addSubjectBtn.addEventListener(
        "click",
        openAddSubjectModal
    );

}


/*
 * Add form
 */

const addSubjectForm =
    document.getElementById(
        "addSubjectForm"
    );


if (addSubjectForm) {

    addSubjectForm.addEventListener(
        "submit",
        handleAddSubject
    );

}


/*
 * Edit form
 */

const editSubjectForm =
    document.getElementById(
        "editSubjectForm"
    );


if (editSubjectForm) {

    editSubjectForm.addEventListener(
        "submit",
        handleEditSubject
    );

}


/*
 * View → Edit button
 */

const viewEditSubjectBtn =
    document.getElementById(
        "viewEditSubjectBtn"
    );


if (viewEditSubjectBtn) {

    viewEditSubjectBtn.addEventListener(
        "click",
        () => {

            if (!currentSubject) {
                return;
            }

            openEditSubjectModal(
                currentSubject
            );

        }
    );

}


/*
 * Confirm status button
 */

const confirmSubjectStatusBtn =
    document.getElementById(
        "confirmSubjectStatusBtn"
    );


if (confirmSubjectStatusBtn) {

    confirmSubjectStatusBtn.addEventListener(
        "click",
        handleSubjectStatusChange
    );

}


/*
 * Subject card actions
 */

initializeSubjectCardActions();

}

/* ==================================================
RELOAD SUBJECTS AFTER PHASE 1 LOAD

Phase 1 already has loadSubjects().
We wrap it so the subject cards receive
their management buttons after rendering.
================================================== */

const phase1LoadSubjects =
typeof loadSubjects === "function"
? loadSubjects
: null;

if (phase1LoadSubjects) {

loadSubjects = async function () {

    await phase1LoadSubjects();

    addSubjectCardActions();

};

}

/* ==================================================
ADD SUBJECT CARD ACTIONS
================================================== */

function initializeSubjectCardActions() {

const subjectsGrid =
    document.getElementById(
        "subjectsGrid"
    );


if (!subjectsGrid) {
    return;
}


/*
 * Event delegation.
 *
 * This means we do not need to attach
 * separate listeners to every button.
 */

subjectsGrid.addEventListener(
    "click",
    handleSubjectCardAction
);

}

/* ==================================================
HANDLE SUBJECT CARD ACTION
================================================== */

function handleSubjectCardAction(event) {

const button =
    event.target.closest(
        "[data-subject-action]"
    );


if (!button) {
    return;
}


const subjectId =
    button.dataset.subjectId;


if (!subjectId) {
    return;
}


const subject =
    subjectsData.find(
        item =>
            item.$id === subjectId
    );


if (!subject) {

    showSubjectNotification(
        "Unable to find the selected subject.",
        "danger"
    );

    return;

}


const action =
    button.dataset.subjectAction;


switch (action) {

    case "view":

        openViewSubjectModal(
            subject
        );

        break;


    case "edit":

        openEditSubjectModal(
            subject
        );

        break;


    case "status":

        openSubjectStatusModal(
            subject
        );

        break;

}

}

/* ==================================================
ADD ACTION BUTTONS TO SUBJECT CARDS
================================================== */

function addSubjectCardActions() {

const subjectsGrid =
    document.getElementById(
        "subjectsGrid"
    );


if (!subjectsGrid) {
    return;
}


const cards =
    subjectsGrid.querySelectorAll(
        ".subject-card"
    );


cards.forEach((card, index) => {

    /*
     * Prevent duplicate action bars
     */

    if (
        card.querySelector(
            ".subject-card-actions"
        )
    ) {
        return;
    }


    const subject =
        subjectsData[index];


    if (!subject) {
        return;
    }


    const isActive =
        String(
            subject.status || ""
        ).toLowerCase() === "active";


    const actionBar =
        document.createElement("div");


    actionBar.className =
        "subject-card-actions";


    actionBar.innerHTML = `

        <button
            type="button"
            class="subject-card-action view"
            data-subject-action="view"
            data-subject-id="${escapeHtml(subject.$id)}"
            title="View subject"
        >

            <i class="fa-solid fa-eye"></i>

            <span>
                View
            </span>

        </button>


        <button
            type="button"
            class="subject-card-action edit"
            data-subject-action="edit"
            data-subject-id="${escapeHtml(subject.$id)}"
            title="Edit subject"
        >

            <i class="fa-solid fa-pen"></i>

            <span>
                Edit
            </span>

        </button>


        <button
            type="button"
            class="subject-card-action status"
            data-subject-action="status"
            data-subject-id="${escapeHtml(subject.$id)}"
            title="${isActive ? "Deactivate subject" : "Activate subject"}"
        >

            <i class="fa-solid ${
                isActive
                    ? "fa-toggle-on"
                    : "fa-toggle-off"
            }"></i>

            <span>
                ${isActive ? "Deactivate" : "Activate"}
            </span>

        </button>

    `;


    card.appendChild(actionBar);

});

}

/* ==================================================
OPEN ADD SUBJECT MODAL
================================================== */

function openAddSubjectModal() {

const form =
    document.getElementById(
        "addSubjectForm"
    );


if (form) {

    form.reset();

    clearFormValidation(form);

}


const status =
    document.getElementById(
        "subjectStatus"
    );


if (status) {

    status.value = "active";

}


if (addSubjectModalInstance) {

    addSubjectModalInstance.show();

}

}

/* ==================================================
HANDLE ADD SUBJECT
================================================== */

async function handleAddSubject(event) {

event.preventDefault();


const form =
    event.currentTarget;


if (!validateSubjectForm(form)) {
    return;
}


const name =
    document.getElementById(
        "subjectName"
    ).value.trim();


const code =
    document.getElementById(
        "subjectCode"
    ).value.trim();
    
const department =
    document.getElementById(
        "subjectDepartment"
    ).value.trim();


const description =
    document.getElementById(
        "subjectDescription"
    ).value.trim();


const status =
    document.getElementById(
        "subjectStatus"
    ).value;


const saveButton =
    document.getElementById(
        "saveSubjectBtn"
    );


try {

    setButtonLoading(
        saveButton,
        "Adding..."
    );


    /*
     * Check whether subject code already exists.
     */

    const duplicate =
        await subjectCodeExists(
            code
        );


    if (duplicate) {

        showSubjectNotification(
            "A subject with this code already exists.",
            "warning"
        );

        markFieldInvalid(
            document.getElementById(
                "subjectCode"
            ),
            "This subject code is already in use."
        );

        return;

    }


    /*
     * Create subject in Appwrite.
     */

    await tablesDB.createRow({

        databaseId:
            DATABASE_ID,

        tableId:
            SUBJECTS_TABLE_ID,

        rowId:
            ID.unique(),

        data: {

            name:
                name,

            code:
                code,
            
            department:
                department,

            description:
                description,

            status:
                status

        }

    });


    /*
     * Close modal.
     */

    if (addSubjectModalInstance) {

        addSubjectModalInstance.hide();

    }


    /*
     * Notify admin.
     */

    showSubjectNotification(
        "Subject added successfully.",
        "success"
    );


    /*
     * Reload subjects.
     */

    await refreshSubjects();


} catch (error) {

    console.error(
        "Error adding subject:",
        error
    );


    showSubjectNotification(
        getAppwriteErrorMessage(
            error,
            "Unable to add subject."
        ),
        "danger"
    );


} finally {

    resetButtonLoading(
        saveButton,
        '<i class="fa-solid fa-plus"></i> <span>Add Subject</span>'
    );

}

}

/* ==================================================
OPEN VIEW SUBJECT MODAL
================================================== */

function openViewSubjectModal(subject) {

currentSubject =
    subject;


const name =
    document.getElementById(
        "viewSubjectName"
    );


const code =
    document.getElementById(
        "viewSubjectCode"
    );

const department =
    document.getElementById(
        "viewSubjectDepartment"
    );


const status =
    document.getElementById(
        "viewSubjectStatus"
    );


const description =
    document.getElementById(
        "viewSubjectDescription"
    );


const created =
    document.getElementById(
        "viewSubjectCreated"
    );


const updated =
    document.getElementById(
        "viewSubjectUpdated"
    );


if (name) {

    name.textContent =
        subject.name ||
        "Unnamed Subject";

}


if (code) {

    code.textContent =
        subject.code ||
        "N/A";

}

if (department) {

    code.textContent =
        subject.department ||
        "General";

}


if (description) {

    description.textContent =
        subject.description &&
        String(
            subject.description
        ).trim()

            ? subject.description

            : "No description has been added for this subject.";

}


if (status) {

    const isActive =
        String(
            subject.status || ""
        ).toLowerCase() === "active";


    status.className =
        `subject-status ${
            isActive
                ? "active"
                : "inactive"
        }`;


    status.innerHTML = `

        <i class="fa-solid ${
            isActive
                ? "fa-circle-check"
                : "fa-circle-pause"
        }"></i>

        ${isActive ? "Active" : "Inactive"}

    `;

}


if (created) {

    created.textContent =
        formatSubjectDate(
            subject.$createdAt
        );

}


if (updated) {

    updated.textContent =
        formatSubjectDate(
            subject.$updatedAt
        );

}


if (viewSubjectModalInstance) {

    viewSubjectModalInstance.show();

}

}

/* ==================================================
OPEN EDIT SUBJECT MODAL
================================================== */

function openEditSubjectModal(subject) {

currentSubject =
    subject;


/*
 * Close View modal first.
 */

if (
    viewSubjectModalInstance &&
    document
        .getElementById(
            "viewSubjectModal"
        )
        ?.classList.contains("show")
) {

    viewSubjectModalInstance.hide();

}


const id =
    document.getElementById(
        "editSubjectId"
    );


const name =
    document.getElementById(
        "editSubjectName"
    );


const code =
    document.getElementById(
        "editSubjectCode"
    );


const description =
    document.getElementById(
        "editSubjectDescription"
    );


const status =
    document.getElementById(
        "editSubjectStatus"
    );


if (id) {

    id.value =
        subject.$id || "";

}


if (name) {

    name.value =
        subject.name || "";

}


if (code) {

    code.value =
        subject.code || "";

}


if (description) {

    description.value =
        subject.description || "";

}


if (status) {

    status.value =
        String(
            subject.status || "active"
        ).toLowerCase();

}


const form =
    document.getElementById(
        "editSubjectForm"
    );


if (form) {

    clearFormValidation(form);

}


if (editSubjectModalInstance) {

    editSubjectModalInstance.show();

}

}

/* ==================================================
HANDLE EDIT SUBJECT
================================================== */

async function handleEditSubject(event) {

event.preventDefault();


const form =
    event.currentTarget;


if (!validateSubjectForm(form)) {
    return;
}


const subjectId =
    document.getElementById(
        "editSubjectId"
    ).value;


const name =
    document.getElementById(
        "editSubjectName"
    ).value.trim();


const code =
    document.getElementById(
        "editSubjectCode"
    ).value.trim();


const description =
    document.getElementById(
        "editSubjectDescription"
    ).value.trim();


const status =
    document.getElementById(
        "editSubjectStatus"
    ).value;


const updateButton =
    document.getElementById(
        "updateSubjectBtn"
    );


if (!subjectId) {

    showSubjectNotification(
        "The subject ID could not be found.",
        "danger"
    );

    return;

}


try {

    setButtonLoading(
        updateButton,
        "Saving..."
    );


    /*
     * Check for duplicate code.
     *
     * The current subject itself is excluded.
     */

    const duplicate =
        await subjectCodeExists(
            code,
            subjectId
        );


    if (duplicate) {

        showSubjectNotification(
            "A different subject already uses this code.",
            "warning"
        );

        markFieldInvalid(
            document.getElementById(
                "editSubjectCode"
            ),
            "This subject code is already in use."
        );

        return;

    }


    /*
     * Update Appwrite row.
     */

    await tablesDB.updateRow({

        databaseId:
            DATABASE_ID,

        tableId:
            SUBJECTS_TABLE_ID,

        rowId:
            subjectId,

        data: {

            name:
                name,

            code:
                code,

            description:
                description,

            status:
                status

        }

    });


    if (editSubjectModalInstance) {

        editSubjectModalInstance.hide();

    }


    showSubjectNotification(
        "Subject updated successfully.",
        "success"
    );


    await refreshSubjects();


} catch (error) {

    console.error(
        "Error updating subject:",
        error
    );


    showSubjectNotification(
        getAppwriteErrorMessage(
            error,
            "Unable to update subject."
        ),
        "danger"
    );


} finally {

    resetButtonLoading(
        updateButton,
        '<i class="fa-solid fa-floppy-disk"></i> <span>Save Changes</span>'
    );

}

}

/* ==================================================
OPEN STATUS CONFIRMATION MODAL
================================================== */

function openSubjectStatusModal(subject) {

currentSubject =
    subject;


const subjectId =
    document.getElementById(
        "statusSubjectId"
    );


const statusValue =
    document.getElementById(
        "statusSubjectValue"
    );


const title =
    document.getElementById(
        "subjectStatusModalLabel"
    );


const message =
    document.getElementById(
        "subjectStatusModalMessage"
    );


const icon =
    document.getElementById(
        "subjectStatusModalIcon"
    );


const confirmButton =
    document.getElementById(
        "confirmSubjectStatusBtn"
    );


const isActive =
    String(
        subject.status || ""
    ).toLowerCase() === "active";


const newStatus =
    isActive
        ? "inactive"
        : "active";


if (subjectId) {

    subjectId.value =
        subject.$id || "";

}


if (statusValue) {

    statusValue.value =
        newStatus;

}


if (title) {

    title.textContent =
        isActive
            ? "Deactivate Subject?"
            : "Activate Subject?";

}


if (message) {

    message.textContent =
        isActive

            ? `Are you sure you want to deactivate "${subject.name}"? Students will no longer be able to use this subject where active subjects are required.`

            : `Are you sure you want to activate "${subject.name}"?`;

}


if (icon) {

    icon.className =
        `subject-confirm-icon ${
            isActive
                ? "warning"
                : "success"
        }`;


    icon.innerHTML = `

        <i class="fa-solid ${
            isActive
                ? "fa-toggle-off"
                : "fa-toggle-on"
        }"></i>

    `;

}


if (confirmButton) {

    confirmButton.classList.remove(
        "activate",
        "deactivate"
    );


    confirmButton.classList.add(
        isActive
            ? "deactivate"
            : "activate"
    );


    confirmButton.innerHTML = `

        <i class="fa-solid ${
            isActive
                ? "fa-toggle-off"
                : "fa-toggle-on"
        }"></i>

        ${isActive ? "Deactivate" : "Activate"}

    `;

}


if (subjectStatusModalInstance) {

    subjectStatusModalInstance.show();

}

}

/* ==================================================
HANDLE STATUS CHANGE
================================================== */

async function handleSubjectStatusChange() {

const subjectId =
    document.getElementById(
        "statusSubjectId"
    ).value;


const newStatus =
    document.getElementById(
        "statusSubjectValue"
    ).value;


const confirmButton =
    document.getElementById(
        "confirmSubjectStatusBtn"
    );


if (!subjectId) {

    showSubjectNotification(
        "The subject ID could not be found.",
        "danger"
    );

    return;

}


try {

    setButtonLoading(
        confirmButton,
        newStatus === "active"
            ? "Activating..."
            : "Deactivating..."
    );


    await tablesDB.updateRow({

        databaseId:
            DATABASE_ID,

        tableId:
            SUBJECTS_TABLE_ID,

        rowId:
            subjectId,

        data: {

            status:
                newStatus

        }

    });


    if (subjectStatusModalInstance) {

        subjectStatusModalInstance.hide();

    }


    showSubjectNotification(

        newStatus === "active"

            ? "Subject activated successfully."

            : "Subject deactivated successfully.",

        "success"

    );


    await refreshSubjects();


} catch (error) {

    console.error(
        "Error changing subject status:",
        error
    );


    showSubjectNotification(
        getAppwriteErrorMessage(
            error,
            "Unable to change subject status."
        ),
        "danger"
    );


} finally {

    resetButtonLoading(
        confirmButton,
        '<i class="fa-solid fa-check"></i> Confirm'
    );

}

}

/* ==================================================
CHECK DUPLICATE SUBJECT CODE
================================================== */

async function subjectCodeExists(
code,
excludeId = null
) {

const normalizedCode =
    String(code)
        .trim()
        .toLowerCase();


/*
 * Check the subjects already loaded
 * into the page first.
 */

const localDuplicate =
    subjectsData.some(subject => {

        const existingCode =
            String(
                subject.code || ""
            )
                .trim()
                .toLowerCase();


        return (
            existingCode === normalizedCode &&
            subject.$id !== excludeId
        );

    });


if (localDuplicate) {

    return true;

}


/*
 * Perform an additional check directly
 * against Appwrite.
 */

try {

    const response =
        await tablesDB.listRows({

            databaseId:
                DATABASE_ID,

            tableId:
                SUBJECTS_TABLE_ID,

            queries: [

                Query.equal(
                    "code",
                    code.trim()
                ),

                Query.limit(1)

            ]

        });


    const rows =
        response.rows || [];


    return rows.some(
        row =>
            row.$id !== excludeId
    );


} catch (error) {

    /*
     * Do not block the operation if the
     * duplicate-check request fails.
     */

    console.warn(
        "Could not perform remote duplicate check:",
        error
    );


    return false;

}

}

/* ==================================================
REFRESH SUBJECTS
================================================== */

async function refreshSubjects() {

try {

    const subjects =
        await getAllSubjects();


    subjectsData =
        subjects;


    updateSubjectStatistics(
        subjects
    );


    if (subjects.length === 0) {

        showSubjectsEmptyState();

        return;

    }


    renderSubjects(
        subjects
    );


    /*
     * Re-add action buttons because
     * renderSubjects() replaces the grid.
     */

    addSubjectCardActions();


} catch (error) {

    console.error(
        "Error refreshing subjects:",
        error
    );


    showSubjectNotification(
        "The subject list could not be refreshed.",
        "danger"
    );

}

}

/* ==================================================
KEEP SUBJECT DATA IN SYNC

Wrap the Phase 1 renderSubjects() function
so subjectsData is always updated whenever
the subject cards are rendered.
================================================== */

const phase1RenderSubjects =
typeof renderSubjects === "function"
? renderSubjects
: null;

if (phase1RenderSubjects) {

renderSubjects = function (subjects) {

    subjectsData =
        Array.isArray(subjects)
            ? subjects
            : [];


    phase1RenderSubjects(
        subjects
    );

};

}

/* ==================================================
FORM VALIDATION
================================================== */

function validateSubjectForm(form) {

let valid = true;


const name =
    form.querySelector(
        '[name="name"]'
    );


const code =
    form.querySelector(
        '[name="code"]'
    );


/* ----------------------------------------------
   SUBJECT NAME
   ---------------------------------------------- */

if (name) {

    const nameValue =
        name.value.trim();


    if (!nameValue) {

        markFieldInvalid(
            name,
            "Please enter the subject name."
        );

        valid = false;

    } else {

        clearFieldInvalid(
            name
        );

    }

}


/* ----------------------------------------------
   SUBJECT CODE
   ---------------------------------------------- */

if (code) {

    const codeValue =
        code.value.trim();


    if (!codeValue) {

        markFieldInvalid(
            code,
            "Please enter the subject code."
        );

        valid = false;

    } else {

        clearFieldInvalid(
            code
        );

    }

}


return valid;

}

/* ==================================================
MARK FIELD INVALID
================================================== */

function markFieldInvalid(
field,
message
) {

if (!field) {

    return;

}


field.classList.add(
    "is-invalid"
);


const feedback =
    field.parentElement
        ?.querySelector(
            ".invalid-feedback"
        );


if (feedback && message) {

    feedback.textContent =
        message;

}


field.focus();

}

/* ==================================================
CLEAR FIELD INVALID
================================================== */

function clearFieldInvalid(field) {

if (!field) {

    return;

}


field.classList.remove(
    "is-invalid"
);

}

/* ==================================================
CLEAR FORM VALIDATION
================================================== */

function clearFormValidation(form) {

if (!form) {

    return;

}


form.querySelectorAll(
    ".is-invalid"
).forEach(field => {

    field.classList.remove(
        "is-invalid"
    );

});

}

/* ==================================================
BUTTON LOADING
================================================== */

function setButtonLoading(
button,
text
) {

if (!button) {

    return;

}


/*
 * Store the original button HTML
 * before replacing it.
 */

if (!button.dataset.originalHtml) {

    button.dataset.originalHtml =
        button.innerHTML;

}


button.disabled =
    true;


button.classList.add(
    "btn-loading"
);


button.innerHTML = `

    <i class="fa-solid fa-spinner fa-spin"></i>

    <span>
        ${text}
    </span>

`;

}

/* ==================================================
RESET BUTTON LOADING
================================================== */

function resetButtonLoading(
button,
fallbackHtml
) {

if (!button) {

    return;

}


button.disabled =
    false;


button.classList.remove(
    "btn-loading"
);


button.innerHTML =
    button.dataset.originalHtml ||
    fallbackHtml ||
    button.innerHTML;


delete button.dataset.originalHtml;

}

/* ==================================================
SUBJECT DATE FORMATTER
================================================== */

function formatSubjectDate(dateValue) {

if (!dateValue) {

    return "Not available";

}


const date =
    new Date(dateValue);


if (
    Number.isNaN(
        date.getTime()
    )
) {

    return "Not available";

}


return date.toLocaleDateString(
    undefined,
    {

        day:
            "numeric",

        month:
            "short",

        year:
            "numeric"

    }
);

}

/* ==================================================
APPWRITE ERROR MESSAGE
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


return fallback;

}

/* ==================================================
SUBJECT NOTIFICATION
================================================== */

function showSubjectNotification(
message,
type = "success"
) {

/*
 * Remove an existing notification first.
 */

const existing =
    document.getElementById(
        "subjectNotification"
    );


if (existing) {

    existing.remove();

}


/*
 * Create notification.
 */

const notification =
    document.createElement(
        "div"
    );


notification.id =
    "subjectNotification";


notification.className =
    `alert alert-${type} subject-notification`;


notification.setAttribute(
    "role",
    "alert"
);


/*
 * Notification icons.
 */

const iconMap = {

    success:
        "fa-circle-check",

    danger:
        "fa-circle-exclamation",

    warning:
        "fa-triangle-exclamation",

    info:
        "fa-circle-info"

};


const icon =
    iconMap[type] ||
    iconMap.info;


notification.innerHTML = `

    <div class="subject-notification-content">

        <i class="fa-solid ${icon}"></i>

        <span>
            ${escapeHtml(message)}
        </span>

    </div>


    <button
        type="button"
        class="btn-close"
        aria-label="Close"
    ></button>

`;


/*
 * Add notification to page.
 */

document.body.appendChild(
    notification
);


/*
 * Close button.
 */

const closeButton =
    notification.querySelector(
        ".btn-close"
    );


if (closeButton) {

    closeButton.addEventListener(
        "click",
        () => notification.remove()
    );

}


/*
 * Automatically remove notification
 * after four seconds.
 */

setTimeout(() => {

    if (
        document.body.contains(
            notification
        )
    ) {

        notification.remove();

    }

}, 4000);

}

/* ==================================================
END PHASE 2C
================================================== */