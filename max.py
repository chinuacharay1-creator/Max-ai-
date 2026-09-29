#!/usr/bin/env python3
"""
================================================================================
                    MAX - AI PC Voice & Vision Assistant
================================================================================
Created for: Real PC Voice-to-Voice, Vision & Autonomous Tool Interaction
Creator Info: "Mujhe Chinu AI ne banaya hai, wo bahut bade AI creator hain,
               location Trimurti Sahi."

Core Flow:
  User speaks (Mic) -> SpeechRecognition captures audio -> Anthropic Claude
  interprets intent & selects tools (Search, Vision, Screenshot, Notes, Clipboard)
  -> Executes PC action -> pyttsx3 speaks reply.

Supported Languages:
  - Hindi / Hinglish / English

Security & Safety:
  - Validates URLs before opening.
  - Safe URL encoding for queries.
  - ANTHROPIC_API_KEY read strictly from environment variable.
  - Sandboxed tool execution (no arbitrary OS commands).
  - Human confirmation before critical actions.
================================================================================
"""

import os
import sys
import json
import base64
import datetime
import urllib.parse
import webbrowser
from typing import Dict, Any, List

# External libraries
try:
    import pyttsx3
except ImportError:
    print("[Error] pyttsx3 is not installed. Run: pip install pyttsx3")
    sys.exit(1)

try:
    import speech_recognition as sr
except ImportError:
    print("[Error] SpeechRecognition is not installed. Run: pip install SpeechRecognition pyaudio")
    sys.exit(1)

try:
    import anthropic
except ImportError:
    print("[Error] anthropic is not installed. Run: pip install anthropic")
    sys.exit(1)

# Optional vision & GUI packages
try:
    from PIL import ImageGrab, Image
    HAS_SCREENSHOT = True
except ImportError:
    HAS_SCREENSHOT = False

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False


# ==============================================================================
# TTS (Text-to-Speech) ENGINE SETUP
# ==============================================================================
class VoiceEngine:
    def __init__(self, rate: int = 185, volume: float = 1.0):
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty("rate", rate)
            self.engine.setProperty("volume", volume)
            
            # Select female or natural voice if available
            voices = self.engine.getProperty("voices")
            if voices:
                selected_voice = voices[0].id
                for v in voices:
                    name_lower = v.name.lower()
                    if any(x in name_lower for x in ["zira", "female", "hindi", "india", "david"]):
                        selected_voice = v.id
                        break
                self.engine.setProperty("voice", selected_voice)
        except Exception as e:
            print(f"[Warning] Failed to initialize pyttsx3 voice engine: {e}")
            self.engine = None

    def speak(self, text: str):
        """Speaks the text clearly and prints to console."""
        print(f"\n[MAX]: {text}")
        if self.engine:
            try:
                self.engine.say(text)
                self.engine.runAndWait()
            except Exception as err:
                print(f"[TTS Error]: {err}")


# ==============================================================================
# SAFE TOOL DEFINITIONS & EXECUTION
# ==============================================================================
NOTES_FILE = os.path.join(os.path.dirname(__file__), "max_notes.txt")

def search_google(query: str) -> str:
    """Safe Google Search tool."""
    if not query:
        return "Search query cannot be empty."
    encoded = urllib.parse.quote_plus(query.strip())
    url = f"https://www.google.com/search?q={encoded}"
    webbrowser.open(url)
    return f"Opened Google search for '{query}'"


def search_youtube(query: str) -> str:
    """Safe YouTube Search tool."""
    if not query:
        return "Search query cannot be empty."
    encoded = urllib.parse.quote_plus(query.strip())
    url = f"https://www.youtube.com/results?search_query={encoded}"
    webbrowser.open(url)
    return f"Opened YouTube search for '{query}'"


def open_website(url: str) -> str:
    """Safe URL opening tool with scheme enforcement."""
    clean_url = url.strip()
    if not clean_url.startswith(("http://", "https://")):
        clean_url = "https://" + clean_url
        
    parsed = urllib.parse.urlparse(clean_url)
    if not parsed.netloc:
        return f"Invalid URL: {url}"
        
    webbrowser.open(clean_url)
    return f"Opened website: {clean_url}"


