const questions = [
    { id: 1, sign: "A", options: ["A", "B", "S", "D"], correct: "A" },
    { id: 2, sign: "B", options: ["L", "B", "M", "N"], correct: "B" },
    { id: 3, sign: "S", options: ["U", "O", "S", "X"], correct: "S" }
];

let currentStep = 0;
let score = 0;

function loadQuestion() {
    const q = questions[currentStep];
    document.getElementById('sign-image').src = `https://via.placeholder.com/200x200?text=${q.sign}`;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, btn);
        optionsDiv.appendChild(btn);
    });

    // Progress bar yangilash
    const progressPerc = ((currentStep) / questions.length) * 100;
    document.getElementById('progress').style.width = `${progressPerc}%`;
}

function checkAnswer(selected, btn) {
    const correct = questions[currentStep].correct;
    const feedback = document.getElementById('feedback');
    
    if (selected === correct) {
        btn.classList.add('correct');
        feedback.style.backgroundColor = "#d7ffb8";
        document.getElementById('feedback-title').innerText = "Ajoyib! To'g'ri topdingiz.";
    } else {
        btn.classList.add('wrong');
        feedback.style.backgroundColor = "#ffdfe0";
        document.getElementById('feedback-title').innerText = `Xato. To'g'ri javob: ${correct}`;
    }
    
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('show'), 10);
}

document.getElementById('next-btn').onclick = () => {
    currentStep++;
    if (currentStep < questions.length) {
        document.getElementById('feedback').classList.remove('show');
        setTimeout(() => {
            document.getElementById('feedback').classList.add('hidden');
            loadQuestion();
        }, 300);
    } else {
        alert("Tabriklaymiz! Bugungi darsni tugatdingiz.");
        location.reload();
    }
};

// Birinchi savolni yuklash
loadQuestion();