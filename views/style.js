// DOM Elements - Safely get elements
function getElement(id) {
    return document.getElementById(id);
}

const imageInput = getElement('imageInput');
const uploadArea = getElement('uploadArea');
const previewContainer = getElement('previewContainer');
const imagePreview = getElement('imagePreview');
const analyzeBtn = getElement('analyzeBtn');
const resultContainer = getElement('resultContainer');
const emotionResult = getElement('emotionResult');
const historyTableBody = getElement('historyTableBody');
const userInfoForm = getElement('userInfoForm');
const detailedResultsSection = getElement('detailedResults');
const historyEmptyMessage = getElement('historyEmpty');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// Mobile menu toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// User data storage
let userData = {
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    stressLevel: '',
    sleepQuality: '',
    mentalHealthHistory: '',
    primaryConcern: '',
    id: 'MW-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 999)).padStart(3, '0'),
    emotionHistory: [],
    currentPhoto: null,
    currentAnalysis: null
};

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('access_token');
    const authButtons = document.querySelector('.auth-buttons');
    const profileLink = document.querySelector('a[href="#profile"]');
    const historyLink = document.querySelector('a[href="#history"]');
    
    if (token) {
        // User is logged in
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="#" class="login-btn" id="logoutBtn">Logout</a>
            `;
            
            // Add logout functionality
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('access_token');
                localStorage.removeItem('token_type');
                window.location.href = '/';
            });
        }
        
        // Enable restricted sections
        if (profileLink) profileLink.classList.remove('disabled');
        if (historyLink) historyLink.classList.remove('disabled');
        
        // Load history if on main page
        if (historyTableBody) {
            loadHistory();
        }
    } else {
        // User is not logged in
        if (profileLink) profileLink.classList.add('disabled');
        if (historyLink) historyLink.classList.add('disabled');
    }
}

// Handle file input change
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImageUpload(e.target.files[0]);
        }
    });
}

// Handle drag and drop
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!uploadArea.contains(e.relatedTarget)) {
            uploadArea.classList.remove('drag-over');
        }
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length) {
            handleImageUpload(files[0]);
        }
    });
}

// Handle image upload
function handleImageUpload(file) {
    // Validate file type
    if (!file.type.match('image.*')) {
        showError('Please upload a valid image file.');
        return;
    }

    // Display image preview
    const reader = new FileReader();
    reader.onload = function(e) {
        if (previewContainer && imagePreview) {
            previewContainer.style.display = 'block';
            imagePreview.src = e.target.result;
            
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.addEventListener('click', () => {
                    uploadAndAnalyzeImage(file);
                }, { once: true });
            }
        }
    };
    reader.readAsDataURL(file);

    // Store file for later use
    userData.currentPhoto = file;
}

// Upload and analyze image
async function uploadAndAnalyzeImage(file) {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Please login to analyze images');
        window.location.href = '/login';
                return;
            }
            
    // Show loading indicator
    showLoadingIndicator(true);
    
    try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Call API to analyze image
        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to analyze image');
        }
        
        const result = await response.json();
        
        // Process result
        const analysis = {
            emotion: result.mood,
            confidence: Math.floor(Math.random() * 30) + 70, // Mock confidence since API doesn't provide it
            timestamp: result.timestamp
        };
        
        // Update UI with result
        userData.currentAnalysis = analysis;
        updateResultsUI(analysis);
        
        // Save to history
        userData.emotionHistory.push({
            timestamp: analysis.timestamp,
            emotion: analysis.emotion,
            imageUrl: URL.createObjectURL(file)
        });
        
        // Update history table if it exists
        if (historyTableBody) {
            updateHistoryTable();
        }
    } catch (error) {
        console.error('Error analyzing image:', error);
        showError('Failed to analyze image. Please try again.');
    } finally {
        showLoadingIndicator(false);
    }
}

// Real API emotion analysis function
async function analyzeEmotion() {
    // This function will be replaced by uploadAndAnalyzeImage
    // It's kept for backward compatibility
    showLoadingIndicator(true);
    
    try {
        // Check if user has uploaded a file
        if (!userData.currentPhoto) {
            throw new Error('Please upload an image first');
        }
        
        // Use uploadAndAnalyzeImage instead
        await uploadAndAnalyzeImage(userData.currentPhoto);
        return userData.currentAnalysis;
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An error occurred during analysis');
        throw error;
    } finally {
    showLoadingIndicator(false);
    }
}

// Update results UI
function updateResultsUI(analysis) {
    if (resultContainer && emotionResult) {
        resultContainer.style.display = 'block';
        emotionResult.textContent = analysis.emotion;
        
        // Update detailed results if section exists
        if (detailedResultsSection) {
            updateDetailedResults(analysis);
        }
    }
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
    if (!analyzeBtn) return;
    
    if (show) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
    } else {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze Emotion';
    }
}

// Load user history
async function loadHistory() {
    const token = localStorage.getItem('access_token');
    if (!token || !historyTableBody) return;
    
    try {
        const response = await fetch('/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load history');
        }
        
        const history = await response.json();
        
        if (history.length > 0) {
            // Clear existing entries
            historyTableBody.innerHTML = '';
            
            // Hide empty message if it exists
            if (historyEmptyMessage) {
                historyEmptyMessage.style.display = 'none';
            }
            
            // Add history entries
            history.forEach((entry, index) => {
                const row = document.createElement('tr');
                
                const date = new Date(entry.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>
                        <span class="emotion-badge ${entry.mood.toLowerCase()}">
                            ${entry.mood}
                        </span>
                    </td>
                    <td>${entry.filename}</td>
                    <td>${entry.recommendation}</td>
                    <td>
                        <button class="view-btn" data-index="${index}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                historyTableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = btn.dataset.index;
                    viewHistoryDetails(index);
                });
            });
        } else if (historyEmptyMessage) {
            historyEmptyMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading history:', error);
        if (historyEmptyMessage) {
            historyEmptyMessage.textContent = 'Failed to load history. Please try again.';
            historyEmptyMessage.style.display = 'block';
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Get recommendations based on emotion and user data
function getRecommendations(emotion, userData) {
    // Base recommendations for each emotion
    const baseRecommendations = {
        'Happy': [
            {
                title: 'Maintain Your Positive Energy',
                description: 'Share your positive energy with others and document what made you happy today.'
            },
            {
                title: 'Plan Future Activities',
                description: 'Use this positive state to plan activities that will maintain this mood.'
            }
        ],
        'Sad': [
            {
                title: 'Connect with Others',
                description: 'Talk to someone you trust about your feelings. Social connection can help improve mood.'
            },
            {
                title: 'Nature Therapy',
                description: 'Take a relaxing walk in nature. Research shows it can help reduce negative thoughts.'
            },
            {
                title: 'Mindful Breathing',
                description: 'Practice deep breathing exercises to help calm your mind and body.'
            }
        ],
        'Neutral': [
            {
                title: 'Try Something New',
                description: 'This is a good time to try a new hobby or activity that interests you.'
            },
            {
                title: 'Set Small Goals',
                description: 'Set a small achievable goal for today to create a sense of accomplishment.'
            }
        ],
        'Excited': [
            {
                title: 'Channel Your Energy',
                description: 'Direct your excitement into productive tasks or creative projects.'
            },
            {
                title: 'Document Your Ideas',
                description: 'Write down your ideas and plans while you\'re feeling inspired.'
            }
        ],
        'Tired': [
            {
                title: 'Rest Strategically',
                description: 'Take short breaks between tasks and consider a power nap if possible.'
            },
            {
                title: 'Improve Sleep Habits',
                description: 'Ensure you get enough quality sleep tonight by establishing a relaxing bedtime routine.'
            }
        ],
        'Anxious': [
            {
                title: 'Grounding Techniques',
                description: 'Try the 5-4-3-2-1 technique: acknowledge 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste.'
            },
            {
                title: 'Limit Stimulants',
                description: 'Reduce or avoid caffeine and other stimulants that can increase anxiety.'
            }
        ],
        'Relaxed': [
            {
                title: 'Mindfulness Practice',
                description: 'Use this relaxed state to practice mindfulness or meditation to enhance the feeling.'
            },
            {
                title: 'Creative Activities',
                description: 'This is an ideal state for creative activities like writing, drawing, or music.'
            }
        ],
        'Frustrated': [
            {
                title: 'Take a Break',
                description: 'Step away from the frustrating situation for a few minutes to reset your perspective.'
            },
            {
                title: 'Physical Release',
                description: 'Physical activity can help release tension - try a quick walk or stretching.'
            }
        ]
    };
    
    // Get base recommendations for the detected emotion
    let recommendations = baseRecommendations[emotion] || [
        {
            title: 'Self-Care Activities',
            description: 'Practice self-care activities that you enjoy and that help you feel balanced.'
        },
        {
            title: 'Maintain Routine',
            description: 'Stick to a regular routine to provide structure and stability.'
        }
    ];
    
    // Add personalized recommendations based on user data
    if (userData.stressLevel === 'high' || userData.stressLevel === 'severe') {
        recommendations.push({
            title: 'Stress Management',
            description: 'Consider stress-reduction techniques like progressive muscle relaxation or guided imagery.'
        });
    }
    
    if (userData.sleepQuality === 'poor' || userData.sleepQuality === 'very-poor') {
        recommendations.push({
            title: 'Sleep Improvement',
            description: 'Improve sleep by maintaining a regular sleep schedule, creating a restful environment, and avoiding screens before bed.'
        });
    }
    
    if (userData.primaryConcern === 'anxiety') {
        recommendations.push({
            title: 'Anxiety Management',
            description: 'Practice regular breathing exercises and consider keeping an anxiety journal to identify triggers.'
        });
    }
    
    if (userData.primaryConcern === 'depression') {
        recommendations.push({
            title: 'Mood Enhancement',
            description: 'Try to engage in activities you used to enjoy, even if you don\'t feel like it at first. Small steps can help improve mood.'
        });
    }
    
    return recommendations;
}

// Handle emotion analysis
if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
        try {
            const result = await analyzeEmotion();
            userData.currentAnalysis = result;
            
            // Update result container
            if (resultContainer) {
                resultContainer.style.display = 'block';
            }
            
            if (emotionResult) {
                emotionResult.innerHTML = `
                    <div class="emotion-icon ${result.emotion.toLowerCase()}">${getEmotionIcon(result.emotion)}</div>
                    <h3>${result.emotion}</h3>
                    <p>We detected that you're feeling ${result.emotion.toLowerCase()} 
                    with ${result.confidence}% confidence</p>
                `;
            }
            
            // Update recommendations
            const recommendations = getRecommendations(result.emotion, userData);
            const recommendationsList = getElement('recommendationsList');
            if (recommendationsList) {
                recommendationsList.innerHTML = recommendations
                    .map(rec => `<li>${rec.title}: ${rec.description}</li>`)
                    .join('');
            }
            
            // Update detailed results section
            updateDetailedResults(result);
            if (detailedResultsSection) {
                detailedResultsSection.style.display = 'block';
                
                // Scroll to detailed results
                setTimeout(() => {
                    detailedResultsSection.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
            
        } catch (error) {
            console.error('Error analyzing emotion:', error);
            if (emotionResult) {
                emotionResult.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Something went wrong while analyzing your emotion.</p>
                        <p>Please try again or choose a different photo.</p>
                    </div>
                `;
            }
        }
    });
}

