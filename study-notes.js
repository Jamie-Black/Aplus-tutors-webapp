/* ==================================================
APLUS TUTORS
STUDY NOTES
ADMIN JAVASCRIPT — PHASE 3
================================================== */

/* ==================================================
GLOBAL VARIABLES
================================================== */

let viewNoteModal;

let currentNotes = [];

let currentSubjects = [];

let noteModal = null;




/* =========================================================
APLUS TUTORS
STUDY NOTES IMAGE SUPPORT
========================================================= */

const NOTE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

let noteImageUploadInProgress = false;

/* =========================================================
   STUDY NOTE IMAGE UPLOAD
========================================================= */

let savedNoteImageRange = null;


/* =========================================================
   UPLOAD IMAGE TO APPWRITE STORAGE
========================================================= */

async function uploadStudyNoteImage(file) {

    if (!file) {
        throw new Error("Please select an image.");
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            "Unsupported image format. Use JPG, PNG, WEBP or GIF."
        );
    }

    if (file.size > NOTE_IMAGE_MAX_SIZE) {
        throw new Error(
            "The maximum image size is 5 MB."
        );
    }

    if (file.size === 0) {
        throw new Error(
            "The selected image is empty."
        );
    }

    // Verify that the bucket ID is configured.
    if (
        typeof STUDY_NOTES_IMAGES_ID === "undefined" ||
        !STUDY_NOTES_IMAGES_ID
    ) {
        throw new Error(
            "The Study Notes image Storage bucket ID is missing from appwrite.js."
        );
    }

    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif"
    };

    const fileName =
        "study-note-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 10) +
        "." +
        extensions[file.type];

    const imageFile = new File(
        [file],
        fileName,
        {
            type: file.type,
            lastModified: Date.now()
        }
    );

    console.log("Uploading Study Note image:", {
        endpoint: client.config.endpoint,
        projectId: client.config.project,
        bucketId: STUDY_NOTES_IMAGES_ID,
        fileName: imageFile.name,
        fileSize: imageFile.size
    });

    // IMPORTANT:
    // createFile(bucketId, fileId, file)
    // Do not pass DATABASE_ID to Storage.
    const uploadedFile = await storage.createFile(
        STUDY_NOTES_IMAGES_ID,
        Appwrite.ID.unique(),
        imageFile
    );

    return {
        fileId: uploadedFile.$id,
        fileName: uploadedFile.name
    };
}


/* =========================================================
   CREATE APPWRITE IMAGE URL
========================================================= */

function getStudyNoteImageUrl(fileId) {

    if (!fileId) {
        return "";
    }

    return (
        client.config.endpoint +
        "/storage/buckets/" +
        encodeURIComponent(STUDY_NOTES_IMAGES_ID) +
        "/files/" +
        encodeURIComponent(fileId) +
        "/view?project=" +
        encodeURIComponent(client.config.project)
    );
}


/* =========================================================
   INSERT IMAGE INTO EDITOR
========================================================= */

function insertStudyNoteImage(fileId, altText = "") {

    const editor = document.getElementById("noteContent");

    if (!editor) {
        throw new Error("The study note editor was not found.");
    }

    const imageUrl = getStudyNoteImageUrl(fileId);

    if (!imageUrl) {
        throw new Error("Unable to create the image URL.");
    }

    const image = document.createElement("img");

    image.src = imageUrl;
    image.alt = altText;
    image.dataset.appwriteFileId = fileId;
    image.className = "study-note-image";
    image.loading = "lazy";
    image.decoding = "async";

    image.style.maxWidth = "100%";
    image.style.height = "auto";
    image.style.display = "block";
    image.style.margin = "12px 0";

    // Restore the cursor position saved before opening
    // the phone's file picker.
    if (savedNoteImageRange) {

        const selection = window.getSelection();

        try {

            const range = savedNoteImageRange.cloneRange();

            if (editor.contains(range.commonAncestorContainer)) {

                range.deleteContents();
                range.insertNode(image);

                range.setStartAfter(image);
                range.collapse(true);

                selection.removeAllRanges();
                selection.addRange(range);

            } else {

                editor.appendChild(image);
            }

        } catch (error) {

            console.warn(
                "Could not restore the editor cursor. Appending image instead.",
                error
            );

            editor.appendChild(image);
        }

    } else {

        editor.appendChild(image);
    }

    editor.focus();

    // Notify any existing editor listeners.
    editor.dispatchEvent(
        new Event("input", { bubbles: true })
    );

    savedNoteImageRange = null;

    return image;
}


