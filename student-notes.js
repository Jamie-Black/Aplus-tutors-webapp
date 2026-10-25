/* ==================================================
   APLUS TUTORS
   STUDENT STUDY NOTES
   PHASE 4 — SEARCH & SUBJECT FILTERING
================================================== */


/* ==================================================
   GLOBAL VARIABLES
================================================== */

let currentNotes = [];

let currentSubjects = [];

let currentStudentDepartment = "";

let viewNoteModal = null;


// ============================================================
// STUDY NOTE PROGRESS
// ============================================================

// Appwrite profile document ID of the logged-in student.
let currentStudentProfileId = "";

// Progress records belonging to the current student.
let currentNoteProgress = [];

// Progress record for the note currently being read.
let currentReadingProgress = null;

// ID of the note currently open in the reader.
let currentReadingNoteId = null;

// Timer used to prevent excessive database updates.
let progressSaveTimer = null;

// Prevent repeated progress saves while loading a note.
let isRestoringReadingPosition = false;

// Current reading position.
let currentReadingPercent = 0;



// ============================================================
// FLUSH PENDING READING PROGRESS
// Saves the latest reading position before switching notes
// or closing the reader.
// ============================================================

async function flushPendingNoteProgress() {

    clearTimeout(progressSaveTimer);

    progressSaveTimer = null;

    const noteId = currentReadingNoteId;

    if (!noteId) {
        return;
    }

    const content = document.getElementById(
        "viewNoteContent"
    );

    if (!content) {
        return;
    }

    // Do not save while another note is being restored.
    if (isRestoringReadingPosition) {
        return;
    }

    const percentage = calculateNoteReadingProgress();

    const position = content.scrollTop;

    const existingStatus = getNoteStudyStatus(noteId);

    const status = (
        existingStatus === "completed" ||
        percentage >= 100
    )
        ? "completed"
        : (
            percentage > 0
                ? "in_progress"
                : existingStatus === "unread"
                    ? "in_progress"
                    : existingStatus
        );

    currentReadingPercent = percentage;

    await saveStudentNoteProgress(
        noteId,
        percentage,
        position,
        status
    );
}


/* ==================================================
   DOM ELEMENTS
================================================== */

const notesLoading =
    document.getElementById("notesLoading");

const notesEmpty =
    document.getElementById("notesEmpty");

const notesGrid =
    document.getElementById("notesGrid");

const notesCount =
    document.getElementById("notesCount");

const subjectFilter =
    document.getElementById("subjectFilter");

const notesSearch =
    document.getElementById("notesSearch");



 /* ==================================================
    MATHJAX RENDERER
 ================================================== */

async function renderStudyNoteMath(container) {

    if (!container) {
        return;
    }


    try {

        /*
         * Wait for MathJax to finish loading.
         */
        if (
            window.MathJax &&
            window.MathJax.startup &&
            window.MathJax.startup.promise
        ) {

            await window.MathJax.startup.promise;
        }


        /*
         * Make sure MathJax is available.
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
         * Clear previous rendering.
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
         * Render the mathematical expressions.
         */
        await window.MathJax.typesetPromise([
            container
        ]);


        console.log(
            "MathJax rendered successfully."
        );

    } catch (error) {

        console.error(
            "Study Note MathJax rendering error:",
            error
        );
    }
}





