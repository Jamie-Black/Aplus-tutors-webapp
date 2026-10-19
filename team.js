"use strict";

/*==================================================
APLUS TUTORS
TEAM PAGE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initializeTeam
);

function initializeTeam() {
    
    renderTeamMembers();
    
}

function renderTeamMembers() {
    
    const grid =
        document.getElementById(
            "teamGrid"
        );
    
    if (!grid) return;
    
    grid.innerHTML =
        TEAM_MEMBERS
        .map(createTeamCard)
        .join("");
    
}

function createTeamCard(member) {
    
    return `

        <article class="team-card">

            <div class="team-image">

                <img
                    src="${member.image}"
                    alt="${member.name}">

            </div>

            <div class="team-content">

                <span class="team-role">

                    ${member.role}

                </span>

                <h3>

                    ${member.name}

                </h3>

                <p>

                    ${member.bio}

                </p>

                <div class="team-subjects">

                    ${member.subjects
                        .map(subject => `
                            <span>${subject}</span>
                        `)
                        .join("")}

                </div>

                <div class="team-footer">

                    <span>

                        ${member.experience}

                    </span>

                    <a
                        href="#"
                        class="team-btn">

                        View Profile

                    </a>

                </div>

            </div>

        </article>

    `;
    
}