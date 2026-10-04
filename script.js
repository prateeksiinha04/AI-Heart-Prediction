document.addEventListener("DOMContentLoaded", () => {
   
    /* ==========================================================================
       1. GLOBAL UI & PROFILE SETTINGS
       ========================================================================== */
    const profileModal = document.getElementById('profileModal');
    const topRightProfile = document.querySelector('.profile-avatar'); 
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // Desktop Photo Upload Logic
    const desktopPhotoUpload = document.getElementById('desktopPhotoUpload');
    if (desktopPhotoUpload) {
        desktopPhotoUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 2.5 * 1024 * 1024) {
                    alert('Photo is too large! Please select an image under 2.5MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64Image = e.target.result;
                    try {
                        localStorage.setItem('userPhoto', base64Image);
                        updateUI(null, base64Image, null);
                        const uploadLabel = document.querySelector('label[for="desktopPhotoUpload"]');
                        if (uploadLabel) {
                            const originalText = uploadLabel.innerHTML;
                            uploadLabel.innerHTML = '<i class="fa-solid fa-check" style="color: green;"></i> Uploaded!';
                            setTimeout(() => { uploadLabel.innerHTML = originalText; }, 2000);
                        }
                    } catch (error) {
                        console.error("Storage Error:", error);
                        alert("Could not save the image. Your browser storage might be full.");
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (topRightProfile) {
        topRightProfile.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'profile-settings.html';
        });
    }

    // --- Helper Function: Calculate Age from ISO Date String (YYYY-MM-DD) ---
    function calculateAge(dobString) {
        if (!dobString) return null;
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function updateUI(name, photoUrl, email) {
        const savedName = name || localStorage.getItem('userName') || "Guest";
        const savedPhoto = photoUrl || localStorage.getItem('userPhoto') || "https://i.pravatar.cc/100?img=32";
        const savedEmail = email || localStorage.getItem('userEmail') || "";
        const savedSex = localStorage.getItem('userSex') || "Male";
        const savedPhone = localStorage.getItem('userPhone') || "+91 98765 43210";

        // Retrieve stored DOB and compute age
        const savedDOB = localStorage.getItem('userDOB') || "1990-05-16";
        const computedAge = calculateAge(savedDOB);

        const headerGreeting = document.querySelector('.username-highlight');
        if (headerGreeting) headerGreeting.innerText = savedName;

        const topProfileName = document.querySelector('.profile-name');
        if (topProfileName) topProfileName.innerHTML = `${savedName.split(' ')[0]} <i class="fa-solid fa-chevron-down"></i>`;

        const displayName = document.getElementById('displayName');
        if (displayName) displayName.innerText = savedName;

        const displaySex = document.getElementById('displaySex');
        if (displaySex) displaySex.innerText = savedSex;

        const displayPhone = document.getElementById('displayPhone');
        if (displayPhone) displayPhone.innerText = savedPhone;

        const allAvatars = document.querySelectorAll('.profile-avatar img, .large-avatar, #settingsAvatar, #topAvatar');
        allAvatars.forEach(img => img.src = savedPhoto);
        
        const nameInput = document.getElementById('profileName');
        if (nameInput) nameInput.value = savedName;

        const emailInput = document.getElementById('profileEmail');
        if (emailInput) emailInput.value = savedEmail;

        const sexInput = document.getElementById('profileSex');
        if (sexInput) sexInput.value = savedSex;

        const phoneInput = document.getElementById('profilePhone');
        if (phoneInput) phoneInput.value = savedPhone;

        // Sync DOB & Age across Patient Profile (profile-settings.html)
        const displayDOB = document.getElementById('displayDOB');
        if (displayDOB) {
            displayDOB.innerText = `DOB: ${savedDOB} (${computedAge ? computedAge + 'y' : '--'})`;
        }

        const profileDOBInput = document.getElementById('profileDOB');
        if (profileDOBInput) {
            profileDOBInput.value = savedDOB;
        }

        // Auto Pre-fill Full Name & Age in Health Prediction Form (heart-prediction.html)
        const formNameInput = document.getElementById('name') || document.querySelector('input[name="name"]');
        if (formNameInput && !formNameInput.value) {
            formNameInput.value = savedName;
        }

        const formAgeInput = document.getElementById('age') || document.querySelector('input[name="age"]');
        if (formAgeInput && !formAgeInput.value && computedAge) {
            formAgeInput.value = computedAge;
        }
    }

    updateUI(null, null, null);

    // Preview age changes while editing; profile values are committed with Save Updates.
    const profileDOBInput = document.getElementById('profileDOB');
    if (profileDOBInput) {
        profileDOBInput.addEventListener('change', (e) => {
            const newDOB = e.target.value;
            const displayDOB = document.getElementById('displayDOB');
            const computedAge = calculateAge(newDOB);
            if (displayDOB) {
                displayDOB.innerText = `DOB: ${newDOB || '--'} (${computedAge !== null ? computedAge + 'y' : '--'})`;
            }
        });
    }

    window.addEventListener('storage', (event) => {
        if (event.key === 'userName' || event.key === 'userPhoto' || event.key === 'userEmail' || event.key === 'userDOB' || event.key === 'userSex' || event.key === 'userPhone' || event.key === 'healthPredictProfile') {
            updateUI(null, null, null);
            if (event.key === 'healthPredictProfile' && profileForm) {
                loadProfileFields();
            }
        }
    });

    /* ==========================================================================
       2. AUTH / LOGIN PAGE LOGIC
       ========================================================================== */

    const loginForm = document.querySelector('.login-form');
    const altLoginBtn = document.querySelector('.btn-alt-login'); 

    if (loginForm) {
        const togglePassword = document.querySelector('.toggle-password');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                togglePassword.innerHTML = type === 'password' ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
                togglePassword.style.color = type === 'password' ? 'var(--text-muted)' : 'var(--primary)';
            });
        }

        let errorMsg = loginForm.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.cssText = 'color: #ef4444; font-size: 0.85rem; font-weight: 500; text-align: center; margin-bottom: 0.5rem; display: none;';
            const submitBtn = loginForm.querySelector('.btn-submit');
            loginForm.insertBefore(errorMsg, submitBtn);
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                errorMsg.innerText = "Please enter a valid email address.";
                errorMsg.style.display = 'block';
                return; 
            }
            if (password.length < 6) {
                errorMsg.innerText = "Password must be at least 6 characters long.";
                errorMsg.style.display = 'block';
                return; 
            }

            errorMsg.style.display = 'none';

            if (emailInput && emailInput.value) {
                localStorage.setItem('userEmail', emailInput.value);
                let derivedName = emailInput.value.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                localStorage.setItem('userName', derivedName);
                if (!localStorage.getItem('userPhoto')) localStorage.setItem('userPhoto', 'https://i.pravatar.cc/100?img=32'); 
            }

            const submitBtn = loginForm.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
                submitBtn.style.opacity = '0.8';
                submitBtn.disabled = true;
            }
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        });        
    }

    if (altLoginBtn) {
        altLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('userEmail', 'demo.patient@healthpredict.com');
            localStorage.setItem('userName', 'Demo Patient');
            localStorage.setItem('userPhoto', 'https://i.pravatar.cc/150?img=11'); 

            altLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading Dashboard...';
            altLoginBtn.style.opacity = '0.8';
            altLoginBtn.disabled = true;
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        });
    }

    /* ==========================================================================
       OFFICIAL GOOGLE AUTHENTICATION LOGIC (index.html)
       ========================================================================== */

    function handleCredentialResponse(response) {
        // Decode the JWT token
        const responsePayload = JSON.parse(atob(response.credential.split('.')[1]));

        // Save REAL Google data
        localStorage.setItem('userName', responsePayload.name);
        localStorage.setItem('userEmail', responsePayload.email);
        localStorage.setItem('userPhoto', responsePayload.picture);

        // Save DOB from payload (or set/retain stored DOB)
        const userDOB = responsePayload.birthdate || localStorage.getItem('userDOB') || "1990-05-16";
        localStorage.setItem('userDOB', userDOB);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }

    window.onload = function () {
        if (typeof google !== 'undefined' && google.accounts) {
            // 1. Initialize Google Identity
            google.accounts.id.initialize({
                client_id: "66445890031-ftlfc1mu9g84josa1ud0cu2nf97ndgfg.apps.googleusercontent.com",
                callback: handleCredentialResponse
            });

            const googleContainer = document.getElementById('googleButtonContainer');
            
            // 2. Find main blue Login button to match measurements
            const mainLoginButton = document.querySelector('.btn-submit');
            
            // 3. Measure width
            const targetWidth = mainLoginButton ? mainLoginButton.offsetWidth : 350;

            if (googleContainer) {
                google.accounts.id.renderButton(
                    googleContainer,
                    { 
                        theme: "outline", 
                        size: "large", 
                        shape: "rectangular",
                        width: targetWidth,
                        type: "standard",
                        text: "signin_with"
                    }
                );
            }
        }
    };

    // --- Interactive Welcome Toast Logic ---
    const userName = localStorage.getItem('userName');
    const userPhoto = localStorage.getItem('userPhoto');
    const userDOB = localStorage.getItem('userDOB');
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');

    if (window.location.pathname.includes('dashboard') && userName && !justLoggedIn) {
        const userAge = calculateAge(userDOB);
        const ageText = userAge ? ` (${userAge}y)` : '';

        // 1. Create the toast element
        const toast = document.createElement('div');
        toast.className = 'welcome-toast';
        toast.innerHTML = `
            <img src="${userPhoto}" class="toast-img" alt="Profile">
            <div class="toast-content">
                <h4>Welcome back, ${userName.split(' ')[0]}${ageText}!</h4>
                <p>Authentication successful.</p>
            </div>
        `;
        
        // 2. Append to body and trigger animation
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 3. Slide back out after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            sessionStorage.setItem('justLoggedIn', 'true');
        }, 4000);
    }

    /* ==========================================================================
       3. DASHBOARD PAGE LOGIC (Real-time Vitals, Assessment & Telemetry Chart)
       ========================================================================== */
    if (document.body.classList.contains('dashboard-page')) {
        const heartRateEl = document.getElementById('dashHeartRate');
        const bpEl = document.getElementById('dashBloodPressure');
        const bloodSugarEl = document.getElementById('dashBloodSugar');
        const assessmentPill = document.getElementById('dashAssessmentPill');
        const assessmentText = document.getElementById('dashAssessmentText');
        const historyEmptyState = document.getElementById('healthTrendEmpty');
        let history = [];
        try {
            const storedHistory = JSON.parse(localStorage.getItem('healthHistory') || '[]');
            if (!Array.isArray(storedHistory)) {
                throw new TypeError('Saved health history must be an array.');
            }
            history = storedHistory.filter(record => record && record.isManual !== true && record.is_manual !== true);
        } catch (error) {
            console.error('Could not load dashboard assessment history:', error);
            if (historyEmptyState) {
                historyEmptyState.textContent = 'Your assessment history could not be loaded. Check browser storage and refresh the page.';
                historyEmptyState.hidden = false;
            }
        }

        const latestRecord = history[0] || null;
        const latestRiskScore = latestRecord ? Number(latestRecord.score ?? latestRecord.riskScore) : null;
        const latestVitals = latestRecord && latestRecord.vitals ? latestRecord.vitals : {};
        const setMetric = (element, value, unit = '') => {
            if (!element) return;
            element.replaceChildren();
            if (value === null || value === undefined || value === '') {
                element.textContent = 'Not available';
                return;
            }
            element.append(document.createTextNode(String(value)));
            if (unit) {
                const unitLabel = document.createElement('span');
                unitLabel.style.cssText = 'font-size: 1rem; color: #647b91; font-weight: 500;';
                unitLabel.textContent = unit;
                element.appendChild(unitLabel);
            }
        };

        setMetric(heartRateEl, latestVitals.hr, 'bpm');
        setMetric(bpEl, latestVitals.bp, 'mmHg');

        const fastingSugar = latestRecord?.fastingBloodSugar ?? latestVitals.fastingBloodSugar;
        const legacySugar = latestVitals.bs;
        if (fastingSugar !== undefined && fastingSugar !== null) {
            setMetric(bloodSugarEl, Number(fastingSugar) === 1 ? 'Above 120 mg/dL' : 'Below 120 mg/dL');
        } else if (legacySugar === 140 || legacySugar === '140') {
            setMetric(bloodSugarEl, 'Above 120 mg/dL');
        } else if (legacySugar === 95 || legacySugar === '95') {
            setMetric(bloodSugarEl, 'Below 120 mg/dL');
        }

        if (latestRecord && Number.isFinite(latestRiskScore) && assessmentPill && assessmentText) {
            const riskInfo = getRiskCategory(latestRiskScore);
            const displayedScore = Math.round(latestRiskScore);
            assessmentPill.textContent = `${riskInfo.label.toUpperCase()} (${displayedScore}%)`;
            assessmentPill.style.background = riskInfo.bgColor;
            assessmentPill.style.color = riskInfo.textColor;
            assessmentText.textContent = `Estimated health risk: ${riskInfo.label.toLowerCase()} (${displayedScore}%), recorded ${latestRecord.date || 'on an earlier date'}. Discuss this result with your healthcare professional; it is not a diagnosis.`;
        }

// Initialize Toggleable Telemetry Chart
const healthChartCanvas = document.getElementById('healthTrendChart');
if (healthChartCanvas && typeof Chart !== 'undefined') {
    const ctx = healthChartCanvas.getContext('2d');
    const chartRecords = history.slice(0, 5).reverse();
    const labels = chartRecords.map(record => record.date || 'Assessment');
    const riskPoints = chartRecords.map(record => {
        const score = Number(record.score ?? record.riskScore);
        return Number.isFinite(score) ? score : null;
    });
    const hrPoints = chartRecords.map(record => {
        const value = Number(record.vitals?.hr);
        return Number.isFinite(value) ? value : null;
    });
    const bpPoints = chartRecords.map(record => {
        const value = Number(record.vitals?.bp);
        return Number.isFinite(value) ? value : null;
    });

    if (chartRecords.length === 0) {
        healthChartCanvas.hidden = true;
        if (historyEmptyState) historyEmptyState.hidden = false;
        document.querySelectorAll('.toggle-pill').forEach(button => { button.disabled = true; });
    }

    // Dataset Configurations
    const metricsConfig = {
        risk: {
            label: 'Health Risk Estimate (%)',
            data: riskPoints,
            color: '#0e7490',
            bgColor: 'rgba(14, 116, 144, 0.12)',
            min: 0,
            max: 100,
            unit: '%'
        },
        hr: {
            label: 'Maximum Heart Rate (BPM)',
            data: hrPoints,
            color: '#0f172a',
            bgColor: 'rgba(15, 23, 42, 0.1)',
            min: 40,
            max: 180,
            unit: ' BPM'
        },
        bp: {
            label: 'Resting Blood Pressure (mmHg)',
            data: bpPoints,
            color: '#22d3ee',
            bgColor: 'rgba(34, 211, 238, 0.14)',
            min: 80,
            max: 200,
            unit: ' mmHg'
        }
    };

    let activeMetric = 'risk';

    // Create Chart with initial Risk Profile dataset
    const trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: metricsConfig[activeMetric].label,
                data: metricsConfig[activeMetric].data,
                borderColor: metricsConfig[activeMetric].color,
                backgroundColor: metricsConfig[activeMetric].bgColor,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${context.dataset.label}: ${context.raw}${metricsConfig[activeMetric].unit}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: metricsConfig[activeMetric].min,
                    max: metricsConfig[activeMetric].max,
                    ticks: {
                        callback: value => activeMetric === 'risk' ? `${value}%` : value
                    },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    grid: { color: '#f1f5f9' }
                }
            }
        }
    });

    // Handle Toggle Button Clicks
    const togglePills = document.querySelectorAll('.toggle-pill');
    togglePills.forEach(pill => {
        pill.addEventListener('click', function() {
            activeMetric = this.getAttribute('data-metric');
            const targetConfig = metricsConfig[activeMetric];

            togglePills.forEach(p => {
                p.classList.toggle('active', p === this);
            });

            // Update Chart Dataset & Axis Bounds Smoothly
            trendChart.data.datasets[0].label = targetConfig.label;
            trendChart.data.datasets[0].data = targetConfig.data;
            trendChart.data.datasets[0].borderColor = targetConfig.color;
            trendChart.data.datasets[0].backgroundColor = targetConfig.bgColor;
            trendChart.options.scales.y.min = targetConfig.min;
            trendChart.options.scales.y.max = targetConfig.max;

            trendChart.update();
        });
    });
}
}

    /* ==========================================================================
       4. HEALTH RECORDS LOGIC (Dynamic Sync & Live Search)
       ========================================================================== */
    const recordsPage = document.querySelector('.records-page');
    const recordsGrid = document.getElementById('recordsGrid');
    const searchInput = document.getElementById('searchInput');

    if (recordsPage || recordsGrid) {
        
        const renderHealthRecords = (filterQuery = '') => {
            const storedHistory = JSON.parse(localStorage.getItem('healthHistory') || '[]');
            const history = Array.isArray(storedHistory)
                ? storedHistory.filter(record => record && record.isManual !== true && record.is_manual !== true)
                : [];
            const query = filterQuery.toLowerCase().trim();

            const filteredHistory = history.filter(rec => {
                const title = (rec.statusText || 'AI Prediction').toLowerCase();
                const date = (rec.date || '').toLowerCase();
                const rawScore = Number(rec.score ?? rec.riskScore);
                const score = Number.isFinite(rawScore) ? `${Math.round(rawScore)}%` : '';
                const riskLabel = getRiskCategory(rawScore).label.toLowerCase();

                return title.includes(query) || date.includes(query) || score.includes(query) || riskLabel.includes(query);
            });

            if (!recordsGrid) return;

            if (filteredHistory.length === 0) {
                recordsGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <h3>No health records found</h3>
                        <p style="color: var(--text-muted); margin-top: 0.5rem;">Complete a health assessment to add a record, or try changing your search.</p>
                    </div>
                `;
                return;
            }

            recordsGrid.innerHTML = filteredHistory.map(rec => {
                const rawScore = Number(rec.score ?? rec.riskScore);
                const hasScore = Number.isFinite(rawScore);
                const score = hasScore ? rawScore : null;
                const risk = getRiskCategory(score);
                const vitals = rec.vitals || {};
                const hr = vitals.hr ? `${vitals.hr} bpm` : 'Not available';
                const bp = vitals.bp ? `${vitals.bp} mmHg` : 'Not available';
                const cholesterol = vitals.cholesterol || rec.cholesterol;
                const fastingSugar = rec.fastingBloodSugar ?? vitals.fastingBloodSugar;
                const legacySugar = vitals.bs;
                const bloodSugarStatus = fastingSugar !== undefined && fastingSugar !== null
                    ? Number(fastingSugar) === 1 ? 'Above 120 mg/dL' : 'Below 120 mg/dL'
                    : legacySugar === 140 || legacySugar === '140'
                        ? 'Above 120 mg/dL'
                        : legacySugar === 95 || legacySugar === '95'
                            ? 'Below 120 mg/dL'
                            : 'Not available';

                return `
                    <div class="record-card">
                        <div class="record-header">
                            <span class="record-date"><i class="fa-regular fa-calendar"></i> ${rec.date || 'Recent'}</span>
                            <span style="font-size: 0.8rem; padding: 0.25rem 0.65rem; border-radius: 9999px; font-weight: 700; background: ${risk.bgColor}; color: ${risk.textColor};">
                                ${hasScore ? `${risk.label.toUpperCase()} (${Math.round(score)}%)` : 'ASSESSMENT'}
                            </span>
                        </div>
                        <div class="record-body">
                            <div class="record-type" style="color: var(--primary); font-size: 0.8rem; font-weight: 600;"><i class="fa-solid fa-heart-pulse"></i> Health Risk Estimate</div>
                            <div class="record-title" style="font-size: 1.1rem; font-weight: 700; margin: 0.4rem 0 1rem 0;">${rec.statusText || 'Heart health assessment'}</div>
                            <div class="vitals-mini-grid">
                                <div class="vital-item">
                                    <span class="vital-lbl">Maximum Heart Rate</span>
                                    <span class="vital-val">${hr}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-lbl">Resting Blood Pressure</span>
                                    <span class="vital-val">${bp}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-lbl">Fasting Blood Sugar</span>
                                    <span class="vital-val">${bloodSugarStatus}</span>
                                </div>
                                <div class="vital-item">
                                    <span class="vital-lbl">Cholesterol</span>
                                    <span class="vital-val">${cholesterol ? `${cholesterol} mg/dL` : 'Not available'}</span>
                                </div>
                            </div>
                        </div>
                        <div class="record-footer">
                            <button class="btn-delete-record" data-id="${rec.id}" style="padding: 0.5rem 1rem; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer; flex: 1; font-weight: 600;">
                                <i class="fa-solid fa-trash-can"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        };

        renderHealthRecords();

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderHealthRecords(e.target.value);
            });
        }

        recordsGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-record');
            if (deleteBtn) {
                const recordId = deleteBtn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this record?')) {
                    let history = JSON.parse(localStorage.getItem('healthHistory')) || [];
                    history = history.filter(rec => rec.id !== recordId);
                    localStorage.setItem('healthHistory', JSON.stringify(history));
                    renderHealthRecords(searchInput ? searchInput.value : '');
                }
            }
        });
    }

    function getRiskCategory(score) {
        const numScore = parseFloat(score);
        if (numScore >= 60) {
            return { label: 'High Risk Estimate', bgColor: '#fee2e2', textColor: '#b91c1c', description: 'Consider discussing this result with your healthcare professional.' };
        } else if (numScore >= 30) {
            return { label: 'Moderate Risk Estimate', bgColor: '#fef3c7', textColor: '#92400e', description: 'Some factors may be worth discussing with your healthcare professional.' };
        } else {
            return { label: 'Low Risk Estimate', bgColor: '#dcfce7', textColor: '#15803d', description: 'Continue routine checkups and healthy habits.' };
        }
    }    

    /* ==========================================================================
       5. HEART PREDICTION FORM LOGIC
       ========================================================================== */
    const riskForm = document.getElementById('riskForm') || document.getElementById('heartRiskForm'); 
    if (riskForm) {
        riskForm.addEventListener('submit', function(e) {
            e.preventDefault(); 

            if (!this.checkValidity()) {
                const requiredFields = this.querySelectorAll('[required]');
                let missing = [];
                requiredFields.forEach(field => {
                    if (!field.value) {
                        const label = field.closest('.form-group, .form-group-item, .form-element')?.querySelector('label');
                        if (label) missing.push(label.innerText.replace('*', '').trim());
                    }
                });
                alert("Please complete the following required fields:\n\n• " + missing.join('\n• '));
                return;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Data...';
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.8';
            }

            const getValue = (identifier) => {
                const el = document.getElementById(identifier) || riskForm.querySelector(`[name="${identifier}"]`);
                return el ? el.value : '';
            };

            const name = getValue('name') || localStorage.getItem('userName') || 'Patient';
            const age = parseInt(getValue('age')) || 0;
            const gender = getValue('gender');
            const cp = parseInt(getValue('chestPainType') || getValue('chestPain')) || 0;
            const bp = parseInt(getValue('restingBP') || getValue('bp')) || 120; 
            const chol = parseInt(getValue('cholesterol')) || 0;
            const fbs = parseInt(getValue('fastingBloodSugar') || getValue('fbs')) || 0;
            const restingECG = parseInt(getValue('restingECG')) || 0;
            const thalach = parseInt(getValue('maxHeartRate') || getValue('thalach')) || 75; 
            const exang = parseInt(getValue('exerciseAngina') || getValue('exang')) || 0;
            const oldpeak = parseFloat(getValue('oldpeak')) || 0.0;
            const slope = parseInt(getValue('slope')) || 1;
            const majorVessels = parseInt(getValue('majorVessels')) || 0;
            const thalassemia = parseInt(getValue('thalassemia')) || 1;

            let riskScore = 10; 
            if (age > 50) riskScore += 12; 
            if (age > 65) riskScore += 8; 
            if (gender === 'male') riskScore += 8;
            if (cp > 0) riskScore += 18; 
            if (bp > 130) riskScore += 10; 
            if (bp > 150) riskScore += 15;
            if (chol > 240) riskScore += 12; 
            if (fbs === 1 || fbs === '1') riskScore += 10; 
            if (thalach < 130) riskScore += 8; 
            if (exang === 1 || exang === '1') riskScore += 15; 
            if (oldpeak > 1.5) riskScore += 10;
            riskScore = Math.min(riskScore, 98);

            let statusText = "", statusColor = "", statusIcon = "", recommendation = "", colorClass = "", badgeClass = "", badgeText = "";

            if (riskScore < 30) {
                statusText = "Lower Risk Estimate"; statusColor = "#10b981"; statusIcon = "fa-shield-heart"; colorClass = "text-green"; badgeClass = "light-green"; badgeText = "Lower";
                recommendation = "This estimate is in the lower range. Keep up healthy habits and continue routine checkups with your healthcare professional.";
            } else if (riskScore < 60) {
                statusText = "Moderate Risk Estimate"; statusColor = "#f59e0b"; statusIcon = "fa-triangle-exclamation"; colorClass = "text-orange"; badgeClass = "light-orange"; badgeText = "Moderate";
                recommendation = "This estimate is in the moderate range. Consider discussing the result and your blood pressure or cholesterol with your healthcare professional.";
            } else {
                statusText = "Higher Risk Estimate"; statusColor = "#ef4444"; statusIcon = "fa-truck-medical"; colorClass = "text-red"; badgeClass = "light-red"; badgeText = "Higher";
                recommendation = "This estimate is in the higher range. Please discuss the result with a healthcare professional, who can interpret it alongside your medical history.";
            }

            const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            const newRecord = { 
                id: 'rec_' + Date.now(),
                date: today, 
                score: riskScore, 
                statusText: statusText, 
                statusColorClass: colorClass, 
                badgeClass: badgeClass, 
                badgeText: badgeText,
                vitals: { hr: thalach, bp: bp, cholesterol: chol, fastingBloodSugar: fbs },
                isManual: false 
            };
            
            let history = JSON.parse(localStorage.getItem('healthHistory')) || [];
            history.unshift(newRecord); 
            if (history.length > 20) history.pop();
            localStorage.setItem('healthHistory', JSON.stringify(history));

            const payload = {
                name: name,
                age: age, 
                gender: gender, 
                chestPainType: cp, 
                restingBP: bp, 
                cholesterol: chol, 
                fastingBloodSugar: fbs,
                restingECG: restingECG,
                maxHeartRate: thalach,
                exerciseAngina: exang,
                oldpeak: oldpeak,
                slope: slope,
                majorVessels: majorVessels,
                thalassemia: thalassemia,
                riskScore: riskScore, 
                statusText: statusText
            };

            fetch('http://localhost:5001/api/save-prediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) throw new Error("Backend response error");
                return response.json();
            })
            .then(data => {
                showPredictionSuccess(riskScore, statusText, statusColor, statusIcon, recommendation);
            })
            .catch(error => {
                console.warn('MongoDB endpoint unreachable. Saved locally instead:', error);
                showPredictionSuccess(riskScore, statusText, statusColor, statusIcon, recommendation);
            });
        });

        function showPredictionSuccess(riskScore, statusText, statusColor, statusIcon, recommendation) {
            const formCard = riskForm.closest('.prediction-form-card') || riskForm.closest('.container') || riskForm.closest('.form-card') || riskForm.closest('.form-workspace');
            if (formCard) {
                formCard.innerHTML = `
                    <div style="text-align: center; padding: 2rem 1rem; animation: fadeIn 0.5s ease;">
                        <div style="width: 80px; height: 80px; background: ${statusColor}20; color: ${statusColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem auto;"><i class="fa-solid ${statusIcon}"></i></div>
                        <h2 style="font-size: 1.5rem; color: var(--text-dark); margin-bottom: 0.5rem;">Assessment Complete</h2>
                        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem;">Your assessment is complete. This result is saved in this browser.</p>
                        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                            <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Health Risk Estimate</span>
                            <div style="font-size: 4rem; font-weight: 800; color: ${statusColor}; line-height: 1;">${Math.round(riskScore)}%</div>
                            <div style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: ${statusColor}15; color: ${statusColor}; font-weight: 600; border-radius: 20px; font-size: 0.9rem;">${statusText}</div>
                        </div>
                        <div style="text-align: left; background: #eff6ff; color: #1e293b; padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--primary); font-size: 0.9rem; line-height: 1.5;">
                            <strong><i class="fa-solid fa-user-doctor"></i> Recommendation:</strong><br>${recommendation}
                        </div>
                        <p style="margin-top: 1rem; color: var(--text-muted); font-size: 0.85rem; line-height: 1.5;">This estimate is provided for informational purposes and is not a diagnosis. Please discuss health concerns and next steps with your healthcare professional.</p>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                            <button onclick="window.location.reload()" style="background: white; border: 1px solid var(--border-color); color: var(--text-dark); padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                <i class="fa-solid fa-rotate-left"></i> Run Again
                            </button>
                            <button onclick="window.location.href='dashboard.html'" style="background: var(--primary); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                View Dashboard <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    /* ==========================================================================
       7. PROFILE SETTINGS LOGIC
       ========================================================================== */
    const profilePage = document.querySelector('.profile-page');
    const profileForm = document.getElementById('clinicalProfileForm');
    const profileSaveStatus = document.getElementById('profileSaveStatus');
    const profileStorageKey = 'healthPredictProfile';

    function setProfileStatus(message, isError = false) {
        if (!profileSaveStatus) return;
        profileSaveStatus.textContent = message;
        profileSaveStatus.classList.toggle('is-error', isError);
    }

    function loadProfileFields() {
        if (!profileForm) return;
        try {
            const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey) || '{}');
            profileForm.querySelectorAll('[data-profile-field]').forEach((field) => {
                const value = savedProfile[field.dataset.profileField];
                if (value !== undefined && value !== null) {
                    field.value = value;
                }
            });
        } catch (error) {
            console.error('Could not load saved profile details:', error);
            setProfileStatus('Saved profile details could not be loaded. Check browser storage and reload.', true);
        }
    }

    if (profilePage && profileForm && saveProfileBtn) {
        loadProfileFields();
        if (profileDOBInput) {
            const today = new Date();
            const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 10);
            profileDOBInput.max = localToday;
        }

        profileForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!profileForm.reportValidity()) return;

            const profileData = {};
            profileForm.querySelectorAll('[data-profile-field]').forEach((field) => {
                profileData[field.dataset.profileField] = field.value.trim();
            });
            profileData.savedAt = new Date().toISOString();

            const originalText = saveProfileBtn.innerHTML;
            saveProfileBtn.disabled = true;
            saveProfileBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Saving...';
            setProfileStatus('');

            try {
                localStorage.setItem(profileStorageKey, JSON.stringify(profileData));
                localStorage.setItem('userName', profileData.name);
                localStorage.setItem('userEmail', profileData.email);
                localStorage.setItem('userDOB', profileData.dob);
                localStorage.setItem('userSex', profileData.sex);
                localStorage.setItem('userPhone', profileData.phone);
                updateUI(profileData.name, null, profileData.email);
                setProfileStatus('Your profile was saved successfully.');
                saveProfileBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Profile Saved';
            } catch (error) {
                console.error('Could not save profile details:', error);
                setProfileStatus('Your profile could not be saved. Check browser storage and try again.', true);
                saveProfileBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Save Failed';
            } finally {
                saveProfileBtn.disabled = false;
                window.setTimeout(() => {
                    saveProfileBtn.innerHTML = originalText;
                }, 2200);
            }
        });
    }

    /* ==========================================================================
       9. CHARTS & TRENDS PAGE LOGIC
       ========================================================================== */
    const chartsPage = document.querySelector('.charts-page');
    if (chartsPage) {
        let history = [];
        try {
            const storedHistory = JSON.parse(localStorage.getItem('healthHistory') || '[]');
            if (!Array.isArray(storedHistory)) {
                throw new TypeError('Saved health history must be an array.');
            }
            history = storedHistory.filter(record => {
                if (!record || record.isManual === true || record.is_manual === true) return false;
                return Number.isFinite(Number(record.score ?? record.riskScore));
            });
        } catch (error) {
            console.error('Could not load assessment history for the trends chart:', error);
            const historyContainer = document.querySelector('.history-container');
            if (historyContainer) {
                historyContainer.innerHTML = '<p class="chart-empty-state" role="status">Your assessment history could not be loaded. Check browser storage and refresh the page.</p>';
            }
        }
        const canvasObj = document.getElementById('healthChart');
        
        if (canvasObj && typeof Chart !== 'undefined') {
            const ctx = canvasObj.getContext('2d');
            if (history.length === 0) {
                const historyContainer = document.querySelector('.history-container');
                if (historyContainer) historyContainer.innerHTML = '<p class="chart-empty-state">Complete a health assessment to start seeing your trends here.</p>';
            } else {
                const sortedHistory = [...history].reverse();
                const labels = sortedHistory.map(record => record.date || 'Assessment');
                const dataPoints = sortedHistory.map(record => Number(record.score ?? record.riskScore));

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{ label: 'Health Risk Estimate (%)', data: dataPoints, borderColor: '#0e7490', backgroundColor: 'rgba(14, 116, 144, 0.12)', tension: 0.4, fill: true, pointBackgroundColor: '#0e7490' }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            tooltip: { callbacks: { label: context => ` Health risk estimate: ${Math.round(context.raw)}%` } }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: { display: true, text: 'Health risk estimate (%)' },
                                ticks: { callback: value => `${value}%` }
                            }
                        }
                    }
                });
            }
        } else if (canvasObj) {
            const historyContainer = document.querySelector('.history-container');
            if (historyContainer) historyContainer.innerHTML = '<p class="chart-empty-state">The trends chart is unavailable right now. Please refresh the page and try again.</p>';
        }
    }

    /* ==========================================================================
       10. UTILITIES (Logout)
       ========================================================================== */
    const logoutBtn = document.querySelector('.logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span class="nav-text">Signing out...</span>';
            logoutBtn.style.opacity = '0.7';
            logoutBtn.style.pointerEvents = 'none';

            setTimeout(() => {
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userPhoto');
                sessionStorage.removeItem('justLoggedIn');
                
                window.location.href = 'index.html';
            }, 800);
        });
    }
});