/* ==================================================
   INITIALIZE STUDENT NOTES PAGE
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            console.log("Initializing student study notes...");

            /* ------------------------------------------
               INITIALIZE VIEW MODAL
            ------------------------------------------ */

            const viewNoteModalElement =
                document.getElementById("viewNoteModal");

            if (viewNoteModalElement) {

    viewNoteModal = new bootstrap.Modal(
        viewNoteModalElement
    );

    // Save the current position when the reader closes.
    viewNoteModalElement.addEventListener(
        "hide.bs.modal",
        function () {

            flushPendingNoteProgress();

        }
    );

}

            /* ------------------------------------------
               LOAD STUDENT PROFILE
            ------------------------------------------ */

            await loadStudentDepartment();

            console.log("Student profile loaded.");

            /* ------------------------------------------
               LOAD STUDENT SUBJECTS
            ------------------------------------------ */

            await loadSubjects();

            console.log(
                "Student subjects loaded:",
                currentSubjects.length
            );

            /* ------------------------------------------
               LOAD STUDENT READING PROGRESS
            ------------------------------------------ */

            await loadStudentNoteProgress();

            console.log(
                "Student progress loaded:",
                currentNoteProgress.length
            );

            /* ------------------------------------------
               LOAD PUBLISHED STUDY NOTES
            ------------------------------------------ */

            await loadPublishedNotes();

            console.log(
                "Published notes available:",
                currentNotes.length
            );

            /* ------------------------------------------
               UPDATE DASHBOARD STATISTICS
            ------------------------------------------ */

            updateStudyNotesDashboard();

            console.log(
                "Study notes dashboard updated."
            );

            /* ------------------------------------------
               ATTACH SEARCH AND FILTER EVENTS
            ------------------------------------------ */

            attachFilterEvents();

            console.log(
                "Student study notes initialized successfully."
            );

        } catch (error) {

            console.error(
                "Student Study Notes initialization error:",
                error
            );

            showNotesError(
                "Unable to load your study notes. Please refresh the page."
            );

        }

    }
);


// ============================================================
// ATTACH STUDY NOTES FILTER EVENTS
// ============================================================

function attachFilterEvents() {

    const searchInput =
        document.getElementById("notesSearch");

    const subjectSelect =
        document.getElementById("subjectFilter");

    const statusSelect =
        document.getElementById("studyStatusFilter");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyNoteFilters
        );
    }

    if (subjectSelect) {
        subjectSelect.addEventListener(
            "change",
            applyNoteFilters
        );
    }

    if (statusSelect) {
        statusSelect.addEventListener(
            "change",
            applyNoteFilters
        );
    }
}


// ============================================================
// LOAD STUDENT PROFILE
// ============================================================

async function loadStudentDepartment() {
    try {
        const currentUser = await account.get();

        const response = await tablesDB.listRows(
            DATABASE_ID,
            USERS_TABLE_ID,
            [
                Query.equal("userId", currentUser.$id),
                Query.limit(1)
            ]
        );

        if (!response.rows || response.rows.length === 0) {
            throw new Error("Student profile not found.");
        }

        const profile = response.rows[0];

        // Store the Appwrite profile document ID.
        currentStudentProfileId = profile.$id;

        // Preserve the student's department.
        currentStudentDepartment = profile.department || "";

        if (!currentStudentDepartment) {
            throw new Error(
                "Your student profile does not have a department assigned."
            );
        }

        console.log("Student profile loaded:", {
            profileId: currentStudentProfileId,
            department: currentStudentDepartment
        });

    } catch (error) {
        console.error("Error loading student profile:", error);
        throw error;
    }
}



/* ==================================================
   LOAD STUDENT SUBJECTS
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


        const allSubjects =
            response.rows || [];


        /*
         * Only subjects belonging to the
         * student's department are allowed.
         *
         * General subjects are available
         * to every student.
         */

        currentSubjects =
            allSubjects.filter(
                function (subject) {

                    const subjectDepartment =
                        String(
                            subject.department || ""
                        )
                        .trim()
                        .toLowerCase();


                    const studentDepartment =
                        String(
                            currentStudentDepartment
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        subjectDepartment ===
                        studentDepartment
                    ) ||
                    subjectDepartment === "general";

                }
            );


        console.log(
            "Student Department:",
            currentStudentDepartment
        );

        console.log(
            "Available Student Subjects:",
            currentSubjects
        );


        populateSubjectFilter();


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

    return (
        subject.name ||
        subject.subjectName ||
        subject.title ||
        subject.subject ||
        "Unnamed Subject"
    );

}


/* ==================================================
   POPULATE SUBJECT FILTER
================================================== */

function populateSubjectFilter() {

    if (!subjectFilter) {
        return;
    }


    subjectFilter.innerHTML = `
        <option value="">
            All Subjects
        </option>
    `;


    currentSubjects.forEach(
        function (subject) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject.$id;


            option.textContent =
                getSubjectName(subject);


            subjectFilter.appendChild(
                option
            );

        }
    );

}


