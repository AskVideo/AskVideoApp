import whisper
from pytube import YouTube, Search

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")


    def text_from_uploaded_file(self, video_path):
        result = self.model.transcribe(video_path)

    def search_yt(self, query):
        pass