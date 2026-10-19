"use strict";

/*==================================================
APLUS TUTORS
STUDENT MANAGEMENT

PHASE 3A
FOUNDATION
==================================================*/


/*==================================================
CONFIGURATION
==================================================*/

const PAGE_SIZE = 25;


/*==================================================
ELEMENTS
==================================================*/

const tableBody =
    document.getElementById(
        "studentsTable"
    );

const pagination =
    document.getElementById(
        "pagination"
    );

const searchInput =
    document.getElementById(
        "studentSearch"
    );

const departmentFilter =
    document.getElementById(
        "departmentFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const tabButtons =
    document.querySelectorAll(
        ".tab-btn"
    );

const selectAll =
    document.getElementById(
        "selectAll"
    );

const bulkBar =
    document.getElementById(
        "bulkBar"
    );


/*==================================================
STATISTICS
==================================================*/

const totalStudentsCard =
    document.getElementById(
        "totalStudents"
    );

const pendingStudentsCard =
    document.getElementById(
        "pendingStudents"
    );

const activeStudentsCard =
    document.getElementById(
        "activeStudents"
    );

const suspendedStudentsCard =
    document.getElementById(
        "suspendedStudents"
    );


/*==================================================
GLOBAL DATA
==================================================*/

let allStudents = [];

let filteredStudents = [];

let selectedStudents = [];

let currentPage = 1;

let currentTab = "all";


/*==================================================
WAIT FOR AUTH
==================================================*/

document.addEventListener(

    "aplusAuthReady",

    initializeStudents

);


/*==================================================
INITIALIZE
==================================================*/

function initializeStudents() {

    attachStudentEvents();

    loadStudents();

}



/*==================================================
ACTIVATE STUDENT
==================================================*/

async function activateStudent(

    rowId

) {

    try {

        await tablesDB.updateRow({

            databaseId:
                DATABASE_ID,

            tableId:
                USERS_TABLE_ID,

            rowId:
                rowId,

            data: {

                status:
                    "active"

            }

        });

        await loadStudents();

    }

    catch (error) {

        console.error(

            "Activation Error",

            error

        );

    }

}



/*==================================================
SUSPEND STUDENT
==================================================*/

async function suspendStudent(

    rowId

) {

    try {

        await tablesDB.updateRow({

            databaseId:
                DATABASE_ID,

            tableId:
                USERS_TABLE_ID,

            rowId:
                rowId,

            data: {

                status:
                    "suspended"

            }

        });

        await loadStudents();

    }

    catch (error) {

        console.error(

            error

        );

    }

}

/*==================================================
DELETE STUDENT
==================================================*/

async function deleteStudent(

    rowId

) {

    if (

        !confirm(

            "Delete this student?"

        )

    ) {

        return;

    }

    try {

        await tablesDB.deleteRow({

            databaseId:
                DATABASE_ID,

            tableId:
                USERS_TABLE_ID,

            rowId:
                rowId

        });

        await loadStudents();

    }

    catch (error) {

        console.error(

            error

        );

    }

}


/*==================================================
UPDATE STUDENT
==================================================*/

async function updateStudent(

    rowId,

    data

) {

    try {

        await tablesDB.updateRow({

            databaseId:
                DATABASE_ID,

            tableId:
                USERS_TABLE_ID,

            rowId:
                rowId,

            data:
                data

        });

        await loadStudents();

    }

    catch (error) {
    
    console.error(
        "Update Student Error:",
        error
    );
    
    alert(error.message);
    
}

}

/*==================================================
EVENTS
==================================================*/

function attachStudentEvents() {

    searchInput.addEventListener(

        "input",

        applyFilters

    );

    departmentFilter.addEventListener(

        "change",

        applyFilters

    );

    statusFilter.addEventListener(

        "change",

        applyFilters

    );

    tabButtons.forEach(

        button => {

            button.addEventListener(

                "click",

                function () {

                    tabButtons.forEach(

                        btn =>

                        btn.classList.remove(
                            "active"
                        )

                    );

                    this.classList.add(
                        "active"
                    );

                    currentTab =
                        this.dataset.tab;

                    applyFilters();

                }

            );

        }

    );

}



/*==================================================
LOAD STUDENTS
==================================================*/

async function loadStudents() {

    try {

        const response =

            await tablesDB.listRows({

                databaseId:
                    DATABASE_ID,

                tableId:
                    USERS_TABLE_ID,

                queries: [

                    Query.equal(
                        "role",
                        "student"
                    ),

                    Query.limit(500)

                ]

            });

        allStudents =
            response.rows;

        applyFilters();

    }

    catch (error) {

        console.error(

            "Load Students Error",

            error

        );

    }

}


/*==================================================
FILTERS
==================================================*/

function applyFilters() {

    const keyword =

        searchInput.value

        .toLowerCase()

        .trim();

    filteredStudents = allStudents.filter(
    function(student) {
        
        if (
            currentTab !== "all" &&
            student.status !== currentTab
        ) {
            return false;
        }
        
        if (
            departmentFilter.value &&
            student.department !== departmentFilter.value
        ) {
            return false;
        }
        
        if (
            statusFilter.value &&
            student.status !== statusFilter.value
        ) {
            return false;
        }
        
        const name =
            String(student.fullName || "").toLowerCase();
        
        const email =
            String(student.email || "").toLowerCase();
        
        const phone =
            String(student.phone || "");
        
        return (
            name.includes(keyword) ||
            email.includes(keyword) ||
            phone.includes(keyword)
        );
        
    }
);

    renderStatistics();

    renderTable();
    
    attachRowEvents();

}



/*==================================================
ROW EVENTS
==================================================*/

function attachRowEvents() {
    
document

.querySelectorAll(

    ".edit"

)

.forEach(

    button => {

        button.onclick =

            () =>

            editStudent(

                button.dataset.id

            );

    }

);
    
    document

.querySelectorAll(

    ".view"

)

.forEach(

    button => {

        button.onclick =

            function () {

                viewStudent(

                    this.dataset.id

                );

            };

    }

);


    document

    .querySelectorAll(

        ".activate"

    )

    .forEach(

        button => {

            button.onclick =

                () =>

                activateStudent(

                    button.dataset.id

                );

        }

    );

    document

    .querySelectorAll(

        ".suspend"

    )

    .forEach(

        button => {

            button.onclick =

                () =>

                suspendStudent(

                    button.dataset.id

                );

        }

    );

    document

    .querySelectorAll(

        ".delete"

    )

    .forEach(

        button => {

            button.onclick =

                () =>

                deleteStudent(

                    button.dataset.id

                );

        }

    );

}




/*==================================================
STATISTICS
==================================================*/

function renderStatistics() {

    totalStudentsCard.textContent =

        allStudents.length;

    pendingStudentsCard.textContent =

        allStudents.filter(

            s =>

            s.status === "pending"

        ).length;

    activeStudentsCard.textContent =

        allStudents.filter(

            s =>

            s.status === "active"

        ).length;

    suspendedStudentsCard.textContent =

        allStudents.filter(

            s =>

            s.status === "suspended"

        ).length;

}


/*==================================================
TABLE
==================================================*/

function renderTable() {

    if (

        filteredStudents.length === 0

    ) {

        tableBody.innerHTML =

            `<tr>

                <td colspan="7"

                class="empty-state">

                No students found.

                </td>

            </tr>`;

        return;

    }

    tableBody.innerHTML =

        filteredStudents.map(

            student =>

            `

<tr>

<td>

<input

type="checkbox"

class="student-check"

data-id="${student.$id}">

</td>

<td>

<div class="student-cell">

<div class="student-photo">

<img src="${student.photoUrl || '/assets/Screenshot_20260806-223602.png'}">

</div>

<div>

<div class="student-name">

${student.fullName}

</div>

<div class="student-id">

${student.department}

</div>

</div>

</div>

</td>

<td>${student.email}</td>

<td>${student.phone}</td>

<td>${student.department}</td>

<td>

<span class="status ${student.status}">

${student.status}

</span>

</td>

<td>

<div class="action-buttons">

<button
class="action-btn view"
data-id="${student.$id}">

<i class="fa fa-eye"></i>

</button>

<button
class="action-btn edit"
data-id="${student.$id}">

<i class="fa fa-edit"></i>

</button>

${
student.status==="pending"

?

`<button
class="action-btn activate"
data-id="${student.$id}">

<i class="fa fa-check"></i>

</button>`

:

`<button
class="action-btn suspend"
data-id="${student.$id}">

<i class="fa fa-ban"></i>

</button>`
}

<button
class="action-btn delete"
data-id="${student.$id}">

<i class="fa fa-trash"></i>

</button>

</div>

</td>

</tr>

`

        ).join("");

}


/*==================================================
VIEW STUDENT
==================================================*/

function viewStudent(rowId) {

    const student = allStudents.find(
        s => s.$id === rowId
    );

    if (!student) {
        alert("Student record not found.");
        return;
    }

    document.getElementById("viewPhoto").src =
        student.photoUrl ||
        "assets/Screenshot_20260806-223602.png";

    document.getElementById("viewName").textContent =
        student.fullName || "Not provided";

    document.getElementById("viewEmail").textContent =
        student.email || "Not provided";

    document.getElementById("viewPhone").textContent =
        student.phone || "Not provided";

    document.getElementById("viewDepartment").textContent =
        student.department || "Not assigned";

    const statusElement =
        document.getElementById("viewStatus");

    const status =
        student.status || "pending";

    statusElement.textContent = status;

    statusElement.className =
        "student-profile-status " + status;

    document.getElementById("viewUserId").textContent =
        student.$id || "Not available";

    document.getElementById("viewStudentModal")
        .classList.add("show");

    document.getElementById("viewStudentModal")
        .setAttribute("aria-hidden", "false");
}


/*==================================================
EDIT STUDENT
==================================================*/

function editStudent(rowId) {

    const student = allStudents.find(
        s => s.$id === rowId
    );

    if (!student) {
        alert("Student record not found.");
        return;
    }

    document.getElementById("editRowId").value =
        student.$id;

    document.getElementById("editFullName").value =
        student.fullName || "";

    document.getElementById("editEmail").value =
        student.email || "";

    document.getElementById("editPhone").value =
        student.phone || "";

    document.getElementById("editDepartment").value =
        student.department || "";

    document.getElementById("editStatus").value =
        student.status || "pending";

    const message =
        document.getElementById("editStudentMessage");

    message.textContent = "";
    message.className = "student-form-message";

    document.getElementById("editStudentModal")
        .classList.add("show");

    document.getElementById("editStudentModal")
        .setAttribute("aria-hidden", "false");
}








/*==================================================
CLOSE VIEW MODAL
==================================================*/

document

.getElementById(

    "closeViewModal"

)

.addEventListener(

    "click",

    function () {

        document

            .getElementById(

                "viewStudentModal"

            )

            .classList.remove(

                "show"

            );

    }

);


/* =========================================================
SAVE STUDENT CHANGES
Includes validation, loading state and error handling
========================================================= */

const editStudentForm =
document.getElementById("editStudentForm");

const saveStudentBtn =
document.getElementById("saveStudentBtn");

const editStudentMessage =
document.getElementById("editStudentMessage");

/* Prevent duplicate event registration. */
if (editStudentForm && saveStudentBtn) {

editStudentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        /* =========================================
           PREVENT MULTIPLE SUBMISSIONS
        ========================================= */

        if (saveStudentBtn.disabled) {
            return;
        }


        /* =========================================
           GET FORM VALUES
        ========================================= */

        const rowId =
            document.getElementById("editRowId").value.trim();

        const fullName =
            document.getElementById("editFullName").value.trim();

        const email =
            document.getElementById("editEmail").value.trim();

        const phone =
            document.getElementById("editPhone").value.trim();

        const department =
            document.getElementById("editDepartment").value;

        const status =
            document.getElementById("editStatus").value;


        /* =========================================
           VALIDATE REQUIRED FIELDS
        ========================================= */

        if (!rowId) {

            showEditStudentMessage(
                "Student record could not be identified.",
                "error"
            );

            return;
        }


        if (!fullName) {

            showEditStudentMessage(
                "Please enter the student's full name.",
                "error"
            );

            document.getElementById("editFullName").focus();

            return;
        }


        if (!email) {

            showEditStudentMessage(
                "Please enter the student's email address.",
                "error"
            );

            document.getElementById("editEmail").focus();

            return;
        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showEditStudentMessage(
                "Please enter a valid email address.",
                "error"
            );

            document.getElementById("editEmail").focus();

            return;
        }


        if (!department) {

            showEditStudentMessage(
                "Please select a department.",
                "error"
            );

            document.getElementById("editDepartment").focus();

            return;
        }


        if (!status) {

            showEditStudentMessage(
                "Please select a student status.",
                "error"
            );

            document.getElementById("editStatus").focus();

            return;
        }


        /* =========================================
           PREPARE DATA
        ========================================= */

        const data = {
            fullName: fullName,
            email: email,
            phone: phone,
            department: department,
            status: status
        };


        /* =========================================
           SAVE BUTTON LOADING STATE
        ========================================= */

        const originalButtonHTML =
            saveStudentBtn.innerHTML;

        saveStudentBtn.disabled = true;

        saveStudentBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Saving...</span>
        `;

        saveStudentBtn.style.opacity = "0.7";
        saveStudentBtn.style.cursor = "not-allowed";


        try {

            /* =====================================
               UPDATE STUDENT IN APPWRITE
            ===================================== */

            await updateStudent(rowId, data);


/* =========================================
   SHOW SUCCESS NOTIFICATION
========================================= */

showEditStudentMessage(
    "Student details updated successfully!",
    "success"
);


/* =========================================
   CLOSE MODAL AFTER A SHORT DELAY
========================================= */

setTimeout(function() {
    
    const modal =
        document.getElementById("editStudentModal");
    
    if (modal) {
        modal.classList.remove("show");
    }
    
}, 1500);

            /* =====================================
               REFRESH STUDENT LIST IF AVAILABLE
            ===================================== */

            if (typeof loadStudents === "function") {

                await loadStudents();

            } else if (typeof fetchStudents === "function") {

                await fetchStudents();

            } else if (typeof getStudents === "function") {

                await getStudents();

            }


        } catch (error) {

            console.error(
                "Error updating student:",
                error
            );


            showEditStudentMessage(
                error.message ||
                "Unable to save student changes. Please try again.",
                "error"
            );


        } finally {

            /* =====================================
               RESTORE SAVE BUTTON
            ===================================== */

            saveStudentBtn.disabled = false;

            saveStudentBtn.innerHTML =
                originalButtonHTML;

            saveStudentBtn.style.opacity = "";
            saveStudentBtn.style.cursor = "";

        }

    }
);

}

/* =========================================================
DISPLAY EDIT STUDENT MESSAGE
========================================================= */

function showEditStudentMessage(message, type) {

const messageElement =
    document.getElementById("editStudentMessage");

if (!messageElement) {
    console.log(message);
    return;
}

messageElement.textContent = message;

messageElement.className =
    "student-form-message " + type;

messageElement.style.display = "block";

}




/*==================================================
STUDENT MODAL CONTROLS
==================================================*/

function closeStudentModal(modalId) {

    const modal = document.getElementById(modalId);

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    modal.setAttribute("aria-hidden", "true");
}


/*==================================================
CLOSE VIEW MODAL BUTTONS
==================================================*/

document.getElementById("closeViewModalFooter")
    .addEventListener("click", function () {

        closeStudentModal("viewStudentModal");

    });


/*==================================================
CLOSE EDIT MODAL BUTTONS
==================================================*/

document.getElementById("closeEditModal")
    .addEventListener("click", function () {

        closeStudentModal("editStudentModal");

    });


document.getElementById("cancelEditModal")
    .addEventListener("click", function () {

        closeStudentModal("editStudentModal");

    });


/*==================================================
EDIT DIRECTLY FROM STUDENT PROFILE
==================================================*/

document.getElementById("editFromViewBtn")
    .addEventListener("click", function () {

        const rowId =
            document.getElementById("viewUserId").textContent;

        closeStudentModal("viewStudentModal");

        editStudent(rowId);

    });


/*==================================================
CLOSE MODAL WHEN CLICKING OUTSIDE
==================================================*/

document.querySelectorAll(".student-modal")
    .forEach(function (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {

                closeStudentModal(modal.id);

            }

        });

    });


/*==================================================
CLOSE MODALS WITH ESCAPE
==================================================*/

document.addEventListener("keydown", function (event) {

    if (event.key !== "Escape") {
        return;
    }

    document.querySelectorAll(".student-modal.show")
        .forEach(function (modal) {

            closeStudentModal(modal.id);

        });

});