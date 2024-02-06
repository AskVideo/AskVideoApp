from app.speech_to_text.models import speech_to_text, punctuation, summarizer
from pyannote.audio import Pipeline
from transformers import pipeline, Wav2Vec2Processor, HubertForCTC, T5Tokenizer, T5ForConditionalGeneration, Wav2Vec2Tokenizer
from pydub import AudioSegment, silence
import re
import torch
import librosa
import audioread
from datetime import timedelta




class Converter:
    def __init__(self):
        self.stt_tokenizer=Wav2Vec2Processor.from_pretrained(speech_to_text)
        self.stt_model=HubertForCTC.from_pretrained(speech_to_text)
        self.t5_punct_tokenizer=T5Tokenizer.from_pretrained(punctuation)
        self.t5_punct_model=T5ForConditionalGeneration.from_pretrained(punctuation)
        self.summarizer=pipeline(summarizer)
        Maximum
        self.min_space=15000 # Minimum temporal distance between two silences
        self.max_space=25000 # Maximum temporal distance between two silences


    def text_from_uploaded_file(self, video_path):
        #TODO when frontend is done we upload file from there so parameter video_path changed do uploaded_video.
        audio = AudioSegment.from_file(video_path)
        audio = self._convert_file_to_wav(audio, video_path)
        audio_length = audio.duration_seconds

        save_result, txt_text = self._transcription(file_path=video_path, audio=audio, start=0, end=audio_length)

        my_split_text_list = self._split_text(txt_text, 256)
        txt_text = ""
        print("my_spliit")
        print(my_split_text_list)
        # punctuate each text block
        for my_split_text in my_split_text_list:
            txt_text += self._add_punctuation(my_split_text)

        print("Texttttttt")
        print(txt_text)
        print("-----------------------------")
        print(save_result)
        my_split_text_list = self._split_text(txt_text, 1024)

        summary = ""
        # Summarize each text block
        for my_split_text in my_split_text_list:
            summary += summarizer(my_split_text)[0]['summary_text']

        # Removing multiple spaces and double spaces around punctuation mark " . "
        summary = re.sub(' +', ' ', summary)
        summary = re.sub(r'\s+([?.!"])', r'\1', summary)


    def _convert_file_to_wav(self, aud_seg, filename):
        aud_seg.export(filename, format="wav")

        newaudio = AudioSegment.from_file(filename)

        return newaudio
    
    def _transcription(self, file_path, audio, start, end):
        # Get Decibels (dB) so silences detection depends on the audio instead of a fixed value
        dbfs = audio.dBFS
        silence_list = silence.detect_silence(audio, min_silence_len=750, silence_thresh=dbfs - 14)

        if silence_list != []:
            silence_list = self._get_middle_silence_time(silence_list)
            silence_list = self._silences_distribution(silence_list, start, end)
        else:
            silence_list = self._generate_regular_split_till_end(silence_list, end)

        txt_text=""
        save_result=[]

        # Transcribe each audio chunk (from timestamp to timestamp) and display transcript
        for i in range(0, len(silence_list) - 1):
            sub_start = silence_list[i]
            sub_end = silence_list[i + 1]

            transcription = self._transcribe_audio_part(file_path, audio, sub_start, sub_end, i)

            # Initial audio has been split with start & end values
            # It begins to 0s, but the timestamps need to be adjust with +start*1000 values to adapt the gap
            if transcription != "":
                save_result, txt_text = self._display_transcription(transcription, save_result,
                                                                        txt_text,
                                                                        sub_start + start * 1000,
                                                                        sub_end + start * 1000)

        return save_result, txt_text

    
    
    
    def _transcribe_audio_part(self, filename, audio, sub_start, sub_end, index):
        """
        Transcribe an audio between a sub_start and a sub_end value (s)
        :param filename: name of the audio file
        :param audio: AudioSegment file
        :param sub_start: start value (s) of the considered audio part to transcribe
        :param sub_end: end value (s) of the considered audio part to transcribe
        :param index: audio file counter
        :return: transcription of the considered audio (only in uppercase, so we add lower() to make the reading easier)
        """
        device = "cuda" if torch.cuda.is_available() else "cpu"
        try:
            with torch.no_grad():
                new_audio = audio[sub_start:sub_end]  # Works in milliseconds
                path = filename[:-3] + "audio_" + str(index) + ".wav"
                new_audio.export(path)  # Exports to a wav file in the current path

                # Load audio file with librosa, set sound rate to 16000 Hz because the model we use was trained on 16000 Hz data
                input_audio, _ = librosa.load(path, sr=16000)

                # return PyTorch torch.Tensor instead of a list of python integers thanks to return_tensors = ‘pt’
                input_values = self.stt_tokenizer(input_audio, sampling_rate=16000, return_tensors="pt").to(device).input_values

                # Get logits from the data structure containing all the information returned by the model and get our prediction
                logits = self.stt_model.to(device)(input_values).logits
                prediction = torch.argmax(logits, dim=-1)

                # Decode & lower our string (model's output is only uppercase)
                if isinstance(self.stt_tokenizer, Wav2Vec2Tokenizer):
                    transcription = self.stt_tokenizer.batch_decode(prediction)[0]
                elif isinstance(self.stt_tokenizer, Wav2Vec2Processor):
                    transcription = self.stt_tokenizer.decode(prediction[0])

                # return transcription
                return transcription.lower()

        except audioread.NoBackendError:
            # Means we have a chunk with a [value1 : value2] case with value1>value2
            print("Sorry")

    
    
    def _get_middle_silence_time(self, silence_list):
        """
        Replace in a list each timestamp by a unique value, which is approximately the middle of each silence timestamp, to
        avoid word cutting
        :param silence_list: List of lists where each element has a start and end value which describes a silence timestamp
        :return: Simple float list
        """
        length = len(silence_list)
        index = 0
        while index < length:
            diff = (silence_list[index][1] - silence_list[index][0])
            if diff < 3500:
                silence_list[index] = silence_list[index][0] + diff / 2
                index += 1
            else:
                adapted_diff = 1500
                silence_list.insert(index + 1, silence_list[index][1] - adapted_diff)
                silence_list[index] = silence_list[index][0] + adapted_diff
                length += 1
                index += 2

        return silence_list
    
    def _silences_distribution(self, silence_list, start, end):
        """
        We keep each silence value if it is sufficiently distant from its neighboring values, without being too much
        :param silence_list: List with silences intervals
        :param start: int value (seconds)
        :param end: int value (seconds)
        :return: list with equally distributed silences
        """
        # If starts != 0, we need to adjust end value since silences detection is performed on the trimmed/cut audio
        # (and not on the original audio) (ex: trim audio from 20s to 2m will be 0s to 1m40 = 2m-20s)

        # Shift the end according to the start value
        end -= start
        start = 0
        end *= 1000

        # Step 1 - Add start value
        newsilence = [start]

        # Step 2 - Create a regular distribution between start and the first element of silence_list to don't have a gap > max_space and run out of memory
        # example newsilence = [0] and silence_list starts with 100000 => It will create a massive gap [0, 100000]

        if silence_list[0] - self.max_space > newsilence[0]:
            for i in range(int(newsilence[0]), int(silence_list[0]), self.max_space):  # int bc float can't be in a range loop
                value = i + self.max_space
                if value < silence_list[0]:
                    newsilence.append(value)

        # Step 3 - Create a regular distribution until the last value of the silence_list
        min_desired_value = newsilence[-1]
        max_desired_value = newsilence[-1]
        nb_values = len(silence_list)

        while nb_values != 0:
            max_desired_value += self.max_space

            # Get a window of the values greater than min_desired_value and lower than max_desired_value
            silence_window = list(filter(lambda x: min_desired_value < x <= max_desired_value, silence_list))

            if silence_window != []:
                # Get the nearest value we can to min_desired_value or max_desired_value depending on srt_token
                nearest_value = min(silence_window, key=lambda x: abs(x - min_desired_value))
                nb_values -= silence_window.index(nearest_value) + 1  # (index begins at 0, so we add 1)

                # Append the nearest value to our list
                newsilence.append(nearest_value)

            # If silence_window is empty we add the max_space value to the last one to create an automatic cut and avoid multiple audio cutting
            else:
                newsilence.append(newsilence[-1] + self.max_space)

            min_desired_value = newsilence[-1]
            max_desired_value = newsilence[-1]

        # Step 4 - Add the final value (end)

        if end - newsilence[-1] > self.min_space:
            # Gap > Min Space
            if end - newsilence[-1] < self.max_space:
                newsilence.append(end)
            else:
                # Gap too important between the last list value and the end value
                # We need to create automatic max_space cut till the end
                newsilence = self._generate_regular_split_till_end(newsilence, end)
        else:
            # Gap < Min Space <=> Final value and last value of new silence are too close, need to merge
            if len(newsilence) >= 2:
                if end - newsilence[-2] <= self.max_space:
                    # Replace if gap is not too important
                    newsilence[-1] = end
                else:
                    newsilence.append(end)

            else:
                if end - newsilence[-1] <= self.max_space:
                    # Replace if gap is not too important
                    newsilence[-1] = end
                else:
                    newsilence.append(end)

        return newsilence
    


    def _generate_regular_split_till_end(self, time_list, end):
        """
        Add automatic "time cuts" to time_list till end value depending on min_space and max_space values
        :param time_list: silence time list
        :param end: int value (s)
        :param min_space: Minimum temporal distance between two silences
        :param max_space: Maximum temporal distance between two silences
        :return: list with automatic time cuts
        """
        # In range loop can't handle float values so we convert to int
        int_last_value = int(time_list[-1])
        int_end = int(end)

        # Add maxspace to the last list value and add this value to the list
        for i in range(int_last_value, int_end, self.max_space):
            value = i + self.max_space
            if value < end:
                time_list.append(value)

        # Fix last automatic cut
        # If small gap (ex: 395 000, with end = 400 000)
        if end - time_list[-1] < self.min_space:
            time_list[-1] = end
        else:
            # If important gap (ex: 311 000 then 356 000, with end = 400 000, can't replace and then have 311k to 400k)
            time_list.append(end)
        return time_list
    

    def _display_transcription(self, transcription, save_result,
                          txt_text, sub_start, sub_end):
        """
        Display results
        :param transcription: transcript of the considered audio
        :param save_result: whole process
        :param txt_text: generated .txt transcript
        :param sub_start: start value (s) of the considered audio part to transcribe
        :param sub_end: end value (s) of the considered audio part to transcribe
        """
       
       
        temp_timestamps = str(timedelta(milliseconds=sub_start)).split(".")[0] + " --> " + \
                            str(timedelta(milliseconds=sub_end)).split(".")[0] + "\n"
        temp_list = [temp_timestamps, transcription, int(sub_start / 1000)]
        save_result.append(temp_list)
           

        txt_text += transcription + " "  # So x seconds sentences are separated

        return save_result, txt_text
    

    def _split_text(self, my_text, max_size):
        """
        Split a text
        Maximum sequence length for this model is max_size.
        If the transcript is longer, it needs to be split by the nearest possible value to max_size.
        To avoid cutting words, we will cut on "." characters, and " " if there is not "."
        :return: split text
        """

        cut2 = max_size
        

        # First, we get indexes of "."
        my_split_text_list = []
        nearest_index = 0
        length = len(my_text)
        # We split the transcript in text blocks of size <= max_size.
        if cut2 == length:
            my_split_text_list.append(my_text)
        else:
            while cut2 <= length:
                cut1 = nearest_index
                cut2 = nearest_index + max_size
                # Find the best index to split

                dots_indexes = [index for index, char in enumerate(my_text[cut1:cut2]) if
                                char == "."]
                if dots_indexes != []:
                    nearest_index = max(dots_indexes) + 1 + cut1
                else:
                    spaces_indexes = [index for index, char in enumerate(my_text[cut1:cut2]) if
                                    char == " "]
                    if spaces_indexes != []:
                        nearest_index = max(spaces_indexes) + 1 + cut1
                    else:
                        nearest_index = cut2 + cut1
                my_split_text_list.append(my_text[cut1: nearest_index])

        return my_split_text_list
    


    def _add_punctuation(self, transcript):
        """
        Punctuate a transcript
        :return: Punctuated and improved (corrected) transcript
        """
        input_text = "fix: { " + transcript + " } </s>"

        input_ids = self.t5_punct_tokenizer.encode(input_text, return_tensors="pt", max_length=10000, truncation=True,
                                        add_special_tokens=True)

        outputs = self.t5_punct_model.generate(
            input_ids=input_ids,
            max_length=256,
            num_beams=4,
            repetition_penalty=1.0,
            length_penalty=1.0,
            early_stopping=True
        )

        transcript = self.t5_punct_tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)

        return transcript