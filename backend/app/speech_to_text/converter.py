from app.speech_to_text.models import speaker_diarization, diarization_pipe_token, speech_to_text, punctuation, summarizer
from pyannote.audio import Pipeline
from transformers import pipeline, Wav2Vec2Processor, HubertForCTC, T5Tokenizer, T5ForConditionalGeneration
from pydub import AudioSegment
import pandas as pd

class Converter:
    def __init__(self):
        self.diarization_pipeline=Pipeline.from_pretrained(speaker_diarization, use_auth_token=diarization_pipe_token)
        self.stt_tokenizer=Wav2Vec2Processor.from_pretrained(speech_to_text)
        self.stt_model=HubertForCTC.from_pretrained(speech_to_text)
        self.t5_punct_tokenizer=T5Tokenizer.from_pretrained(punctuation)
        self.t5_punct_model=T5ForConditionalGeneration.from_pretrained(punctuation)
        self.summarizer=pipeline(summarizer)

    def text_from_uploaded_file(self, video_path):
        #TODO when frontend is done we upload file from there so parameter video_path changed do uploaded_video.
        audio = AudioSegment.from_file(video_path)
        audio = self._convert_file_to_wav(audio, video_path)
        audio_length = audio.duration_seconds

        min_space = 1000  # 1 sec
        max_space = 8000  # 8 secs

        txt_text = ""
        srt_text = ""
        save_result = []



    def _convert_file_to_wav(self, aud_seg, filename):
        aud_seg.export(filename, format="wav")

        newaudio = AudioSegment.from_file(filename)

        return newaudio