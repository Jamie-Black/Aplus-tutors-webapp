// ============================================================
// APLUS TUTORS
// GLOBAL AUTHENTICATION & ROLE GUARD
// ============================================================
//
// PURPOSE:
//
// This script protects all authenticated pages.
//
// It checks:
//
// 1. Is there an active Appwrite session?
// 2. Does the authenticated user have a profile?
// 3. Is the account active?
// 4. What is the user's role?
// 5. Is the user allowed to access this page?
//
// SUPPORTED ROLES:
//
// - admin
// - student
//
// PAGE SETUP:
//
// Student page:
//
// <body data-role="student">
//
// Admin page:
//
// <body data-role="admin">
//
// Shared page accessible to both:
//
// <body data-role="authenticated">
//
// Public page:
//
// Do not include this script.
//
// ============================================================


// ============================================================
// CONFIGURATION
// ============================================================

const APLUS_LOGIN_PAGE =
    "login.html";


// ============================================================
// PAGE ACCESS MODE
// ============================================================
//
// Read the required role from the body.
//
// Examples:
//
// <body data-role="student">
//
// <body data-role="admin">
//
// <body data-role="authenticated">
//
// ============================================================

const requiredRole =
    document.body.dataset.role ||
    "authenticated";


// ============================================================
// GLOBAL GUARD STATE
// ============================================================

let currentAuthUser = null;

let currentUserProfile = null;

let guardChecking = false;


// ============================================================
// START GUARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeGuard();

    }
);


// ============================================================
// INITIALIZE GUARD
// ============================================================

async function initializeGuard() {


    // --------------------------------------------------------
    // Prevent duplicate guard execution
    // --------------------------------------------------------

    if (guardChecking) {

        return;

    }


    guardChecking = true;


    // --------------------------------------------------------
    // Hide page while authentication is being checked
    // --------------------------------------------------------

    document.documentElement.classList.add(
        "auth-checking"
    );


    try {


        console.log(
            "Aplus Tutors authentication guard started."
        );


        // ====================================================
        // STEP 1
        // GET CURRENT APPWRITE USER
        // ====================================================

        const authUser =
            await account.get();


        // ----------------------------------------------------
        // Make sure a valid user was returned
        // ----------------------------------------------------

        if (
            !authUser ||
            !authUser.$id
        ) {


            console.warn(
                "No valid Appwrite user found."
            );


            redirectToLogin();


            return;

        }


        // ----------------------------------------------------
        // Save authenticated user
        // ----------------------------------------------------

        currentAuthUser =
            authUser;


        console.log(
            "Authenticated user:",
            authUser.$id
        );


        // ====================================================
        // STEP 2
        // LOAD USER PROFILE
        // ====================================================

        const userProfile =
            await getUserProfile(
                authUser.$id
            );


        // ----------------------------------------------------
        // Check if profile exists
        // ----------------------------------------------------

        if (!userProfile) {


            console.error(
                "Authenticated user has no profile."
            );


            await safelyLogout();


            redirectToLogin();


            return;

        }


        // ----------------------------------------------------
        // Save profile globally
        // ----------------------------------------------------

        currentUserProfile =
            userProfile;


        console.log(
            "User profile:",
            userProfile
        );


        // ====================================================
        // STEP 3
        // CHECK ACCOUNT STATUS
        // ====================================================

        const status =
            String(
                userProfile.status || ""
            )
            .toLowerCase()
            .trim();


        // ----------------------------------------------------
        // Only active accounts can access dashboards
        // ----------------------------------------------------

        if (
            status !==
            "active"
        ) {


            console.warn(
                "Account is not active:",
                status
            );


            await safelyLogout();


            redirectToLogin();


            return;

        }


        // ====================================================
        // STEP 4
        // CHECK USER ROLE
        // ====================================================

        const role =
            String(
                userProfile.role || ""
            )
            .toLowerCase()
            .trim();


        // ----------------------------------------------------
        // Make sure role is valid
        // ----------------------------------------------------

        if (
            role !== "admin" &&
            role !== "student"
        ) {


            console.error(
                "Invalid user role:",
                role
            );


            await safelyLogout();


            redirectToLogin();


            return;

        }


        // ====================================================
        // STEP 5
        // CHECK PAGE ACCESS
        // ====================================================

        const hasAccess =
            checkPageAccess(
                role,
                requiredRole
            );


        // ----------------------------------------------------
        // User is not authorized for this page
        // ----------------------------------------------------

        if (!hasAccess) {


            console.warn(
                "User attempted to access an unauthorized page."
            );


            redirectToCorrectDashboard(
                role
            );


            return;

        }


        // ====================================================
        // STEP 6
        // SAVE PROFILE FOR UI
        // ====================================================

        saveUserLocally(
            authUser,
            userProfile
        );


        // ====================================================
        // STEP 7
        // GUARD SUCCESS
        // ====================================================

        console.log(
            "Authentication guard passed."
        );


        console.log(
            "User role:",
            role
        );


        console.log(
            "Page requires:",
            requiredRole
        );


        // ----------------------------------------------------
        // Show page
        // ----------------------------------------------------

        document.documentElement.classList.remove(
            "auth-checking"
        );


        // ----------------------------------------------------
        // Dispatch event
        //
        // Other scripts can listen for this event
        // before loading dashboard data.
        // ----------------------------------------------------

        document.dispatchEvent(
            new CustomEvent(
                "aplusAuthReady",
                {
                    detail: {

                        authUser:
                            authUser,

                        user:
                            userProfile,

                        role:
                            role

                    }

                }
            )
        );


    } catch (error) {


        console.error(
            "Authentication guard error:",
            error
        );


        // ====================================================
        // NO ACTIVE SESSION
        // ====================================================

        if (
            error.code === 401 ||
            error.type ===
                "user_unauthorized"
        ) {


            console.warn(
                "No active Appwrite session."
            );


            redirectToLogin();


            return;

        }


        // ====================================================
        // OTHER AUTHENTICATION ERRORS
        // ====================================================

        console.error(
            "Unexpected authentication error."
        );


        redirectToLogin();


    } finally {


        guardChecking =
            false;


        // ----------------------------------------------------
        // Remove loading state
        // ----------------------------------------------------

        document.documentElement.classList.remove(
            "auth-checking"
        );

    }

}