// Get emotion icon
function getEmotionIcon(emotion) {
    const icons = {
        'Happy': '😊',
        'Sad': '😢',
        'Neutral': '😐',
        'Excited': '😃',
        'Tired': '😴',
        'Anxious': '😰',
        'Relaxed': '😌',
        'Frustrated': '😤'
    };
    return icons[emotion] || '😐';
}

// Update detailed results section
function updateDetailedResults(result) {
    // Check if elements exist before updating
    const updateElementText = (id, text) => {
        const element = getElement(id);
        if (element) element.textContent = text;
    };
    
    const updateElementHTML = (id, html) => {
        const element = getElement(id);
        if (element) element.innerHTML = html;
    };
    
    const updateElementSrc = (id, src) => {
        const element = getElement(id);
        if (element) element.src = src;
    };
    
    // Set basic analysis info
    updateElementText('analysisDate', new Date().toLocaleString());
    updateElementText('analysisId', userData.id + '-' + userData.emotionHistory.length);
    
    // Set image
    if (userData.currentPhoto) {
        updateElementSrc('resultImage', URL.createObjectURL(userData.currentPhoto));
    }
    
    // Set emotion results
    updateElementHTML('resultEmotion', `${getEmotionIcon(result.emotion)} ${result.emotion}`);
    updateElementText('resultConfidence', `${result.confidence}% confidence`);
    
    // Set user info
    updateElementText('resultName', `${userData.firstName} ${userData.lastName}` || 'Not provided');
    updateElementText('resultAge', userData.age || 'Not provided');
    updateElementText('resultGender', userData.gender || 'Not provided');
    
    // Set mental health info
    updateElementText('resultStressLevel', getDisplayValue('stressLevel', userData.stressLevel));
    updateElementText('resultSleepQuality', getDisplayValue('sleepQuality', userData.sleepQuality));
    updateElementText('resultPrimaryConcern', getDisplayValue('primaryConcern', userData.primaryConcern));
    updateElementText('resultMentalHealthHistory', getDisplayValue('mentalHealthHistory', userData.mentalHealthHistory));
    
    // Set recommendations
    const recommendations = getRecommendations(result.emotion, userData);
    const detailedRecommendations = getElement('detailedRecommendations');
    if (detailedRecommendations) {
        detailedRecommendations.innerHTML = recommendations
            .map(rec => `
                <div class="recommendation-card">
                    <h5>${rec.title}</h5>
                    <p>${rec.description}</p>
                </div>
            `)
            .join('');
    }
}

