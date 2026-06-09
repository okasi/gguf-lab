from huggingface_hub import hf_hub_download
path = hf_hub_download(
    repo_id="huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF",
    filename="Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-ggml-model-Q5_K.gguf",
    local_dir="models",
    local_dir_use_symlinks=False,
    resume_download=True,
)
print(path)
