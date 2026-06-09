# Bolan Article Judgement

Prompt: `Skriv en artikel om bolån`

Run: llama.cpp b9222 Vulkan, 262144 context, Q4_0/Q4_0 KV, flash attention, `temperature=0.65`, `top_p=0.95`, `top_k=20`, `presence_penalty=0.0`, `repeat_penalty=1.0`, `enable_thinking=true`, `draft-mtp n_min=1 n_max=2`, `max_tokens=2600`.

Scoring baseline as of 2026-05-20:
- New-purchase bolånetak is 90 percent of market value, so 10 percent minimum cash deposit.
- Add-on mortgage cap is 80 percent.
- Amortization: above 70 percent LTV requires 2 percent per year; above 50 percent and up to 70 percent requires 1 percent per year.
- The previous extra amortization requirement for debt over 4.5x gross income has been removed under the 2026 law.

| Model | Score | Judgement |
|---|---:|---|
| Qwopus 35B APEX I-Balanced | 7.0 | Best overall readability and structure. Swedish is natural enough and the article covers the right themes. Main factual flaw: amortization bands are shifted upward by one point, incorrectly saying under 50 percent requires 1 percent and over 70 percent requires 3 percent. Also says 15 percent deposit, now outdated for new purchases. |
| Huihui 35B A3B MTP Q5_K | 6.5 | Clear, useful, and concise article with decent Swedish. Main factual flaw: says loans over 50 percent LTV must amortize 2 percent yearly, missing the 50-70 percent = 1 percent rule. Also uses awkward phrases and a few typos. |
| Qwopus 35B MXFP4_MOE | 5.5 | Coherent article and practical framing, but contains serious invented details: says banks normally lend up to 80 percent, invents/garbles bolånesäkring over 80 percent, and only partially describes amortization. Better prose than its factual accuracy. |
| Qwopus 27B preview IQ4_XS | 5.0 | Readable, helpful structure, but several Swedish and factual issues: outdated 85 percent loan cap, incorrect amortization claim tied to bostadsvärde and 4.5 million, odd terms like inkassotaxa/mäklarpengar, and invented bank products like räntegaranti. |
| Qwopus 35B APEX Balanced | 4.5 | Fluent enough but financially unsafe. It invents a tiered bolånetak by loan size and incorrectly says amortization is a requirement for most loans over 85 percent of value. Good article shape, poor correctness. |
| Qwen3.6 27B PRISM-PRO-DQ | 2.0 | Long and article-like, but too many hallucinations and language errors: "förtedanspanning", "förskott" for LTV, fictitious 0.25 percent amortization minimum, odd loan categories, and unreliable Swedish. Not safe for a finance article. |

Raw outputs:
- `logs/bolan-Huihui_35B_A3B_MTP_Q5_K-bolan-article.article.md`
- `logs/bolan-Qwopus_35B_APEX_Balanced-bolan-article.article.md`
- `logs/bolan-Qwopus_35B_APEX_I-Balanced-bolan-article.article.md`
- `logs/bolan-Qwopus_35B_MXFP4_MOE-bolan-article.article.md`
- `logs/bolan-Qwopus_27B_preview_IQ4_XS-bolan-article.article.md`
- `logs/bolan-Qwen3.6_27B_PRISM-PRO-DQ-bolan-article.article.md`
