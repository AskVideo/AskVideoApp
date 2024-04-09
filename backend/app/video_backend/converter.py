import os
import whisper
from openai import OpenAI
from pytube import YouTube, Search
import logging
from app.database.qdrant import QdrantDb
from app.user_backend.manager import Response
from langchain.docstore.document import Document
from app.database.model import Sessions, SessionContent, Video, MainFunc

class Converter:
    def __init__(self):
        self.model = whisper.load_model("base")
        self.qdrant = QdrantDb(cloud_api_key="MgU7bxwucSbZwFY8rQCZY9winLdTsdRekVyk3i3HdEUjmSAWejxniA", openai_api_key="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")
        self.prompt = {"en": "You are given a several of contents. Answer this question by given contents. Question:{question}\n Contents:{contents}"}

    def ask_video(self, data):
        try:
            video_id = data["video_id"]
            sess_id = int(data["sess_id"])
            sequence = int(data["seq"])
            query = data["query"]

            MainFunc.create(SessionContent(sequence=sequence, content=query, id=sess_id))
        
            docs = self.qdrant.search_top_k(query=query, video_id=video_id)
            merged_docs = self._merge_docs(docs)

            result = []
            answer = self._rag(merged_docs, merged_docs[0]["metadata"]["lang"], query)
            tmp_cont = SessionContent(sequence=sequence+1, content=answer, id=sess_id).create()
 
            for doc in merged_docs:
                MainFunc.create(Video(video_id, doc["metadata"]["start"], doc["metadata"]["end"], tmp_cont.id))
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
            if doc.payload["metadata"]['start'] - tmp["metadata"]["end"] < 10:
                result[-1] = {
                                "page_content": tmp["page_content"] + " " + doc.payload["page_content"],
                                "metadata":{"start": tmp["metadata"]["start"], "end": doc.payload["metadata"]['end'], 
                                            "lang": doc.payload["metadata"]["lang"]}
                            }
            else:
                result.append(doc.payload)

        return result
        


    def preprocess(self, data):
        try:
            user_id = data["user_id"]
            video_id = data["video_id"]
            url = "https://youtube.com/watch?v={video_id}".format(video_id=video_id)

            sess_name = data["session_name"]

            if MainFunc.get(Sessions, video_id=video_id):
                return Response(200, "Video preprocessed before", {})

            audio = self._download_video(url)
            result = self.model.transcribe(audio)
            os.remove("./tmp_audio")

            docs = []
            for seg in result["segments"]:
                doc = Document(page_content=seg["text"], metadata={"video_id": video_id, "start": seg["start"], 
                                                                         "end": seg["end"], "lang": result["language"]})
                docs.append(doc)
           
            self.qdrant.instert_docs(docs=docs)

            # Create session for user when video selected
            MainFunc.create(Sessions(user_id=user_id, session_name=sess_name, video_id=video_id))
            return Response(200, "Video preprocessed successfully", {})
        except Exception as e:
            logging.error("Video Preprocesse Error")
            logging.error(e)
            return Response(500, "Something went wrong while preprocessing", {})
        

    def _rag(self, docs, language, question):
        text = []
        for doc in docs:
            text.append(doc['page_content'])
        text = "\n".join(text)

        prompt = self.prompt[language].format(question=question, contents=text)
        client = OpenAI(api_key="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")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-16k",
            messages=[
                {"role": "user", "content": prompt},
            ]
        )
        return response.choices[0].message.content

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