/* ==================================================
   LOAD PUBLISHED STUDY NOTES
================================================== */

async function loadPublishedNotes() {

    setNotesLoading(true);


    try {

        const response =
            await tablesDB.listRows(
                DATABASE_ID,
                "study_notes",
                [
                    Query.equal(
                        "status",
                        "published"
                    ),

                    Query.orderDesc(
                        "$updatedAt"
                    ),

                    Query.limit(100)
                ]
            );


        const allPublishedNotes =
            response.rows || [];


        /*
         * Get the IDs of subjects that this
         * student is allowed to access.
         */

        const allowedSubjectIds =
            new Set(
                currentSubjects.map(
                    function (subject) {
                        return subject.$id;
                    }
                )
            );


        /*
         * Only keep notes belonging to the
         * student's department subjects
         * or General subjects.
         */

        currentNotes =
            allPublishedNotes.filter(
                function (note) {

                    return allowedSubjectIds.has(
                        note.subjectId
                    );

                }
            );


        console.log(
            "Published notes loaded:",
            allPublishedNotes.length
        );

        console.log(
            "Notes available to student:",
            currentNotes.length
        );


        renderPublishedNotes(
            currentNotes
        );


    } catch (error) {

        console.error(
            "Error loading published study notes:",
            error
        );


        showNotesError(
            "Unable to load published study notes."
        );


    } finally {

        setNotesLoading(false);

    }

}



// ============================================================
// FILTER STUDY NOTES
// SEARCH + SUBJECT + STUDY STATUS
// ============================================================

function applyNoteFilters() {

    const searchInput =
        document.getElementById("notesSearch");

    const subjectSelect =
        document.getElementById("subjectFilter");

    const statusSelect =
        document.getElementById("studyStatusFilter");

    const searchTerm = (
        searchInput?.value || ""
    ).trim().toLowerCase();

    const selectedSubject =
        subjectSelect?.value || "all";

    const selectedStatus =
        statusSelect?.value || "all";

    const filteredNotes = currentNotes.filter(note => {

        const subjectName =
            getNoteSubjectName(note);

        const plainText =
            getPlainText(note.content || "");

        // Search by title, content, or subject.
        const matchesSearch =
            (note.title || "").toLowerCase().includes(searchTerm) ||
            subjectName.toLowerCase().includes(searchTerm) ||
            plainText.toLowerCase().includes(searchTerm);

        // Filter by subject.
        const matchesSubject =
            selectedSubject === "all" ||
            note.subjectId === selectedSubject;

        // Filter by study status.
        const status =
            getNoteStudyStatus(note.$id);

        const matchesStatus =
            selectedStatus === "all" ||
            status === selectedStatus;

        return (
            matchesSearch &&
            matchesSubject &&
            matchesStatus
        );

    });

    renderPublishedNotes(filteredNotes);
}


/* ==================================================
   GET NOTE SUBJECT NAME
================================================== */

function getNoteSubjectName(note) {

    const subject =
        currentSubjects.find(
            function (item) {

                return (
                    item.$id ===
                    note.subjectId
                );

            }
        );


    return subject
        ? getSubjectName(subject)
        : "Unknown Subject";

}


/* ==================================================
   RENDER PUBLISHED NOTES
================================================== */

// ============================================================
// LOAD STUDENT STUDY PROGRESS
// ============================================================

async function loadStudentNoteProgress() {
    try {
        if (!currentStudentProfileId) {
            throw new Error(
                "Cannot load study progress without a student profile ID."
            );
        }

        const response = await tablesDB.listRows(
            DATABASE_ID,
            STUDY_NOTE_PROGRESS_TABLE_ID,
            [
                Query.equal("studentId", currentStudentProfileId),
                Query.limit(100)
            ]
        );

        currentNoteProgress = response.rows || [];

        console.log(
            "Student study progress loaded:",
            currentNoteProgress.length
        );

        return currentNoteProgress;

    } catch (error) {
        console.error("Error loading study progress:", error);

        throw error;
    }
}


// ============================================================
// FIND PROGRESS FOR A SPECIFIC NOTE
// ============================================================

