import os
import whisper
import openai
from pytube import YouTube, Search
import logging
from app.database.qdrant import QdrantDb
from app.user_backend.manager import Response
from langchain.docstore.document import Document
from app.database.model import Sessions, SessionContent, Video, MainFunc

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")
        self.qdrant = QdrantDb(cloud_api_key="bGKFPZr51MMPXPnxlPQTGlTSqd0Dk8dZyo01b9dLgSo98gWi5anu5A", openai_api_key="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")
        self.prompt = {"eng": "Answer this question by provided info. Question:{question}\n Info:{info}"}

    def ask_video(self, data):
        try:
            video_id = data["video_id"]
            sess_id = data["sess_id"]
            sequence = data["seq"]
            query = data["query"]

            MainFunc.create(SessionContent(sequence=sequence, content=query, id=sess_id))

            docs = self.qdrant.search_top_k(query=query, video_id=video_id)
            merged_docs = self._merge_docs(docs)

            result = []

            for doc in merged_docs:
                answer = self._rag(doc["page_content"], doc["metadata"]["lang"], query) #TODO get content right
                video = Video(video_id, doc["metadata"]["start"], doc["metadata"]["end"]).create()
                MainFunc.create(SessionContent(sequence=sequence+1, content=answer, id=sess_id, video=video))
                result.append({"video_info": doc["metadata"], "answer": answer})



            return Response(200, "Answers", result)
        except Exception as e:
            logging.error("Ask the Video Error")
            logging.error(e)
            return Response(500, "Something went wrong while answering question", {})
        
    def _merge_docs(self, docs):
        merged_docs = sorted(docs, key=lambda x: x.payload["metadata"]["start"])
        result = [merged_docs[0].payload]

        for doc in merged_docs[1:]:
            tmp = result[-1]
            if tmp["metadata"]["end"] == doc.payload["metadata"]['start']:
                result[-1] = {
                                "page_content": tmp["page_content"] + " " + doc.payload["page_content"],
                                "metadata":{"start": tmp["metadata"]["start"], "end": doc.payload["metadata"]['end'], 
                                            "lang": doc.payload["metadata"]["lang"]}
                            }
            else:
                result.append(doc.payload)

        return  result
        


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
        

    def _rag(self, text, language, question):
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