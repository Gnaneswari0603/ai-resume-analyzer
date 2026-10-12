
"use strict";

// ==================================================
// RESUME UPLOAD & ANALYSIS
// ==================================================

const resumeForm = document.getElementById("resumeForm");
const resumeFile = document.getElementById("resumeFile");
const fileName = document.getElementById("fileName");
const statusMessage = document.getElementById("status");
const results = document.getElementById("results");


// ==================================================
// FILE NAME DISPLAY
// ==================================================

if (resumeFile) {
    resumeFile.addEventListener("change", function () {
        if (resumeFile.files && resumeFile.files.length > 0) {
            fileName.textContent = resumeFile.files[0].name;
        } else {
            fileName.textContent = "No file selected";
        }
    });
}


// ==================================================
// RESUME UPLOAD
// ==================================================

if (resumeForm) {
    resumeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!resumeFile || !resumeFile.files.length) {
            statusMessage.textContent = "Please select a resume file.";
            return;
        }

        const file = resumeFile.files[0];
        const lowerName = file.name.toLowerCase();

        if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx")) {
            statusMessage.textContent = "Please upload a PDF or DOCX file.";
            return;
        }

        const analyzeBtn = document.getElementById("analyzeBtn");
        const originalButtonText = analyzeBtn ? analyzeBtn.textContent : "";

        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = "Analyzing...";
        }

        statusMessage.textContent = "Uploading and analyzing resume...";

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/upload-resume", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Upload server error:", errorText);

                throw new Error("Upload failed with status " + response.status);
            }

            const data = await response.json();

            console.log("Resume analysis response:", data);

            displayResumeResults(data);

            statusMessage.textContent = "Resume analyzed successfully!";

        } catch (error) {
            console.error("Resume upload error:", error);

            statusMessage.textContent =
                "Something went wrong while analyzing the resume.";

        } finally {
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = originalButtonText;
            }
        }
    });
}


// ==================================================
// DISPLAY RESUME RESULTS
// ==================================================

function displayResumeResults(data) {
    if (!results) {
        return;
    }

    results.style.display = "block";

    // Filename
    const resultFilename = document.getElementById("resultFilename");

    if (resultFilename) {
        resultFilename.textContent = data.filename || "";
    }

    // Reset previous JD comparison for the new resume.
    const jdResults = document.getElementById("jdResults");

    if (jdResults) {
        jdResults.style.display = "none";
    }

    updateSkillMatchGraphic(0);

    // Skills
    const skillsContainer = document.getElementById("skillsContainer");

    if (skillsContainer) {
        skillsContainer.innerHTML = "";

        const skills = Array.isArray(data.skills) ? data.skills : [];

        skills.forEach(function (skill) {
            createSkillElement(skill, false);
        });
    }

    // Reset skill editing controls.
    const editSkillsBtn = document.getElementById("editSkillsBtn");
    const addSkillBtn = document.getElementById("addSkillBtn");
    const saveSkillsBtn = document.getElementById("saveSkillsBtn");

    if (editSkillsBtn) editSkillsBtn.style.display = "inline-block";
    if (addSkillBtn) addSkillBtn.style.display = "none";
    if (saveSkillsBtn) saveSkillsBtn.style.display = "none";

    // Resume sections
    const sectionsContainer = document.getElementById("sectionsContainer");

    if (sectionsContainer) {
        sectionsContainer.innerHTML = "";

        const sections = data.sections || {};

        Object.entries(sections).forEach(function ([sectionName, sectionContent]) {
            const sectionDiv = document.createElement("div");
            sectionDiv.className = "resume-section";

            const heading = document.createElement("h4");
            heading.textContent = sectionName;

            const content = document.createElement("p");
            content.textContent =
                typeof sectionContent === "string"
                    ? sectionContent
                    : JSON.stringify(sectionContent ?? "");

            sectionDiv.appendChild(heading);
            sectionDiv.appendChild(content);
            sectionsContainer.appendChild(sectionDiv);
        });
    }

    // Extracted text
    const resumeText = document.getElementById("resumeText");

    if (resumeText) {
        resumeText.textContent = data.text || data.resume_text || "";
    }
}


// ==================================================
// CREATE SKILL ELEMENT
// ==================================================

function createSkillElement(skill, editMode) {
    const skillsContainer = document.getElementById("skillsContainer");

    if (!skillsContainer) {
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "skill-wrapper";

    const skillTag = document.createElement("span");
    skillTag.className = "skill-tag";
    skillTag.textContent = skill;

    wrapper.appendChild(skillTag);

    if (editMode) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-skill-btn";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Delete " + skill);

        deleteButton.addEventListener("click", function () {
            wrapper.remove();
        });

        wrapper.appendChild(deleteButton);
    }

    skillsContainer.appendChild(wrapper);
}


