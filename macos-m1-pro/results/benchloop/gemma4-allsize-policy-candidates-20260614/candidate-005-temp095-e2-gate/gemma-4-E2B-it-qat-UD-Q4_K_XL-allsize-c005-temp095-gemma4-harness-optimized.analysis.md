# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-005-temp095-e2-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c005-temp095-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c005-temp095-gemma4-harness-optimized`
- Overall: 76.45309925093633
- Quality: 81.21666666666667
- Speed: 74.65
- Reliability: 67.41573033707866
- Failures/partials: 39

## Failure Classes

| Class | Count |
| --- | ---: |
| `numeric_string` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 7 |
| `semantic_extraction` | 3 |
| `semantic_math` | 3 |
| `tool_missing` | 3 |
| `agent_or_tool_semantic` | 1 |
| `reasonmath_format` | 1 |
| `tool_partial_batch` | 1 |
| `tool_unneeded` | 1 |

## Recommendations

- Inspect declared schemas and only coerce values when the schema permits it.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect batch tool-call fidelity; do not synthesize missing calls.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=43: battery_life_hours: expected number / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number /
- `dataextract/de-06` score=60: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / oxygen_saturation: expected number / referral: expected null / 
- `dataextract/de-07` score=67: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / location: mismatch / note: mismatch
- `dataextract/de-09` score=70: attendee_count: expected number / date: mismatch / requester_name: mismatch
- `dataextract/de-11` score=71: budget_per_person: expected number / num_rooms: expected number
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte

### `semantic_extraction`
- `dataextract/de-04` score=71: meeting_name: mismatch / room: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=80: cuisine_type: mismatch / neighborhood: expected null

### `format_or_instruction`
- `instructfollow/if-02` score=50: word_counts_3_4_3
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-07` score=50: tagged_translations
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `semantic_math`
- `reasonmath/rm-03` score=55: saved_money expected yes, got no
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got $5721.46; interest expected 718.96, got $721.46

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `speed_measurement`
- `speed/speed-short-001` score=67.18: 
- `speed/speed-short-002` score=73.05: 
- `speed/speed-short-003` score=72.88: 
- `speed/speed-medium-001` score=75.95: 
- `speed/speed-medium-002` score=76.22: 
- `speed/speed-medium-003` score=76.19: 
- `speed/speed-long-001` score=76.55: 
- `speed/speed-long-002` score=76.68: 

### `tool_missing`
- `toolcall/tc-03` score=25: did not match any acceptable tool strategy; answered directly instead of using tools
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools
- `toolcall/tc-07` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
