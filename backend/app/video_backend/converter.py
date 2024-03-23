import os
import whisper
import openai
from pytube import YouTube, Search
import logging
from app.database.qdrant import QdrantDb
from app.user_backend.manager import Response
from langchain.docstore.document import Document
from app.database.model import Sessions, MainFunc

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")
        self.qdrant = QdrantDb(cloud_api_key="bGKFPZr51MMPXPnxlPQTGlTSqd0Dk8dZyo01b9dLgSo98gWi5anu5A", openai_api_key="")
        self.prompt = {"eng": "Answer this question by provided info. Question:{question}\n Info:{info}"}

    def ask_video(self, data):
        try:
            user_id = data["user_id"]
            video_id = data["video_id"]
            query = data["query"]

            docs = self.qdrant.search_top_k(query=query)

            # TODO


        except Exception as e:
            logging.error("Ask the Video Error")
            logging.error(e)
            return Response(500, "Something went wrong while answering question", {})

    def preprocess(self, data):
        try:
            user_id = data["user_id"]
            video_id = data["video_id"]
            url = "https://youtube.com/watch?v={video_id}".format(video_id=video_id)

            sess_name = data["session_name"] 

            audio = self._download_video(url)
            result = self.model.transcribe(audio)
            os.remove("./tmp_audio")
            
            # Create session for user when video selected
            MainFunc.create(Sessions(user_id=user_id, session_name=sess_name))
            # When user asks something, we can use language info to select promt for gpt in the future.

            docs = []
            for seg in result["segments"]:
                docs.append(Document(page_content=seg["text"], metadata={"video_id": video_id, "start": seg["start"], 
                                                                         "end": seg["end"], "lang": result["language"]}))

            self.qdrant.instert_docs(docs=docs)
            return Response(200, "Video preprocessed successfully", {})
        except Exception as e:
            logging.error("Video Preprocesse Error")
            logging.error(e)
            return Response(500, "Something went wrong while preprocessing", {})
        

    def rag(self, text, language, question):
        prompt = self.prompt[language].format(question=question, info=text)
        response = openai.ChatCompletion.create(
            api_key="",
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