"use strict";

/*==================================================
APLUS TUTORS
STUDENT PROFILE

PHASE 2
FOUNDATION
AUTHENTICATION
STUDENT VERIFICATION
PROFILE DATA
PROFILE EDITING
==================================================*/


/*==================================================
APPLICATION CONFIGURATION
==================================================*/

const STUDENT_PROFILE_APP_NAME =
    "Aplus Tutors";


/*==================================================
DOM ELEMENTS
==================================================*/

const profilePage =
    document.getElementById(
        "profilePage"
    );


const profileLoader =
    document.getElementById(
        "pageLoader"
    );


const profileForm =
    document.getElementById(
        "profileForm"
    );


const profileMessage =
    document.getElementById(
        "profileMessage"
    );


const profilePhoto =
    document.getElementById(
        "profilePhoto"
    );


const photoPreview =
    document.getElementById(
        "photoPreview"
    );





/*==================================================
PROFILE STATE
==================================================*/

let profileAuthUser =
    null;


let profileStudent =
    null;


/*==================================================
DEFAULT PROFILE PHOTO
==================================================*/

const DEFAULT_STUDENT_PHOTO =
    "assets/Screenshot_20260806-223602.png";


/*==================================================
AUTHENTICATION READY EVENT
==================================================*/

document.addEventListener(
    "aplusAuthReady",
    initializeStudentProfile
);


/*==================================================
INITIALIZE STUDENT PROFILE
==================================================*/

function initializeStudentProfile(
    event
) {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "APLUS TUTORS STUDENT PROFILE"
        );

        console.log(
            "========================================"
        );


        /*------------------------------------------
        VERIFY AUTH EVENT
        ------------------------------------------*/

        if (!event) {

            throw new Error(
                "Authentication event was not received."
            );

        }


        if (!event.detail) {

            throw new Error(
                "Authentication information is unavailable."
            );

        }


        /*------------------------------------------
        AUTHENTICATED APPWRITE USER
        ------------------------------------------*/

        profileAuthUser =
            event.detail.authUser;


        /*------------------------------------------
        DATABASE USER
        ------------------------------------------*/

        profileStudent =
            event.detail.user;


        console.log(
            "Authenticated student:",
            profileAuthUser
        );


        console.log(
            "Student profile:",
            profileStudent
        );


        /*------------------------------------------
        VERIFY AUTHENTICATED USER
        ------------------------------------------*/

        if (!profileAuthUser) {

            throw new Error(
                "Your account could not be identified."
            );

        }


        /*------------------------------------------
        VERIFY DATABASE PROFILE
        ------------------------------------------*/

        if (!profileStudent) {

            throw new Error(
                "Your student profile could not be found."
            );

        }


        /*------------------------------------------
        VERIFY STUDENT ROLE
        ------------------------------------------*/

        verifyStudentRole();


        /*------------------------------------------
        INITIALIZE PAGE
        ------------------------------------------*/

        initializeProfilePage();

    }

    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "STUDENT PROFILE INITIALIZATION ERROR"
        );

        console.error(
            "========================================"
        );

        console.error(
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to load your profile.",
            "error"
        );


        hideProfileLoader();

    }

}


/*==================================================
VERIFY STUDENT ROLE
==================================================*/

function verifyStudentRole() {

    if (!profileStudent) {

        throw new Error(
            "Student profile information is unavailable."
        );

    }


    const role =
        String(
            profileStudent.role || ""
        )
        .trim()
        .toLowerCase();


    console.log(
        "Detected account role:",
        role
    );


    /*------------------------------------------
    STUDENT ROLE
    ------------------------------------------*/

    if (
        role === "student"
    ) {

        return true;

    }


    /*------------------------------------------
    NO ROLE
    ------------------------------------------*/

    if (!role) {

        throw new Error(
            "Your account role could not be determined."
        );

    }


    /*------------------------------------------
    INVALID ROLE
    ------------------------------------------*/

    throw new Error(
        "This page is only available to student accounts."
    );

}


/*==================================================
INITIALIZE PROFILE PAGE
==================================================*/

