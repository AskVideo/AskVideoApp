import os
import random
import whisper
import openai
from pytube import YouTube, Search
import logging
from app.database.qdrant import QdrantDb
from app.user_backend.manager import Response
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from app.database.model import User, Sessions, MainFunc

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")
        self.qdrant = QdrantDb(cloud_api_key='qd2EJwwKcPCH6H5Q3QIqMZD8goCahUNMAFCx2Zbk2HR98lnJaPrUTg', openai_api_key="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")
        self.text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        self.prompt = {"eng": "Answer this question by provided info. Question:{question}\n Info:{info}"}

    def _insert_docs(self, text, video_id, start_time, end_time, language):
        doc =  [Document(page_content=text, metadata={"video_id": video_id, "start_time": start_time, "end_time": end_time, "lang": language})]
        docs = self.text_splitter.split_documents(doc)
        self.qdrant.instert_docs(docs)

    
    def insert_video_segments(self, segments, video_id, language):
        for seg in segments:
            self._insert_docs(text=seg["text"], video_id=video_id, start_time=seg["start"], end_time=seg["end"], language=language)

    def video_to_text(self, url, video_id, user_id):
        try:
            audio = self._download_video(url)
            result = self.model.transcribe(audio)
            os.remove("./tmp_audio")
            # Create session for user when video selected
            MainFunc.create(Sessions(user_id=user_id))
            # When user asks something, we can use language info to select promt for gpt in the future.
            self.insert_video_segments(result["segmets"], video_id=video_id, language=result["language"])
            return result
        except Exception as e:
            logging.error("Video to Text Error")
            logging.error(e)

    def rag(self, text, language, question):
        prompt = self.prompt[language].format(question=question, info=text)
        response = openai.ChatCompletion.create(
            api_key="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",
            model="gpt-3.5-turbo-16k",
            messages=[
                {"role": "user", "content": prompt},
            ]
        )
        return response

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