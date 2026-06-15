# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-26b-quality-200loops-20260614/loop-002-temp092/run-json/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-q200-loop002-temp092-gemma4-harness-optimized.run.json`
- Model: `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-q200-loop002-temp092-gemma4-harness-optimized`
- Overall: 77.43142134831461
- Quality: 84.19
- Speed: 57.32
- Reliability: 78.65168539325843
- Failures/partials: 31

## Failure Classes

| Class | Count |
| --- | ---: |
| `speed_measurement` | 9 |
| `semantic_extraction` | 7 |
| `format_or_instruction` | 4 |
| `semantic_math` | 3 |
| `numeric_string` | 2 |
| `agent_or_tool_semantic` | 1 |
| `format_cleanup` | 1 |
| `reasonmath_format` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect declared schemas and only coerce values when the schema permits it.
- Enable fence/reasoning stripping and content normalization.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `format_cleanup`
- `coding/coding-retry-decorator` score=0: SyntaxError: no binding for nonlocal 'counter' found (line 48)

### `semantic_extraction`
- `dataextract/de-03` score=92: 
- `dataextract/de-04` score=0: top-level shape mismatch: expected object, received array / expected object
- `dataextract/de-06` score=87: 
- `dataextract/de-07` score=76: location: mismatch / note: mismatch / location: mismatch / note: mismatch / note: mismatch
- `dataextract/de-10` score=60: cuisine_type: expected string / neighborhood: expected null / street_address: expected null / visit_duration: mismatch
- `dataextract/de-12` score=86: 
- `dataextract/de-14` score=82: anc_type: mismatch / array values did not match expected set / expected 3 items but received 2

### `numeric_string`
- `dataextract/de-05` score=43: battery_life_hours: expected number / charging_type: mismatch / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_pri
- `dataextract/de-13` score=59: discounts.amount: expected number / discounts.amount: expected number / line_items.amount: expected number / line_items.unit_price: expected number / line_items.amount: expected nu

### `format_or_instruction`
- `instructfollow/if-03` score=0: three_paragraphs; one_sentence_each; coffee_start_question_end_under_60_words
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-11` score=66.7: required_terms_once_no_food_or_eat
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang

### `semantic_math`
- `reasonmath/rm-04` score=0: did not identify inconsistency / non-unique ordering
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5,721.24; interest expected 718.96, got $721.24

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=46.28: 
- `speed/speed-short-002` score=55.99: 
- `speed/speed-short-003` score=58.11: 
- `speed/speed-medium-001` score=58.18: 
- `speed/speed-medium-002` score=58.39: 
- `speed/speed-medium-003` score=61.33: 
- `speed/speed-long-001` score=59.85: 
- `speed/speed-long-002` score=59.34: 

### `tool_missing`
- `toolcall/tc-05` score=0: matched 0/1 required tool calls

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
