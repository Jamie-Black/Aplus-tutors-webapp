// HELPER: AUTH MESSAGE
// =========================================================

function showAuthMessage(
    message,
    type = "error"
) {

    const messageBox =
        document.getElementById(
            "authMessage"
        );

    if (!messageBox) return;


    messageBox.textContent =
        message;


    messageBox.className =
        `auth-message show ${type}`;

}


// =========================================================
// HIDE AUTH MESSAGE
// =========================================================

function hideAuthMessage() {

    const messageBox =
        document.getElementById(
            "authMessage"
        );

    if (!messageBox) return;


    messageBox.textContent =
        "";

    messageBox.className =
        "auth-message";

}


// =========================================================
// PASSWORD VISIBILITY TOGGLE
// =========================================================

document
    .querySelectorAll(
        ".password-toggle"
    )
    .forEach(button => {


        button.addEventListener(
            "click",
            () => {


                const targetId =
                    button.dataset.target;


                const input =
                    document.getElementById(
                        targetId
                    );


                if (!input) return;


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (
                    input.type ===
                    "password"
                ) {


                    input.type =
                        "text";


                    if (icon) {

                        icon.classList.remove(
                            "fa-eye"
                        );

                        icon.classList.add(
                            "fa-eye-slash"
                        );

                    }


                } else {


                    input.type =
                        "password";


                    if (icon) {

                        icon.classList.remove(
                            "fa-eye-slash"
                        );

                        icon.classList.add(
                            "fa-eye"
                        );

                    }

                }

            }
        );

    });


// =========================================================
// LOGIN FORM
// =========================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {


    loginForm.addEventListener(
        "submit",
        async event => {


            event.preventDefault();


            hideAuthMessage();


            // =================================================
            // GET FORM ELEMENTS
            // =================================================

            const emailInput =
                document.getElementById(
                    "email"
                );


            const passwordInput =
                document.getElementById(
                    "password"
                );


            const rememberMe =
                document.getElementById(
                    "rememberMe"
                );


            const loginBtn =
                document.getElementById(
                    "loginBtn"
                );


            if (
                !emailInput ||
                !passwordInput ||
                !loginBtn
            ) {

                console.error(
                    "Login form elements are missing."
                );

                return;

            }


            // =================================================
            // GET VALUES
            // =================================================

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            // =================================================
            // VALIDATION
            // =================================================

            if (!email) {

                showAuthMessage(
                    "Please enter your email address."
                );

                emailInput.focus();

                return;

            }


            if (!password) {

                showAuthMessage(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;

            }


            // =================================================
            // LOADING STATE
            // =================================================

            loginBtn.disabled =
                true;


            loginBtn.classList.add(
                "loading"
            );


            try {


                // =================================================
                // STEP 1
                // CREATE APPWRITE SESSION
                // =================================================

                await account
                    .createEmailPasswordSession(
                        email,
                        password
                    );


                console.log(
                    "Appwrite login successful."
                );


                // =================================================
                // STEP 2
                // GET CURRENT AUTH USER
                // =================================================

                const authUser =
                    await account
                        .get();


                console.log(
                    "Authenticated user:",
                    authUser
                );


                // =================================================
                // STEP 3
                // FIND USER PROFILE
                // =================================================

                const userResult =
                    await tablesDB
                        .listRows(
                            DATABASE_ID,
                            USERS_TABLE_ID,
                            [
                                Query.equal(
                                    "userId",
                                    authUser.$id
                                ),
                                Query.limit(1)
                            ]
                        );


                // =================================================
                // CHECK USER PROFILE
                // =================================================

                if (
                    !userResult.rows ||
                    userResult.rows.length === 0
                ) {


                    console.error(
                        "No user profile found for:",
                        authUser.$id
                    );


                    // Logout because
                    // authentication succeeded
                    // but profile does not exist.

                    await account
                        .deleteSession(
                            "current"
                        );


                    showAuthMessage(
                        "Your account profile could not be found. Please contact Aplus Tutors support."
                    );


                    return;

                }


                const user =
                    userResult.rows[0];


                console.log(
                    "User profile:",
                    user
                );


                // =================================================
                // STEP 4
                // CHECK ACCOUNT STATUS
                // =================================================

                const status =
                    String(
                        user.status || ""
                    )
                    .toLowerCase()
                    .trim();


                if (
                    status ===
                    "inactive"
                ) {


                    await account
                        .deleteSession(
                            "current"
                        );


                    showAuthMessage(
                        "Your account has been deactivated. Please contact Aplus Tutors support."
                    );


                    return;

                }


                if (
                    status ===
                    "pending"
                ) {


                    // Keep the session or logout?
                    // We logout here for security.

                    await account
                        .deleteSession(
                            "current"
                        );


                    showAuthMessage(
                        "Your account is awaiting activation. Please complete your payment and contact Aplus Tutors."
                    );


                    return;

                }


                // =================================================
                // STEP 5
                // CHECK USER ROLE
                // =================================================

                const role =
                    String(
                        user.role || ""
                    )
                    .toLowerCase()
                    .trim();


                // =================================================
                // STORE USER INFO LOCALLY
                // =================================================
                //
                // This is NOT used for authentication.
                //
                // Appwrite remains the source of truth.
                //
                // This simply makes it easier for
                // dashboard UI to display the user's name.
                //

                localStorage.setItem(
                    "aplusUser",
                    JSON.stringify({
                        id:
                            authUser.$id,

                        profileId:
                            user.$id,

                        fullName:
                            user.fullName,

                        email:
                            user.email,

                        role:
                            role,

                        status:
                            status,

                        phone:
                            user.phone || "",

                        photoUrl:""
                    })
                );


                // =================================================
                // REMEMBER ME
                // =================================================

                if (
                    rememberMe &&
                    rememberMe.checked
                ) {


                    localStorage.setItem(
                        "aplusRememberMe",
                        "true"
                    );


                } else {


                    localStorage.removeItem(
                        "aplusRememberMe"
                    );

                }


                // =================================================
                // STEP 6
                // REDIRECT BY ROLE
                // =================================================

                showAuthMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                setTimeout(
                    () => {


                        // -----------------------------
                        // ADMIN
                        // -----------------------------

                        if (
                            role ===
                            "admin"
                        ) {


                            window.location.href =
                                "admin-dashboard.html";


                            return;

                        }


                        // -----------------------------
                        // STUDENT
                        // -----------------------------

                        if (
                            role ===
                            "student"
                        ) {


                            window.location.href =
                                "student-dashboard.html";


                            return;

                        }


                        // -----------------------------
                        // UNKNOWN ROLE
                        // -----------------------------

                        console.error(
                            "Unknown user role:",
                            role
                        );


                        showAuthMessage(
                            "Your account role is not configured correctly. Please contact Aplus Tutors support."
                        );


                    },
                    700
                );


            } catch (error) {


                console.error(
                    "Login error:",
                    error
                );


                // =================================================
                // DEFAULT ERROR
                // =================================================

                let errorMessage =
                    "Unable to login. Please try again.";


                // =================================================
                // INVALID CREDENTIALS
                // =================================================

                if (
                    error.code ===
                    401
                ) {


                    errorMessage =
                        "Invalid email or password. Please check your details and try again.";

                }


                // =================================================
                // USER NOT FOUND
                // =================================================

                else if (
                    error.code ===
                    404
                ) {


                    errorMessage =
                        "Account not found. Please check your email address.";

                }


                // =================================================
                // NETWORK ERROR
                // =================================================

                else if (
                    error.message &&
                    (
                        error.message
                            .toLowerCase()
                            .includes(
                                "network"
                            )
                    )
                ) {


                    errorMessage =
                        "Network error. Please check your internet connection and try again.";

                }


                // =================================================
                // OTHER APPWRITE ERRORS
                // =================================================

                else if (
                    error.message
                ) {


                    errorMessage =
                        error.message;

                }


                showAuthMessage(
                    errorMessage
                );


            } finally {


                // =================================================
                // RESET LOADING STATE
                // =================================================

                loginBtn.disabled =
                    false;


                loginBtn.classList.remove(
                    "loading"
                );

            }

        }
    );

}


