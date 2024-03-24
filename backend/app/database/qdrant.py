import os
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.qdrant import Qdrant
from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from qdrant_client.http import models


class QdrantDb:
    def __init__(self, cloud_api_key, openai_api_key):
        os.environ["OPENAI_API_KEY"] = openai_api_key

        self.openai_api_key = openai_api_key
        self.cloud_api_key = cloud_api_key

        self.embedding_model = "text-embedding-ada-002"

        self.client = QdrantClient(
            url="https://b8a51c41-8d13-40a2-bdab-e5036e1ad1c0.us-east4-0.gcp.cloud.qdrant.io:6333", 
            api_key=cloud_api_key,
        )
        
        # self.client.create_collection(
        # collection_name="ask_video",
        # vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),
        # )

    def instert_docs(self, docs):  
        Qdrant.from_documents(
            docs,
            OpenAIEmbeddings(openai_api_key=self.openai_api_key, model=self.embedding_model),
            url="https://b8a51c41-8d13-40a2-bdab-e5036e1ad1c0.us-east4-0.gcp.cloud.qdrant.io:6333",
            prefer_grpc=True,
            api_key=self.cloud_api_key,
            collection_name="ask_video",
            force_recreate=False,
        )

    def search_top_k(self, query, video_id, k=10):
        print("searchhhhhh")
        openai = OpenAIEmbeddings(openai_api_key=self.openai_api_key, model=self.embedding_model)
        emmbed_q = openai.embed_query(query)
        filter = [FieldCondition(key="metadata.video_id", match=MatchValue(value=video_id))]
        found_docs = self.client.search(collection_name="ask_video", query_vector=emmbed_q,
                                        query_filter=Filter(
                                        should=filter
                                        ),limit=k)
        return found_docs