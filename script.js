/* =========================================================
   PLÁSTICOZERO FUTURE — JavaScript
   ========================================================= */

/* ---------- 1. ÍCONES LUCIDE ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

/* ---------- 2. HEADER SCROLL ---------- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ---------- 3. MENU MOBILE ---------- */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Fecha ao clicar em link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });
}

/* ---------- 4. SCROLL REVEAL (Intersection Observer) ---------- */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ---------- 5. CONTADORES ANIMADOS ---------- */
const counters = document.querySelectorAll('[data-counter]');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((c) => counterObserver.observe(c));

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-counter'), 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easing out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

/* ---------- 6. PARTÍCULAS NO CANVAS ---------- */
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      // Cores: verde, ciano, roxo
      const colors = ['0, 255, 163', '0, 229, 255', '168, 85, 247'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particleCount = window.innerWidth < 768 ? 40 : 90;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Conecta partículas próximas
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 163, ${0.15 * (1 - distance / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connectParticles();
    animationId = requestAnimationFrame(animateParticles);
  }

  animateParticles();

  // Pausa quando a aba não está visível (economia de CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animateParticles();
    }
  });
}

/* ---------- 7. QUIZ INTERATIVO DE DESCARTE ---------- */
const quizInput = document.getElementById('quiz-input');
const quizBtn = document.getElementById('quiz-btn');
const quizResult = document.getElementById('quiz-result');

const descarteDatabase = {
  'garrafa pet': {
    title: 'Garrafa PET',
    status: 'RECICLÁVEL ✅',
    text: 'Enxágue, retire o rótulo se possível, amasse levemente e descarte na coleta seletiva. A tampinha pode ficar.',
  },
  'pet': {
    title: 'Garrafa PET',
    status: 'RECICLÁVEL ✅',
    text: 'Enxágue, retire o rótulo se possível, amasse levemente e descarte na coleta seletiva.',
  },
  'isopor': {
    title: 'Isopor (EPS)',
    status: 'BAIXA RECICLAGEM ⚠️',
    text: 'O isopor é difícil de reciclar. Procure pontos específicos de coleta de EPS. Evite ao máximo seu uso.',
  },
  'sacola': {
    title: 'Sacola Plástica',
    status: 'COLETA ESPECÍFICA ⚠️',
    text: 'Não coloque na coleta seletiva comum. Entregue em supermercados ou pontos de coleta de sacolas plásticas.',
  },
  'sacola plastica': {
    title: 'Sacola Plástica',
    status: 'COLETA ESPECÍFICA ⚠️',
    text: 'Não coloque na coleta seletiva comum. Entregue em supermercados ou pontos de coleta de sacolas plásticas.',
  },
  'copo descartavel': {
    title: 'Copo Descartável',
    status: 'BAIXA RECICLAGEM ⚠️',
    text: 'Copos de plástico (PS) têm baixa reciclagem. Prefira copos reutilizáveis. Se descartar, enxágue e coloque na seletiva.',
  },
  'canudo': {
    title: 'Canudo Plástico',
    status: 'EVITE ❌',
    text: 'Canudos plásticos são um dos itens mais encontrados em praias. Troque por inox, vidro ou bambu.',
  },
  'tampinha': {
    title: 'Tampinha de Garrafa',
    status: 'RECICLÁVEL ✅',
    text: 'Tampinhas (PP) são muito recicláveis. Não amasse. Junte várias e entregue em pontos de coleta.',
  },
  'pote': {
    title: 'Pote de Alimento',
    status: 'RECICLÁVEL ✅',
    text: 'Potes de PP são recicláveis. Enxágue bem, retire restos de comida e descarte na seletiva.',
  },
  'eletronico': {
    title: 'Eletrônico com Plástico',
    status: 'COLETA ESPECÍFICA ⚠️',
    text: 'Eletrônicos contêm plásticos tipo 7 (Outros). Leve em pontos de coleta de e-lixo — nunca no lixo comum.',
  },
  'escova': {
    title: 'Escova de Dente',
    status: 'BAIXA RECICLAGEM ⚠️',
    text: 'Escovas têm plásticos mistos. Algumas marcas fazem logística reversa. Prefira escovas de bambu.',
  },
};

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function consultarDescarte() {
  const input = normalizarTexto(quizInput.value);

  if (!input) {
    quizResult.classList.remove('hidden', 'error');
    quizResult.innerHTML = '<p>⚠️ Digite um item para consultar.</p>';
    return;
  }

  let encontrado = null;
  for (const key in descarteDatabase) {
    const keyNormalized = normalizarTexto(key);
    if (input.includes(keyNormalized) || keyNormalized.includes(input)) {
      encontrado = descarteDatabase[key];
      break;
    }
  }

 