// =========================================================
// CHECK IF USER IS ALREADY LOGGED IN
// =========================================================
//
// If a user is already logged in and visits login.html,
// we can redirect them to the appropriate dashboard.
//
// =========================================================

async function checkExistingSession() {


    try {


        const authUser =
            await account.get();


        if (
            !authUser ||
            !authUser.$id
        ) {

            return;

        }


        console.log(
            "Existing session found:",
            authUser.$id
        );


        // =====================================================
        // GET USER PROFILE
        // =====================================================

        const userResult =
            await tablesDB
                .listRows(
                    DATABASE_ID,
                    USERS_TABLE_ID,
                    [
                        Query.equal(
                            "userId",
                            authUser.$id
                        ),
                        Query.limit(1)
                    ]
                );


        if (
            !userResult.rows ||
            userResult.rows.length === 0
        ) {

            return;

        }


        const user =
            userResult.rows[0];


        const role =
            String(
                user.role || ""
            )
            .toLowerCase()
            .trim();


        const status =
            String(
                user.status || ""
            )
            .toLowerCase()
            .trim();


        // =====================================================
        // DO NOT REDIRECT INACTIVE/PENDING USERS
        // =====================================================

        if (
            status !==
            "active"
        ) {

            return;

        }


        // =====================================================
        // REDIRECT ADMIN
        // =====================================================

        if (
            role ===
            "admin"
        ) {


            window.location.href =
                "admin-dashboard.html";


            return;

        }


        // =====================================================
        // REDIRECT STUDENT
        // =====================================================

        if (
            role ===
            "student"
        ) {


            window.location.href =
                "student-dashboard.html";


            return;

        }


    } catch (error) {


        // =====================================================
        // NO ACTIVE SESSION
        // =====================================================
        //
        // This is completely normal when someone
        // visits the login page without logging in.
        //
        // We intentionally do not show an error.
        //

        console.log(
            "No active login session."
        );

    }

}


// =========================================================
// RUN SESSION CHECK
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkExistingSession();

    }
);

