import os
import whisper
from pytube import YouTube, Search
import logging
from app.database.qdrant import QdrantDb
from app.user_backend.manager import Response
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")
        self.qdrant = QdrantDb(cloud_api_key='qd2EJwwKcPCH6H5Q3QIqMZD8goCahUNMAFCx2Zbk2HR98lnJaPrUTg', openai_api_key="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")

    # for test
    def insert_docs(self):
        txt = "Random words are really good"
        doc =  [Document(page_content=txt, metadata={"source": "local"})]
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        docs = text_splitter.split_documents(doc)
        self.qdrant.instert_docs(docs)
        
        docs = self.qdrant.search_top_k("words are good")
        return docs


    def video_to_text(self, url):
        try:
            audio = self._download_video(url)
            result = self.model.transcribe(audio)
            os.remove("./tmp_audio")
            return result
        except Exception as e:
            logging.error("Video to Text Error")
            logging.error(e)
        

    def search_yt(self, query, k=10):
        try:
            searchResults = []
            s = Search(query)
            while len(s.results) < k:
                s.get_next_results()

            for v in s.results[0:k]:
                video_id = v.watch_url.split('v=')[1]
                thumbnail_url = f"https://img.youtube.com/vi/{video_id}/0.jpg"
                searchResults.append({'title': v.title, 'url': v.watch_url, 'thumbnail_url': thumbnail_url})

            return Response(200, "Search results", searchResults)
        except Exception as e:
            logging.error(e)
            return Response(500, "Something went wrong while youtube video searching", searchResults)
        
        

    def _download_video(self, url):
        try:
            youtubeObject = YouTube(url)
            audio_stream = youtubeObject.streams.filter(only_audio=True).first()
            return audio_stream.download(output_path=".", filename="tmp_audio")
        except Exception as e:
            logging.error(e)
            return