// ==================================================
// EDIT SKILLS
// ==================================================

const editSkillsBtn = document.getElementById("editSkillsBtn");
const addSkillBtn = document.getElementById("addSkillBtn");
const saveSkillsBtn = document.getElementById("saveSkillsBtn");

let skillsEditMode = false;

if (editSkillsBtn) {
    editSkillsBtn.addEventListener("click", function () {
        skillsEditMode = true;

        const skillsContainer = document.getElementById("skillsContainer");

        if (!skillsContainer) {
            return;
        }

        const existingSkills = [];

        skillsContainer.querySelectorAll(".skill-tag").forEach(function (tag) {
            const skill = tag.textContent.trim();

            if (skill !== "") {
                existingSkills.push(skill);
            }
        });

        skillsContainer.innerHTML = "";

        existingSkills.forEach(function (skill) {
            createSkillElement(skill, true);
        });

        editSkillsBtn.style.display = "none";

        if (addSkillBtn) addSkillBtn.style.display = "inline-block";
        if (saveSkillsBtn) saveSkillsBtn.style.display = "inline-block";
    });
}


// ==================================================
// ADD NEW SKILL
// ==================================================

if (addSkillBtn) {
    addSkillBtn.addEventListener("click", function () {
        const skillsContainer = document.getElementById("skillsContainer");

        if (!skillsContainer) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "skill-wrapper";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "new-skill-input";
        input.placeholder = "Enter skill";
        input.setAttribute("aria-label", "New skill");

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-skill-btn";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", "Remove new skill");

        deleteButton.addEventListener("click", function () {
            wrapper.remove();
        });

        wrapper.appendChild(input);
        wrapper.appendChild(deleteButton);
        skillsContainer.appendChild(wrapper);

        input.focus();
    });
}


// ==================================================
// NORMALIZE SKILL NAME
// ==================================================

function normalizeSkill(skill) {
    if (!skill) {
        return "";
    }

    const normalized = skill
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const aliases = {
        "html5": "html",
        "css3": "css",
        "js": "javascript",
        "python3": "python",
        "postgres": "postgresql",
        "cpp": "c++",
        "c plus plus": "c++",
        "csharp": "c#",
        "c sharp": "c#",
        "restful api": "rest api"
    };

    return aliases[normalized] || normalized;
}


// ==================================================
// CLEAN RESUME SKILLS
// ==================================================

function cleanResumeSkills(skills) {
    const uniqueSkills = [];
    const seen = new Set();

    skills.forEach(function (skill) {
        const normalized = normalizeSkill(skill);

        if (normalized !== "" && !seen.has(normalized)) {
            seen.add(normalized);
            uniqueSkills.push(skill.trim());
        }
    });

    return uniqueSkills;
}


// ==================================================
// SAVE SKILLS
// ==================================================

if (saveSkillsBtn) {
    saveSkillsBtn.addEventListener("click", function () {
        const skillsContainer = document.getElementById("skillsContainer");

        if (!skillsContainer) {
            return;
        }

        const skills = [];

        skillsContainer.querySelectorAll(".skill-wrapper").forEach(function (wrapper) {
            const tag = wrapper.querySelector(".skill-tag");
            const input = wrapper.querySelector(".new-skill-input");

            let skill = "";

            if (tag) {
                skill = tag.textContent.trim();
            } else if (input) {
                skill = input.value.trim();
            }

            if (skill !== "") {
                skills.push(skill);
            }
        });

        const uniqueSkills = [];
        const seen = new Set();

        skills.forEach(function (skill) {
            const normalized = normalizeSkill(skill);

            if (normalized && !seen.has(normalized)) {
                seen.add(normalized);
                uniqueSkills.push(skill);
            }
        });

        skillsContainer.innerHTML = "";

        uniqueSkills.forEach(function (skill) {
            createSkillElement(skill, false);
        });

        skillsEditMode = false;

        if (editSkillsBtn) editSkillsBtn.style.display = "inline-block";
        if (addSkillBtn) addSkillBtn.style.display = "none";
        if (saveSkillsBtn) saveSkillsBtn.style.display = "none";

        console.log("Updated resume skills:", uniqueSkills);
    });
}


// ==================================================
// JOB DESCRIPTION COMPARISON
// ==================================================

const compareJDBtn = document.getElementById("compareJDBtn");
const jobDescription = document.getElementById("jobDescription");
const jdStatus = document.getElementById("jdStatus");