// ============================================================
// GET USER PROFILE
// ============================================================

async function getUserProfile(
    userId
) {


    try {


        // ====================================================
        // SEARCH USERS TABLE
        // ====================================================

        const result =
            await tablesDB.listRows(

                DATABASE_ID,

                USERS_TABLE_ID,

                [

                    Query.equal(
                        "userId",
                        userId
                    ),

                    Query.limit(
                        1
                    )

                ]

            );


        // ====================================================
        // CHECK RESULTS
        // ====================================================

        if (
            !result.rows ||
            result.rows.length === 0
        ) {


            console.warn(
                "No profile found for user:",
                userId
            );


            return null;

        }


        // ====================================================
        // RETURN FIRST PROFILE
        // ====================================================

        return result.rows[0];


    } catch (error) {


        console.error(
            "Error retrieving user profile:",
            error
        );


        throw error;

    }

}



// ============================================================
// CHECK PAGE ACCESS
// ============================================================
//
// Returns:
//
// true
//
// or
//
// false
//
// ============================================================

function checkPageAccess(
    userRole,
    pageRole
) {


    // ========================================================
    // SHARED AUTHENTICATED PAGE
    // ========================================================
    //
    // Both admin and student can access.
    //
    // Example:
    //
    // <body data-role="authenticated">
    //
    // ========================================================

    if (
        pageRole ===
        "authenticated"
    ) {


        return (
            userRole === "admin" ||
            userRole === "student"
        );

    }


    // ========================================================
    // ADMIN PAGE
    // ========================================================

    if (
        pageRole ===
        "admin"
    ) {


        return (
            userRole === "admin"
        );

    }


    // ========================================================
    // STUDENT PAGE
    // ========================================================

    if (
        pageRole ===
        "student"
    ) {


        return (
            userRole === "student"
        );

    }


    // ========================================================
    // UNKNOWN PAGE ROLE
    // ========================================================

    console.warn(
        "Unknown page role:",
        pageRole
    );


    return false;

}



// ============================================================
// REDIRECT TO LOGIN
// ============================================================

function redirectToLogin() {


    // --------------------------------------------------------
    // Prevent redirect loop
    // --------------------------------------------------------

    if (
        window.location.pathname
            .includes(
                "student-login.html"
            )
    ) {


        return;

    }


    // --------------------------------------------------------
    // Redirect
    // --------------------------------------------------------

    window.location.replace(
        APLUS_LOGIN_PAGE
    );

}



// ============================================================
// REDIRECT TO CORRECT DASHBOARD
// ============================================================

function redirectToCorrectDashboard(
    role
) {


    // ========================================================
    // ADMIN
    // ========================================================

    if (
        role ===
        "admin"
    ) {


        window.location.replace(
            "admin-dashboard.html"
        );


        return;

    }


    // ========================================================
    // STUDENT
    // ========================================================

    if (
        role ===
        "student"
    ) {


        window.location.replace(
            "student-dashboard.html"
        );


        return;

    }


    // ========================================================
    // UNKNOWN ROLE
    // ========================================================

    redirectToLogin();

}



