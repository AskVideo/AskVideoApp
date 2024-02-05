# Speaker diarization
speaker_diarization="pyannote/speaker-diarization-3.1"
diarization_pipe_token="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"

# English speech to text model
speech_to_text="facebook/hubert-large-ls960-ft"

# Auto grammer fixer(by punctuation as i understand it) model
# We can use T5 for text-to-text if needed(https://huggingface.co/google-t5/t5-small)
punctuation="flexudy/t5-small-wav2vec2-grammar-fixer"

# Summarizer model 
summarizer="summarization"
