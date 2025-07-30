from PIL import Image
import random

MOODS = ["happy", "sad", "angry", "neutral", "excited"]

def predict_mood(image: Image.Image) -> str:
    # Replace with real ML model later
    return random.choice(MOODS)

def generate_recommendation(mood: str) -> str:
    recommendations = {
    "happy": "Keep doing what brings you joy — consider sharing your positivity with someone who needs it today.",
    "sad": "It's okay to feel down. Try journaling your thoughts or watching a comforting movie. You're not alone.",
    "angry": "Pause and breathe deeply. Channel that energy into something physical like a workout or a walk.",
    "neutral": "A balanced mood is a good place to build from. Maybe explore a new hobby or reach out to someone you haven’t spoken to in a while.",
    "surprised": "Embrace the unexpected! Reflect on what surprised you and how it might open new opportunities.",
    "fearful": "Fear often signals growth ahead. Try talking to someone you trust and take things one step at a time.",
    "disgusted": "Discomfort is valid. Take a break from what’s bothering you and focus on something that uplifts you."
    }

    return recommendations.get(mood.lower(), "Stay strong and take care!")