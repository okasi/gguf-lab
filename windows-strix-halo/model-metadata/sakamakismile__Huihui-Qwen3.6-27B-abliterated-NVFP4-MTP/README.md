---
license: apache-2.0
base_model: huihui-ai/Huihui-Qwen3.6-27B-abliterated
base_model_relation: quantized
library_name: transformers
tags:
  - qwen3_5
  - qwen3.6
  - nvfp4
  - quantized
  - modelopt
  - mtp
  - speculative-decoding
  - blackwell
  - abliterated
  - multimodal
  - image-text-to-text
  - vlm
pipeline_tag: image-text-to-text
language:
  - en
  - zh
  - ja
  - ko
  - fr
  - de
  - es
  - it
  - pt
  - ru
  - ar
---

# Huihui-Qwen3.6-27B-abliterated-NVFP4-MTP

NVFP4-quantized **multimodal** abliterated sibling of [`Qwen/Qwen3.6-27B`](https://huggingface.co/Qwen/Qwen3.6-27B), with the **MTP (Multi-Token Prediction) head restored in bf16** so speculative decoding works.

Vision tower is **kept** (in bf16 — image and video input still work).

## Headline performance (1 × RTX PRO 6000 Blackwell, vLLM 0.19.1rc1)

- 🚀 **Aggregate ~200 tok/s on a single GPU** with two concurrent sessions at full **256K context** (KV FP8 + MTP n=3): **197.8 tok/s** at 700-token decodes, 183.3 tok/s at 350-token decodes — production-grade serving from one Blackwell card while keeping the vision tower active.
- 🖼 **Image-input round-trip 129.1 tok/s** end-to-end (inline base64 PNG, 89-token prompt → 352-token answer; image content correctly identified).
- ⚡ **137 tok/s single-request decode** at the smaller 16K BF16-KV configuration.
- 🎯 **256K context ceiling, 7× concurrency budget** at full 256K with KV FP8 (KV cache holds 492,800 tokens on a 96 GB Blackwell card).
- 🟢 vLLM-ready, full launch flags below.

## Sibling repos

| | This repo | Text-only sibling | Original VLM (compressed-tensors) |
|---|---|---|---|
| Repo | `Huihui-Qwen3.6-27B-abliterated-NVFP4-MTP` | [`Qwen3.6-27B-Text-NVFP4-MTP`](https://huggingface.co/sakamakismile/Qwen3.6-27B-Text-NVFP4-MTP) | [`Huihui-Qwen3.6-27B-abliterated-NVFP4`](https://huggingface.co/sakamakismile/Huihui-Qwen3.6-27B-abliterated-NVFP4) |
| Vision input | **✅ image + video** | ❌ text-only | ✅ |
| Quantization format | **`modelopt`** (vLLM SM120 native path) | `modelopt` | `compressed-tensors` |
| MTP head | **✅ bf16, working** | ✅ bf16, working | ❌ dropped → 0% acceptance |
| Abliterated | **✅ (huihui-ai base)** | ❌ | ✅ |

## What's different from the original `Huihui-Qwen3.6-27B-abliterated-NVFP4`

The original repo was quantized with `llmcompressor` to `compressed-tensors` format
and had the same problem we hit on the official Qwen repo: `AutoModelForCausalLM`
silently drops the MTP head during export, leading to 0% draft acceptance, **and**
`compressed-tensors` NVFP4 takes a slower fallback path on Blackwell SM120 in
vLLM 0.19.x.

This repo:

1. **Quantization format**: `modelopt` (native NVFP4 GEMM via
   `FlashInferCutlassNvFp4LinearKernel` on Blackwell)
2. **MTP head**: 15 `mtp.*` tensors (~850 MB, bf16) re-grafted from the original
   bf16 base, and added to `quantization_config.ignore`
3. **Vision tower**: **kept** in bf16 (`*visual*` on the ignore list — image
   encoder integrity preserved)
4. **Mamba/SSM convs**: `*linear_attn.conv1d*` is on `modelopt`'s default ignore
   list, so the hybrid layer convolutions stay in bf16
5. **Abliteration**: inherited from the upstream [`huihui-ai/Huihui-Qwen3.6-27B-abliterated`](https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated) base — no
   additional alignment pass

## Why "Unsensor"?

This is the abliterated counterpart of our text-only release. The intent (per the
maintainer's [philosophy](https://huggingface.co/sakamakismile)) is **not "remove
the chains" but "remove the colored glasses"** — let the model observe and reason
neutrally, without the strong refusal-shaped priors learned during alignment.
You're expected to use it responsibly.

## Reproduce this quantization

This model was produced by the open-source [`lna-lab/GGUF-to-NVFP4-SM120`](https://github.com/lna-lab/GGUF-to-NVFP4-SM120) pipeline — Lna-Lab's production line for converting Qwen3.5 / 3.6 / Gemma 4 checkpoints into modelopt-format NVFP4 + working MTP, ready for vLLM on Blackwell SM120. The VLM variant (vision tower kept in bf16) uses [`src/quantize/qwen36_27b_vlm_mtp.py`](https://github.com/lna-lab/GGUF-to-NVFP4-SM120/blob/main/src/quantize/qwen36_27b_vlm_mtp.py); the 5-step MTP graft recipe is documented in [`docs/MTP_GRAFT_RECIPE.md`](https://github.com/lna-lab/GGUF-to-NVFP4-SM120/blob/main/docs/MTP_GRAFT_RECIPE.md).

## Quantization details

- **Base**: `huihui-ai/Huihui-Qwen3.6-27B-abliterated` (bf16, 27.78B params,
  hybrid linear-attn + full-attn, 64 layers, 1 MTP layer)
- **Quantizer**: `nvidia-modelopt` 0.43.0 with `NVFP4_DEFAULT_CFG`
- **Calibration**: 20 samples from `neuralmagic/calibration` (LLM split),
  max_seq_len 8192
- **Ignored from quantization** (kept in bf16):
  - `lm_head`
  - All `model.visual.*` (vision tower bf16-preserved)
  - All `*linear_attn.conv1d*` (Mamba-style SSM convolutions, 48 of 64 layers)
  - All `mtp.*` modules (15 tensors, ~850 MB bf16)
  - Other `NVFP4_DEFAULT_CFG` defaults (router, mlp.gate, output_layer …)

## Usage with vLLM (Blackwell, SM120)

### Recommended production launch — 256K context · KV FP8 · MTP n=3 · image input

```bash
vllm serve sakamakismile/Huihui-Qwen3.6-27B-abliterated-NVFP4-MTP \
    --trust-remote-code \
    --quantization modelopt \
    --max-model-len 262144 \
    --max-num-seqs 2 \
    --kv-cache-dtype fp8 \
    --gpu-memory-utilization 0.9 \
    --reasoning-parser qwen3 \
    --speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'
```

This is what we run in production on a single RTX PRO 6000 Blackwell — full 256K context, image input enabled, fp8 KV cache for concurrency headroom. Then send an image-aware request:

```bash
curl http://localhost:8000/v1/chat/completions -H 'Content-Type: application/json' -d '{
  "model": "sakamakismile/Huihui-Qwen3.6-27B-abliterated-NVFP4-MTP",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "image_url", "image_url": {"url": "https://example.com/photo.jpg"}},
      {"type": "text", "text": "Describe what you see in this image."}
    ]
  }],
  "max_tokens": 400
}'
```

The four flags that are easy to skip but matter:

- **`--max-model-len 262144`** — full 256K context. Qwen3.6 declares 262K as the trained max, and at NVFP4 weights + fp8 KV the budget fits comfortably on a 96 GB Blackwell card.
- **`--kv-cache-dtype fp8`** — halves KV memory, lifts maximum concurrency at 256K from ~4× (BF16, won't fit) to **7.0×** with the same VRAM. Per-token decode pays a small overhead (~5–10 % vs BF16 KV), the trade is worth it on long-context workloads.
- **`--max-num-seqs 2`** — the load-bearing number. `--max-num-seqs 4` plus `--kv-cache-dtype fp8` plus `--speculative-config n=3` plus `--max-model-len 262144` will silently OOM during cuda-graph capture on this build of vLLM (0.19.1rc1). Two in-flight slots is the sweet spot for a single-card deployment; on a multi-GPU box, run one instance per GPU at `--max-num-seqs 2` rather than one large instance.
- **`num_speculative_tokens: 3`** — vLLM applies the single MTP layer (`mtp_num_hidden_layers=1`) recursively three times per draft pass; per-position acceptance ~87 / 72 / 61 % at positions 1 / 2 / 3 lands mean accepted-length around 3.0, which is what unlocks the 100+ tok/s rate. `num_speculative_tokens: 1` is a safer fallback if you hit a draft-path bug.

The `qwen3_5_mtp` handler is internally normalized to `mtp` by current vLLM (deprecated-name warning is harmless).

### Multi-GPU + KV FP8 (high-throughput serving)

For aggregate-throughput serving on a 6-GPU Blackwell box, **one instance
per GPU with `--max-num-seqs 2` and `--kv-cache-dtype fp8`** is the
practical layout (two instances on the same GPU is not viable on vLLM
V1 — see below):

```bash
for gpu in 0 1 2 3 4 5; do
  CUDA_VISIBLE_DEVICES=$gpu vllm serve <repo> \
      --trust-remote-code \
      --gpu-memory-utilization 0.85 \
      --kv-cache-dtype fp8 \
      --max-model-len 8192 \
      --max-num-seqs 2 \
      --quantization modelopt \
      --reasoning-parser qwen3 \
      --speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}' \
      --port $((8002 + gpu)) &
done
```

This gives **12 in-flight requests max** across the 6 GPUs (= 6 × 2)
and lets vLLM's continuous batching share the MTP draft path between
the two slots on each GPU.

KV FP8 introduces no measurable quality regression on the Qwen3.5/3.6
family.

> **Why not 2 vLLM instances per GPU?** vLLM V1 cannot reliably share
> a single GPU between two processes — each instance accounts for the
> *entire* GPU's free memory, so two simultaneous instances both
> reserve overlapping pools and OOM during cuda-graph capture. RTX PRO
> 6000 Blackwell *Workstation* Edition does not expose MIG either, so
> the practical ceiling is one vLLM per GPU.

## Verified locally (RTX PRO 6000 Blackwell, vLLM 0.19.1rc1)

### Production config — 256K context · KV FP8 · MTP n=3 · max-num-seqs 2

Single + 2-session-parallel decode, T = 0:

| Prompt | Single tok/s | **2-parallel agg tok/s** | per-request |
|---|---|---|---|
| Short (50 tok) | 117.9 | 49.3 | 26.1 (latency-bound) |
| Medium (350 tok) | 97.4 | **183.3** | 91.7 |
| Long-form (700 tok) | 100.5 | **197.8** | 99.1 |

KV cache size at 256K + fp8: **492,800 tokens** → **maximum concurrency 7.01×** at full 256K context. Available KV memory: 63.97 GiB on a 96 GB Blackwell card.

**Image-input round-trip** (inline base64 PNG, 89-token prompt → 352-token answer): **129.1 tok/s** end-to-end including the vision-tower forward pass; image content correctly identified (colors and overlaid text both recognised).

### Smaller-context single-request bench (16K, BF16 KV) — fastest interactive use

9-run T = 0 single-request bench, vision tower active:

| Prompt | Tokens | n=1 tok/s | **n=3 tok/s** |
|---|---|---|---|
| Short (50 tok) | 50 | ~71 | **136.8** |
| Medium (350 tok) | 350 | ~85 | **112.3** |
| Long-form (700 tok) | 700 | ~85 | **103.7** |

For text-only inference at the same numbers but ~1 GB less VRAM, the
sibling [`Huihui-Qwen3.6-27B-abliterated-NVFP4-TEXT-MTP`](https://huggingface.co/sakamakismile/Huihui-Qwen3.6-27B-abliterated-NVFP4-TEXT-MTP)
strips the vision tower; lands at 135 / 112 / 109 tok/s in the 16K bench
and matches this repo's 256K + fp8 results within noise.

### `num_speculative_tokens=1` (historical) — text + image multi-domain

Single request, T = 0.7, 2000-token long-form decode across 4 domains:

| Domain | tok/s |
|---|---|
| Technical (CS) | 87.0 |
| Literary (Japanese) | 76.4 |
| Reasoning (math) | 90.6 |
| Code review | 90.5 |
| **mean** | **86.9** |

- **MTP acceptance** (n=1): 81.1% on long-form (T=0.7), 86.8% on short prompts (T=0)
- **Image input** (Pexels cat / HF logo / code screenshot / public domain art):
  77–84 tok/s with image preprocess included; output is coherent and
  domain-aware

### Aggregate throughput (6 GPUs, 1 instance per GPU, max-num-seqs=2)

12 concurrent requests (× 500 tokens, T=0.7) round-robined across 6 endpoints:

| metric | value |
|---|---|
| concurrency | 12 (= 6 GPUs × 2 in-flight) |
| successful requests | 12 / 12 |
| wall time | 9.0 s |
| **aggregate tok/s** | **648.4** |
| avg per-req tok/s | 57.3 |
| MTP acceptance | 80.1% |

That's ~7.5× the single-request decode rate, which is the realistic ceiling
for a 6 × RTX PRO 6000 Blackwell box serving this model concurrently —
each user lands on a GPU that handles up to 2 in-flight requests at a
time via vLLM's continuous batching. (Co-resident multi-instance per GPU
was attempted and rejected: vLLM V1 cannot share VRAM accounting across
two processes on the same GPU, so a 12-instance / 24-in-flight layout
hits CUDA OOM during cuda-graph capture; this is upstream-known. RTX PRO
6000 Blackwell *Workstation* does not expose MIG either.)

## Hardware target

Built and tested on **NVIDIA RTX PRO 6000 Blackwell (SM120)**. Should also work
on **RTX 5090** and other Blackwell consumer/workstation cards with sufficient
VRAM (the model is roughly 15 GB NVFP4 weights + ~5 GB bf16 vision/MTP/SSM/
lm_head ≈ 20.6 GB on disk, ≈ 21 GB at load with KV cache room on top).

## Acknowledgements

- [`huihui-ai`](https://huggingface.co/huihui-ai) — for the abliterated base
- [`Qwen`](https://huggingface.co/Qwen) — for the original Qwen3.6-27B
- [`osoleve`](https://huggingface.co/osoleve) — for the MTP-restoration recipe
  on Qwen3.5
- [`nvidia-modelopt`](https://github.com/NVIDIA/TensorRT-Model-Optimizer) team
- The reporters of Discussions #5 and #7 on the original repo — for catching
  the issues cleanly

## Support the Base Model Authors

If you find this model useful, please consider supporting:

- **huihui-ai** (abliteration): [Ko-fi](https://ko-fi.com/huihuiai) | BTC: `bc1qqnkhuchxw0zqjh2ku3lu4hq45hc6gy84uk70ge`
- **Qwen Team** (original model): [Star the Qwen repo](https://huggingface.co/Qwen/Qwen3.6-27B)

## License

This model inherits the Apache 2.0 license.
