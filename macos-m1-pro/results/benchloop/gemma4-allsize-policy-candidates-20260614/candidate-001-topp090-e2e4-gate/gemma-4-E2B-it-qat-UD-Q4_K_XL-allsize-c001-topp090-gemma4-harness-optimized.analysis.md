# Gemma 4 Harness Failure Analysis

- Source: `results/benchloop/gemma4-allsize-policy-candidates-20260614/candidate-001-topp090-e2e4-gate/run-json/gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c001-topp090-gemma4-harness-optimized.run.json`
- Model: `gemma-4-E2B-it-qat-UD-Q4_K_XL-allsize-c001-topp090-gemma4-harness-optimized`
- Overall: 76.38037921348315
- Quality: 81.905
- Speed: 68.18
- Reliability: 70.78651685393258
- Failures/partials: 37

## Failure Classes

| Class | Count |
| --- | ---: |
| `numeric_string` | 10 |
| `speed_measurement` | 9 |
| `format_or_instruction` | 6 |
| `semantic_extraction` | 3 |
| `agent_or_tool_semantic` | 2 |
| `semantic_math` | 2 |
| `tool_unneeded` | 2 |
| `reasonmath_format` | 1 |
| `tool_missing` | 1 |
| `tool_partial_batch` | 1 |

## Recommendations

- Inspect declared schemas and only coerce values when the schema permits it.
- Reduce temp=1 rambling with tighter prompts or post-processing; avoid truncating model output.
- Inspect tool-choice behavior; do not drop or invent calls from prompt expectations.
- Inspect reason/math formatting and instruction-following without rewriting expected answers.
- Inspect model tool-call fidelity and declared tool schemas; do not synthesize calls from prompts.
- Inspect batch tool-call fidelity; do not synthesize missing calls.

## Examples

### `agent_or_tool_semantic`
- `agent/agent-02-stock-portfolio` score=75: 
- `toolcall/tc-12` score=50: missing refusal/explanation language

### `numeric_string`
- `dataextract/de-02` score=62: items.price: expected number / items.price: expected number / items.price: expected number / subtotal: expected number / tax_amount: expected number / total: expected number
- `dataextract/de-03` score=67: experience_years_min: expected number / salary_max: expected number / salary_min: expected number / work_model: mismatch
- `dataextract/de-05` score=43: battery_life_hours: expected number / competitor_1_price: expected number / product_name: mismatch / product_price_original: expected number / product_price_paid: expected number /
- `dataextract/de-06` score=53: blood_pressure_diastolic: expected number / blood_pressure_systolic: expected number / heart_rate: expected number / medication_dose: mismatch / oxygen_saturation: expected number 
- `dataextract/de-07` score=71: location: mismatch / note: mismatch / location: mismatch / note: mismatch / hourly_rate: expected number / note: mismatch
- `dataextract/de-09` score=40: attendee_count: expected number / date: mismatch / needs_catering: expected boolean / needs_projector: expected boolean / needs_whiteboard: expected boolean / room: mismatch
- `dataextract/de-11` score=57: budget_per_person: expected number / num_rooms: expected number / total_attendees: expected null
- `dataextract/de-12` score=50: battery_life_hours: expected number / complaint: mismatch / price: expected number / product_name: mismatch / ram_gb: expected number / rating: expected number / weight_kg: expecte

### `semantic_extraction`
- `dataextract/de-04` score=71: note: mismatch / room: mismatch
- `dataextract/de-08` score=90: 
- `dataextract/de-10` score=90: 

### `format_or_instruction`
- `instructfollow/if-04` score=50: reverse_alpha_order
- `instructfollow/if-08` score=50: allowed_items_unique_starts
- `instructfollow/if-10` score=66.7: exactly_50_words_humanity_to_stars
- `instructfollow/if-12` score=0: exact_impossible_line
- `instructfollow/if-14` score=0: two_sentences; all_caps_rain_bang
- `instructfollow/if-15` score=50: city_constraints

### `reasonmath_format`
- `reasonmath/rm-06` score=0: missing switch; missing stay

### `semantic_math`
- `reasonmath/rm-08` score=0: fill_time expected 7.2, got 9 minutes
- `reasonmath/rm-13` score=0: amount expected 5718.96, got 5721.09; interest expected 718.96, got 721.09

### `speed_measurement`
- `speed/speed-short-001` score=62.43: 
- `speed/speed-short-002` score=66.87: 
- `speed/speed-short-003` score=67.55: 
- `speed/speed-medium-001` score=68.73: 
- `speed/speed-medium-002` score=69.02: 
- `speed/speed-medium-003` score=69.61: 
- `speed/speed-long-001` score=70.54: 
- `speed/speed-long-002` score=69.72: 

### `tool_missing`
- `toolcall/tc-05` score=25: matched 0/1 required tool calls; answered directly instead of using tools

### `tool_unneeded`
- `toolcall/tc-10` score=0: unexpected tool call; missing expected direct answer content
- `toolcall/tc-11` score=0: unexpected tool call; missing expected direct answer content

### `tool_partial_batch`
- `toolcall/tc-15` score=50: matched 1/2 required tool calls