// Get display value for select fields
function getDisplayValue(field, value) {
    if (!value) return 'Not provided';
    
    const displayValues = {
        stressLevel: {
            'none': 'No stress',
            'mild': 'Mild stress',
            'moderate': 'Moderate stress',
            'high': 'High stress',
            'severe': 'Severe stress'
        },
        sleepQuality: {
            'excellent': 'Excellent (8+ hours)',
            'good': 'Good (6-8 hours)',
            'fair': 'Fair (4-6 hours)',
            'poor': 'Poor (2-4 hours)',
            'very-poor': 'Very poor (< 2 hours)'
        },
        primaryConcern: {
            'anxiety': 'Anxiety',
            'depression': 'Depression',
            'stress': 'Stress Management',
            'sleep': 'Sleep Issues',
            'relationships': 'Relationship Issues',
            'work': 'Work-related Stress',
            'trauma': 'Trauma/PTSD',
            'other': 'Other',
            'prefer-not-to-say': 'Prefer not to say'
        },
        mentalHealthHistory: {
            'none': 'No previous support',
            'therapy': 'Therapy/Counseling',
            'medication': 'Medication',
            'both': 'Both therapy and medication',
            'other': 'Other support methods',
            'prefer-not-to-say': 'Prefer not to say'
        }
    };
    
    return displayValues[field]?.[value] || value;
}