// ============================================================
// SAFE LOGOUT
// ============================================================
//
// Used when authentication succeeds but the user's profile
// is invalid, missing, inactive, or unauthorized.
//
// ============================================================

async function safelyLogout() {


    try {


        await account.deleteSession(
            "current"
        );


        console.log(
            "Invalid session removed."
        );


    } catch (error) {


        console.warn(
            "Unable to remove session:",
            error
        );

    }

}



// ============================================================
// SAVE USER DATA LOCALLY
// ============================================================
//
// IMPORTANT:
//
// This data is NOT used to authenticate the user.
//
// Appwrite Authentication remains the source of truth.
//
// localStorage is only used for:
//
// - Displaying names
// - Displaying profile pictures
// - UI preferences
//
// ============================================================

function saveUserLocally(
    authUser,
    userProfile
) {


    const role =
        String(
            userProfile.role || ""
        )
        .toLowerCase()
        .trim();


    const status =
        String(
            userProfile.status || ""
        )
        .toLowerCase()
        .trim();


    const userData = {

    id:
        authUser.$id,

    profileId:
        userProfile.$id,

    fullName:
        userProfile.fullName ||
        authUser.name ||
        "",

    email:
        userProfile.email ||
        authUser.email ||
        "",

    role:
        role,

    status:
        status,

    department:
        userProfile.department ||
        "",

    phone:
        userProfile.phone ||
        "",

    photoUrl:
        ""

};


    localStorage.setItem(
        "aplusUser",
        JSON.stringify(
            userData
        )
    );


    // --------------------------------------------------------
    // Make available globally
    // --------------------------------------------------------

    window.aplusUser =
        userData;

}



// ============================================================
// GLOBAL LOGOUT FUNCTION
// ============================================================
//
// You can use this from any dashboard:
//
// <button onclick="aplusLogout()">
//
// Or attach it to your logout button.
//
// ============================================================

async function aplusLogout() {


    try {


        console.log(
            "Logging out..."
        );


        await account.deleteSession(
            "current"
        );


    } catch (error) {


        console.error(
            "Logout error:",
            error
        );


    } finally {


        // ----------------------------------------------------
        // Clear UI-only local data
        // ----------------------------------------------------

        localStorage.removeItem(
            "aplusUser"
        );


        localStorage.removeItem(
            "aplusRememberMe"
        );


        // ----------------------------------------------------
        // Redirect to login
        // ----------------------------------------------------

        window.location.replace(
            APLUS_LOGIN_PAGE
        );

    }

}



// ============================================================
// CHECK CURRENT AUTHENTICATION
// ============================================================
//
// Useful for other scripts.
//
// Example:
//
// const auth = await getAplusAuth();
//
// ============================================================

async function getAplusAuth() {


    try {


        const authUser =
            await account.get();


        const userProfile =
            await getUserProfile(
                authUser.$id
            );


        if (!userProfile) {


            return null;

        }


        return {

            authUser:
                authUser,

            user:
                userProfile,

            role:
                String(
                    userProfile.role ||
                    ""
                )
                .toLowerCase()
                .trim(),

            status:
                String(
                    userProfile.status ||
                    ""
                )
                .toLowerCase()
                .trim()

        };


    } catch (error) {


        console.error(
            "Unable to get Aplus authentication:",
            error
        );


        return null;

    }

}



// ============================================================
// PAGE VISIBILITY PROTECTION
// ============================================================
//
// This prevents users from seeing protected page content
// briefly while the Appwrite authentication check is running.
//
// ============================================================

const authGuardStyle =
    document.createElement(
        "style"
    );


authGuardStyle.textContent = `

    html.auth-checking body {
        visibility: hidden;
    }

`;


document.head.appendChild(
    authGuardStyle
);



// ============================================================
// HANDLE BROWSER BACK/FORWARD CACHE
// ============================================================
//
// If a user logs out and then presses the browser's
// back button, the browser may restore the dashboard
// from its cache.
//
// We check the Appwrite session again when the page
// is restored from the browser back/forward cache.
//
// ============================================================

window.addEventListener(
    "pageshow",
    event => {


        // ----------------------------------------------------
        // Check if the page was restored from browser cache
        // ----------------------------------------------------

        if (
            event.persisted
        ) {


            console.log(
                "Page restored from browser cache."
            );


            // ------------------------------------------------
            // Re-run authentication guard
            // ------------------------------------------------

            initializeGuard();

        }

    }
);


