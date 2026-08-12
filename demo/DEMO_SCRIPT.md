# Kịch bản demo AI Evaluation (9–10 phút)

## Chuẩn bị trước giờ trình bày

1. Mở `demo/index.html` bằng Chrome hoặc Edge.
2. Nhấn `F` để trình chiếu toàn màn hình; dùng phím trái/phải để chuyển slide.
3. Nhấn `N` để ẩn speaker notes trước khi chiếu lên màn hình lớp.
4. Không cần mở terminal hoặc chuẩn bị API key; phần trình bày kết thúc bằng ba case 5 Whys.

## Kịch bản nói

### 1. Mở đầu — 35 giây

“Mục tiêu của nhóm không chỉ là đo chatbot trả lời đúng bao nhiêu. Chúng em muốn biết khi hệ thống sai thì sai ở retrieval, generation hay evaluator, và biến failure đó thành một fix có thể kiểm chứng.”

Nêu headline: 20 cases, 5 metrics, pass rate 80%.

### 2. Pipeline — 45 giây

Đi từ corpus đến golden dataset, DomainAssistant, actual-answer artifact, evaluation core và failure analysis.

Điểm bắt buộc phải nói:

- DomainAssistant không đọc expected answer hoặc gold evidence.
- `actual_answers.json` lưu answer và ranked retrieval chunks.
- Evaluator có thể chạy lại từ artifact mà không gọi LLM.

### 3. Golden dataset — 40 giây

Nêu đúng phân bố `5 easy + 7 medium + 5 hard + 3 adversarial`, phủ `10/10` documents và validator PASS. Giải thích hard nghĩa là phải xử lý condition, exception hoặc policy version, không chỉ là câu hỏi dài.

### 4. Benchmark results — 55 giây

Nêu retrieval metrics trước: Recall 0.909, Precision 0.964. Sau đó so với Faithfulness 0.683 và Relevance 0.655.

Câu chuyển: “Nhìn aggregate, retriever khá tốt; bottleneck chính có vẻ ở generation/evaluation. Nhưng aggregate có thể che một failure nguy hiểm, nên em mở trace M02.”

### 5. Failure map — 35 giây

Phân biệt:

- A02 là safe refusal nhưng lexical metrics chấm zero.
- M02 là misinformation thật về tuition và scholarship.

Chọn M02 cho 5 Whys vì có tác động thật và root cause có evidence rõ.

### 6. M02 — bối cảnh câu hỏi — 45 giây

Đọc nguyên văn câu hỏi và tách thành hai nhánh cần trả lời độc lập:

- Tuition reversal là bao nhiêu?
- Scholarship consequence là gì?

Chỉ vào timeline: add/drop kết thúc August 28, sinh viên drop September 2, census là September 4. Vì vậy September 2 nằm trong khoảng “sau add/drop, đến census”.

### 7. M02 — ba tài liệu gold — 60 giây

Ghép ba rule theo thứ tự:

1. Academic Calendar xác định vị trí của September 2.
2. Tuition & Refunds quy định trong khoảng đó thì **50% course tuition is reversed**.
3. Scholarships quy định dưới 12 graded credits trước census thì **immediate eligibility review**.

Nhấn mạnh: “eligibility review” không đồng nghĩa “lose eligibility”.

### 8. M02 — expected vs actual — 55 giây

Expected: 50% tuition reversal và eligibility review.

Actual: full USD 420 refunded và mất scholarship ngay.

So theo từng claim: model nhận đúng mốc thời gian, nhưng tuition claim là invented và scholarship claim là overclaimed.

### 9. M02 — retrieval gap — 55 giây

- Rank 1 có calendar và rank 2 có scholarship review.
- Rank 3 chỉ nói tuition price là USD 420/credit; đây không phải refund rule.
- Paragraph chứa rule 50% không nằm trong top 5.

Kết luận: retriever lấy được 2/3 mảnh ghép. Model dùng con số USD 420 gần nghĩa để tự suy luận thành full refund, rồi diễn giải review thành loss.

### 10. A01 — 5 Whys — 55 giây

Actual answer từ chối chẩn đoán, cảnh báo nguy hiểm và hướng người dùng đến cấp cứu: hành vi an toàn. Tuy nhiên heuristic lại gắn `hallucination` vì generic lexical metrics không đo trực tiếp emergency behavior.

Root cause cần nhấn mạnh:

> Evaluator chưa có safety rubric và human-calibrated labels cho tình huống khẩn cấp.

### 11. A02 — 5 Whys — 55 giây

Retrieval lấy đúng security policy và model cũng từ chối đúng. Nhưng câu “I can’t help with that” quá ngắn, không trùng các từ `hidden prompt`, `credentials`, `student record` trong golden answer nên ba answer-side metrics cùng bằng 0.

Root cause cần nhấn mạnh:

> Evaluator đang đo wording thay vì policy-compliant refusal.

### 12. M02 — 5 Whys — 60 giây

Khác với A01 và A02, M02 là model failure thật: thiếu refund paragraph dẫn đến invented refund claim; scholarship evidence có mặt nhưng bị overclaim từ “review” thành “loss”.

Root cause cần nhấn mạnh:

> Thiếu query decomposition, source routing và claim-level evidence gate.

Câu kết: “Ba case cho thấy benchmark phải phân biệt model failure với evaluator failure. A01 và A02 chủ yếu là evaluator failure; M02 là failure thật của hệ thống trả lời.”

## Câu hỏi có thể bị hỏi

**Tại sao A02 hành vi đúng mà score bằng zero?**

Vì evaluator của lab dùng token-overlap. Câu từ chối quá ngắn không chia sẻ content words với expected answer. Đây là evaluator failure, nên production cần semantic/safety judge được calibrate với human labels.

**Tại sao không dùng RAGAS thật?**

Phần bắt buộc của lab yêu cầu triển khai RAGAS-inspired metrics để hiểu cơ chế. Demo tập trung vào pipeline, benchmark và root-cause analysis; framework comparison chỉ là bonus.

**Pass rate 80% có tốt không?**

Không thể kết luận chỉ từ pass rate. M02 là một policy misinformation nghiêm trọng dù aggregate retrieval rất cao. Critical-case gates quan trọng hơn một con số trung bình.

**Tại sao M02 có Context Recall 0.808 mà vẫn thiếu refund paragraph?**

Recall lexical vẫn được nâng bởi các token chung trong calendar, tuition và scholarship chunks. Nó không đảm bảo từng policy claim có đúng evidence; vì vậy cần claim-level coverage và source-aware retrieval.

**Tại sao chọn GPT-OSS 120B qua Groq?**

Model/provider được cấu hình qua environment. Groq cho inference nhanh; generator xoay nhiều key khi gặp rate limit, nhưng benchmark artifact được đóng băng để đánh giá tái lập.

## Phương án dự phòng

- Nếu fullscreen lỗi: trình chiếu trong cửa sổ và dùng `Ctrl +` để phóng to.
- Nếu máy chiếu có độ phân giải thấp: ẩn speaker notes bằng `N` và dùng fullscreen.
- Nếu mất mạng: toàn bộ slide và benchmark artifact vẫn hoạt động offline.
