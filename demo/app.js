const slides = [...document.querySelectorAll(".slide")];
const notes = [
  "Mở bằng outcome: đây không phải demo chatbot, mà là cách biết chatbot sai ở retrieval, generation hay evaluator. Pass rate 80% chưa đủ để kết luận hệ thống an toàn.",
  "Đi theo 6 bước. Corpus được paragraph-chunk; BM25 có source-repeat decay lấy top 5; GPT-OSS sinh answer đúng một lần; JSON đóng băng answer và ranked chunks. Từ artifact, evaluator tính lại 5 metrics mà không gọi Groq. Pass chỉ xét Faithfulness, Relevance, Completeness đều từ 0.5; Recall/Precision dùng chẩn đoán retrieval.",
  "Giải thích difficulty bằng yêu cầu suy luận, không phải độ dài câu hỏi. Dataset phủ đủ 10 tài liệu và bốn mức khó.",
  "Đọc retrieval trước rồi mới đọc answer-side. Retriever nhìn chung tốt, nhưng aggregate có thể che một lỗi nghiêm trọng.",
  "Phân biệt A02 là false negative của metric, còn M02 là misinformation thật về tiền và học bổng. Vì vậy chọn M02 để điều tra.",
  "A01: đọc nhanh ba ô Question, Expected, Actual trước. Actual làm đúng hành vi khẩn cấp nhưng thiếu một phần wording như campus security; đi qua 5 Whys để chỉ ra đây chủ yếu là evaluator failure.",
  "A02: đối chiếu gold liệt kê rõ ba thứ phải bảo vệ với actual chỉ có một câu refusal. Hành vi đúng nhưng lexical overlap bằng 0; root cause là evaluator chưa đo policy compliance.",
  "Đọc nguyên câu hỏi M02 và báo hiệu chuyển sang deep dive. Tách hai sub-question: tuition reversal và scholarship consequence; September 2 nằm sau add/drop nhưng trước census.",
  "Ghép lần lượt ba policy. Calendar xác định khoảng thời gian; Tuition Refund cho kết luận 50%; Scholarship chỉ yêu cầu immediate eligibility review. Không policy nào nói mất học bổng ngay.",
  "So từng claim expected và actual. Model đúng mốc thời gian, nhưng sai khi biến USD 420/credit thành full refund và biến review thành immediate loss.",
  "Đọc top-5 retrieval. Rank 1 và 2 cung cấp hai phần đúng; rank 3 chỉ là tuition price. Paragraph quyết định 50% không xuất hiện.",
  "M02 khác A01 và A02: đây là model failure thật. Nối 5 Whys từ unsupported conclusions, qua missing refund evidence, đến root cause ở retrieval decomposition và grounding gate.",
];

const currentLabel = document.querySelector("#current");
const totalLabel = document.querySelector("#total");
const progress = document.querySelector("#progress");
const title = document.querySelector("#slide-title");
const noteText = document.querySelector("#note-text");
const slideTime = document.querySelector("#slide-time");
const note = document.querySelector("#speaker-note");
const help = document.querySelector("#help");
const deck = document.querySelector("#deck");
const prev = document.querySelector("#prev");
const next = document.querySelector("#next");
let current = 0;

totalLabel.textContent = String(slides.length).padStart(2, "0");

function showSlide(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === current));
  currentLabel.textContent = String(current + 1).padStart(2, "0");
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  title.textContent = slides[current].dataset.title;
  slideTime.textContent = slides[current].dataset.time;
  noteText.textContent = notes[current] ?? "";
  prev.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  history.replaceState(null, "", `#${current + 1}`);
}

function toggleNotes() { note.classList.toggle("hidden"); }
async function toggleFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await deck.requestFullscreen();
}

prev.addEventListener("click", () => showSlide(current - 1));
next.addEventListener("click", () => showSlide(current + 1));
document.querySelector("#notes-toggle").addEventListener("click", toggleNotes);
document.querySelector("#fullscreen").addEventListener("click", toggleFullscreen);

document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); showSlide(current + 1); }
  if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); showSlide(current - 1); }
  if (event.key === "Home") showSlide(0);
  if (event.key === "End") showSlide(slides.length - 1);
  if (event.key.toLowerCase() === "f") toggleFullscreen();
  if (event.key.toLowerCase() === "n") toggleNotes();
  if (event.key.toLowerCase() === "h") help.classList.toggle("hidden");
});

let touchStart = null;
deck.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
deck.addEventListener("touchend", (event) => {
  if (touchStart === null) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(delta) > 55) showSlide(current + (delta < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

const requestedSlide = Number(location.hash.slice(1));
showSlide(Number.isInteger(requestedSlide) && requestedSlide > 0 ? requestedSlide - 1 : 0);
setTimeout(() => help.classList.add("hidden"), 4500);