function initializeProfilePage() {

    console.log(
        "Initializing student profile page..."
    );


    /*------------------------------------------
    POPULATE PROFILE
    ------------------------------------------*/

    populateProfile();


    /*------------------------------------------
    PHOTO ERROR HANDLING
    ------------------------------------------*/

    attachPhotoErrorHandler();


    /*------------------------------------------
    PROFILE FORM
    ------------------------------------------*/

    attachProfileForm();


    /*------------------------------------------
    PAGE READY
    ------------------------------------------*/

    hideProfileLoader();


    console.log(
        "========================================"
    );

    console.log(
        "STUDENT PROFILE READY"
    );

    console.log(
        "========================================"
    );

}


/*==================================================
POPULATE PROFILE
==================================================*/

function populateProfile() {

    if (!profileStudent) {

        console.warn(
            "No student profile data available."
        );

        return;

    }


    console.log(
        "Populating student profile..."
    );


    /*------------------------------------------
    PROFILE HEADER
    ------------------------------------------*/

    setProfileText(
        "profileName",
        profileStudent.fullName
    );


    setProfileText(
        "profileEmail",
        profileStudent.email
    );


    /*------------------------------------------
    PROFILE FORM
    ------------------------------------------*/

    setProfileValue(
        "fullName",
        profileStudent.fullName
    );


    setProfileValue(
        "email",
        profileStudent.email
    );


    setProfileValue(
        "department",
        profileStudent.department
    );


    setProfileValue(
        "role",
        formatRole(
            profileStudent.role
        )
    );


    setProfileValue(
        "status",
        formatStatus(
            profileStudent.status
        )
    );


    /*------------------------------------------
    PROFILE BADGES
    ------------------------------------------*/

    updateProfileStatus(
        profileStudent.status
    );


    updateProfileDepartment(
        profileStudent.department
    );


    /*------------------------------------------
    ACCOUNT INFORMATION
    ------------------------------------------*/

    setProfileText(
        "accountRole",
        formatRole(
            profileStudent.role
        )
    );


    setProfileText(
        "accountDepartment",
        formatDepartment(
            profileStudent.department
        )
    );


    setProfileText(
        "accountStatus",
        formatStatus(
            profileStudent.status
        )
    );


    /*------------------------------------------
    PROFILE PHOTO
    ------------------------------------------*/

    loadProfilePhoto();

}


/*==================================================
ATTACH PROFILE FORM
==================================================*/

function attachProfileForm() {

    if (!profileForm) {

        console.warn(
            "Student profile form was not found."
        );

        return;

    }


    profileForm.addEventListener(
        "submit",
        handleProfileSubmit
    );


    console.log(
        "Student profile form connected."
    );

}


/*==================================================
HANDLE PROFILE SUBMIT
==================================================*/