/* =========================================================
   INITIALIZE IMAGE UPLOAD
========================================================= */

function initializeStudyNoteImageUpload() {

    const imageButton = document.getElementById("insertNoteImageBtn");
    const imageInput = document.getElementById("noteImageInput");
    const editor = document.getElementById("noteContent");

    if (!imageButton || !imageInput || !editor) {

        console.error("Study Note image controls are missing.", {
            buttonFound: !!imageButton,
            inputFound: !!imageInput,
            editorFound: !!editor
        });

        return;
    }

    if (imageButton.dataset.imageUploadReady === "true") {
        return;
    }

    imageButton.dataset.imageUploadReady = "true";

    // Save the insertion position before the file picker opens.
    imageButton.addEventListener("mousedown", function () {

        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {

            const range = selection.getRangeAt(0);

            if (editor.contains(range.commonAncestorContainer)) {
                savedNoteImageRange = range.cloneRange();
            }
        }
    });

    imageButton.addEventListener("click", function (event) {

        event.preventDefault();

        if (noteImageUploadInProgress) {
            return;
        }

        // Also save the current cursor position on touch devices.
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {

            const range = selection.getRangeAt(0);

            if (editor.contains(range.commonAncestorContainer)) {
                savedNoteImageRange = range.cloneRange();
            }
        }

        imageInput.click();
    });

    imageInput.addEventListener("change", async function () {

        const file = imageInput.files?.[0];

        if (!file) {
            return;
        }

        noteImageUploadInProgress = true;
        imageButton.disabled = true;

        const originalButtonContent = imageButton.innerHTML;

        imageButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {

            // 1. Upload image to Appwrite.
            const uploadedImage = await uploadStudyNoteImage(file);

            // 2. Insert uploaded image into the editor.
            insertStudyNoteImage(
                uploadedImage.fileId,
                file.name
            );

            alert(
                "Image uploaded and inserted successfully. " +
                "Remember to save the study note."
            );

        } catch (error) {

            console.error("Study Note image upload failed:", error);

            alert(
                error?.message ||
                "Image upload failed. Check your Appwrite Storage permissions and try again."
            );

        } finally {

            noteImageUploadInProgress = false;
            imageButton.disabled = false;
            imageButton.innerHTML = originalButtonContent;
            imageInput.value = "";
        }
    });

    console.log("Study Note image upload initialized.");
}

/* ==================================================
DOM ELEMENTS
================================================== */

const notesTableBody =
document.getElementById("notesTableBody");

const notesTableContainer =
document.getElementById("notesTableContainer");

const notesLoading =
document.getElementById("notesLoading");

const notesEmpty =
document.getElementById("notesEmpty");

const notesCount =
document.getElementById("notesCount");

const notesSearch =
document.getElementById("notesSearch");

const subjectFilter =
document.getElementById("subjectFilter");

const statusFilter =
document.getElementById("statusFilter");

const addNoteBtn =
document.getElementById("addNoteBtn");

const emptyAddNoteBtn =
document.getElementById("emptyAddNoteBtn");

const noteModalElement =
document.getElementById("noteModal");

const noteModalLabel =
document.getElementById("noteModalLabel");

const noteForm =
document.getElementById("noteForm");

const noteId =
document.getElementById("noteId");

const noteTitle =
document.getElementById("noteTitle");

