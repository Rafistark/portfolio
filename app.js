// ==============================================================================
// RA.FX // RAFI EDITS - HIGH-RETENTION VIDEO PORTFOLIO ENGINE
// Bulletproof Video Playback, Custom Theater Player & Interactive Gallery
// ==============================================================================

(function() {
  'use strict';

  const data = window.PORTFOLIO_DATA;
  if (!data) {
    console.error("PORTFOLIO_DATA not found. Make sure data.js is loaded first.");
    return;
  }

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroPlayer();
    initWorksGallery();
    initFaq();
    initTheaterModal();
  });

  // ----------------------------------------------------------------------------
  // Helper: Format Time (mm:ss)
  // ----------------------------------------------------------------------------
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // ----------------------------------------------------------------------------
  // Mobile Navigation Drawer Toggle
  // ----------------------------------------------------------------------------
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-toggle-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const links = document.querySelectorAll('.mobile-drawer-link');

    if (!toggleBtn || !drawer) return;

    function toggle(open) {
      const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
      drawer.classList.toggle('open', isOpen);
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      
      const icon = toggleBtn.querySelector('svg');
      if (icon) {
        if (isOpen) {
          icon.innerHTML = '<path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        } else {
          icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        }
      }
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    links.forEach(l => l.addEventListener('click', () => toggle(false)));

    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
        toggle(false);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // Hero Video Player (Rock-Solid Playback Engine)
  // ----------------------------------------------------------------------------
  function initHeroPlayer() {
    const player = document.getElementById('hero-video-player');
    const overlay = document.getElementById('hero-play-overlay');
    const spinner = document.getElementById('hero-spinner');
    const togglePlayBtn = document.getElementById('hero-toggle-play-btn');
    const playIcon = document.getElementById('hero-toggle-play-icon');
    const toggleMuteBtn = document.getElementById('hero-toggle-mute-btn');
    const muteIcon = document.getElementById('hero-toggle-mute-icon');
    const timecode = document.getElementById('hero-timecode');
    const fullscreenBtn = document.getElementById('hero-fullscreen-btn');

    if (!player) return;

    const heroData = data.heroShowreel;

    // Rock-Solid Fallback Handler
    let usingFallback = false;
    player.addEventListener('error', () => {
      if (!usingFallback && heroData.fallbackUrl) {
        console.warn('Hero video local source unavailable. Switching to high-speed CDN fallback.');
        usingFallback = true;
        player.src = heroData.fallbackUrl;
        player.load();
        player.play().catch(e => console.log('Autoplay deferred until user interaction'));
      }
    });

    // Spinner during buffering
    player.addEventListener('waiting', () => spinner && spinner.classList.add('active'));
    player.addEventListener('playing', () => spinner && spinner.classList.remove('active'));
    player.addEventListener('canplay', () => spinner && spinner.classList.remove('active'));

    function playHero() {
      player.muted = false;
      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (overlay) overlay.style.opacity = '0';
          if (overlay) overlay.style.pointerEvents = 'none';
          updatePlayIcon(true);
        }).catch(err => {
          console.warn('Audio play blocked by browser. Starting muted:', err);
          player.muted = true;
          player.play();
          if (overlay) overlay.style.opacity = '0';
          if (overlay) overlay.style.pointerEvents = 'none';
          updatePlayIcon(true);
        });
      }
    }

    function pauseHero() {
      player.pause();
      if (overlay) overlay.style.opacity = '1';
      if (overlay) overlay.style.pointerEvents = 'auto';
      updatePlayIcon(false);
    }

    function updatePlayIcon(isPlaying) {
      if (!playIcon) return;
      if (isPlaying) {
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      } else {
        playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }
    }

    if (overlay) {
      overlay.addEventListener('click', () => playHero());
    }

    player.addEventListener('click', () => {
      if (player.paused) playHero();
      else pauseHero();
    });

    if (togglePlayBtn) {
      togglePlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (player.paused) playHero();
        else pauseHero();
      });
    }

    if (toggleMuteBtn) {
      toggleMuteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        player.muted = !player.muted;
        if (muteIcon) {
          if (player.muted) {
            muteIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
          } else {
            muteIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
          }
        }
      });
    }

    player.addEventListener('timeupdate', () => {
      if (timecode) {
        timecode.textContent = `${formatTime(player.currentTime)} / ${formatTime(player.duration || 45)}`;
      }
    });

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          if (player.requestFullscreen) player.requestFullscreen();
          else if (player.webkitRequestFullscreen) player.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }
  }

  // ----------------------------------------------------------------------------
  // Works Gallery Rendering & Category Filtering
  // ----------------------------------------------------------------------------
  function initWorksGallery() {
    const grid = document.getElementById('works-grid');
    const filterTabsContainer = document.getElementById('filter-tabs-container');
    if (!grid || !data.projects) return;

    let activeFilter = 'all';

    function renderCards() {
      const filtered = activeFilter === 'all' 
        ? data.projects 
        : data.projects.filter(p => p.category === activeFilter);

      grid.innerHTML = filtered.map(p => `
        <div class="reel-card group flex flex-col justify-between" data-id="${p.id}">
          
          <!-- Visual Media Container -->
          <div class="relative w-full aspect-reel bg-black overflow-hidden flex items-center justify-center">
            
            <!-- Poster Image (Always crisp & immediately visible) -->
            <img src="${p.poster}" alt="${p.title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            
            <!-- Video for Hover Preview (Muted) -->
            <video 
              src="${p.videoUrl}" 
              data-fallback="${p.fallbackUrl || ''}"
              muted 
              loop 
              playsinline 
              webkit-playsinline 
              preload="none" 
              class="card-preview-vid absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            </video>

            <!-- Gradient Shadow Top & Bottom -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none"></div>

            <!-- Top Badges -->
            <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
              <span class="tag-pill tag-cyan text-[10px] font-mono tracking-wider">${p.badge}</span>
              <span class="tag-pill text-[10px] font-mono bg-black/70 border-white/10">${p.duration}</span>
            </div>

            <!-- Center Play Button with Glow -->
            <div class="absolute inset-0 flex items-center justify-center z-10">
              <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#00f2fe] transition-all duration-300">
                <svg class="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>

            <!-- Client Benefit Strip -->
            <div class="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
              <div class="text-[11px] font-mono text-[#00f2fe] flex items-center gap-1.5 mb-1">
                <span>⚡</span>
                <span class="truncate">${p.clientBenefit}</span>
              </div>
              <h3 class="text-sm sm:text-base font-extrabold text-white group-hover:text-[#00f2fe] transition-colors leading-tight line-clamp-1">
                ${p.title}
              </h3>
            </div>

          </div>

          <!-- Bottom Card Content -->
          <div class="p-3.5 sm:p-4 bg-zinc-950 flex flex-col justify-between gap-3 border-t border-white/5">
            <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              ${p.summary}
            </p>

            <div class="flex flex-wrap gap-1">
              ${p.tags.slice(0, 3).map(t => `<span class="tag-pill text-[9px]">${t}</span>`).join('')}
            </div>

            <div class="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">
              <span class="text-[11px] text-zinc-500">${p.categoryLabel}</span>
              <span class="text-[#00f2fe] font-bold flex items-center gap-1">
                Watch Edit <span>▶</span>
              </span>
            </div>
          </div>

        </div>
      `).join('');

      attachCardEvents();
    }

    function attachCardEvents() {
      const cards = grid.querySelectorAll('.reel-card');

      cards.forEach(card => {
        const id = card.dataset.id;
        const project = data.projects.find(p => p.id === id);
        const vid = card.querySelector('.card-preview-vid');

        if (vid && project) {
          vid.addEventListener('error', () => {
            if (project.fallbackUrl && vid.src !== project.fallbackUrl) {
              vid.src = project.fallbackUrl;
            }
          });

          // Hover video preview on desktop
          if (!isTouchDevice) {
            card.addEventListener('mouseenter', () => {
              vid.currentTime = 0;
              vid.play().catch(() => {});
            });
            card.addEventListener('mouseleave', () => {
              vid.pause();
            });
          }
        }

        // Tap or click anywhere on card opens Theater Modal
        card.addEventListener('click', () => {
          if (project) openTheaterModal(project);
        });
      });
    }

    if (filterTabsContainer) {
      filterTabsContainer.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          filterTabsContainer.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          activeFilter = tab.dataset.filter;
          renderCards();
        });
      });
    }

    renderCards();
  }

  // ----------------------------------------------------------------------------
  // Theater Video Modal Controller
  // ----------------------------------------------------------------------------
  let activeModalProject = null;

  function initTheaterModal() {
    const modal = document.getElementById('theater-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const video = document.getElementById('theater-video-el');
    const spinner = document.getElementById('theater-spinner');
    const playBtn = document.getElementById('theater-play-btn');
    const playIcon = document.getElementById('theater-play-icon');
    const muteBtn = document.getElementById('theater-mute-btn');
    const muteIcon = document.getElementById('theater-mute-icon');
    const scrubber = document.getElementById('theater-scrubber');
    const timeDisplay = document.getElementById('theater-time');
    const fullscreenBtn = document.getElementById('theater-fullscreen-btn');

    if (!modal || !video) return;

    // Spinner during buffer
    video.addEventListener('waiting', () => spinner && spinner.classList.add('active'));
    video.addEventListener('playing', () => spinner && spinner.classList.remove('active'));
    video.addEventListener('canplay', () => spinner && spinner.classList.remove('active'));

    // Bulletproof Fallback
    video.addEventListener('error', () => {
      if (activeModalProject && activeModalProject.fallbackUrl && video.src !== activeModalProject.fallbackUrl) {
        console.warn('Theater video primary source error. Switching to fallback:', activeModalProject.fallbackUrl);
        video.src = activeModalProject.fallbackUrl;
        video.load();
        video.play().catch(e => console.warn('Fallback play blocked:', e));
      }
    });

    function togglePlay() {
      if (video.paused) {
        video.play().catch(e => console.warn('Play error:', e));
        if (playIcon) playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      } else {
        video.pause();
        if (playIcon) playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }
    }

    function toggleMute() {
      video.muted = !video.muted;
      if (muteIcon) {
        if (video.muted) {
          muteIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        } else {
          muteIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
        }
      }
    }

    video.addEventListener('click', togglePlay);
    if (playBtn) playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
    if (muteBtn) muteBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(); });

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        if (scrubber) scrubber.value = progress;
        if (timeDisplay) timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }
    });

    if (scrubber) {
      scrubber.addEventListener('input', () => {
        if (video.duration) {
          video.currentTime = (scrubber.value / 100) * video.duration;
        }
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          if (video.requestFullscreen) video.requestFullscreen();
          else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      });
    }

    function closeModal() {
      modal.classList.remove('active');
      video.pause();
      video.src = '';
      activeModalProject = null;
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function openTheaterModal(project) {
    const modal = document.getElementById('theater-modal');
    const video = document.getElementById('theater-video-el');
    const title = document.getElementById('modal-title');
    const badge = document.getElementById('modal-category-badge');
    const desc = document.getElementById('modal-desc');
    const tagsContainer = document.getElementById('modal-tags');
    const whatsappCTA = document.getElementById('modal-whatsapp-cta');
    const playIcon = document.getElementById('theater-play-icon');

    if (!modal || !video) return;

    activeModalProject = project;

    if (title) title.textContent = project.title;
    if (badge) badge.textContent = project.badge || 'EDIT';
    if (desc) desc.textContent = project.summary;

    if (tagsContainer) {
      tagsContainer.innerHTML = project.tags.map(t => `<span class="tag-pill text-[10px]">${t}</span>`).join('');
    }

    if (whatsappCTA) {
      const msg = encodeURIComponent(`Hi Rafi, I saw your edit "${project.title}" on your portfolio and want something similar for my videos!`);
      whatsappCTA.href = `https://wa.me/917395812248?text=${msg}`;
    }

    video.poster = project.poster || '';
    video.src = project.videoUrl;
    video.muted = false;
    video.load();

    modal.classList.add('active');

    video.play().then(() => {
      if (playIcon) playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    }).catch(err => {
      console.warn('Modal unmuted autoplay blocked, trying muted:', err);
      video.muted = true;
      video.play().catch(() => {});
    });
  }

  // ----------------------------------------------------------------------------
  // FAQ Accordion
  // ----------------------------------------------------------------------------
  function initFaq() {
    const container = document.getElementById('faq-container');
    if (!container || !data.faq) return;

    container.innerHTML = data.faq.map((item, idx) => `
      <div class="bento-card overflow-hidden transition-all duration-200">
        <button class="faq-question w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-white hover:text-[#00f2fe] transition-colors" data-idx="${idx}">
          <span>${item.q}</span>
          <span class="faq-arrow text-zinc-500 font-mono text-base transition-transform duration-200">+</span>
        </button>
        <div class="faq-answer hidden px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
          ${item.a}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.bento-card');
        const answer = card.querySelector('.faq-answer');
        const arrow = card.querySelector('.faq-arrow');
        const isHidden = answer.classList.contains('hidden');

        // Close all others
        container.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        container.querySelectorAll('.faq-arrow').forEach(ar => {
          ar.textContent = '+';
          ar.classList.remove('rotate-45');
        });

        if (isHidden) {
          answer.classList.remove('hidden');
          arrow.textContent = '−';
        }
      });
    });
  }

})();