function getNoteProgress(noteId) {
    return currentNoteProgress.find(
        progress => progress.noteId === noteId
    ) || null;
}


// ============================================================
// GET NOTE STUDY STATUS
// ============================================================

function getNoteStudyStatus(noteId) {

    const progress = getNoteProgress(noteId);

    if (!progress) {
        return "unread";
    }

    // A completed status should always be preserved.
    if (progress.status === "completed") {
        return "completed";
    }

    // Treat 100% reading progress as completed.
    const percentage = Number(progress.progressPercent) || 0;

    if (percentage >= 100) {
        return "completed";
    }

    if (
        progress.status === "in_progress" ||
        percentage > 0
    ) {
        return "in_progress";
    }

    return "unread";
}


// ============================================================
// GET NOTE READING PERCENTAGE
// ============================================================

function getNoteReadingPercent(noteId) {
    const progress = getNoteProgress(noteId);

    if (!progress) {
        return 0;
    }

    const percentage = Number(progress.progressPercent) || 0;

    return Math.max(0, Math.min(100, percentage));
}

// ============================================================
// RENDER PUBLISHED STUDY NOTES
// ============================================================

// ============================================================
// RENDER PUBLISHED STUDY NOTES
// ============================================================

function renderPublishedNotes(notes = currentNotes) {

    const notesGrid = document.getElementById("notesGrid");
    const notesEmpty = document.getElementById("notesEmpty");
    const notesCount = document.getElementById("notesCount");

    console.log("Rendering study notes:", notes.length);

    if (!notesGrid) {
        console.error("ERROR: #notesGrid was not found in the HTML.");
        return;
    }

    // Clear existing cards.
    notesGrid.innerHTML = "";

    // Remove visibility classes that might hide the grid.
    notesGrid.classList.remove("d-none");

    if (notesCount) {
        notesCount.textContent = notes.length;
    }

    // Handle empty results.
    if (!notes.length) {

        if (notesEmpty) {
            notesEmpty.classList.remove("d-none");
            notesEmpty.style.display = "block";
        }

        notesGrid.style.display = "none";

        return;
    }

    // Hide the empty-state message.
    if (notesEmpty) {
        notesEmpty.classList.add("d-none");
        notesEmpty.style.display = "none";
    }

    // Make the grid visible.
    notesGrid.style.display = "grid";

    const fragment = document.createDocumentFragment();

    notes.forEach(note => {

        try {

            const card = createNoteCard(note);

            if (card) {
                fragment.appendChild(card);
            }

        } catch (error) {

            console.error(
                "Error creating study note card:",
                note.title,
                error
            );

        }

    });

    notesGrid.appendChild(fragment);

    // Confirm that cards were inserted.
    console.log("Study note cards inserted:", notesGrid.children.length);

    console.log("Study note grid visibility:", {
        display: getComputedStyle(notesGrid).display,
        visibility: getComputedStyle(notesGrid).visibility,
        opacity: getComputedStyle(notesGrid).opacity,
        className: notesGrid.className,
        cardCount: notesGrid.children.length
    });
}


/* ==================================================
   CREATE NOTE CARD
================================================== */

// ============================================================
// CREATE STUDY NOTE CARD
// ============================================================

