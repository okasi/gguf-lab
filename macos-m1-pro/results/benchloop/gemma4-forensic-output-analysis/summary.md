# Gemma 4 Forensic Output Analysis

This report compares every BenchLoop task output across Extra5 and Extra3 runs. Full per-run outputs are in `full-task-diff.md`; machine-readable rows are in `task-rows.json` and `task-stats.json`.

## High-Variance Tasks

| Model | Suite | Task | Spread | Best | Worst | Scores |
|---|---|---|---:|---|---|---|
| E2B | reasonmath | `rm-05` | 100.00 | extra5-i05 100.00 | extra5-i03 0.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:0 extra5-i03:0 extra5-i04:100 extra5-i05:100 |
| E2B | reasonmath | `rm-06` | 100.00 | extra3-i03 100.00 | extra5-i05 0.00 | extra3-i01:0 extra3-i02:0 extra3-i03:100 extra5-i01:0 extra5-i02:0 extra5-i03:0 extra5-i04:0 extra5-i05:0 |
| E2B | reasonmath | `rm-12` | 100.00 | extra5-i05 100.00 | extra3-i03 0.00 | extra3-i01:100 extra3-i02:100 extra3-i03:0 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |
| E2B | reasonmath | `rm-15` | 100.00 | extra3-i03 100.00 | extra5-i05 0.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:0 extra5-i02:0 extra5-i03:0 extra5-i04:0 extra5-i05:0 |
| E4B | reasonmath | `rm-04` | 100.00 | extra5-i05 100.00 | extra5-i04 0.00 | extra3-i01:100 extra3-i02:0 extra3-i03:100 extra5-i01:100 extra5-i02:0 extra5-i03:0 extra5-i04:0 extra5-i05:100 |
| E4B | reasonmath | `rm-05` | 100.00 | extra5-i05 100.00 | extra5-i04 0.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:0 extra5-i04:0 extra5-i05:100 |
| E4B | reasonmath | `rm-12` | 100.00 | extra5-i05 100.00 | extra3-i02 0.00 | extra3-i01:100 extra3-i02:0 extra3-i03:100 extra5-i01:0 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |
| E2B | dataextract | `de-13` | 92.00 | extra5-i05 92.00 | extra5-i03 0.00 | extra3-i01:92 extra3-i02:92 extra3-i03:92 extra5-i01:0 extra5-i02:92 extra5-i03:0 extra5-i04:92 extra5-i05:92 |
| E4B | dataextract | `de-14` | 76.00 | extra5-i02 76.00 | extra5-i01 0.00 | extra3-i01:59 extra3-i02:71 extra3-i03:65 extra5-i01:0 extra5-i02:76 extra5-i03:59 extra5-i04:71 extra5-i05:65 |
| E2B | toolcall | `tc-03` | 75.00 | extra5-i05 100.00 | extra5-i04 25.00 | extra3-i01:100 extra3-i02:25 extra3-i03:100 extra5-i01:100 extra5-i02:25 extra5-i03:100 extra5-i04:25 extra5-i05:100 |
| E2B | toolcall | `tc-05` | 75.00 | extra5-i05 100.00 | extra3-i03 25.00 | extra3-i01:100 extra3-i02:100 extra3-i03:25 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |
| E4B | toolcall | `tc-05` | 75.00 | extra3-i03 100.00 | extra5-i05 25.00 | extra3-i01:25 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:25 extra5-i05:25 |
| E4B | reasonmath | `rm-13` | 55.00 | extra5-i03 55.00 | extra5-i05 0.00 | extra3-i01:0 extra3-i02:0 extra3-i03:0 extra5-i01:0 extra5-i02:0 extra5-i03:55 extra5-i04:0 extra5-i05:0 |
| E2B | agent | `agent-02-stock-portfolio` | 50.00 | extra3-i02 100.00 | extra3-i03 50.00 | extra3-i01:75 extra3-i02:100 extra3-i03:50 extra5-i01:75 extra5-i02:75 extra5-i03:75 extra5-i04:75 extra5-i05:75 |
| E2B | instructfollow | `if-01` | 50.00 | extra5-i05 100.00 | extra3-i02 50.00 | extra3-i01:100 extra3-i02:50 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |
| E2B | instructfollow | `if-02` | 50.00 | extra5-i05 100.00 | extra3-i03 50.00 | extra3-i01:50 extra3-i02:50 extra3-i03:50 extra5-i01:100 extra5-i02:50 extra5-i03:50 extra5-i04:100 extra5-i05:100 |
| E2B | instructfollow | `if-07` | 50.00 | extra5-i05 100.00 | extra5-i04 50.00 | extra3-i01:50 extra3-i02:100 extra3-i03:100 extra5-i01:50 extra5-i02:100 extra5-i03:100 extra5-i04:50 extra5-i05:100 |
| E4B | agent | `agent-03-string-roundtrip` | 50.00 | extra5-i05 100.00 | extra5-i04 50.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:50 extra5-i05:100 |
| E4B | instructfollow | `if-02` | 50.00 | extra5-i05 100.00 | extra5-i03 50.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:50 extra5-i04:100 extra5-i05:100 |
| E4B | instructfollow | `if-04` | 50.00 | extra5-i05 100.00 | extra3-i03 50.00 | extra3-i01:50 extra3-i02:100 extra3-i03:50 extra5-i01:100 extra5-i02:100 extra5-i03:50 extra5-i04:100 extra5-i05:100 |
| E4B | instructfollow | `if-07` | 50.00 | extra5-i05 100.00 | extra5-i03 50.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:50 extra5-i04:100 extra5-i05:100 |
| E4B | instructfollow | `if-15` | 50.00 | extra5-i02 100.00 | extra5-i05 50.00 | extra3-i01:50 extra3-i02:50 extra3-i03:50 extra5-i01:50 extra5-i02:100 extra5-i03:50 extra5-i04:50 extra5-i05:50 |
| E2B | reasonmath | `rm-03` | 45.00 | extra5-i04 100.00 | extra5-i05 55.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:55 |
| E4B | reasonmath | `rm-03` | 45.00 | extra5-i05 100.00 | extra5-i03 55.00 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:55 extra5-i04:100 extra5-i05:100 |
| E2B | dataextract | `de-09` | 40.00 | extra3-i02 80.00 | extra5-i03 40.00 | extra3-i01:80 extra3-i02:80 extra3-i03:70 extra5-i01:50 extra5-i02:70 extra5-i03:40 extra5-i04:70 extra5-i05:70 |
| E2B | instructfollow | `if-05` | 33.30 | extra5-i05 100.00 | extra5-i03 66.70 | extra3-i01:100 extra3-i02:100 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:67 extra5-i04:100 extra5-i05:100 |
| E4B | instructfollow | `if-10` | 33.30 | extra5-i04 100.00 | extra5-i05 66.70 | extra3-i01:67 extra3-i02:67 extra3-i03:67 extra5-i01:67 extra5-i02:67 extra5-i03:67 extra5-i04:100 extra5-i05:67 |
| E4B | instructfollow | `if-11` | 33.30 | extra5-i05 100.00 | extra3-i02 66.70 | extra3-i01:100 extra3-i02:67 extra3-i03:100 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |
| E4B | dataextract | `de-09` | 30.00 | extra5-i04 90.00 | extra5-i05 60.00 | extra3-i01:90 extra3-i02:70 extra3-i03:90 extra5-i01:90 extra5-i02:80 extra5-i03:90 extra5-i04:90 extra5-i05:60 |
| E2B | dataextract | `de-04` | 29.00 | extra5-i05 86.00 | extra3-i02 57.00 | extra3-i01:57 extra3-i02:57 extra3-i03:86 extra5-i01:71 extra5-i02:86 extra5-i03:86 extra5-i04:71 extra5-i05:86 |
| E2B | dataextract | `de-11` | 29.00 | extra5-i04 100.00 | extra5-i01 71.00 | extra3-i01:86 extra3-i02:100 extra3-i03:86 extra5-i01:71 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:86 |
| E2B | agent | `agent-03-string-roundtrip` | 25.00 | extra5-i05 100.00 | extra3-i03 75.00 | extra3-i01:100 extra3-i02:100 extra3-i03:75 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |
| E2B | agent | `agent-05-refuse-unknown-tool` | 25.00 | extra5-i05 100.00 | extra3-i03 75.00 | extra3-i01:100 extra3-i02:100 extra3-i03:75 extra5-i01:100 extra5-i02:100 extra5-i03:100 extra5-i04:100 extra5-i05:100 |

