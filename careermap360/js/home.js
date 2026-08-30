document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", function (event) {

    const button = event.target.closest("button");

    if (!button) return;

    // Sirf "Explore Field" buttons ko pakdo
    if (button.textContent.trim() !== "Explore Field") {
        return;
    }

    event.preventDefault();

    const card = button.closest(".field-card");

    if (!card) {
        console.error("Field card not found.");
        return;
    }

    const heading = card.querySelector("h2, h3");

    if (!heading) {
        console.error("Field name not found.");
        return;
    }

    const fieldName =
        heading.textContent.trim().toLowerCase();

    let fieldId = "";

    if (fieldName.includes("it") ||
        fieldName.includes("technology")) {

        fieldId = "it";

    } else if (
        fieldName.includes("medical") ||
        fieldName.includes("healthcare")
    ) {

        fieldId = "medical";

    } else if (
        fieldName.includes("business") ||
        fieldName.includes("management")
    ) {

        fieldId = "business";

    } else if (
        fieldName.includes("engineering")
    ) {

        fieldId = "engineering";
    }

    if (!fieldId) {
        console.error(
            "Unknown career field:",
            fieldName
        );
        return;
    }

    // Save selected field
    localStorage.setItem(
        "selectedCareerField",
        fieldId
    );

    // Directly open Choose Your Career Field page
    window.location.href =
        `field.html?field=${encodeURIComponent(fieldId)}`;
});


    // =====================================================
    // ELEMENTS
    // =====================================================

    const fieldSelect = document.getElementById("fieldSelect");
    const coursesContainer = document.getElementById("coursesContainer");
    const courseDetailsContainer =
        document.getElementById("courseDetailsContainer");
    const companiesContainer =
        document.getElementById("companiesContainer");

    const courseDetailsSection =
        document.getElementById("courseDetailsSection");

    const companiesSection =
        document.getElementById("companiesSection");

    const roadmapContainer =
        document.getElementById("roadmapContainer");

    // =====================================================
    // DATA
    // =====================================================

    let fields = [];
    let courses = [];
    let companies = [];

    // =====================================================
    // HOME PAGE - EXPLORE FIELD BUTTONS
    // =====================================================

    setupExploreFieldButtons();

    function setupExploreFieldButtons() {

        const exploreButtons =
            document.querySelectorAll(".explore-field-btn");

        exploreButtons.forEach(button => {

            button.addEventListener("click", function () {

                // Get field from data-field
                let fieldId = this.dataset.field;

                // Fallback: if data-field is not present
                if (!fieldId) {

                    const text =
                        this.closest(".field-card")?.innerText
                            .toLowerCase() || "";

                    if (text.includes("it") ||
                        text.includes("technology")) {

                        fieldId = "it";

                    } else if (text.includes("medical") ||
                               text.includes("healthcare")) {

                        fieldId = "medical";

                    } else if (text.includes("business") ||
                               text.includes("management")) {

                        fieldId = "business";

                    } else if (text.includes("engineering")) {

                        fieldId = "engineering";
                    }
                }

                if (!fieldId) {
                    console.error("Career field ID not found.");
                    return;
                }

                // Save selected field
                localStorage.setItem(
                    "selectedCareerField",
                    fieldId
                );

                // Open Choose Your Career Field page
                window.location.href =
                    `field.html?field=${encodeURIComponent(fieldId)}`;
            });
        });
    }

    // =====================================================
    // LOAD JSON DATA
    // =====================================================

    async function loadData() {

        try {

            const [
                fieldsResponse,
                coursesResponse,
                companiesResponse
            ] = await Promise.all([

                fetch("../data/fields.json"),

                fetch("../data/courses.json"),

                fetch("../data/companies.json")
            ]);

            fields = await fieldsResponse.json();

            courses = await coursesResponse.json();

            // Companies file optional
            if (companiesResponse.ok) {

                companies =
                    await companiesResponse.json();

            } else {

                companies = [];
            }

            populateFields();

            // Check whether a field was selected
            // from the Home page
            openSelectedField();

        } catch (error) {

            console.error(
                "Error loading website data:",
                error
            );

            if (fieldSelect) {

                fieldSelect.innerHTML =
                    `<option value="">
                        Unable to load career fields
                    </option>`;
            }
        }
    }

    // =====================================================
    // FIELD DROPDOWN
    // =====================================================

    function populateFields() {

        if (!fieldSelect) return;

        fieldSelect.innerHTML =
            `<option value="">
                Select a career field
            </option>`;

        fields.forEach(field => {

            const option =
                document.createElement("option");

            option.value = field.id;

            option.textContent = field.name;

            fieldSelect.appendChild(option);
        });
    }

    // =====================================================
    // OPEN FIELD FROM HOME PAGE
    // =====================================================

    function openSelectedField() {

        if (!fieldSelect) return;

        const params =
            new URLSearchParams(window.location.search);

        let selectedField =
            params.get("field");

        // If URL does not contain field,
        // check localStorage
        if (!selectedField) {

            selectedField =
                localStorage.getItem(
                    "selectedCareerField"
                );
        }

        if (!selectedField) return;

        // Automatically select field
        fieldSelect.value = selectedField;

        // Show courses automatically
        hideDetails();

        showCourses(selectedField);
    }

    // =====================================================
    // FIELD SELECT
    // =====================================================

    if (fieldSelect) {

        fieldSelect.addEventListener(
            "change",
            function () {

                const selectedField =
                    this.value;

                // Save selected field
                if (selectedField) {

                    localStorage.setItem(
                        "selectedCareerField",
                        selectedField
                    );
                }

                hideDetails();

                if (!selectedField) {

                    showMessage(
                        coursesContainer,
                        "Please select a career field above to view available courses."
                    );

                    return;
                }

                showCourses(selectedField);
            }
        );
    }

    // =====================================================
    // SHOW COURSES
    // =====================================================

    function showCourses(fieldId) {

        if (!coursesContainer) return;

        const fieldCourses =
            courses.filter(
                course => course.field === fieldId
            );

        coursesContainer.innerHTML = "";

        if (fieldCourses.length === 0) {

            showMessage(
                coursesContainer,
                "No courses available for this field yet."
            );

            return;
        }

        fieldCourses.forEach(course => {

            const card =
                document.createElement("div");

            card.className =
                "course-card";

            card.innerHTML = `

                <h3>${course.name}</h3>

                <p>
                    <strong>Duration:</strong>
                    ${course.duration}
                </p>

                <p>
                    ${course.overview}
                </p>

                <button
                    class="view-course-btn"
                    data-course-id="${course.id}">
                    View Course Information
                </button>

            `;

            coursesContainer.appendChild(card);
        });

        // Course information buttons
        const buttons =
            document.querySelectorAll(
                ".view-course-btn"
            );

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const courseId =
                        button.getAttribute(
                            "data-course-id"
                        );

                    showCourseInformation(
                        courseId
                    );
                }
            );
        });
    }

    // =====================================================
    // COURSE INFORMATION
    // =====================================================

    function showCourseInformation(courseId) {

        const course =
            courses.find(
                item => item.id === courseId
            );

        if (!course) return;

        // COURSE INFORMATION ONLY
        if (courseDetailsContainer) {

            courseDetailsContainer.innerHTML = `

                <div class="course-info-box">

                    <h3>${course.name}</h3>

                    <p>
                        <strong>Duration:</strong>
                        ${course.duration}
                    </p>

                    <p>
                        <strong>Eligibility:</strong>
                        ${course.eligibility}
                    </p>

                    <p>
                        <strong>Overview:</strong>
                        ${course.overview}
                    </p>

                    <div class="info-block">

                        <h4>Subjects</h4>

                        <ul>
                            ${createList(course.subjects)}
                        </ul>

                    </div>

                    <div class="info-block">

                        <h4>Skills</h4>

                        <ul>
                            ${createList(course.skills)}
                        </ul>

                    </div>

                    <div class="info-block">

                        <h4>Higher Studies</h4>

                        <ul>
                            ${createList(course.higherStudies)}
                        </ul>

                    </div>

                </div>

            `;
        }

        // Show course information
        if (courseDetailsSection) {

            courseDetailsSection.style.display =
                "block";
        }

        // Career opportunities
        showCareerOpportunities(course);

        // Career roadmap
        showCareerRoadmap(course);

        // Scroll
        if (courseDetailsSection) {

            courseDetailsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    // =====================================================
    // CAREER OPPORTUNITIES
    // =====================================================

    function showCareerOpportunities(course) {

        if (!companiesContainer) return;

        companiesContainer.innerHTML = "";

        let relatedCompanies = [];

        if (Array.isArray(companies)) {

            relatedCompanies =
                companies.filter(company => {

                    if (
                        company.courseId &&
                        company.courseId === course.id
                    ) {
                        return true;
                    }

                    if (
                        company.field &&
                        company.field === course.field
                    ) {
                        return true;
                    }

                    return false;
                });
        }

        // Opportunity box
        const opportunityBox =
            document.createElement("div");

        opportunityBox.className =
            "opportunities-box";

        opportunityBox.innerHTML = `

            <h3>Career Opportunities</h3>

            <div class="career-roles">

                <h4>Career Options</h4>

                <ul>
                    ${createList(course.careerOptions)}
                </ul>

            </div>

        `;

        // =================================================
        // COMPANIES
        // =================================================

        let companyNames = [];

        relatedCompanies.forEach(company => {

            if (company.name) {

                companyNames.push(
                    company.name
                );
            }

            if (
                Array.isArray(
                    company.companies
                )
            ) {

                companyNames.push(
                    ...company.companies
                );
            }
        });

        // Remove duplicates
        companyNames =
            [...new Set(companyNames)];

        // Default companies
        if (companyNames.length === 0) {

            const defaultCompanies = {

                it: [
                    "TCS",
                    "Infosys",
                    "Wipro",
                    "HCLTech",
                    "Accenture",
                    "Cognizant"
                ],

                medical: [
                    "Apollo Hospitals",
                    "Fortis Healthcare",
                    "Max Healthcare",
                    "Manipal Hospitals"
                ],

                business: [
                    "Deloitte",
                    "KPMG",
                    "EY",
                    "PwC",
                    "HDFC Bank",
                    "ICICI Bank"
                ],

                engineering: [
                    "Tata Motors",
                    "Larsen & Toubro",
                    "Mahindra",
                    "Siemens",
                    "Bosch",
                    "Tata Technologies"
                ]
            };

            companyNames =
                defaultCompanies[
                    course.field
                ] || [];
        }

        // Company box
        const companyBox =
            document.createElement("div");

        companyBox.className =
            "companies-box";

        companyBox.innerHTML = `

            <h4>
                Companies & Hiring Opportunities
            </h4>

            <ul>
                ${createList(companyNames)}
            </ul>

        `;

        opportunityBox.appendChild(
            companyBox
        );

        companiesContainer.appendChild(
            opportunityBox
        );

        if (companiesSection) {

            companiesSection.style.display =
                "block";
        }
    }

    // =====================================================
    // CAREER ROADMAP
    // =====================================================

    function showCareerRoadmap(course) {

        if (!roadmapContainer) return;

        roadmapContainer.innerHTML = `

            <div class="roadmap-box">

                <h3>Career Roadmap</h3>

                <div class="roadmap-step">

                    <span>1</span>

                    <div>

                        <h4>
                            Choose ${
                                course.shortName ||
                                course.name
                            }
                        </h4>

                        <p>
                            Understand the course,
                            eligibility and subjects.
                        </p>

                    </div>

                </div>

                <div class="roadmap-step">

                    <span>2</span>

                    <div>

                        <h4>Build Skills</h4>

                        <p>
                            Develop the important
                            skills required for this career.
                        </p>

                    </div>

                </div>

                <div class="roadmap-step">

                    <span>3</span>

                    <div>

                        <h4>
                            Gain Practical Experience
                        </h4>

                        <p>
                            Work on projects,
                            internships and practical learning.
                        </p>

                    </div>

                </div>

                <div class="roadmap-step">

                    <span>4</span>

                    <div>

                        <h4>
                            Apply for Career Opportunities
                        </h4>

                        <p>
                            Explore suitable job
                            roles and companies.
                        </p>

                    </div>

                </div>

                <div class="roadmap-step">

                    <span>5</span>

                    <div>

                        <h4>Higher Studies</h4>

                        <p>
                            Consider ${
                                createHigherStudyText(course)
                            }
                            or other relevant programmes.
                        </p>

                    </div>

                </div>

            </div>

        `;

        const roadmapSection =
            document.getElementById(
                "roadmapSection"
            );

        if (roadmapSection) {

            roadmapSection.style.display =
                "block";
        }
    }

    // =====================================================
    // CREATE LIST
    // =====================================================

    function createList(items) {

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return `
                <li>
                    Information will be updated.
                </li>
            `;
        }

        return items
            .map(
                item => `<li>${item}</li>`
            )
            .join("");
    }

    // =====================================================
    // HIGHER STUDY TEXT
    // =====================================================

    function createHigherStudyText(course) {

        if (
            !Array.isArray(
                course.higherStudies
            ) ||
            course.higherStudies.length === 0
        ) {

            return "relevant postgraduate programmes";
        }

        return course.higherStudies
            .slice(0, 2)
            .join(" or ");
    }

    // =====================================================
    // HIDE DETAILS
    // =====================================================

    function hideDetails() {

        if (courseDetailsSection) {

            courseDetailsSection.style.display =
                "none";
        }

        if (companiesSection) {

            companiesSection.style.display =
                "none";
        }

        const roadmapSection =
            document.getElementById(
                "roadmapSection"
            );

        if (roadmapSection) {

            roadmapSection.style.display =
                "none";
        }

        if (courseDetailsContainer) {

            courseDetailsContainer.innerHTML =
                "";
        }

        if (companiesContainer) {

            companiesContainer.innerHTML =
                "";
        }

        if (roadmapContainer) {

            roadmapContainer.innerHTML =
                "";
        }
    }

    // =====================================================
    // MESSAGE
    // =====================================================

    function showMessage(
        container,
        message
    ) {

        if (!container) return;

        container.innerHTML = `

            <p class="course-message">
                ${message}
            </p>

        `;
    }

    // =====================================================
    // START
    // =====================================================

    // Only load data when fieldSelect exists
    // This prevents errors on Home page.
    if (fieldSelect) {
        loadData();
    }

});