from PIL import Image
import random

# Available emotions for analysis
EMOTIONS = ["happy", "sad", "excited", "angry", "neutral"]

def predict_mood(image: Image.Image) -> str:
    """
    Predict the mood from an image.
    
    In a real application, this function would use a machine learning model
    to analyze the facial expression in the image. For this demo, we're using
    a simple random selection.
    
    Args:
        image: A PIL Image object containing the user's photo
        
    Returns:
        A string representing the detected emotion
    """
    try:
        # Here you would normally:
        # 1. Preprocess the image (resize, normalize, etc.)
        # 2. Run it through a pre-trained mood detection model
        # 3. Return the predicted mood
        
        # For this demo, we'll just return a random emotion
        return random.choice(EMOTIONS)
        
    except Exception as e:
        print(f"Error predicting mood: {e}")
        return "neutral"  # Default fallback

def generate_recommendation(mood: str) -> str:
    """
    Generate a personalized recommendation based on the detected mood.
    
    Args:
        mood: The detected mood/emotion string
        
    Returns:
        A recommendation string based on the mood
    """
    recommendations = {
        "happy": "Keep doing what you love! Consider journaling about what made you happy today.",
        "sad": "Take some time for self-care. A short walk, talking to a friend, or listening to uplifting music might help.",
        "excited": "Channel your energy into a creative project or something you've been meaning to start!",
        "angry": "Try deep breathing exercises or writing down your thoughts to process your emotions.",
        "neutral": "This might be a good time to try something new or explore a different routine."
    }

    return recommendations.get(mood.lower(), "Take a moment to check in with yourself and practice mindfulness.")