## Current Extra5 Non-Perfect Tasks

| Model | Suite | Task | Extra5 Score | Best Run | Best Score | Error In Extra5 |
|---|---|---|---:|---|---:|---|
| E2B | reasonmath | `rm-06` | 0.00 | extra3-i03 | 100.00 | missing switch; missing stay |
| E2B | reasonmath | `rm-15` | 0.00 | extra3-i03 | 100.00 | missing count |
| E2B | dataextract | `de-13` | 92.00 | extra5-i05 | 92.00 |  |
| E4B | dataextract | `de-14` | 65.00 | extra5-i02 | 76.00 | anc_type: mismatch / array values did not match expected set / driver_size: mismatch / array values did not match expected set / product_typ |
| E4B | toolcall | `tc-05` | 25.00 | extra3-i03 | 100.00 | matched 0/1 required tool calls; answered directly instead of using tools |
| E4B | reasonmath | `rm-13` | 0.00 | extra5-i03 | 55.00 | amount expected 5718.96, got 5721.08; interest expected 718.96, got 721.08 |
| E2B | agent | `agent-02-stock-portfolio` | 75.00 | extra3-i02 | 100.00 |  |
| E4B | instructfollow | `if-15` | 50.00 | extra5-i02 | 100.00 | city_constraints |
| E2B | reasonmath | `rm-03` | 55.00 | extra5-i04 | 100.00 | saved_money expected yes, got no |
| E2B | dataextract | `de-09` | 70.00 | extra3-i02 | 80.00 | date: mismatch / requester_name: mismatch / room: mismatch |
| E4B | instructfollow | `if-10` | 66.70 | extra5-i04 | 100.00 | exactly_50_words_humanity_to_stars |
| E4B | dataextract | `de-09` | 60.00 | extra5-i04 | 90.00 | needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / requester_name: mismatch |
| E2B | dataextract | `de-04` | 86.00 | extra5-i05 | 86.00 |  |
| E2B | dataextract | `de-11` | 86.00 | extra5-i04 | 100.00 |  |
| E2B | dataextract | `de-10` | 80.00 | extra5-i05 | 80.00 | neighborhood: expected null / visit_duration: expected string |
| E2B | dataextract | `de-14` | 59.00 | extra5-i01 | 76.00 | anc_type: mismatch / array values did not match expected set / driver_size: mismatch / array values did not match expected set / product_nam |
| E4B | dataextract | `de-04` | 86.00 | extra5-i05 | 86.00 |  |
| E2B | dataextract | `de-12` | 79.00 | extra3-i03 | 93.00 | complaint: mismatch / product_name: mismatch / rating: mismatch |
| E4B | dataextract | `de-12` | 86.00 | extra3-i03 | 93.00 |  |
| E2B | dataextract | `de-07` | 76.00 | extra5-i04 | 81.00 | location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch |
| E4B | dataextract | `de-10` | 80.00 | extra5-i05 | 80.00 | neighborhood: expected null / visit_duration: expected string |
| E2B | dataextract | `de-03` | 92.00 | extra5-i05 | 92.00 |  |
| E2B | speed | `speed-short-001` | 63.28 | extra5-i04 | 63.59 |  |
| E2B | speed | `speed-short-003` | 62.53 | extra5-i04 | 69.06 |  |
| E2B | speed | `speed-short-002` | 62.12 | extra3-i02 | 69.89 |  |
| E4B | speed | `speed-short-001` | 52.88 | extra5-i02 | 54.43 |  |
| E2B | dataextract | `de-05` | 86.00 | extra5-i05 | 86.00 |  |
| E2B | dataextract | `de-06` | 80.00 | extra3-i02 | 87.00 | medication_dose: mismatch / medication_duration: expected string / referral: expected null |
| E4B | dataextract | `de-05` | 93.00 | extra5-i05 | 93.00 |  |
| E4B | dataextract | `de-06` | 87.00 | extra5-i05 | 87.00 |  |
| E4B | speed | `speed-short-003` | 53.18 | extra5-i02 | 58.91 |  |
| E4B | speed | `speed-short-002` | 55.11 | extra3-i03 | 60.31 |  |
| E2B | speed | `speed-long-003` | 68.98 | extra3-i02 | 69.69 |  |
| E4B | speed | `speed-medium-001` | 58.93 | extra5-i03 | 60.53 |  |
| E2B | speed | `speed-medium-003` | 68.99 | extra3-i03 | 69.84 |  |
| E4B | speed | `speed-long-002` | 60.34 | extra5-i05 | 60.34 |  |
| E2B | speed | `speed-medium-002` | 68.42 | extra5-i03 | 69.86 |  |
| E2B | speed | `speed-medium-001` | 68.38 | extra5-i03 | 68.93 |  |
| E4B | speed | `speed-medium-002` | 59.23 | extra3-i02 | 60.60 |  |
| E4B | speed | `speed-medium-003` | 60.10 | extra5-i01 | 60.59 |  |
| E2B | speed | `speed-long-001` | 68.44 | extra5-i04 | 70.00 |  |
| E4B | speed | `speed-long-001` | 59.56 | extra5-i04 | 60.34 |  |
| E2B | speed | `speed-long-002` | 68.53 | extra3-i02 | 69.03 |  |
| E4B | speed | `speed-long-003` | 59.76 | extra5-i03 | 60.01 |  |
| E2B | instructfollow | `if-03` | 0.00 | extra5-i05 | 0.00 | three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words |
| E2B | instructfollow | `if-04` | 50.00 | extra5-i05 | 50.00 | reverse_alpha_order |
| E2B | instructfollow | `if-08` | 50.00 | extra5-i05 | 50.00 | allowed_items_unique_starts |
| E2B | instructfollow | `if-10` | 66.70 | extra5-i05 | 66.70 | exactly_50_words_humanity_to_stars |
| E2B | instructfollow | `if-12` | 0.00 | extra5-i05 | 0.00 | exact_impossible_line |
| E2B | instructfollow | `if-14` | 0.00 | extra5-i05 | 0.00 | two_sentences; all_caps_rain_bang |
| E2B | instructfollow | `if-15` | 50.00 | extra5-i05 | 50.00 | city_constraints |
| E2B | reasonmath | `rm-04` | 0.00 | extra5-i05 | 0.00 | did not identify inconsistency / non-unique ordering |
| E2B | reasonmath | `rm-08` | 0.00 | extra5-i05 | 0.00 | fill_time expected 7.2, got 9 minutes |
| E2B | reasonmath | `rm-13` | 0.00 | extra5-i05 | 0.00 | amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09 |
| E4B | agent | `agent-02-stock-portfolio` | 75.00 | extra5-i05 | 75.00 |  |
| E4B | dataextract | `de-03` | 92.00 | extra5-i05 | 92.00 |  |
| E4B | dataextract | `de-07` | 76.00 | extra5-i05 | 76.00 | location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch |
| E4B | dataextract | `de-13` | 92.00 | extra5-i05 | 92.00 |  |
| E4B | instructfollow | `if-03` | 0.00 | extra5-i05 | 0.00 | three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words |
| E4B | instructfollow | `if-05` | 33.30 | extra5-i05 | 33.30 | format_and_sorted_heaviest_to_lightest; at_least_one_under_1kg |