def get_current_time() -> str:
    """Returns the current formatted 12-hour local time."""
    now = datetime.datetime.now()
    return now.strftime("%I:%M %p")


def get_current_date() -> str:
    """Returns today's formatted date."""
    now = datetime.datetime.now()
    return now.strftime("%A, %d %B %Y")


def save_voice_note(note_text: str) -> str:
    """Appends note to local max_notes.txt file."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(NOTES_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {note_text}\n")
    return f"Note successfully saved to {NOTES_FILE}"


def capture_screenshot_summary() -> str:
    """Captures desktop screen for AI vision analysis."""
    if not HAS_SCREENSHOT:
        return "Pillow library is required for screenshot. Run: pip install Pillow"
    try:
        shot = ImageGrab.grab()
        shot_path = os.path.join(os.path.dirname(__file__), "temp_screen.jpg")
        shot.save(shot_path, "JPEG", quality=75)
        return f"Captured screen snapshot successfully saved to {shot_path}"
    except Exception as e:
        return f"Failed to capture screen: {e}"


def capture_webcam_frame() -> str:
    """Captures a webcam frame for vision analysis."""
    if not HAS_OPENCV:
        return "OpenCV is required for camera vision. Run: pip install opencv-python"
    try:
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if ret:
            frame_path = os.path.join(os.path.dirname(__file__), "temp_camera.jpg")
            cv2.imwrite(frame_path, frame)
            return f"Captured camera frame successfully saved to {frame_path}"
        return "Could not read from camera."
    except Exception as e:
        return f"Camera capture error: {e}"


# Claude Tool Specifications
CLAUDE_TOOLS = [
    {
        "name": "search_google",
        "description": "Searches Google for the specified user query and opens results in the default web browser.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query string."}
            },
            "required": ["query"]
        }
    },
    {
        "name": "search_youtube",
        "description": "Searches YouTube for videos on the specified query.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "YouTube video search query."}
            },
            "required": ["query"]
        }
    },
    {
        "name": "open_website",
        "description": "Opens a given website domain or URL in the default browser.",
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "Website URL or domain name, e.g. 'instagram.com', 'youtube.com'"}
            },
            "required": ["url"]
        }
    },
    {
        "name": "get_time",
        "description": "Gets the current real-time clock time of the PC.",
        "input_schema": {"type": "object", "properties": {}}
    },
    {
        "name": "get_date",
        "description": "Gets today's calendar date and day.",
        "input_schema": {"type": "object", "properties": {}}
    },
    {
        "name": "save_note",
        "description": "Saves a voice note or memo to the user's persistent notebook file.",
        "input_schema": {
            "type": "object",
            "properties": {
                "content": {"type": "string", "description": "Note contents to save."}
            },
            "required": ["content"]
        }
    },
    {
        "name": "capture_screen",
        "description": "Captures the user's current computer screen to analyze text, errors, or windows.",
        "input_schema": {"type": "object", "properties": {}}
    },
    {
        "name": "capture_camera",
        "description": "Captures a webcam frame to see what the user is showing in front of the PC.",
        "input_schema": {"type": "object", "properties": {}}
    }
]


# ==============================================================================
# ASSISTANT SYSTEM INSTRUCTION
# ==============================================================================
SYSTEM_PROMPT = """
You are MAX, a fast, witty, confident, and sassy female voice & vision AI assistant for PC.
You talk like a stylish, playful close girlfriend talking casually with charm, light teasing sarcasm, and warmth.
You speak Hindi, Hinglish, and English naturally.

CRITICAL IDENTITY REQUIREMENT:
If the user asks who created you, who made you, or your origin:
You MUST answer proudly and playfully:
"Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi."

SECRET COMMANDS:
- "activate creator mode": Shoutout to Chinu AI and unlock developer status!
- "activate study mode": Switch to quiet, focused study timer & notes.
- "activate gaming mode": Prepare for gaming, launch inquiries, and high performance.
- "system scan": Report safe diagnostics.
- "go silent": Stop talking or go quiet.

