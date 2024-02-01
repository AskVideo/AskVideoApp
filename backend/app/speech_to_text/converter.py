import pickle
from app.speech_to_text.models import speaker_diarization, diarization_pipe_token, speech_to_text, punctuation
from pyannote.audio import Pipeline
from transformers import Wav2Vec2Processor, HubertForCTC, T5Tokenizer, T5ForConditionalGeneration

class Converter:
    def __init__(self) -> None:
        self.diarization_pipeline=Pipeline.from_pretrained(speaker_diarization, use_auth_token=diarization_pipe_token)
        self.stt_tokenizer=Wav2Vec2Processor.from_pretrained(speech_to_text)
        self.stt_model=HubertForCTC.from_pretrained(speech_to_text)
        self.t5_punct_tokenizer=T5Tokenizer.from_pretrained(punctuation)
        self.t5_punct_model=T5ForConditionalGeneration.from_pretrained(punctuation)



        