function createNoteCard(note) {

    const card = document.createElement("article");

    card.className = "study-note-card";

    const subjectName = getNoteSubjectName(note);

    const title = note.title || "Untitled Note";

    const preview = getPlainText(
        note.content || ""
    );

    const shortPreview = preview.length > 150
        ? `${preview.substring(0, 150)}...`
        : preview;

    const status = getNoteStudyStatus(note.$id);

    const progress = getNoteReadingPercent(note.$id);

    const updatedDate = formatDate(
        note.$updatedAt || note.$createdAt
    );

    let statusLabel = "Unread";
    let statusClass = "unread";

    let buttonLabel = "Start Reading";
    let buttonIcon = "fa-book-open";

    if (status === "in_progress") {

        statusLabel = "In Progress";
        statusClass = "in-progress";

        buttonLabel = "Continue Reading";
        buttonIcon = "fa-play";

    } else if (status === "completed") {

        statusLabel = "Completed";
        statusClass = "completed";

        buttonLabel = "Review Note";
        buttonIcon = "fa-rotate-right";

    }

    card.innerHTML = `

        <div class="study-note-card-top">

            <span class="study-note-subject">
                ${escapeHtml(subjectName)}
            </span>

            <span class="study-note-status ${statusClass}">
                ${statusLabel}
            </span>

        </div>


        <div class="study-note-card-content">

            <h3 class="study-note-card-title">
                ${escapeHtml(title)}
            </h3>

            <p class="study-note-card-preview">
                ${escapeHtml(shortPreview)}
            </p>

        </div>


        <div class="study-note-card-progress">

            <div class="note-card-progress-heading">

                <span>Reading Progress</span>

                <span>${progress}%</span>

            </div>

            <div
                class="note-card-progress-track"
                role="progressbar"
                aria-label="Reading progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="${progress}"
            >

                <div
                    class="note-card-progress-bar"
                    style="width: ${progress}%"
                ></div>

            </div>

        </div>


        <div class="study-note-card-meta">

            <span>
                <i class="fas fa-calendar-alt"></i>
                Updated ${escapeHtml(updatedDate)}
            </span>

        </div>


        <div class="study-note-card-actions">

            <button
                type="button"
                class="study-note-open-btn"
                data-note-id="${escapeHtml(note.$id)}"
            >

                <i class="fas ${buttonIcon}"></i>

                ${buttonLabel}

            </button>

        </div>

    `;

    const openButton = card.querySelector(
        ".study-note-open-btn"
    );

    openButton.addEventListener("click", () => {
        openViewNote(note.$id);
    });

    return card;
}


/* ==================================================
   UPDATE EMPTY MESSAGE
================================================== */

function updateEmptyMessage() {

    if (!notesEmpty) {
        return;
    }


    const heading =
        notesEmpty.querySelector(
            "h3"
        );


    const paragraph =
        notesEmpty.querySelector(
            "p"
        );


    const searchTerm =
        (
            notesSearch?.value ||
            ""
        )
        .trim();


    const selectedSubject =
        subjectFilter?.value ||
        "";


    /*
     * Filtered search returned nothing.
     */

    if (
        searchTerm ||
        selectedSubject
    ) {

        if (heading) {

            heading.textContent =
                "No matching notes";

        }


        if (paragraph) {

            paragraph.textContent =
                "Try a different search term or select another subject.";

        }


        return;

    }


    /*
     * There are genuinely no published notes.
     */

    if (heading) {

        heading.textContent =
            "No study notes found";

    }


    if (paragraph) {

        paragraph.textContent =
            "There are currently no published study notes available.";

    }

}


/* ==================================================
   GET CONTENT PREVIEW
================================================== */

function getContentPreview(content) {

    const text =
        getPlainText(content);


    if (!text) {

        return "No preview available.";

    }


    if (text.length > 140) {

        return (
            text.substring(
                0,
                140
            ) +
            "..."
        );

    }


    return text;

}


/* ==================================================
   CONVERT HTML TO PLAIN TEXT
================================================== */

function getPlainText(content) {

    if (!content) {
        return "";
    }


    const temporaryElement =
        document.createElement(
            "div"
        );


    temporaryElement.innerHTML =
        content;


    return (
        temporaryElement.textContent ||
        temporaryElement.innerText ||
        ""
    )
    .replace(
        /\s+/g,
        " "
    )
    .trim();

}


/* ==================================================
   UPDATE NOTES COUNT
================================================== */

function updateNotesCount(count) {

    if (!notesCount) {
        return;
    }


    notesCount.textContent =
        `${count} ${
            count === 1
                ? "note"
                : "notes"
        }`;

}


// ============================================================
// OPEN STUDY NOTE
// RESTORE SAVED POSITION AND PRESERVE COMPLETION
// ============================================================