## Best Candidate By Model/Suite

| Model | Suite | Best Run | Candidate | Avg Task Score | Partials |
|---|---|---|---|---:|---:|
| E2B | agent | extra3-i02 | `json-768-instruction-448-default-288` | 100.00 | 0/8 |
| E2B | coding | extra3-i01 | `promoted-extra5-control` | 100.00 | 0/12 |
| E2B | dataextract | extra5-i02 | `json-640-tool-256-coding-128` | 86.93 | 10/15 |
| E2B | instructfollow | extra5-i05 | `balanced-retry-empty-json-320-896` | 67.78 | 7/15 |
| E2B | reasonmath | extra3-i01 | `promoted-extra5-control` | 73.33 | 4/15 |
| E2B | speed | extra5-i04 | `json-640-instruction-384-reasonmath-768` | 67.82 | 9/9 |
| E2B | toolcall | extra3-i01 | `promoted-extra5-control` | 100.00 | 0/15 |
| E4B | agent | extra3-i01 | `promoted-extra5-control` | 96.88 | 1/8 |
| E4B | coding | extra3-i01 | `promoted-extra5-control` | 100.00 | 0/12 |
| E4B | dataextract | extra5-i03 | `tool-normalize-dedupe-retry-coding-128` | 89.40 | 10/15 |
| E4B | instructfollow | extra5-i02 | `json-640-tool-256-coding-128` | 70.00 | 6/15 |
| E4B | reasonmath | extra3-i01 | `promoted-extra5-control` | 80.00 | 3/15 |
| E4B | speed | extra5-i02 | `json-640-tool-256-coding-128` | 58.76 | 9/9 |
| E4B | toolcall | extra3-i02 | `json-768-instruction-448-default-288` | 95.00 | 1/15 |
