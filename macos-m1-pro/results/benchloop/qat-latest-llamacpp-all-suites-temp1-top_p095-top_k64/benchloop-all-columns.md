# QAT BenchLoop All Columns

Run-level rows: 3
Task-level rows: 267
Trial-level rows: 81

## Run-Level Columns

- variant
- backend_mode
- run_id
- run_json
- version
- timestamp
- model_id
- model_family
- model_parameter_count
- model_quantization
- machine_id
- machine_cpu
- machine_gpu
- machine_gpu_memory_gb
- machine_system_memory_gb
- machine_os
- machine_backend
- machine_is_remote
- machine_remote_host
- machine_endpoint
- machine_hardware_label
- provider
- harness
- harness_version
- total_runtime_sec
- overall_score
- quality_score
- speed_score
- reliability_score
- value_score
- speed_metrics_ttft_ms
- speed_metrics_prompt_eval_tok_per_sec
- speed_metrics_generation_tok_per_sec
- speed_metrics_total_latency_ms
- suite_agent_score
- suite_agent_task_count
- suite_agent_pass_count
- suite_agent_fail_count
- suite_agent_median_latency_ms
- suite_coding_score
- suite_coding_task_count
- suite_coding_pass_count
- suite_coding_fail_count
- suite_coding_median_latency_ms
- suite_dataextract_score
- suite_dataextract_task_count
- suite_dataextract_pass_count
- suite_dataextract_fail_count
- suite_dataextract_median_latency_ms
- suite_instructfollow_score
- suite_instructfollow_task_count
- suite_instructfollow_pass_count
- suite_instructfollow_fail_count
- suite_instructfollow_median_latency_ms
- suite_reasonmath_score
- suite_reasonmath_task_count
- suite_reasonmath_pass_count
- suite_reasonmath_fail_count
- suite_reasonmath_median_latency_ms
- suite_speed_score
- suite_speed_task_count
- suite_speed_pass_count
- suite_speed_fail_count
- suite_speed_median_latency_ms
- suite_toolcall_score
- suite_toolcall_task_count
- suite_toolcall_pass_count
- suite_toolcall_fail_count
- suite_toolcall_median_latency_ms

## Task-Level Columns

- variant
- backend_mode
- run_id
- run_json
- model_id
- provider
- harness
- suite_name
- task_id
- task_suite
- task_passed
- task_score
- task_latency_ms
- task_tokens_generated
- task_tokens_prompt
- task_error
- task_output
- task_speed_metrics_ttft_ms
- task_speed_metrics_prompt_eval_tok_per_sec
- task_speed_metrics_generation_tok_per_sec
- task_speed_metrics_total_latency_ms
- task_eval_count
- task_eval_duration
- task_prompt_eval_count
- task_prompt_eval_duration
- task_load_duration
- task_selected_trial
- task_warmup_dropped
- task_selection_method
- task_metadata_json

## Trial-Level Columns

- variant
- backend_mode
- run_id
- run_json
- model_id
- provider
- harness
- suite_name
- task_id
- trial_index
- trial_warmup
- trial_passed
- trial_score
- trial_latency_ms
- trial_tokens_generated
- trial_tokens_prompt
- trial_error
- trial_speed_metrics_ttft_ms
- trial_speed_metrics_prompt_eval_tok_per_sec
- trial_speed_metrics_generation_tok_per_sec
- trial_speed_metrics_total_latency_ms
