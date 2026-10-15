/**
 * JULIO & TRENDON — OFFICIAL PORTFOLIO SCRIPT
 * Features:
 * - Dynamic Physics Particle Constellation Canvas
 * - Web Audio API Synthesizer (Zero-asset SFX engine)
 * - Custom Cursor with trailing aura and magnetic hover
 * - 3D Perspective Card Tilt (Mouse physics)
 * - IntersectionObserver Scroll Reveal & Animated Number Counter
 * - Portfolio Category Filter & Dynamic Modal Case Study
 * - Interactive Confetti Celebration & Email Copying
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. WEB AUDIO API SYNTHESIZER (NO EXTERNAL AUDIO FILES NEEDED)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.audioCtx = null;
      this.enabled = true; // Default enabled
      this.initUserGesture();
    }

    initContext() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    initUserGesture() {
      const unlockAudio = () => {
        this.initContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    }

    playHover() {
      if (!this.enabled || !this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const now = this.audioCtx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {
        // Safe fail
      }
    }

    playClick() {
      if (!this.enabled || !this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const now = this.audioCtx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
      } catch (e) {
        // Safe fail
      }
    }

    playSuccess() {
      if (!this.enabled || !this.audioCtx) return;
      try {
        const now = this.audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord

        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          const startTime = now + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.04, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.28);
        });
      } catch (e) {
        // Safe fail
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  }

  const sound = new SoundEngine();

  // Attach sound triggers to elements
  document.querySelectorAll('[data-sound="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => sound.playHover());
  });

  document.querySelectorAll('[data-sound="click"], a, button').forEach(el => {
    el.addEventListener('click', () => sound.playClick());
  });

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundOnIcon = soundToggleBtn.querySelector('.sound-on-icon');
  const soundOffIcon = soundToggleBtn.querySelector('.sound-off-icon');
  const soundToast = document.getElementById('sound-toast');

  let toastTimer;
  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isNowOn = sound.toggle();
    if (isNowOn) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
      showToast('Efek Suara Diaktifkan 🔊');
      sound.playClick();
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
      showToast('Efek Suara Dimatikan 🔇');
    }
  });

  function showToast(msg) {
    if (!soundToast) return;
    soundToast.textContent = msg;
    soundToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      soundToast.classList.remove('show');
    }, 2000);
  }

  /* ==========================================================================
     2. DYNAMIC CONSTELLATION BACKGROUND CANVAS
     ========================================================================== */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 85;
    const maxDistance = 140;

    let mouseX = -9999;
    let mouseY = -9999;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1;
        this.baseColor = Math.random() > 0.5 ? 'rgba(34, 211, 238, ' : 'rgba(168, 85, 247, ';
        this.alpha = Math.random() * 0.6 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundary
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Repel slightly from mouse cursor
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const force = (130 - dist) / 130;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor + this.alpha + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  /* ==========================================================================
     3. INTERACTIVE CUSTOM CURSOR
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorGlow = document.getElementById('cursor-glow');

  if (cursorDot && cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorDot.style.left = `${targetX}px`;
      cursorDot.style.top = `${targetY}px`;
    });

    // Smooth lagging follower for cursor glow
    function renderCursor() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover states for links & buttons
    const interactables = document.querySelectorAll('a, button, input, select, textarea, .project-card, .stack-card, .duo-tilt-card');
    interactables.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-active');
      });
      item.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
      });
    });
  }

  /* ==========================================================================
     4. 3D PERSPECTIVE TILT CARDS
     ========================================================================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Dynamic radial highlight follow
      const glow = card.querySelector('.card-glow-layer');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12), transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      const glow = card.querySelector('.card-glow-layer');
      if (glow) {
        glow.style.background = `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 70%)`;
      }
    });
  });

  /* ==========================================================================
     5. NAVBAR SCROLL & ACTIVE STATE
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Drawer
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     6. SCROLL REVEAL & STATS COUNTER
     ========================================================================== */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // Animate Numbers Counter in Hero
  const metricNumbers = document.querySelectorAll('.metric-number');
  let metricsCounted = false;

  const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !metricsCounted) {
        metricsCounted = true;
        metricNumbers.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const isDecimal = target % 1 !== 0;
          let count = 0;
          const duration = 1800; // ms
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;

          const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
              counter.textContent = isDecimal ? target.toFixed(1) : Math.round(target);
              clearInterval(timer);
            } else {
              counter.textContent = isDecimal ? count.toFixed(1) : Math.floor(count);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.5 });

  const metricsContainer = document.querySelector('.metrics-grid');
  if (metricsContainer) {
    metricsObserver.observe(metricsContainer);
  }

  /* ==========================================================================
     7. PROJECTS GALLERY FILTER
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  /* ==========================================================================
     8. PROJECT DETAIL MODAL DATA & CONTROLLER
     ========================================================================== */
  const projectData = {
    1: {
      title: "Aether Spatial — 3D Architecture Canvas",
      tags: ["WebGL", "Three.js", "Spatial UI", "GLSL Shaders"],
      team: "Julio (3D Art Direction & UI) & Trendon (WebGL Render Optimization)",
      desc: "Aether Spatial adalah platform visualisasi arsitektur 3D generasi baru yang memungkinkan arsitek dan desainer memamerkan model CAD secara interaktif langsung pada browser dengan pencahayaan photorealistic.",
      highlights: [
        "Rendering WebGL 60fps tanpa lagging pada berbagai perangkat mobile & desktop",
        "Shader khusus buatan Julio untuk efek ambient occlusion dan refleksi kaca waktu-nyata",
        "Arsitektur streaming mesh dari Trendon yang memangkas waktu tunggu unduhan model sebesar 70%",
        "Integrasi antarmuka spasial dengan kontrol kamera intuitif dan mode Virtual Reality"
      ],
      tech: "Three.js, WebGL2, GLSL, WebAssembly, React, TypeScript, Cloudflare Workers",
      metrics: "340% kenaikan user engagement & 45ms latency render"
    },
    2: {
      title: "Chronos Engine — Pro Trading Terminal",
      tags: ["Fintech", "High-Throughput", "Go", "WebSocket"],
      team: "Trendon (Go Backend & WebSocket Mesh) & Julio (Spatial Data HUD)",
      desc: "Terminal transaksi keuangan berskala korporasi yang dibangun khusus untuk menangani ribuan transaksi per detik dengan visualisasi grafik canvas instan tanpa lagging ataupun frame drop.",
      highlights: [
        "Engine backend berbasis Golang dengan sinkronisasi multi-node in-memory Redis",
        "Sistem websocket terenkripsi dengan latensi round-trip di bawah 12 milidetik",
        "Desain antarmuka HUD gelap oleh Julio dengan palet kontras tinggi guna meminimalkan kelelahan mata trader",
        "Visualisasi orderbook instan dengan rendering Canvas 2D murni berkekuatan 120Hz"
      ],
      tech: "Golang, WebSockets, Rust WebAssembly, Redis, Canvas 2D, Next.js, Docker",
      metrics: "1.2 Juta order per detik dengan 99.99% keandalan sistem"
    },
    3: {
      title: "Nexus Brain — Multi-Agent Enterprise Suite",
      tags: ["AI Orchestration", "Vector Database", "Generative UI"],
      team: "Trendon (LLM Pipeline Architecture) & Julio (Generative UI/UX)",
      desc: "Suite kecerdasan buatan terpadu untuk perusahaan berskala besar, mampu menjalankan multi-agent workflows untuk riset pasar, analisis finansial, dan pembuatan dokumen resmi secara otomatis.",
      highlights: [
        "Orkestrasi multi-agen yang menghubungkan LLM reasoning dengan basis data internal",
        "Generative Dynamic UI: Antarmuka aplikasi berubah layout otomatis mengikuti tipe data yang dikembalikan model AI",
        "Pencarian semantik berkekuatan pgvector dengan relevansi akurasi 96%",
        "Panel kontrol monitoring latency dan biaya inferensi token real-time"
      ],
      tech: "Python, FastAPI, Gemini API / LLM, PostgreSQL pgvector, Svelte, Tailwind CSS",
      metrics: "Otomatisasi 85% pekerjaan administratif korporat"
    },
    4: {
      title: "Vortex Couture — Immersive Fashion Realm",
      tags: ["eCommerce", "Procedural Audio", "3D Fashion", "Stripe"],
      team: "Julio (Visual & Sound UX) & Trendon (Distributed Checkout Engine)",
      desc: "Pengalaman berbelanja busana mewah eksklusif yang memadukan tampilan katalog 3D 360 derajat interaktif dengan lanskap suara ambient yang dihasilkan secara prosedural di browser.",
      highlights: [
        "Simulasi tekstur kain realistis menggunakan physical-based rendering (PBR)",
        "Mesin audio prosedural sintesis Web Audio API karya Julio yang menstimulasi relaksasi saat berbelanja",
        "Sistem checkout anti-fraud super cepat rancangan Trendon dengan integrasi Stripe global",
        "Peningkatan drastis durasi sesi rata-rata pengguna di dalam toko online"
      ],
      tech: "WebGL, Web Audio API, Node.js, GraphQL, PostgreSQL, Tailwind, Stripe API",
      metrics: "Peningkatan konversi penjualan hingga +180% dan UX Rating 4.8/5"
    },
    5: {
      title: "CyberShield — Global Threat Telemetry",
      tags: ["Cyber Security", "Zero Trust", "Geo WebGL", "DDoS Defense"],
      team: "Trendon (Security Mesh Core) & Julio (Threat Map HUD)",
      desc: "Pusat operasi keamanan siber real-time yang memetakan anomali trafik jaringan dan serangan botnet global pada globe 3D interaktif berlatar belakang visual sci-fi cybernetic.",
      highlights: [
        "Pemetaan titik serangan secara akurat pada visualisasi globe 3D interaktif",
        "Inspeksi paket jaringan waktu-nyata dengan kemampuan pemblokiran otomatis pada layer edge",
        "Desain HUD bergaya mission-control karya Julio dengan notifikasi anomali berbobot suara",
        "Ketahanan terhadap serangan DDoS berkekuatan ratusan gigabit per detik"
      ],
      tech: "Rust, eBPF, WebGL Globe, WebSockets, Go, Kubernetes, Grafana Cloud",
      metrics: "Kapasitas filtering 100Gbps+ tanpa false positives"
    },
    6: {
      title: "Pulse Generative Soundscape",
      tags: ["Audio AI", "Digital Signal Processing", "Pure Synth", "Spatial Sound"],
      team: "Julio (Acoustic UX Direction) & Trendon (DSP WebAssembly Engine)",
      desc: "Mesin audio generatif berbasis web tanpa perlu mengunduh file suara mp3 berukuran besar. Seluruh suara alam, frekuensi binaural, dan melodi ambient disintesis langsung secara matematis di memori peramban.",
      highlights: [
        "Ukuran payload 0 Kilobyte untuk file audio — 100% sintesis matematis murni",
        "Algoritma harmonisasi frekuensi 432Hz dan gelombang theta untuk stimulasi fokus mendalam",
        "Visualisator gelombang audio responsif terhadap ritme pernapasan pengguna",
        "Pemenang penghargaan Best Innovative Web Experiment di ajang pengembang audio internasional"
      ],
      tech: "Web Audio API, AudioWorklet, WebAssembly C++, Canvas 2D, Vue 3",
      metrics: "Lossless studio quality dengan beban resource memori di bawah 15MB"
    }
  };

  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function openProjectModal(id) {
    const data = projectData[id];
    if (!data) return;

    modalContent.innerHTML = `
      <div class="modal-header-section" style="margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
          ${data.tags.map(t => `<span class="tag-badge" style="background: rgba(34,211,238,0.15); color: #22d3ee; border-color: rgba(34,211,238,0.3);">${t}</span>`).join('')}
        </div>
        <h2 style="font-size: 1.85rem; margin-bottom: 0.5rem;">${data.title}</h2>
        <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--cyan-glow);">Peran: ${data.team}</p>
      </div>

      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #ffffff;">Ringkasan Eksekutif</h4>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.7;">${data.desc}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: #ffffff;">Keunggulan &amp; Solusi Teknis:</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem;">
          ${data.highlights.map(h => `
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.92rem; color: #cbd5e1;">
              <span style="color: var(--cyan-glow); font-weight: bold;">▹</span>
              <span>${h}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
        <div style="background: rgba(15,23,42,0.8); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-subtle);">
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Tech Stack</span>
          <p style="font-size: 0.88rem; font-weight: 600; color: #ffffff; margin-top: 0.3rem;">${data.tech}</p>
        </div>
        <div style="background: rgba(15,23,42,0.8); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-subtle);">
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Dampak Kunci</span>
          <p style="font-size: 0.88rem; font-weight: 600; color: var(--emerald-accent); margin-top: 0.3rem;">${data.metrics}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 1rem;">
        <button class="btn btn-glass" onclick="document.getElementById('modal-close').click()" style="padding: 0.65rem 1.4rem;">Tutup</button>
        <a href="#contact" class="btn btn-primary" onclick="document.getElementById('modal-close').click()" style="padding: 0.65rem 1.4rem;">Diskusikan Proyek Serupa</a>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = btn.getAttribute('data-project');
      openProjectModal(pId);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProjectModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });

  /* ==========================================================================
     9. INTERACTIVE CONTACT FORM & CELEBRATION CONFETTI
     ========================================================================== */
  // Budget Chips selection
  const budgetChips = document.querySelectorAll('.budget-chip');
  budgetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      budgetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Copy Email Button
  const copyBtn = document.querySelector('.copy-email-btn');
  const copyBadge = document.getElementById('copy-badge');
  if (copyBtn && copyBadge) {
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'hello@juliotrendon.design';
      navigator.clipboard.writeText(email).then(() => {
        copyBadge.textContent = 'Tersalin! ✓';
        copyBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        copyBadge.style.color = '#34d399';
        showToast('Email Berhasil Disalin ke Clipboard! 📋');
        sound.playSuccess();
        setTimeout(() => {
          copyBadge.textContent = 'Salin';
          copyBadge.style.background = '';
          copyBadge.style.color = '';
        }, 2500);
      });
    });
  }

  // Contact Form Submission & Confetti Celebration
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('form-name').value.trim();
      const emailVal = document.getElementById('form-email').value.trim();
      const messageVal = document.getElementById('form-message').value.trim();

      if (!nameVal || !emailVal || !messageVal) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Mohon lengkapi semua kolom yang bertanda bintang (*).';
        formFeedback.classList.remove('hidden');
        return;
      }

      // Simulate sending
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Mengirimkan Pesan...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Pesan Terkirim!</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        `;

        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `<strong>Terima kasih, ${nameVal}!</strong> Pesan Anda telah diterima oleh Julio &amp; Trendon. Kami akan menghubungi Anda segera melalui <em>${emailVal}</em>.`;
        formFeedback.classList.remove('hidden');

        sound.playSuccess();
        launchConfetti();

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = `
            <span>Kirim Pesan Sekarang</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          `;
        }, 5000);
      }, 1000);
    });
  }

  // Confetti Physics Engine
  function launchConfetti() {
    const cCanvas = document.getElementById('confetti-canvas');
    if (!cCanvas) return;
    const cCtx = cCanvas.getContext('2d');
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#06b6d4', '#22d3ee', '#8b5cf6', '#c084fc', '#10b981', '#f59e0b', '#ffffff'];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.7,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    let frame = 0;
    function renderConfetti() {
      cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
      frame++;

      let alive = false;
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.rotSpeed;
        p.alpha -= 0.009;

        if (p.alpha > 0) {
          alive = true;
          cCtx.save();
          cCtx.translate(p.x, p.y);
          cCtx.rotate((p.rotation * Math.PI) / 180);
          cCtx.fillStyle = p.color;
          cCtx.globalAlpha = Math.max(0, p.alpha);
          cCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          cCtx.restore();
        }
      });

      if (alive && frame < 180) {
        requestAnimationFrame(renderConfetti);
      } else {
        cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
      }
    }

    renderConfetti();
  }

});