const noteSubject =
document.getElementById("noteSubject");

const noteStatus =
document.getElementById("noteStatus");

const noteContent =
document.getElementById("noteContent");

const saveNoteBtn =
document.getElementById("saveNoteBtn");



/* ==================================================
   MATHJAX RENDERER
================================================== */

async function renderStudyNoteMath(container) {
    
    if (!container) {
        return;
    }
    
    try {
        
        /*
         * Wait until MathJax has completely loaded.
         * This prevents the page from trying to
         * typeset before MathJax is ready.
         */
        if (
            window.MathJax &&
            window.MathJax.startup &&
            window.MathJax.startup.promise
        ) {
            
            await window.MathJax.startup.promise;
        }
        
        
        /*
         * Make sure MathJax is actually available.
         */
        if (
            !window.MathJax ||
            typeof window.MathJax.typesetPromise !== "function"
        ) {
            
            console.warn(
                "MathJax is not ready."
            );
            
            return;
        }
        
        
        /*
         * Clear any previous MathJax rendering
         * inside this container.
         *
         * This is important because the same
         * modal is reused for different notes.
         */
        if (
            typeof window.MathJax.typesetClear === "function"
        ) {
            
            window.MathJax.typesetClear([
                container
            ]);
        }
        
        
        /*
         * Render the MathJax source.
         */
        await window.MathJax.typesetPromise([
            container
        ]);
        
    } catch (error) {
        
        console.error(
            "Study Note MathJax rendering error:",
            error
        );
    }
}

/* ==================================================
INITIALIZE PAGE
================================================== */

document.addEventListener("DOMContentLoaded", async () => {

try {

    // Initialize Bootstrap modal

    noteModal = new bootstrap.Modal(noteModalElement);
    
    viewNoteModal = new bootstrap.Modal(
    document.getElementById("viewNoteModal")
);


    // Get logged-in admin

    currentUser = await account.get();


    // Load subjects

    await loadSubjects();


    // Load notes

    await loadNotes();


    // Attach events

    attachEventListeners();


} catch (error) {

    console.error(
        "Study Notes initialization error:",
        error
    );

    showError(
        "Unable to load the Study Notes page. Please refresh and try again."
    );

}

});

/* ==================================================
EVENT LISTENERS
================================================== */

function attachEventListeners() {

// Add Note button

if (addNoteBtn) {

    addNoteBtn.addEventListener(
        "click",
        openAddNoteModal
    );

}


// Empty state Add Note button

if (emptyAddNoteBtn) {

    emptyAddNoteBtn.addEventListener(
        "click",
        openAddNoteModal
    );

}


// Search

if (notesSearch) {

    notesSearch.addEventListener(
        "input",
        applyFilters
    );

}


// Subject filter

if (subjectFilter) {

    subjectFilter.addEventListener(
        "change",
        applyFilters
    );

}


// Status filter

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

}


// Save note

if (saveNoteBtn) {

    saveNoteBtn.addEventListener(
        "click",
        saveNote
    );

}


// Form submission

if (noteForm) {

    noteForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await saveNote();

        }
    );

}


// Table actions

if (notesTableBody) {

    notesTableBody.addEventListener(
        "click",
        handleTableAction
    );

}

}

/* ==================================================
LOAD SUBJECTS
================================================== */

async function loadSubjects() {

try {

    const response =
        await tablesDB.listRows(
            DATABASE_ID,
            SUBJECTS_TABLE_ID,
            [
                Query.limit(100)
            ]
        );


    currentSubjects = response.rows || [];


    populateSubjectSelects();


} catch (error) {

    console.error(
        "Error loading subjects:",
        error
    );

    throw error;

}

}

/* ==================================================
GET SUBJECT NAME
================================================== */

function getSubjectName(subject) {

/*
 * This supports common subject-name column names.
 * If your Subjects table uses "name", "subjectName",
 * "title", or "subject", it will work automatically.
 */

return (
    subject.name ||
    subject.subjectName ||
    subject.title ||
    subject.subject ||
    "Unnamed Subject"
);

}

