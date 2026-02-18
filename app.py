from flask import Flask, render_template, request, jsonify
from transformers import pipeline, set_seed
import torch

app = Flask(__name__)

# Initialize the GPT-2 text generation pipeline
print("Loading GPT-2 model...")
# Explicitly use PyTorch framework to avoid TensorFlow/Keras compatibility issues
generator = pipeline('text-generation', model='gpt2', framework='pt')
set_seed(42)

@app.route('/')
def home():
    """Render the chatbot UI"""
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat messages and generate responses"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Format prompt for better conversation
        prompt = f"Human: {user_message}\nAI:"
        
        # Generate response using GPT-2 with better parameters
        response = generator(
            prompt,
            max_new_tokens=80,
            num_return_sequences=1,
            temperature=0.8,
            do_sample=True,
            top_k=50,
            top_p=0.95,
            repetition_penalty=1.2,
            pad_token_id=generator.tokenizer.eos_token_id,
            eos_token_id=generator.tokenizer.eos_token_id
        )
        
        # Extract the generated text
        bot_response = response[0]['generated_text']
        
        # Remove the prompt from the response
        if bot_response.startswith(prompt):
            bot_response = bot_response[len(prompt):].strip()
        
        # Clean up the response - stop at newlines or certain markers
        bot_response = bot_response.split('\n')[0].strip()
        bot_response = bot_response.split('Human:')[0].strip()
        
        # If response is too short or empty, provide a fallback
        if len(bot_response) < 10:
            bot_response = "I'm not sure how to respond to that. Could you try rephrasing your question?"
        
        return jsonify({
            'response': bot_response,
            'status': 'success'
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
