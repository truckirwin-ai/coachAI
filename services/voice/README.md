# Voice Service

Low-latency voice pipeline. See SPEC.md §13

## Responsibilities
- WebRTC audio stream handling
- AWS Transcribe Streaming (STT)
- Voice Activity Detection (Silero VAD)
- ElevenLabs TTS streaming
- Interruption handling

## Latency Budget
STT ~100ms + context ~20ms + LLM TTFT ~300ms + TTS ~200ms + overhead ~100ms = ~720ms