async function openViewNote(id) {

    const note = currentNotes.find(
        item => item.$id === id
    );

    if (!note) {
        console.error("Study note not found:", id);
        return;
    }

    const viewTitle = document.getElementById(
        "viewNoteModalLabel"
    );

    const viewSubject = document.getElementById(
        "viewNoteSubject"
    );

    const viewDate = document.getElementById(
        "viewNoteDate"
    );

    const viewContent = document.getElementById(
        "viewNoteContent"
    );

    if (!viewContent) {
        console.error(
            "Study note reader content element not found."
        );
        return;
    }

    // Save pending progress for the previously opened note.
    if (
        currentReadingNoteId &&
        currentReadingNoteId !== id
    ) {
        await flushPendingNoteProgress();
    } else {
        clearTimeout(progressSaveTimer);
        progressSaveTimer = null;
    }

    // Prevent scroll events from saving while the reader loads.
    isRestoringReadingPosition = true;

    // Set the new current note.
    currentReadingNoteId = note.$id;

    // Retrieve the saved progress record.
    currentReadingProgress = getNoteProgress(note.$id);

    // Preserve the saved percentage and completion status.
    currentReadingPercent = getNoteReadingPercent(note.$id);

    const savedPosition = Math.max(
        0,
        Number(currentReadingProgress?.lastPosition) || 0
    );

    const wasCompleted = (
        currentReadingProgress?.status === "completed" ||
        Number(currentReadingProgress?.progressPercent) >= 100
    );

    // Update the reader heading.
    if (viewTitle) {
        viewTitle.textContent =
            note.title || "Untitled Note";
    }

    if (viewSubject) {
        viewSubject.textContent =
            getNoteSubjectName(note);
    }

    if (viewDate) {
        viewDate.textContent =
            `Updated ${formatDate(
                note.$updatedAt || note.$createdAt
            )}`;
    }

    // Insert the note content.
    viewContent.innerHTML =
        note.content || "<p>No content available.</p>";

    // Begin at the top temporarily while the content renders.
    viewContent.scrollTop = 0;

    // Update the progress bar using saved progress.
    const progressBar = document.getElementById(
        "noteReadingProgress"
    );

    if (progressBar) {
        progressBar.style.width =
            `${currentReadingPercent}%`;

        progressBar.setAttribute(
            "aria-valuenow",
            String(currentReadingPercent)
        );
    }

    // Open the modal.
    if (viewNoteModal) {
        viewNoteModal.show();
    }

    try {

        // Wait for MathJax to finish rendering the note.
        await renderStudyNoteMath(viewContent);

        // Wait for browser layout to settle.
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });

        // Ensure this operation still belongs to the same note.
        if (currentReadingNoteId !== note.$id) {
            return;
        }

        // Restore the saved position after rendering.
        viewContent.scrollTop = savedPosition;

        // Wait for the restored position to take effect.
        await new Promise(resolve => {
            requestAnimationFrame(resolve);
        });

        // Update the progress indicator without downgrading
        // a note that was already completed.
        const actualPercentage =
            calculateNoteReadingProgress();

        currentReadingPercent = wasCompleted
            ? 100
            : actualPercentage;

        if (progressBar) {
            progressBar.style.width =
                `${currentReadingPercent}%`;

            progressBar.setAttribute(
                "aria-valuenow",
                String(currentReadingPercent)
            );
        }

        // Finish restoration before attaching normal scrolling.
        isRestoringReadingPosition = false;

        attachReadingProgressEvents();

        // Create a record only for a note without existing progress.
        if (!currentReadingProgress) {

            await saveStudentNoteProgress(
                note.$id,
                actualPercentage,
                viewContent.scrollTop,
                "in_progress"
            );

        }

    } catch (error) {

        isRestoringReadingPosition = false;

        console.error(
            "Unable to restore study note reading position:",
            error
        );

    }
}w


/* ==================================================
   LOADING STATE
================================================== */

function setNotesLoading(isLoading) {

    if (!notesLoading) {
        return;
    }


    if (isLoading) {

        notesLoading.classList.remove(
            "d-none"
        );


        if (notesEmpty) {

            notesEmpty.classList.add(
                "d-none"
            );

        }


        if (notesGrid) {

            notesGrid.classList.add(
                "d-none"
            );

        }

    } else {

        notesLoading.classList.add(
            "d-none"
        );

    }

}


// ============================================================
// APLUS TUTORS
// STUDY NOTES DASHBOARD STATISTICS
// ============================================================