async function handleProfileSubmit(
    event
) {

    event.preventDefault();


    clearProfileMessage();


    /*------------------------------------------
    GET FULL NAME INPUT
    ------------------------------------------*/

    const fullNameInput =
        document.getElementById(
            "fullName"
        );


    if (!fullNameInput) {

        showProfileMessage(
            "The full name field could not be found.",
            "error"
        );

        return;

    }


    /*------------------------------------------
    GET VALUE
    ------------------------------------------*/

    const fullName =
        fullNameInput.value.trim();


    /*------------------------------------------
    VALIDATE FULL NAME
    ------------------------------------------*/

    if (!fullName) {

        showProfileMessage(
            "Please enter your full name.",
            "error"
        );


        fullNameInput.focus();


        return;

    }


    if (
        fullName.length < 3
    ) {

        showProfileMessage(
            "Your full name must contain at least 3 characters.",
            "error"
        );


        fullNameInput.focus();


        return;

    }


    if (
        fullName.length > 100
    ) {

        showProfileMessage(
            "Your full name is too long.",
            "error"
        );


        fullNameInput.focus();


        return;

    }


    /*------------------------------------------
    VERIFY STUDENT RECORD
    ------------------------------------------*/

    if (!profileStudent) {

        showProfileMessage(
            "Your student profile information is unavailable.",
            "error"
        );

        return;

    }


    /*------------------------------------------
    VERIFY DATABASE RECORD ID
    ------------------------------------------*/

    if (!profileStudent.$id) {

        console.error(
            "Student profile does not contain $id:",
            profileStudent
        );


        showProfileMessage(
            "Your student profile record could not be identified.",
            "error"
        );

        return;

    }


    /*------------------------------------------
    CHECK WHETHER ANYTHING CHANGED
    ------------------------------------------*/

    const currentName =
        String(
            profileStudent.fullName || ""
        ).trim();


    if (
        fullName ===
        currentName
    ) {

        showProfileMessage(
            "There are no profile changes to save.",
            "success"
        );


        return;

    }


    /*------------------------------------------
    DISABLE SAVE BUTTON
    ------------------------------------------*/

    setProfileSaveState(
        true
    );


    try {

        console.log(
            "Saving student profile..."
        );


        console.log(
            "Student record ID:",
            profileStudent.$id
        );


        /*--------------------------------------
        UPDATE USERS TABLE
        --------------------------------------*/

        const updatedUser =
            await tablesDB.updateRow(
                DATABASE_ID,
                USERS_TABLE_ID,
                profileStudent.$id,
                {
                    fullName:
                        fullName
                }
            );


        console.log(
            "Updated student record:",
            updatedUser
        );


        /*--------------------------------------
        UPDATE LOCAL PROFILE STATE
        --------------------------------------*/

        profileStudent =
            {
                ...profileStudent,
                ...updatedUser,
                fullName:
                    fullName
            };


        /*--------------------------------------
        UPDATE PROFILE HEADER
        --------------------------------------*/

        setProfileText(
            "profileName",
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE FORM
        --------------------------------------*/

        setProfileValue(
            "fullName",
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE DASHBOARD NAME
        --------------------------------------*/

        updateStudentDashboardName(
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE LOCAL STORAGE
        --------------------------------------*/

        updateStoredStudent();


        /*--------------------------------------
        SUCCESS MESSAGE
        --------------------------------------*/

        showProfileMessage(
            "Your profile information was saved successfully.",
            "success"
        );


        console.log(
            "Student profile updated successfully."
        );

    }

    catch (error) {

        console.error(
            "Student profile update error:",
            error
        );


        showProfileMessage(
            getProfileErrorMessage(
                error
            ),
            "error"
        );

    }

    finally {

        setProfileSaveState(
            false
        );

    }

}


/*==================================================
PROFILE SAVE BUTTON STATE
==================================================*/

function setProfileSaveState(
    saving
) {

    if (!saveProfileBtn) {

        return;

    }


    if (saving) {

        saveProfileBtn.disabled =
            true;


        saveProfileBtn.innerHTML = `
            <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
            ></span>
            Saving...
        `;

    }

    else {

        saveProfileBtn.disabled =
            false;


        saveProfileBtn.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            <span>
                Save Changes
            </span>
        `;

    }

}


/*==================================================
UPDATE DASHBOARD STUDENT NAME
==================================================*/

function updateStudentDashboardName(
    fullName
) {

    if (!fullName) {

        return;

    }


    /*------------------------------------------
    COMMON STUDENT NAME SELECTORS
    ------------------------------------------*/

    const studentNames =
        document.querySelectorAll(
            ".student-name"
        );


    studentNames.forEach(
        function (element) {

            element.textContent =
                fullName;

        }
    );


    /*------------------------------------------
    TOPBAR / SIDEBAR FALLBACK
    ------------------------------------------*/

    const dashboardNames =
        document.querySelectorAll(
            ".user-name, .student-name, .profile-name"
        );


    dashboardNames.forEach(
        function (element) {

            element.textContent =
                fullName;

        }
    );


    console.log(
        "Dashboard student name updated."
    );

}


/*==================================================
UPDATE STORED STUDENT
==================================================*/

function updateStoredStudent() {

    try {

        const storedUser =
            localStorage.getItem(
                "aplusUser"
            );


        if (!storedUser) {

            console.log(
                "No stored Aplus user found."
            );

            return;

        }


        const parsedUser =
            JSON.parse(
                storedUser
            );


        const updatedStoredUser =
            {
                ...parsedUser,
                ...profileStudent
            };


        localStorage.setItem(
            "aplusUser",
            JSON.stringify(
                updatedStoredUser
            )
        );


        console.log(
            "Stored student information updated."
        );

    }

    catch (error) {

        console.warn(
            "Unable to update stored student information:",
            error
        );

    }

}


/*==================================================
PROFILE ERROR MESSAGE
==================================================*/

function getProfileErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to save your profile information."
        );

    }


    /*------------------------------------------
    PERMISSION ERROR
    ------------------------------------------*/

    if (
        error.code === 401 ||
        error.code === 403
    ) {

        return (
            "You do not have permission to update your profile."
        );

    }


    /*------------------------------------------
    NETWORK ERROR
    ------------------------------------------*/

    if (
        error.message &&
        error.message
            .toLowerCase()
            .includes("network")
    ) {

        return (
            "Network error. Please check your internet connection and try again."
        );

    }


    /*------------------------------------------
    DOCUMENT / ROW ERROR
    ------------------------------------------*/

    if (
        error.message &&
        (
            error.message
                .toLowerCase()
                .includes("document") ||

            error.message
                .toLowerCase()
                .includes("row")
        )
    ) {

        return (
            "Unable to update your profile record. Please try again."
        );

    }


    /*------------------------------------------
    GENERAL ERROR
    ------------------------------------------*/

    return (
        error.message ||
        "Unable to save your profile information. Please try again."
    );

}


/*==================================================
SET PROFILE TEXT
==================================================*/

function setProfileText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        console.warn(
            "Profile element not found:",
            elementId
        );

        return;

    }


    element.textContent =
        value ||
        "Not provided";

}


/*==================================================
SET PROFILE INPUT VALUE
==================================================*/

function setProfileValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.value =
        value !== undefined &&
        value !== null
            ? value
            : "";
}


/*==================================================
UPDATE PROFILE STATUS
==================================================*/

function updateProfileStatus(
    status
) {

    const badge =
        document.getElementById(
            "profileStatusBadge"
        );

    if (!badge) {
        return;
    }

    const formattedStatus =
        formatStatus(status);

    badge.textContent =
        formattedStatus;

    badge.className =
        "profile-status-badge";

    const normalizedStatus =
        String(status || "")
            .trim()
            .toLowerCase();

    if (
        normalizedStatus ===
        "active"
    ) {

        badge.classList.add(
            "status-active"
        );

    } else if (
        normalizedStatus ===
        "inactive"
    ) {

        badge.classList.add(
            "status-inactive"
        );

    } else if (
        normalizedStatus ===
        "suspended"
    ) {

        badge.classList.add(
            "status-suspended"
        );

    } else {

        badge.classList.add(
            "status-default"
        );
    }
}


/*==================================================
UPDATE PROFILE DEPARTMENT
==================================================*/

function updateProfileDepartment(
    department
) {

    const badge =
        document.getElementById(
            "profileDepartmentBadge"
        );

    if (!badge) {
        return;
    }

    badge.textContent =
        formatDepartment(
            department
        );
}


/*==================================================
FORMAT ROLE
==================================================*/

function formatRole(
    role
) {

    if (!role) {
        return "Student";
    }

    return capitalizeWords(
        String(role)
    );
}


/*==================================================
FORMAT STATUS
==================================================*/

function formatStatus(
    status
) {

    if (!status) {
        return "Unknown";
    }

    return capitalizeWords(
        String(status)
    );
}


/*==================================================
FORMAT DEPARTMENT
==================================================*/

function formatDepartment(
    department
) {

    if (!department) {
        return "Not assigned";
    }

    return capitalizeWords(
        String(department)
    );
}


/*==================================================
CAPITALIZE WORDS
==================================================*/

function capitalizeWords(
    value
) {

    return value
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .replace(
            /\b\w/g,
            function (letter) {
                return letter.toUpperCase();
            }
        );
}


/*==================================================
LOAD PROFILE PHOTO
==================================================*/

async function loadProfilePhoto() {

    if (!profileStudent) {
        setDefaultProfilePhoto();
        return;
    }

    const photoFileId =
        profileStudent.photoUrl;

    if (
        !photoFileId ||
        typeof photoFileId !== "string"
    ) {

        setDefaultProfilePhoto();
        return;
    }

    try {

        const photoUrl =
            storage.getFilePreview(
                PROFILE_PHOTOS_BUCKET_ID,
                photoFileId,
                800,
                800
            );

        setStudentPhoto(
            photoUrl
        );

    } catch (error) {

        console.error(
            "Failed to load profile photo:",
            error
        );

        setDefaultProfilePhoto();
    }
}


/*==================================================
SET STUDENT PHOTO
==================================================*/

function setStudentPhoto(
    photoUrl
) {

    if (!photoUrl) {
        setDefaultProfilePhoto();
        return;
    }

    const profilePhotoElement =
        document.getElementById(
            "profilePhoto"
        );

    const photoPreviewElement =
        document.getElementById(
            "photoPreview"
        );

    if (profilePhotoElement) {

        profilePhotoElement.src =
            photoUrl;

    }

    if (photoPreviewElement) {

        photoPreviewElement.src =
            photoUrl;

    }

    updateStudentDashboardPhotos(
        photoUrl
    );
}


/*==================================================
SET DEFAULT STUDENT PHOTO
==================================================*/

function setDefaultProfilePhoto() {

    const defaultPhoto =
        DEFAULT_STUDENT_PHOTO;

    const profilePhotoElement =
        document.getElementById(
            "profilePhoto"
        );

    const photoPreviewElement =
        document.getElementById(
            "photoPreview"
        );

    if (profilePhotoElement) {

        profilePhotoElement.src =
            defaultPhoto;

    }

    if (photoPreviewElement) {

        photoPreviewElement.src =
            defaultPhoto;

    }

    updateStudentDashboardPhotos(
        defaultPhoto
    );
}


/*==================================================
UPDATE DASHBOARD PHOTOS
==================================================*/

function updateStudentDashboardPhotos(
    photoUrl
) {

    if (!photoUrl) {
        return;
    }

    const studentPhotos =
        document.querySelectorAll(
            ".student-photo"
        );

    studentPhotos.forEach(
        function (photo) {

            photo.src =
                photoUrl;

        }
    );
}


/*==================================================
PHOTO ERROR HANDLER
==================================================*/

function attachPhotoErrorHandler() {

    const photoElements =
        document.querySelectorAll(
            ".student-photo, #profilePhoto, #photoPreview"
        );

    photoElements.forEach(
        function (photo) {

            photo.addEventListener(
                "error",
                function () {

                    if (
                        photo.src.includes(
                            DEFAULT_STUDENT_PHOTO
                        )
                    ) {
                        return;
                    }

                    photo.src =
                        DEFAULT_STUDENT_PHOTO;
                }
            );

        }
    );
}


/*==================================================
SHOW PROFILE MESSAGE
==================================================*/

function showProfileMessage(
    message,
    type = "info"
) {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        message;

    profileMessage.className =
        "alert";

    if (type === "success") {

        profileMessage.classList.add(
            "alert-success"
        );

    } else if (type === "danger") {

        profileMessage.classList.add(
            "alert-danger"
        );

    } else if (type === "warning") {

        profileMessage.classList.add(
            "alert-warning"
        );

    } else {

        profileMessage.classList.add(
            "alert-info"
        );
    }

    profileMessage.hidden =
        false;
}


/*==================================================
CLEAR PROFILE MESSAGE
==================================================*/

function clearProfileMessage() {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        "";

    profileMessage.hidden =
        true;
}


/*==================================================
HIDE PROFILE LOADER
==================================================*/

function hideProfileLoader() {

    if (!profileLoader) {
        return;
    }

    profileLoader.classList.add(
        "hidden"
    );

    setTimeout(
        function () {

            profileLoader.hidden =
                true;

        },
        300
    );
}


/*==================================================
PHASE 2
PROFILE FORM
==================================================*/

const saveProfileBtn =
    document.getElementById(
        "saveProfileBtn"
    );


/*==================================================
ATTACH PROFILE FORM
==================================================*/

function attachProfileForm() {

    if (!profileForm) {
        return;
    }

    profileForm.addEventListener(
        "submit",
        handleProfileSubmit
    );
}


/*==================================================
HANDLE PROFILE SUBMIT
==================================================*/

async function handleProfileSubmit(
    event
) {

    event.preventDefault();

    clearProfileMessage();

    const fullNameInput =
        document.getElementById(
            "fullName"
        );

    if (!fullNameInput) {
        return;
    }

    const fullName =
        fullNameInput.value.trim();


    /*------------------------------------------
    VALIDATION
    ------------------------------------------*/

    if (!fullName) {

        showProfileMessage(
            "Please enter your full name.",
            "danger"
        );

        fullNameInput.focus();

        return;
    }


    if (fullName.length < 3) {

        showProfileMessage(
            "Your full name must contain at least 3 characters.",
            "danger"
        );

        fullNameInput.focus();

        return;
    }


    if (fullName.length > 100) {

        showProfileMessage(
            "Your full name is too long.",
            "danger"
        );

        fullNameInput.focus();

        return;
    }


    /*------------------------------------------
    CHECK PROFILE
    ------------------------------------------*/

    if (
        !profileStudent ||
        !profileStudent.$id
    ) {

        showProfileMessage(
            "Your student profile could not be found. Please refresh the page and try again.",
            "danger"
        );

        return;
    }


    /*------------------------------------------
    CHECK IF ANYTHING CHANGED
    ------------------------------------------*/

    const currentName =
        String(
            profileStudent.fullName || ""
        ).trim();

    if (
        fullName ===
        currentName
    ) {

        showProfileMessage(
            "There are no changes to save.",
            "warning"
        );

        return;
    }


    /*------------------------------------------
    DISABLE SAVE BUTTON
    ------------------------------------------*/

    setProfileSaveState(
        true
    );


    try {

        /*--------------------------------------
        UPDATE USERS TABLE
        --------------------------------------*/

        const updatedUser =
            await tablesDB.updateRow(
                DATABASE_ID,
                USERS_TABLE_ID,
                profileStudent.$id,
                {
                    fullName: fullName
                }
            );


        /*--------------------------------------
        UPDATE LOCAL PROFILE STATE
        --------------------------------------*/

        profileStudent = {
            ...profileStudent,
            ...updatedUser
        };


        /*--------------------------------------
        UPDATE PAGE
        --------------------------------------*/

        setProfileText(
            "profileName",
            profileStudent.fullName
        );

        setProfileValue(
            "fullName",
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE DASHBOARD NAME
        --------------------------------------*/

        updateStudentDashboardName(
            profileStudent.fullName
        );


        /*--------------------------------------
        UPDATE LOCAL STORAGE
        --------------------------------------*/

        updateStoredStudent();


        /*--------------------------------------
        SUCCESS MESSAGE
        --------------------------------------*/

        showProfileMessage(
            "Your profile has been updated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Failed to update student profile:",
            error
        );

        showProfileMessage(
            getProfileErrorMessage(
                error
            ),
            "danger"
        );

    } finally {

        setProfileSaveState(
            false
        );
    }
}


/*==================================================
PROFILE SAVE BUTTON STATE
==================================================*/

function setProfileSaveState(
    saving
) {

    if (!saveProfileBtn) {
        return;
    }

    if (saving) {

        saveProfileBtn.disabled =
            true;

        saveProfileBtn.innerHTML =
            `
            <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
            ></span>
            Saving...
            `;

    } else {

        saveProfileBtn.disabled =
            false;

        saveProfileBtn.innerHTML =
            `
            <i class="bi bi-check2-circle me-2"></i>
            Save Changes
            `;
    }
}


/*==================================================
UPDATE DASHBOARD NAME
==================================================*/

function updateStudentDashboardName(
    fullName
) {

    if (!fullName) {
        return;
    }

    const studentNames =
        document.querySelectorAll(
            ".student-name"
        );

    studentNames.forEach(
        function (element) {

            element.textContent =
                fullName;

        }
    );
}


/*==================================================
UPDATE STORED STUDENT
==================================================*/

function updateStoredStudent() {

    try {

        const storedStudent =
            localStorage.getItem(
                "aplusUser"
            );

        if (!storedStudent) {
            return;
        }

        const parsedStudent =
            JSON.parse(
                storedStudent
            );

        const updatedStudent = {
            ...parsedStudent,
            ...profileStudent
        };

        localStorage.setItem(
            "aplusUser",
            JSON.stringify(
                updatedStudent
            )
        );

    } catch (error) {

        console.error(
            "Failed to update stored student:",
            error
        );
    }
}


/*==================================================
PROFILE ERROR MESSAGE
==================================================*/

function getProfileErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to update your profile. Please try again."
        );
    }


    const errorCode =
        Number(
            error.code || 0
        );


    if (
        errorCode === 401 ||
        errorCode === 403
    ) {

        return (
            "You are not authorized to update this profile."
        );
    }


    if (
        errorCode === 404
    ) {

        return (
            "Your student profile could not be found."
        );
    }


    if (
        errorCode === 409
    ) {

        return (
            "This profile could not be updated because of a conflict. Please try again."
        );
    }


    if (
        error.message &&
        (
            error.message
                .toLowerCase()
                .includes("network")
            ||
            error.message
                .toLowerCase()
                .includes("fetch")
        )
    ) {

        return (
            "A network error occurred. Please check your internet connection and try again."
        );
    }


    return (
        error.message ||
        "Unable to update your profile. Please try again."
    );
}


/*==================================================
END OF PHASE 2
==================================================*/