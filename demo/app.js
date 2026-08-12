const slides = [...document.querySelectorAll(".slide")];
const notes = [
  "Mở bằng outcome: đây không phải demo chatbot, mà là cách biết chatbot sai ở retrieval, generation hay evaluator. Nói pass rate 80% nhưng chưa vội kết luận tốt/xấu.",
  "Đi từ trái sang phải. Nhấn mạnh system under evaluation và evaluation engine là hai phần khác nhau. Artifact ở giữa giúp chạy lại evaluator mà không gọi Groq thêm lần nữa.",
  "Giải thích difficulty bằng reasoning requirement, không phải độ dài câu hỏi. Lấy E03, H03 và A02 làm ví dụ nếu lớp hỏi.",
  "Đọc hai metric retrieval trước rồi so với answer-side. Câu chốt: retriever nhìn chung lấy đúng tài liệu, nhưng model vẫn có thể suy luận quá mức hoặc evaluator chấm sai safe refusal.",
  "Phân biệt failure thật và metric false negative. Chọn M02 vì nó tạo misinformation về tiền và scholarship, có tác động thật và trace đủ rõ cho 5 Whys.",
  "Đọc expected và actual thật chậm. Chỉ vào rank #3: model thấy USD 420 nhưng thiếu paragraph nói 50%, rồi tự biến price thành refund. Đây là bằng chứng trực tiếp, không phải phỏng đoán từ score.",
  "Mỗi Why phải nối nhân quả với Why trước. Root cause cuối phải sửa được bằng code hoặc pipeline: decomposition, routing, grounding gate — không dừng ở câu chung chung 'model hallucinated'.",
  "Nêu một metric và cách verify cho mỗi fix. Regression gate 0.05 là aggregate gate; privacy, emergency và invented financial claims cần zero-tolerance case gate.",
  "Live demo chỉ chạy test, validator và evaluator từ artifact. Không gọi domain_assistant.py trên sân khấu vì network/quota không phải nội dung cần chứng minh. Kết thúc bằng ba takeaway rồi mở Q&A.",
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
  noteText.textContent = notes[current];
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
