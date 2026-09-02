document.addEventListener("DOMContentLoaded", () => {

    const fieldSelect = document.getElementById("fieldSelect");
    const coursesContainer = document.getElementById("coursesContainer");
    const courseDetailsContainer = document.getElementById("courseDetailsContainer");
    const companiesContainer = document.getElementById("companiesContainer");

    const courseDetailsSection = document.getElementById("courseDetailsSection");
    const companiesSection = document.getElementById("companiesSection");
    const roadmapSection = document.getElementById("roadmapSection");
    const roadmapContainer = document.getElementById("roadmapContainer");
    const fieldsContainer = document.getElementById("fieldsContainer");

    let fields = [];
    let courses = [];
    let companies = [];

    async function loadData() {

        try {

            const responses = await Promise.all([
                fetch("../data/fields.json"),
                fetch("../data/courses.json"),
                fetch("../data/companies.json")
            ]);

            if (!responses[0].ok || !responses[1].ok || !responses[2].ok) {
                throw new Error("One or more JSON files could not be loaded.");
            }

            fields = await responses[0].json();
            courses = await responses[1].json();
            companies = await responses[2].json();

            populateFields();
            createFieldCards();

        } catch (error) {

            console.error(error);

            if (fieldSelect) {
                fieldSelect.innerHTML =
                    `<option value="">Unable to load career fields</option>`;
            }

            if (coursesContainer) {
                coursesContainer.innerHTML =
                    `<p class="course-message">
                        Data could not be loaded. Please run the project using Live Server.
                    </p>`;
            }
        }
    }

    function populateFields() {

        if (!fieldSelect) return;

        fieldSelect.innerHTML =
            `<option value="">-- Select a Career Field --</option>`;

        fields.forEach(field => {

            const option = document.createElement("option");

            option.value = field.id;
            option.textContent = field.name;

            fieldSelect.appendChild(option);
        });
    }

    function createFieldCards() {

        if (!fieldsContainer) return;

        fieldsContainer.innerHTML = "";

        fields.forEach(field => {

            const card = document.createElement("div");

            card.className = "field-card";

            card.innerHTML = `
                <h3>${escapeHTML(field.name)}</h3>

                <p>
                    ${escapeHTML(field.description)}
                </p>

                <button type="button"
                        data-field="${escapeHTML(field.id)}">
                    Explore Field
                </button>
            `;

            const button = card.querySelector("button");

            button.addEventListener("click", () => {
                selectField(field.id);
            });

            fieldsContainer.appendChild(card);
        });
    }

    function selectField(fieldId) {

        if (!fieldSelect) return;

        fieldSelect.value = fieldId;

        hideDetails();

        showCourses(fieldId);

        document.getElementById("fieldSelector").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    window.selectField = selectField;

    fieldSelect.addEventListener("change", function () {

        const selectedField = this.value;

        hideDetails();

        if (!selectedField) {

            coursesContainer.innerHTML = `
                <p class="course-message">
                    Please select a career field above to view courses.
                </p>
            `;

            return;
        }

        showCourses(selectedField);
    });

    function showCourses(fieldId) {

        const selectedField =
            fields.find(field => field.id === fieldId);

        const fieldCourses =
            courses.filter(course => course.field === fieldId);

        coursesContainer.innerHTML = "";

        if (selectedField) {

            const fieldInfo = document.createElement("div");

            fieldInfo.className = "field-info-box";

            fieldInfo.innerHTML = `
                <h3>${escapeHTML(selectedField.name)}</h3>

                <p>
                    ${escapeHTML(selectedField.description)}
                </p>

                <p>
                    <strong>${fieldCourses.length}</strong>
                    course(s) available in this field.
                </p>
            `;

            coursesContainer.appendChild(fieldInfo);
        }

        if (fieldCourses.length === 0) {

            coursesContainer.innerHTML += `
                <p class="course-message">
                    Courses for this field will be added soon.
                </p>
            `;

            return;
        }

        fieldCourses.forEach(course => {

            const card = document.createElement("div");

            card.className = "course-card";

            card.innerHTML = `
                <h3>${escapeHTML(course.name)}</h3>

                <p>
                    <strong>Duration:</strong>
                    ${escapeHTML(course.duration)}
                </p>

                <p>
                    ${escapeHTML(course.overview)}
                </p>

                <button
                    type="button"
                    class="view-course-btn"
                    data-course-id="${escapeHTML(course.id)}">
                    View Complete Information →
                </button>
            `;

            card.querySelector(".view-course-btn")
                .addEventListener("click", () => {
                    showCourseInformation(course.id);
                });

            coursesContainer.appendChild(card);
        });
    }

    function showCourseInformation(courseId) {

        const course =
            courses.find(item => item.id === courseId);

        if (!course) return;

        courseDetailsContainer.innerHTML = `

            <div class="course-info-box">

                <h3>${escapeHTML(course.name)}</h3>

                <p>
                    <strong>Duration:</strong>
                    ${escapeHTML(course.duration)}
                </p>

                <p>
                    <strong>Eligibility:</strong>
                    ${escapeHTML(course.eligibility)}
                </p>

                <p>
                    <strong>Overview:</strong>
                    ${escapeHTML(course.overview)}
                </p>

                <div class="info-block">
                    <h4>🎓 Student Requirements</h4>
                    <ul>
                        ${createList(course.requirements)}
                    </ul>
                </div>

                <div class="info-block">
                    <h4>📚 Short Syllabus / Major Subjects</h4>
                    <ul>
                        ${createList(course.subjects)}
                    </ul>
                </div>

                <div class="info-block">
                    <h4>💻 Languages / Tools</h4>

                    <div class="tags">
                        ${createTags(course.languages)}
                    </div>
                </div>

                <div class="info-block">
                    <h4>🧠 Important Skills</h4>

                    <div class="tags">
                        ${createTags(course.skills)}
                    </div>
                </div>

                <div class="info-block">
                    <h4>🚀 Career Options</h4>
                    <ul>
                        ${createList(course.careerOptions)}
                    </ul>
                </div>

                <div class="info-block">
                    <h4>🎯 Higher Studies</h4>
                    <ul>
                        ${createList(course.higherStudies)}
                    </ul>
                </div>

            </div>
        `;

        courseDetailsSection.style.display = "block";

        showCareerOpportunities(course);
        showCareerRoadmap(course);

        courseDetailsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function showCareerOpportunities(course) {

        companiesContainer.innerHTML = "";

        const related =
            companies.find(company =>
                company.courseId === course.id
            );

        const companyData = related || {
            careerAreas: [],
            companies: [],
            jobRoles: course.careerOptions || [],
            note: "Career opportunities depend on current vacancies, skills, eligibility and role requirements."
        };

        companiesContainer.innerHTML = `

            <div class="opportunities-box">

                <h3>💼 ${escapeHTML(course.name)} Career Opportunities</h3>

                <div class="career-grid">

                    <div class="career-box">

                        <h4>Career Areas</h4>

                        <ul>
                            ${createList(companyData.careerAreas)}
                        </ul>

                    </div>

                    <div class="career-box">

                        <h4>Job Roles</h4>

                        <ul>
                            ${createList(companyData.jobRoles)}
                        </ul>

                    </div>

                </div>

                <div class="career-box" style="margin-top:20px;">

                    <h4>Example Companies / Industries</h4>

                    <div class="company-list">
                        ${createCompanyPills(companyData.companies)}
                    </div>

                </div>

                <div class="note">
                    ${escapeHTML(companyData.note)}
                </div>

            </div>
        `;

        companiesSection.style.display = "block";
    }

    function showCareerRoadmap(course) {

        roadmapContainer.innerHTML = `

            <div class="roadmap-box">

                ${roadmapStep(
                    1,
                    "Choose the Course",
                    `Understand ${course.shortName || course.name}, eligibility and admission requirements.`
                )}

                ${roadmapStep(
                    2,
                    "Learn the Core Subjects",
                    `Build knowledge in ${getFirstItems(course.subjects, 3)}.`
                )}

                ${roadmapStep(
                    3,
                    "Build Important Skills",
                    `Develop ${getFirstItems(course.skills, 3)} through practice and projects.`
                )}

                ${roadmapStep(
                    4,
                    "Gain Practical Experience",
                    "Work on projects, internships, practical activities and portfolio work."
                )}

                ${roadmapStep(
                    5,
                    "Explore Career Opportunities",
                    `Target roles such as ${getFirstItems(course.careerOptions, 3)}.`
                )}

                ${roadmapStep(
                    6,
                    "Higher Studies / Specialization",
                    `Consider ${getFirstItems(course.higherStudies, 3)} or another relevant pathway.`
                )}

            </div>
        `;

        roadmapSection.style.display = "block";
    }

    function roadmapStep(number, title, text) {

        return `
            <div class="roadmap-step">

                <div class="roadmap-number">
                    ${number}
                </div>

                <div>
                    <h4>${escapeHTML(title)}</h4>

                    <p>
                        ${escapeHTML(text)}
                    </p>
                </div>

            </div>
        `;
    }

    function createList(items) {

        if (!Array.isArray(items) || items.length === 0) {
            return "<li>Information will be updated.</li>";
        }

        return items
            .map(item => `<li>${escapeHTML(item)}</li>`)
            .join("");
    }

    function createTags(items) {

        if (!Array.isArray(items) || items.length === 0) {
            return `<span class="tag">Information will be updated</span>`;
        }

        return items
            .map(item =>
                `<span class="tag">${escapeHTML(item)}</span>`
            )
            .join("");
    }

    function createCompanyPills(items) {

        if (!Array.isArray(items) || items.length === 0) {
            return `<span class="company-pill">Industry opportunities</span>`;
        }

        return [...new Set(items)]
            .map(item =>
                `<span class="company-pill">${escapeHTML(item)}</span>`
            )
            .join("");
    }

    function getFirstItems(items, count) {

        if (!Array.isArray(items) || items.length === 0) {
            return "relevant subjects and skills";
        }

        return items
            .slice(0, count)
            .join(", ");
    }

    function hideDetails() {

        courseDetailsSection.style.display = "none";
        companiesSection.style.display = "none";
        roadmapSection.style.display = "none";

        courseDetailsContainer.innerHTML = "";
        companiesContainer.innerHTML = "";
        roadmapContainer.innerHTML = "";
    }

    function escapeHTML(value) {

        if (value === undefined || value === null) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadData();

});