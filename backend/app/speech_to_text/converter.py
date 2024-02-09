import whisper
from pytube import YouTube, Search
import logging

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")


    def text_from_uploaded_file(self, video_path):
        result = self.model.transcribe(video_path)

    def search_yt(self, query, k=10):
        searchResults = []
        s = Search(query)
        while(len(s.results) < k):
            s.get_next_results()

        for v in s.results[0:k]:
            searchResults.append({'title':v.title,'url': v.watch_url})
        return searchResults

    def Download(self,url):
        youtubeObject = YouTube(url)
        youtubeObject = youtubeObject.streams.filter(res="360p").first()
        try:
            youtubeObject.download()
        except Exception as e:
            logging.error(e)
            return
        logging.info("Download is completed successfully")