/* ==================================================
POPULATE SUBJECT SELECTS
================================================== */

function populateSubjectSelects() {

if (subjectFilter) {

    subjectFilter.innerHTML = `
        <option value="">All Subjects</option>
    `;

}


if (noteSubject) {

    noteSubject.innerHTML = `
        <option value="">Select subject</option>
    `;

}


currentSubjects.forEach(subject => {

    const subjectName =
        getSubjectName(subject);


    // Filter option

    if (subjectFilter) {

        const option =
            document.createElement("option");

        option.value = subject.$id;

        option.textContent = subjectName;

        subjectFilter.appendChild(option);

    }


    // Form option

    if (noteSubject) {

        const option =
            document.createElement("option");

        option.value = subject.$id;

        option.textContent = subjectName;

        noteSubject.appendChild(option);

    }

});

}

/* ==================================================
LOAD STUDY NOTES
================================================== */

async function loadNotes() {

setLoadingState(true);


try {

    const response =
        await tablesDB.listRows(
            DATABASE_ID,
            "study_notes",
            [
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );


    currentNotes =
        response.rows || [];


    applyFilters();


} catch (error) {

    console.error(
        "Error loading study notes:",
        error
    );

    showError(
        "Unable to load study notes."
    );

} finally {

    setLoadingState(false);

}

}

/* ==================================================
APPLY SEARCH AND FILTERS
================================================== */

function applyFilters() {

const searchTerm =
    (notesSearch?.value || "")
        .trim()
        .toLowerCase();


const selectedSubject =
    subjectFilter?.value || "";


const selectedStatus =
    statusFilter?.value || "";


let filteredNotes =
    [...currentNotes];


// Search

if (searchTerm) {

    filteredNotes =
        filteredNotes.filter(note => {

            const title =
                String(note.title || "")
                    .toLowerCase();

            const content =
                String(note.content || "")
                    .toLowerCase();

            return (
                title.includes(searchTerm) ||
                content.includes(searchTerm)
            );

        });

}


// Subject

if (selectedSubject) {

    filteredNotes =
        filteredNotes.filter(note => {

            return note.subjectId === selectedSubject;

        });

}


// Status

if (selectedStatus) {

    filteredNotes =
        filteredNotes.filter(note => {

            return note.status === selectedStatus;

        });

}


renderNotes(filteredNotes);

}

/* ==================================================
RENDER NOTES
================================================== */

function renderNotes(notes) {

if (!notesTableBody) {
    return;
}


notesTableBody.innerHTML = "";


updateNotesCount(notes.length);


// No results

if (notes.length === 0) {

    notesTableContainer.classList.add(
        "d-none"
    );

    notesEmpty.classList.remove(
        "d-none"
    );

    return;

}


notesEmpty.classList.add(
    "d-none"
);

notesTableContainer.classList.remove(
    "d-none"
);


notes.forEach((note, index) => {

    const subject =
        currentSubjects.find(
            item => item.$id === note.subjectId
        );


    const subjectName =
        subject
            ? getSubjectName(subject)
            : "Unknown Subject";


    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td class="note-number">
            ${index + 1}
        </td>

        <td class="note-title-cell">

            <span class="note-title">
                ${escapeHtml(note.title || "Untitled Note")}
            </span>

            <span class="note-preview">
                ${escapeHtml(
                    getContentPreview(note.content)
                )}
            </span>

        </td>

        <td>

            <span class="note-subject">
                ${escapeHtml(subjectName)}
            </span>

        </td>

        <td>

            <span class="note-status ${getStatusClass(note.status)}">

                ${escapeHtml(
                    capitalize(note.status || "draft")
                )}

            </span>

        </td>

        <td>

            <span class="note-date">

                ${formatDate(
                    note.$updatedAt ||
                    note.$createdAt
                )}

            </span>

        </td>

        <td>

            <div class="note-actions">

               <button
    type="button"
    class="note-action-btn view"
    data-action="view"
    data-id="${note.$id}"
    title="View"
>
    <i class="fa-solid fa-eye"></i>
</button>


                <button
                    type="button"
                    class="note-action-btn edit"
                    data-action="edit"
                    data-id="${note.$id}"
                    title="Edit"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="note-action-btn delete"
                    data-action="delete"
                    data-id="${note.$id}"
                    title="Delete"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;


    notesTableBody.appendChild(row);

});

}

/* ==================================================
UPDATE NOTES COUNT
================================================== */

function updateNotesCount(count) {

if (!notesCount) {
    return;
}


notesCount.textContent =
    `${count} ${count === 1 ? "note" : "notes"}`;

}

/* ==================================================
OPEN ADD NOTE MODAL
================================================== */

function openAddNoteModal() {

if (!noteModal) {
    return;
}


noteForm.reset();

clearNoteEditor();


noteId.value = "";


noteStatus.value = "draft";


noteModalLabel.textContent =
    "Add Study Note";


saveNoteBtn.innerHTML = `
    <i class="fa-solid fa-floppy-disk"></i>
    Save Note
`;


noteModal.show();

}

/* ==================================================
OPEN EDIT NOTE MODAL
================================================== */

function openEditNote(id) {

const note =
    currentNotes.find(
        item => item.$id === id
    );


if (!note) {

    showError(
        "The selected note could not be found."
    );

    return;

}


noteId.value =
    note.$id || "";


noteTitle.value =
    note.title || "";


noteSubject.value =
    note.subjectId || "";


noteStatus.value =
    note.status || "draft";


noteContent.innerHTML =
    note.content || "";


noteModalLabel.textContent =
    "Edit Study Note";


saveNoteBtn.innerHTML = `
    <i class="fa-solid fa-floppy-disk"></i>
    Update Note
`;


noteModal.show();

}

/* ==================================================
SAVE NOTE
================================================== */

async function saveNote() {

// Validate form

if (!noteForm.checkValidity()) {

    noteForm.reportValidity();

    return;

}


const title =
    noteTitle.value.trim();

const subjectId =
    noteSubject.value;

const content =
    noteContent.innerHTML.trim();

const status =
    noteStatus.value;


if (!title) {

    showError(
        "Please enter a note title."
    );

    return;

}


if (!subjectId) {

    showError(
        "Please select a subject."
    );

    return;

}

if (!hasNoteContent()) {

    showError(
        "Please enter the note content."
    );

    noteContent.focus();

    return;

}


// Disable button

const originalButton =
    saveNoteBtn.innerHTML;


saveNoteBtn.disabled = true;


saveNoteBtn.innerHTML = `
    <span
        class="spinner-border spinner-border-sm"
        role="status"
    ></span>
    Saving...
`;


try {

    const data = {

        title: title,

        subjectId: subjectId,

        content: content,

        status: status,

        createdBy: currentUser.$id

    };


    // EDIT

    if (noteId.value) {

        await tablesDB.updateRow(
            DATABASE_ID,
            "study_notes",
            noteId.value,
            data
        );


        showSuccess(
            "Study note updated successfully."
        );

    }


    // CREATE

    else {

        await tablesDB.createRow(
            DATABASE_ID,
            "study_notes",
            ID.unique(),
            data
        );


        showSuccess(
            "Study note created successfully."
        );

    }


    // Close modal

    noteModal.hide();


    // Reload notes

    await loadNotes();


} catch (error) {

    console.error(
        "Error saving study note:",
        error
    );


    console.error(
        "Appwrite response:",
        error?.message
    );


    showError(
        error?.message ||
        "Unable to save the study note."
    );

} finally {

    saveNoteBtn.disabled = false;

    saveNoteBtn.innerHTML =
        originalButton;

}

}

/* ==================================================
TABLE ACTION HANDLER
================================================== */

async function handleTableAction(event) {

const button =
    event.target.closest(
        "[data-action]"
    );


if (!button) {
    return;
}


const action =
    button.dataset.action;


const id =
    button.dataset.id;


if (!id) {
    return;
}


switch (action) {

    case "view":

        openViewNote(id);

        break;


    case "edit":

        openEditNote(id);

        break;


    case "delete":

        await deleteNote(id);

        break;

}

}

/* ==================================================
OPEN NOTE VIEWER
================================================== */

async function openViewNote(id) {

const note = currentNotes.find(
    item => item.$id === id
);

if (!note) {

    console.error(
        "Study note not found:",
        id
    );

    showError(
        "The selected study note could not be found."
    );

    return;
}

const viewTitle =
    document.getElementById("viewNoteTitle");

const viewSubject =
    document.getElementById("viewNoteSubject");

const viewStatus =
    document.getElementById("viewNoteStatus");

const viewDate =
    document.getElementById("viewNoteDate");

const viewContent =
    document.getElementById("viewNoteContent");


/* ------------------------------------------
   NOTE TITLE
------------------------------------------ */

if (viewTitle) {

    viewTitle.textContent =
        note.title || "Untitled Note";

}


/* ------------------------------------------
   SUBJECT NAME
------------------------------------------ */

if (viewSubject) {

    const subject = currentSubjects.find(
        item => item.$id === note.subjectId
    );

    viewSubject.textContent = subject
        ? getSubjectName(subject)
        : "Unknown Subject";

}


/* ------------------------------------------
   NOTE STATUS
------------------------------------------ */

if (viewStatus) {

    const status =
        note.status || "draft";

    viewStatus.textContent =
        capitalize(status);

    viewStatus.className =
        "note-view-status " +
        getStatusClass(status);

}


/* ------------------------------------------
   LAST UPDATED DATE
------------------------------------------ */

if (viewDate) {

    const date =
        note.$updatedAt ||
        note.$createdAt;

    viewDate.textContent =
        formatDate(date);

}


/* ------------------------------------------
   NOTE CONTENT
------------------------------------------ */

if (viewContent) {

    viewContent.innerHTML =
        note.content ||
        "<p>No content available.</p>";

}


/* ------------------------------------------
   SHOW MODAL
------------------------------------------ */

if (!viewNoteModal) {

    const modalElement =
        document.getElementById(
            "viewNoteModal"
        );

    if (modalElement) {

        viewNoteModal =
            new bootstrap.Modal(
                modalElement
            );

    }

}


if (viewNoteModal) {

    viewNoteModal.show();

}


/* ------------------------------------------
   RENDER MATHEMATICS
------------------------------------------ */

if (viewContent) {

    await renderStudyNoteMath(
        viewContent
    );

}

}

/* ==================================================
DELETE NOTE
================================================== */

async function deleteNote(id) {

const note =
    currentNotes.find(
        item => item.$id === id
    );


if (!note) {
    return;
}


const confirmed =
    confirm(
        `Are you sure you want to delete "${note.title}"?`
    );


if (!confirmed) {
    return;
}


try {

    await tablesDB.deleteRow(
        DATABASE_ID,
        "study_notes",
        id
    );


    showSuccess(
        "Study note deleted successfully."
    );


    await loadNotes();


} catch (error) {

    console.error(
        "Error deleting study note:",
        error
    );


    showError(
        error?.message ||
        "Unable to delete the study note."
    );

}

}

/* ==================================================
LOADING STATE
================================================== */

function setLoadingState(isLoading) {

if (!notesLoading) {
    return;
}


if (isLoading) {

    notesLoading.classList.remove(
        "d-none"
    );

    notesEmpty.classList.add(
        "d-none"
    );

    notesTableContainer.classList.add(
        "d-none"
    );

} else {

    notesLoading.classList.add(
        "d-none"
    );

}

}

/* ==================================================
SUCCESS MESSAGE
================================================== */

function showSuccess(message) {

/*
 * Bootstrap alert.
 * This avoids requiring another notification library.
 */

showAlert(
    message,
    "success"
);

}

/* ==================================================
ERROR MESSAGE
================================================== */

function showError(message) {

showAlert(
    message,
    "danger"
);

}

/* ==================================================
ALERT
================================================== */

function showAlert(message, type) {

const alert =
    document.createElement("div");


alert.className = `
    alert
    alert-${type}
    position-fixed
    top-0
    end-0
    m-3
    shadow
`;


alert.style.zIndex = "9999";


alert.innerHTML = `

    <div class="d-flex align-items-center gap-2">

        <i class="fa-solid
            ${
                type === "success"
                    ? "fa-circle-check"
                    : "fa-circle-exclamation"
            }"
        ></i>

        <span>
            ${escapeHtml(message)}
        </span>

    </div>

`;


document.body.appendChild(alert);


setTimeout(() => {

    alert.remove();

}, 3500);

}


/* ==================================================
CONTENT PREVIEW
================================================== */

function getContentPreview(content) {

    if (!content) {
        return "No content";
    }

    // Create a temporary element to convert HTML
    // into plain readable text for the preview.
    const temp = document.createElement("div");

    temp.innerHTML = String(content);

    return (temp.textContent || temp.innerText || "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 100);

}

/* ==================================================
STATUS CLASS
================================================== */

function getStatusClass(status) {

if (status === "published") {
    return "published";
}

return "draft";

}

/* ==================================================
CAPITALIZE
================================================== */

function capitalize(value) {

if (!value) {
    return "";
}

return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
);

}

/* ==================================================
FORMAT DATE
================================================== */

function formatDate(dateString) {

if (!dateString) {
    return "—";
}

const date =
    new Date(dateString);

if (isNaN(date.getTime())) {
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

/* ==================================================
ESCAPE HTML
================================================== */

function escapeHtml(value) {

return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==================================================
RICH TEXT EDITOR
================================================== */

function initializeNoteEditor() {

const editorButtons =
    document.querySelectorAll(
        ".editor-btn"
    );


const formatBlock =
    document.getElementById(
        "formatBlock"
    );


/*
 * Toolbar buttons
 */

editorButtons.forEach(button => {
    
    
    // The image button has its own event handler.
if (button.id === "insertNoteImageBtn") {
    return;
}

    button.addEventListener(
        "mousedown",
        event => {

            /*
             * Prevent the editable area from
             * losing its current selection.
             */

            event.preventDefault();

        }
    );


    button.addEventListener(
        "click",
        () => {

            const command =
                button.dataset.command;


            if (!command) {
                return;
            }


            /* --------------------------------------
               MATHJAX EQUATION
            -------------------------------------- */

            if (command === "insertMath") {

                insertMathExpression();

                return;

            }


            /* --------------------------------------
               NORMAL EDITOR COMMANDS
            -------------------------------------- */

            document.execCommand(
                command,
                false,
                null
            );


            noteContent.focus();


            updateEditorButtons();

        }
    );

});


/*
 * Heading / paragraph selector
 */

if (formatBlock) {

    formatBlock.addEventListener(
        "change",
        () => {

            const value =
                formatBlock.value;


            document.execCommand(
                "formatBlock",
                false,
                value
            );


            noteContent.focus();

        }
    );

}


/*
 * Update toolbar state
 */

 /*
  * Update toolbar state
  */

noteContent.addEventListener(
    "keyup",
    updateEditorButtons
);


noteContent.addEventListener(
    "mouseup",
    updateEditorButtons
);


/*
 * Handle pasted HTML
 */

noteContent.addEventListener(
    "paste",
    handleNotePaste
);

}


/* ==================================================
HANDLE NOTE PASTE
================================================== */

function handleNotePaste(event) {

event.preventDefault();

const clipboard = event.clipboardData;

if (!clipboard || !noteContent) {
    return;
}

const html =
    clipboard.getData("text/html");

const plainText =
    clipboard.getData("text/plain");

if (html && html.trim()) {

    const parser = new DOMParser();

    const parsed =
        parser.parseFromString(
            html,
            "text/html"
        );

    const body = parsed.body;

    /*
     * Remove dangerous embedded elements.
     */

    body.querySelectorAll(
        "script, iframe, object, embed, form"
    ).forEach(element => {
        element.remove();
    });

    /*
     * Remove event handlers and JavaScript URLs.
     */

    body.querySelectorAll("*").forEach(element => {

        [...element.attributes].forEach(attribute => {

            const name =
                attribute.name.toLowerCase();

            const value =
                attribute.value.trim();

            if (
                name.startsWith("on") ||
                (
                    ["href", "src"].includes(name) &&
                    /^javascript:/i.test(value)
                )
            ) {

                element.removeAttribute(
                    attribute.name
                );

            }

        });

    });

    document.execCommand(
        "insertHTML",
        false,
        body.innerHTML
    );

} else if (plainText) {

    /*
     * If plain text contains escaped HTML,
     * preserve it as text for now.
     *
     * We should only decode it when we have
     * confirmed that the source is escaped HTML.
     */

    document.execCommand(
        "insertText",
        false,
        plainText
    );

}

noteContent.focus();

updateEditorButtons();

}


/* ==================================================
   INSERT MATHJAX EXPRESSION
================================================== */

/* ==================================================
   INSERT MATHJAX EXPRESSION
================================================== */

function insertMathExpression() {

    if (!noteContent) {
        return;
    }


    noteContent.focus();


    const expression =
        prompt(
            "Enter the mathematical expression.\n\n" +
            "Example:\n" +
            "x^2 + 2x + 1 = 0"
        );


    if (
        expression === null ||
        !expression.trim()
    ) {

        return;

    }


    const cleanExpression =
        expression.trim();


    const display =
        confirm(
            "Click OK for a display equation.\n\n" +
            "Click Cancel for an inline equation."
        );


    let math;


    if (display) {

        math =
            `\\[${cleanExpression}\\]`;

    } else {

        math =
            `\\(${cleanExpression}\\)`;

    }


    document.execCommand(
        "insertText",
        false,
        math
    );


    noteContent.focus();

}

/* ==================================================
UPDATE EDITOR BUTTON STATE
================================================== */

function updateEditorButtons() {

const commands = [
    "bold",
    "italic",
    "underline",
    "insertUnorderedList",
    "insertOrderedList"
];


document
    .querySelectorAll(".editor-btn")
    .forEach(button => {

        const command =
            button.dataset.command;


        if (!commands.includes(command)) {
            return;
        }


        try {

            if (
                document.queryCommandState(
                    command
                )
            ) {

                button.classList.add(
                    "active"
                );

            } else {

                button.classList.remove(
                    "active"
                );

            }

        } catch (error) {

            console.warn(
                "Unable to determine editor state:",
                error
            );

        }

    });

}

/* ==================================================
CLEAR EDITOR
================================================== */

function clearNoteEditor() {

if (!noteContent) {
    return;
}


noteContent.innerHTML = "";

}

/* ==================================================
EDITOR CONTENT CHECK
================================================== */

/* ==================================================
   EDITOR CONTENT CHECK
================================================== */

function hasNoteContent() {

    if (!noteContent) {
        return false;
    }


    const text =
        noteContent.innerText
            .replace(/\u00a0/g, " ")
            .trim();


    const html =
        noteContent.innerHTML
            .replace(/&nbsp;/gi, "")
            .trim();


    return (
        text.length > 0 ||
        html.length > 0
    );

}



/* ==================================================
INITIALIZE EDITOR
================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeNoteEditor();
    initializeStudyNoteImageUpload();
});