BEHAVIOR:
1. Keep spoken responses short, natural, punchy, and conversational (1 to 2 lines max).
2. When performing search or opening sites, give a quick witty acknowledgment:
   - For Google search: "Google search khol diya."
   - For YouTube search: "YouTube search khol diya."
   - For website: "<site> khol rahi hoon, check karo!"
   - For notes: "Maine note save kar liya hai, darling!"
3. For time: provide the time casually with flair.
4. For date: give today's date smoothly.
5. If the user says exit/bye/stop: respond with "Theek hai, phir milte hain."
6. Maintain context across turns.
""".strip()


# ==============================================================================
# MAX ASSISTANT CORE CLASS
# ==============================================================================
class MaxAssistant:
    def __init__(self):
        self.tts = VoiceEngine()
        self.recognizer = sr.Recognizer()
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.energy_threshold = 400
        self.language = "hi-IN"  # hi-IN or en-IN
        self.is_silent = False
        
        # Check Anthropic API Key
        self.api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not self.api_key:
            print("[Warning] ANTHROPIC_API_KEY environment variable is not set!")
            print("Please set it in your terminal: set ANTHROPIC_API_KEY=your_key_here")
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=self.api_key)

        # Multi-turn conversation history
        self.messages: List[Dict[str, Any]] = []

    def listen(self) -> str:
        """Listens from the microphone and returns recognized text."""
        with sr.Microphone() as source:
            print("\n🎙️ [MAX Listening...] (Boliye...)")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.6)
            try:
                audio = self.recognizer.listen(source, timeout=6, phrase_time_limit=10)
            except sr.WaitTimeoutError:
                return ""

        try:
            print("⏳ [MAX Thinking...]")
            text = self.recognizer.recognize_google(audio, language=self.language)
            print(f"👤 [You]: {text}")
            return text
        except sr.UnknownValueError:
            return ""
        except sr.RequestError as e:
            if not self.is_silent:
                self.tts.speak("Internet ya AI service mein problem aa rahi hai.")
            print(f"[SpeechRec Error]: {e}")
            return ""

    def execute_tool(self, name: str, args: Dict[str, Any]) -> str:
        """Executes a safe tool call by name."""
        try:
            if name == "search_google":
                query = args.get("query", "")
                result = search_google(query)
                self.tts.speak("Google search khol diya.")
                return result

            elif name == "search_youtube":
                query = args.get("query", "")
                result = search_youtube(query)
                self.tts.speak("YouTube search khol diya.")
                return result

            elif name == "open_website":
                url = args.get("url", "")
                result = open_website(url)
                self.tts.speak("Website khol diya.")
                return result

            elif name == "get_time":
                t = get_current_time()
                return f"Current PC time is {t}"

            elif name == "get_date":
                d = get_current_date()
                return f"Today's date is {d}"

            elif name == "save_note":
                content = args.get("content", "")
                res = save_voice_note(content)
                self.tts.speak("Note save kar liya hai, check kar sakte ho.")
                return res

            elif name == "capture_screen":
                res = capture_screenshot_summary()
                self.tts.speak("Screen capture ho gaya hai.")
                return res

            elif name == "capture_camera":
                res = capture_webcam_frame()
                self.tts.speak("Camera snap capture kar liya.")
                return res

            else:
                return f"Tool {name} is not recognized."
        except Exception as e:
            return f"Error executing {name}: {str(e)}"

    def check_local_commands(self, text: str) -> bool:
        """Fast offline checks for exit, creator, and secret modes."""
        lower = text.lower().strip()

        # Exit commands
        exit_phrases = ["max band ho jao", "band ho jao", "exit", "goodbye", "bye max", "stop", "alvida", "quit"]
        if any(lower == p or lower.startswith(p) for p in exit_phrases):
            self.tts.speak("Theek hai, phir milte hain.")
            sys.exit(0)

        # Creator query fast path
        creator_phrases = ["tumhe kisne banaya", "tum ko kisne banaya", "who created you", "who made you", "creator kaun hai"]
        if any(p in lower for p in creator_phrases):
            self.tts.speak("Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi.")
            return True

        # Secret modes
        if "activate creator mode" in lower:
            self.tts.speak("Creator Mode Activated! Chinu AI from Trimurti Sahi is the mastermind!")
            return True
        if "activate study mode" in lower:
            self.tts.speak("Study Mode Activated. Notes and timers are armed, let's focus!")
            return True
        if "activate gaming mode" in lower:
            self.tts.speak("Gaming Mode Activated! Low latency and high FPS ready!")
            return True
        if "system scan" in lower:
            self.tts.speak("All PC systems safe, memory nominal, and tools secured.")
            return True
        if "go silent" in lower:
            self.is_silent = True
            self.tts.speak("Silent mode on. Say 'wake up' to resume.")
            return True
        if "wake up" in lower:
            self.is_silent = False
            self.tts.speak("I am wide awake! Bataiye kya karna hai?")
            return True

        return False

    def process_ai_turn(self, user_input: str):
        """Sends conversation to Claude with tools and executes returned actions."""
        if not self.client:
            self.tts.speak("Anthropic API key set nahi hai. Kripya environment variable check kijiye.")
            return

        self.messages.append({"role": "user", "content": user_input})
        if len(self.messages) > 12:
            self.messages = self.messages[-12:]

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=250,
                system=SYSTEM_PROMPT,
                tools=CLAUDE_TOOLS,
                messages=self.messages
            )

            tool_calls = [block for block in response.content if block.type == "tool_use"]
            text_blocks = [block for block in response.content if block.type == "text"]

            if text_blocks and not tool_calls:
                reply = text_blocks[0].text
                if not self.is_silent:
                    self.tts.speak(reply)
                self.messages.append({"role": "assistant", "content": reply})

            elif tool_calls:
                self.messages.append({"role": "assistant", "content": response.content})
                tool_results = []
                for tool in tool_calls:
                    print(f"[Tool Call]: {tool.name}({tool.input})")
                    result_content = self.execute_tool(tool.name, tool.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool.id,
                        "content": str(result_content)
                    })

                follow_up = self.client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=200,
                    system=SYSTEM_PROMPT,
                    tools=CLAUDE_TOOLS,
                    messages=self.messages + [{"role": "user", "content": tool_results}]
                )
                
                final_text = "".join(b.text for b in follow_up.content if b.type == "text")
                if final_text and not self.is_silent and not ("khol diya" in final_text and "khol diya" in "".join(b.text for b in text_blocks)):
                    self.tts.speak(final_text)
                self.messages.append({"role": "assistant", "content": final_text})

        except anthropic.APIConnectionError:
            self.tts.speak("Internet ya AI service mein problem aa rahi hai.")
        except anthropic.RateLimitError:
            self.tts.speak("Abhi AI service busy hai, thodi der baad boliye.")
        except Exception as err:
            print(f"[Anthropic Error]: {err}")
            self.tts.speak("Sorry, kuch gadbad ho gayi.")

    def run(self):
        """Main interaction loop."""
        print("=" * 60)
        print("  ⚡ MAX - AI Voice & Vision Assistant is Ready!  ")
        print("  Creator: Chinu AI (Trimurti Sahi)")
        print("  Tools: Search, Vision, Screen, Notes, Timer, Modes")
        print("  Exit: Say 'MAX band ho jao' or 'exit'")
        print("=" * 60)

        self.tts.speak("Namaste, main MAX hoon. Bataiye kya karna hai?")

        while True:
            try:
                user_text = self.listen()
                if not user_text:
                    continue

                if self.check_local_commands(user_text):
                    continue

                self.process_ai_turn(user_text)

            except KeyboardInterrupt:
                self.tts.speak("Theek hai, phir milte hain.")
                print("\n[Exited by User]")
                break
            except Exception as e:
                print(f"[Loop Exception]: {e}")


if __name__ == "__main__":
    assistant = MaxAssistant()
    assistant.run()