function updateStudyNotesDashboard() {

    const totalNotes = currentNotes.length;

    let unreadCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    let totalProgress = 0;

    currentNotes.forEach(note => {

        const status = getNoteStudyStatus(note.$id);

        const progress = getNoteReadingPercent(note.$id);

        if (status === "completed") {

            completedCount++;

            totalProgress += 100;

        } else if (status === "in_progress") {

            inProgressCount++;

            totalProgress += progress;

        } else {

            unreadCount++;

        }

    });

    // Calculate average progress across all published notes.
    const overallPercentage = totalNotes > 0
        ? Math.round(totalProgress / totalNotes)
        : 0;

    // Update statistics.
    const totalElement =
        document.getElementById("totalNotesStat");

    const unreadElement =
        document.getElementById("unreadNotesStat");

    const inProgressElement =
        document.getElementById("inProgressNotesStat");

    const completedElement =
        document.getElementById("completedNotesStat");

    if (totalElement) {
        totalElement.textContent = totalNotes;
    }

    if (unreadElement) {
        unreadElement.textContent = unreadCount;
    }

    if (inProgressElement) {
        inProgressElement.textContent = inProgressCount;
    }

    if (completedElement) {
        completedElement.textContent = completedCount;
    }

    // Update overall progress.
    const percentageElement =
        document.getElementById("overallProgressPercentage");

    const progressBar =
        document.getElementById("overallProgressBar");

    const progressTrack =
        document.getElementById("overallProgressTrack");

    const summary =
        document.getElementById("overallProgressSummary");

    if (percentageElement) {
        percentageElement.textContent =
            `${overallPercentage}%`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${overallPercentage}%`;
    }

    if (progressTrack) {
        progressTrack.setAttribute(
            "aria-valuenow",
            String(overallPercentage)
        );
    }

    if (summary) {
        summary.textContent =
            `${completedCount} of ${totalNotes} notes completed`;
    }
}



/* ==================================================
   ERROR STATE
================================================== */

function showNotesError(message) {

    if (notesLoading) {

        notesLoading.classList.add(
            "d-none"
        );

    }


    if (notesGrid) {

        notesGrid.classList.add(
            "d-none"
        );

    }


    if (notesEmpty) {

        notesEmpty.classList.remove(
            "d-none"
        );


        const heading =
            notesEmpty.querySelector(
                "h3"
            );


        const paragraph =
            notesEmpty.querySelector(
                "p"
            );


        if (heading) {

            heading.textContent =
                "Unable to load notes";

        }


        if (paragraph) {

            paragraph.textContent =
                message;

        }

    }

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


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

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


// ============================================================
// SAVE STUDENT NOTE PROGRESS
// PRESERVE COMPLETED STATUS
// ============================================================

async function saveStudentNoteProgress(
    noteId,
    progressPercent,
    lastPosition,
    status = "in_progress"
) {

    try {

        if (!currentStudentProfileId || !noteId) {
            return null;
        }

        // Find the existing record for this student and note.
        const existingProgress = currentNoteProgress.find(
            progress =>
                progress.noteId === noteId &&
                progress.studentId === currentStudentProfileId
        );

        const percentage = Math.max(
            0,
            Math.min(
                100,
                Math.round(Number(progressPercent) || 0)
            )
        );

        const position = Math.max(
            0,
            Math.round(Number(lastPosition) || 0)
        );

        // Never downgrade a completed note.
        const alreadyCompleted = (
            existingProgress?.status === "completed" ||
            Number(existingProgress?.progressPercent) >= 100
        );

        if (alreadyCompleted) {

            status = "completed";

        } else if (percentage >= 100) {

            status = "completed";

        } else if (status !== "unread") {

            status = "in_progress";

        }

        const now = new Date().toISOString();

        const data = {
            studentId: currentStudentProfileId,
            noteId: noteId,
            status: status,
            progressPercent: alreadyCompleted
                ? 100
                : percentage,
            lastPosition: position,
            lastReadAt: now
        };

        // Preserve the original completion timestamp.
        if (status === "completed") {

            data.completedAt =
                existingProgress?.completedAt || now;

        }

        let savedRecord;

        if (existingProgress) {

            // Update the existing progress record.
            savedRecord = await tablesDB.updateRow(
                DATABASE_ID,
                STUDY_NOTE_PROGRESS_TABLE_ID,
                existingProgress.$id,
                data
            );

            // Replace the existing local record.
            currentNoteProgress = currentNoteProgress.map(
                progress =>
                    progress.$id === savedRecord.$id
                        ? savedRecord
                        : progress
            );

        } else {

            // Create a record only when one does not exist.
            savedRecord = await tablesDB.createRow(
                DATABASE_ID,
                STUDY_NOTE_PROGRESS_TABLE_ID,
                ID.unique(),
                data
            );

            currentNoteProgress.push(savedRecord);

        }

        // Update the current reader's progress.
        if (currentReadingNoteId === noteId) {

            currentReadingProgress = savedRecord;

            currentReadingPercent =
                Number(savedRecord.progressPercent) || 0;

        }

        // Refresh statistics and note cards.
        updateStudyNotesDashboard();

        applyNoteFilters();

        console.log("Study progress saved:", {
            noteId: noteId,
            status: savedRecord.status,
            progressPercent: savedRecord.progressPercent,
            lastPosition: savedRecord.lastPosition
        });

        return savedRecord;

    } catch (error) {

        console.error(
            "Unable to save study progress:",
            error
        );

        return null;

    }
}



// ============================================================
// CALCULATE READING PROGRESS
// ============================================================

function calculateNoteReadingProgress() {
    const content = document.getElementById("viewNoteContent");

    if (!content) {
        return 0;
    }

    const scrollableHeight =
        content.scrollHeight - content.clientHeight;

    // A short note may not require scrolling.
    if (scrollableHeight <= 0) {
        return 100;
    }

    const percentage =
        (content.scrollTop / scrollableHeight) * 100;

    return Math.max(
        0,
        Math.min(100, Math.round(percentage))
    );
}


// ============================================================
// UPDATE READER PROGRESS BAR
// ============================================================

function updateNoteReadingProgress() {
    const progressBar = document.getElementById(
        "noteReadingProgress"
    );

    if (!progressBar) {
        return;
    }

    const percentage = calculateNoteReadingProgress();

    progressBar.style.width = `${percentage}%`;

    progressBar.setAttribute(
        "aria-valuenow",
        String(percentage)
    );

    progressBar.setAttribute(
        "aria-valuemin",
        "0"
    );

    progressBar.setAttribute(
        "aria-valuemax",
        "100"
    );

    currentReadingPercent = percentage;
}




// ============================================================
// HANDLE READER SCROLLING
// PRESERVE COMPLETED STATUS
// ============================================================

function handleNoteReaderScroll() {

    if (isRestoringReadingPosition) {
        return;
    }

    if (!currentReadingNoteId) {
        return;
    }

    const content = document.getElementById(
        "viewNoteContent"
    );

    if (!content) {
        return;
    }

    updateNoteReadingProgress();

    const noteId = currentReadingNoteId;

    const percentage = currentReadingPercent;

    const position = content.scrollTop;

    const existingStatus = getNoteStudyStatus(noteId);

    // Keep completed notes completed when revisiting them.
    const status = (
        existingStatus === "completed" ||
        percentage >= 100
    )
        ? "completed"
        : "in_progress";

    // Debounce database updates while scrolling.
    clearTimeout(progressSaveTimer);

    progressSaveTimer = setTimeout(async () => {

        // Avoid saving stale progress if the student
        // has already opened another note.
        if (currentReadingNoteId !== noteId) {
            return;
        }

        await saveStudentNoteProgress(
            noteId,
            percentage,
            position,
            status
        );

    }, 800);
}


// ============================================================
// ATTACH READER SCROLL LISTENER
// ============================================================

function attachReadingProgressEvents() {
    const content = document.getElementById(
        "viewNoteContent"
    );

    if (!content) {
        return;
    }

    // Prevent duplicate listeners.
    content.removeEventListener(
        "scroll",
        handleNoteReaderScroll
    );

    content.addEventListener(
        "scroll",
        handleNoteReaderScroll,
        { passive: true }
    );
}

/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHtml(value) {

    return String(value)

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