if (compareJDBtn) {
    compareJDBtn.addEventListener("click", async function () {
        const jd = jobDescription ? jobDescription.value.trim() : "";

        if (!jd) {
            if (jdStatus) {
                jdStatus.textContent = "Please paste a job description.";
            }
            return;
        }

        const skillsContainer = document.getElementById("skillsContainer");

        const skillTags = skillsContainer
            ? skillsContainer.querySelectorAll(".skill-tag")
            : [];

        const resumeSkills = [];

        skillTags.forEach(function (skillTag) {
            const skill = skillTag.textContent.trim();

            if (skill) {
                resumeSkills.push(skill);
            }
        });

        const cleanedResumeSkills = cleanResumeSkills(resumeSkills);

        console.log("Resume skills being compared:", cleanedResumeSkills);
        console.log("Job description:", jd);

        compareJDBtn.disabled = true;
        const originalButtonText = compareJDBtn.textContent;
        compareJDBtn.textContent = "Comparing...";

        if (jdStatus) {
            jdStatus.textContent = "Comparing resume with job description...";
        }

        try {
            const response = await fetch("/compare-jd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resume_skills: cleanedResumeSkills,
                    job_description: jd
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("JD comparison server error:", errorText);

                throw new Error("JD comparison failed with status " + response.status);
            }

            const data = await response.json();

            console.log("JD comparison result:", data);

            displayJDResults(data);

            if (jdStatus) {
                jdStatus.textContent = "Comparison completed successfully!";
            }

        } catch (error) {
            console.error("JD comparison error:", error);

            if (jdStatus) {
                jdStatus.textContent =
                    "Something went wrong while comparing the resume with the JD.";
            }

        } finally {
            compareJDBtn.disabled = false;
            compareJDBtn.textContent = originalButtonText;
        }
    });
}


// ==================================================
// DISPLAY JD RESULTS
// ==================================================

function displayJDResults(data) {
    const jdResults = document.getElementById("jdResults");

    if (!jdResults) {
        return;
    }

    jdResults.style.display = "block";

    // Animate the actual percentage returned by the backend.
    updateSkillMatchGraphic(data.match_percentage);

    // Matching skills
    const matchingSkillsContainer = document.getElementById("matchingSkills");

    if (matchingSkillsContainer) {
        matchingSkillsContainer.innerHTML = "";

        const matching = Array.isArray(data.matching_skills)
            ? data.matching_skills
            : [];

        if (matching.length > 0) {
            matching.forEach(function (skill) {
                const skillElement = document.createElement("span");
                skillElement.className = "jd-skill";
                skillElement.textContent = "✓ " + skill;

                matchingSkillsContainer.appendChild(skillElement);
            });
        } else {
            matchingSkillsContainer.textContent = "No matching skills found.";
        }
    }

    // Missing skills
    const missingSkillsContainer = document.getElementById("missingSkills");

    if (missingSkillsContainer) {
        missingSkillsContainer.innerHTML = "";

        const missing = Array.isArray(data.missing_skills)
            ? data.missing_skills
            : [];

        if (missing.length > 0) {
            missing.forEach(function (skill) {
                const skillElement = document.createElement("span");
                skillElement.className = "jd-missing-skill";
                skillElement.textContent = "✗ " + skill;

                missingSkillsContainer.appendChild(skillElement);
            });
        } else {
            missingSkillsContainer.textContent = "No missing skills.";
        }
    }
}


// ==================================================
// ANIMATED SKILL MATCH GRAPHIC
// ==================================================

function updateSkillMatchGraphic(value) {
    const percentageElement = document.getElementById("matchPercentage");
    const progressCircle = document.getElementById("matchCircleProgress");
    const backgroundCircle = document.querySelector(".match-circle-bg");

    if (!percentageElement || !progressCircle) {
        return;
    }

    const parsedValue = Number(value);
    const percentage = Number.isFinite(parsedValue)
        ? Math.max(0, Math.min(100, parsedValue))
        : 0;

    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    // Update the percentage text.
    percentageElement.textContent =
        Number.isInteger(percentage)
            ? String(percentage)
            : percentage.toFixed(1);

    // Explicitly prevent the circles from becoming filled black disks.
    progressCircle.style.fill = "none";
    progressCircle.style.strokeWidth = "10";
    progressCircle.style.strokeLinecap = "round";

    if (backgroundCircle) {
        backgroundCircle.style.fill = "none";
        backgroundCircle.style.stroke = "#e5e7eb";
        backgroundCircle.style.strokeWidth = "10";
    }

    // Set and animate the circular progress.
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset =
        `${circumference * (1 - percentage / 100)}`;

    // Change the progress color based on the match percentage.
    if (percentage >= 75) {
        progressCircle.style.stroke = "#16a34a";
    } else if (percentage >= 40) {
        progressCircle.style.stroke = "#d97706";
    } else {
        progressCircle.style.stroke = "#dc2626";
    }

    // Update accessibility information.
    const matchVisual = progressCircle.closest(".match-visual");

    if (matchVisual) {
        matchVisual.setAttribute(
            "aria-label",
            `Skill match: ${percentage}%`
        );
    }
}