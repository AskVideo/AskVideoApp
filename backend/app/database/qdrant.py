import os
import getpass
from qdrant_client import QdrantClient
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.qdrant import Qdrant
from qdrant_client.http import models


class QdrantDb:
    def __init__(self, cloud_api_key, openai_api_key):
        os.environ["OPENAI_API_KEY"] = openai_api_key

        self.openai_api_key = openai_api_key
        self.cloud_api_key = cloud_api_key

        self.embedding_model = "text-embedding-ada-002"

        # one time thing to create collection
        # self.client = QdrantClient(url="https://154d6f8a-1835-46b5-96e9-e8521b5a3351.us-east4-0.gcp.cloud.qdrant.io:6333",api_key=cloud_api_key,)
        # self.client.create_collection(
        #     collection_name="ask_video",
        #     vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),
        # )

    def instert_docs(self, docs):
        self.qdrant = Qdrant.from_documents(
            docs,
            OpenAIEmbeddings(openai_api_key=self.openai_api_key, model=self.embedding_model),
            url="https://154d6f8a-1835-46b5-96e9-e8521b5a3351.us-east4-0.gcp.cloud.qdrant.io:6333",
            prefer_grpc=True,
            api_key=self.cloud_api_key,
            collection_name="ask_video",
            force_recreate=True,
        )

    def search_top_k(self, query,k=10):
        found_docs = self.qdrant.similarity_search_with_score(query=query, k=k)
        return found_docs