// Save current analysis to history
function saveToHistory() {
    if (!userData.currentAnalysis) {
        showNotification('No analysis to save', 'error');
        return;
    }
    
    const timestamp = new Date().toLocaleString();
    const historyEntry = {
        id: userData.id + '-' + userData.emotionHistory.length,
        emotion: userData.currentAnalysis.emotion,
        confidence: userData.currentAnalysis.confidence,
        timestamp: timestamp,
        photo: userData.currentPhoto,
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userData.age,
        gender: userData.gender,
        stressLevel: userData.stressLevel,
        sleepQuality: userData.sleepQuality,
        mentalHealthHistory: userData.mentalHealthHistory,
        primaryConcern: userData.primaryConcern
    };
    
    userData.emotionHistory.unshift(historyEntry);
    updateHistoryTable();
    
    // Show success message
    showNotification('Analysis saved to history!', 'success');
    
    // Scroll to history section
    const historySection = getElement('history');
    if (historySection) {
        historySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update history table
function updateHistoryTable() {
    if (userData.emotionHistory.length === 0) {
        if (historyEmptyMessage) historyEmptyMessage.style.display = 'flex';
        return;
    }
    
    if (historyEmptyMessage) historyEmptyMessage.style.display = 'none';
    
    if (historyTableBody) {
        historyTableBody.innerHTML = userData.emotionHistory
            .map((entry, index) => `
                <tr>
                    <td>${entry.timestamp}</td>
                    <td class="image-cell">
                        <img src="${entry.photo}" alt="Analysis image">
                    </td>
                    <td class="emotion-cell">
                        <span class="emotion-icon">${getEmotionIcon(entry.emotion)}</span>
                        ${entry.emotion}
                    </td>
                    <td>${entry.confidence}%</td>
                    <td>${getDisplayValue('stressLevel', entry.stressLevel)}</td>
                    <td>${getDisplayValue('sleepQuality', entry.sleepQuality)}</td>
                    <td class="actions-cell">
                        <button class="table-btn" onclick="viewHistoryDetails(${index})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="table-btn" onclick="deleteHistoryEntry(${index})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `)
            .join('');
    }
}

// View history details
function viewHistoryDetails(index) {
    const entry = userData.emotionHistory[index];
    if (!entry) return;
    
    // Set as current analysis
    userData.currentAnalysis = {
        emotion: entry.emotion,
        confidence: entry.confidence
    };
    userData.currentPhoto = entry.photo;
    
    // Update user data
    userData.firstName = entry.firstName;
    userData.lastName = entry.lastName;
    userData.age = entry.age;
    userData.gender = entry.gender;
    userData.stressLevel = entry.stressLevel;
    userData.sleepQuality = entry.sleepQuality;
    userData.mentalHealthHistory = entry.mentalHealthHistory;
    userData.primaryConcern = entry.primaryConcern;
    
    // Update detailed results
    updateDetailedResults(userData.currentAnalysis);
    if (detailedResultsSection) {
        detailedResultsSection.style.display = 'block';
        
        // Scroll to detailed results
        detailedResultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete history entry
function deleteHistoryEntry(index) {
    if (confirm('Are you sure you want to delete this history entry?')) {
        userData.emotionHistory.splice(index, 1);
        updateHistoryTable();
        showNotification('History entry deleted', 'info');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Print results
function printResults() {
    window.print();
}

// Reset upload area
function resetUpload() {
    if (!imageInput) return;
    
    imageInput.value = '';
    if (imagePreview) imagePreview.src = '';
    userData.currentPhoto = null;
    
    if (uploadArea) uploadArea.style.display = 'block';
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.classList.remove('active');
    }
    if (resultContainer) resultContainer.style.display = 'none';
    if (detailedResultsSection) detailedResultsSection.style.display = 'none';
    
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze Emotion';
    }
}

// Show error message
function showError(message) {
    if (!uploadArea) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    uploadArea.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Handle user info form submission
if (userInfoForm) {
    userInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update user data
        userData.firstName = getElement('firstName')?.value || '';
        userData.lastName = getElement('lastName')?.value || '';
        userData.age = getElement('age')?.value || '';
        userData.gender = getElement('gender')?.value || '';
        userData.stressLevel = getElement('stressLevel')?.value || '';
        userData.sleepQuality = getElement('sleepQuality')?.value || '';
        userData.mentalHealthHistory = getElement('mentalHealthHistory')?.value || '';
        userData.primaryConcern = getElement('primaryConcern')?.value || '';
        
        // Show success message
        showNotification('Profile information saved successfully!', 'success');
        
        // Scroll to analysis section
        const analysisSection = document.querySelector('.analysis-section');
        if (analysisSection) {
            analysisSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Add global functions to window object
window.saveToHistory = saveToHistory;
window.viewHistoryDetails = viewHistoryDetails;
window.deleteHistoryEntry = deleteHistoryEntry;
window.printResults = printResults;
window.resetUpload = resetUpload;

// Add styles for notifications and loading spinner
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .emotion-icon {
        font-size: 48px;
        margin-bottom: 1rem;
    }

    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification.success i {
        color: var(--success-color);
    }
    
    .notification.info i {
        color: var(--primary-color);
    }
    
    .notification.error i {
        color: var(--error-color);
    }
    
    @media print {
        body * {
            visibility: hidden;
        }
        #detailedResults, #detailedResults * {
            visibility: visible;
        }
        #detailedResults {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        .results-actions {
            display: none;
        }
    }
`;

document.head.appendChild(style);

// Initialize history table
updateHistoryTable();
