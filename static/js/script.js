const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const sendBtn = document.getElementById('sendBtn');
const sendText = document.getElementById('sendText');
const loadingText = document.getElementById('loadingText');

// Add message to chat
function addMessage(content, isUser = false, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} ${isError ? 'error-message' : ''}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<strong>${isUser ? 'You' : 'Bot'}:</strong> ${content}`;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Set loading state
function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    userInput.disabled = isLoading;
    
    if (isLoading) {
        sendText.style.display = 'none';
        loadingText.style.display = 'inline';
    } else {
        sendText.style.display = 'inline';
        loadingText.style.display = 'none';
    }
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    
    // Set loading state
    setLoading(true);
    
    try {
        // Send message to backend
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            // Add bot response to chat
            addMessage(data.response);
        } else {
            // Handle error
            addMessage(data.error || 'Something went wrong. Please try again.', false, true);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Failed to connect to the server. Please try again.', false, true);
    } finally {
        setLoading(false);
        userInput.focus();
    }
});

// Focus on input when page loads
window.addEventListener('load', () => {
    userInput.focus();
});
