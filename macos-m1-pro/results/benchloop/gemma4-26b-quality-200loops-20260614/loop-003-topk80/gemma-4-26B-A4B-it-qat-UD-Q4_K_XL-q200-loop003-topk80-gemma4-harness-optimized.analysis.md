# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-26b-quality-200loops-20260614/loop-003-topk80/run-json/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-q200-loop003-topk80-gemma4-harness-optimized.run.json`
- Model: `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-q200-loop003-topk80-gemma4-harness-optimized`
- Overall: 74.81207584269664
- Quality: 80.885
- Speed: 58.93
- Reliability: 74.15730337078652
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `semantic_extraction` | 8 |
| `format_or_instruction` | 5 |
| `semantic_math` | 5 |
| `numeric_string` | 3 |
| `coding_semantic` | 2 |
| `tool_missing` | 2 |
| `agent_or_tool_semantic` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `coding_semantic`
- `coding/coding-csv-parser` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-uw53mr9x/task.py", line 4, in <module>
    assert callable(parse_csv)

- `coding/coding-parse-log-entries` score=25: Traceback (most recent call last):
  File "/var/folders/n1/63fgvh314s3bspjn5dzp7xp00000gn/T/bench-loop-coding-jt4hl8pe/task.py", line 3, in <module>
    assert callable(parse_logs)

### `semantic_extraction`
- `dataextract/de-01` score=90: 
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: mismatch
- `dataextract/de-12` score=93: 
- `dataextract/de-14` score=88: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-05` score=64: competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number / rating_stars: expected number
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-05` score=66.7: at_least_one_under_1kg
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-06` score=0: switch expected 0.75, got 3/4; stay expected 0.25, got 1/4
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-12` score=0: person expected son, got his son
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `speed_measurement`
- `speed/speed-short-001` score=46.08: 
- `speed/speed-short-002` score=57.36: 
- `speed/speed-short-003` score=60.23: 
- `speed/speed-medium-001` score=61.51: 
- `speed/speed-medium-002` score=61.26: 
- `speed/speed-medium-003` score=62.65: 
- `speed/speed-long-001` score=61.84: 
- `speed/speed-long-002` score=58.67: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls
- `toolcall/tc-06` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
