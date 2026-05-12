// ====================
// CARREGAR DADOS DO STORAGE
// ====================

function loadMoviesFromStorage() {
    const stored = localStorage.getItem('adminMovies');
    return stored ? JSON.parse(stored) : moviesDatabase;
}

function loadSeriesFromStorage() {
    const stored = localStorage.getItem('adminSeries');
    return stored ? JSON.parse(stored) : [];
}

// ====================
// DATABASE PADRÃO
// ====================

const moviesDatabase = [
    {
        id: 1,
        type: 'movie',
        title: "UM INSCRITO ME DESAFIOU E EU CHAMEI ELE PRO CANAL 🤯😱",
        year: 2026,
        genre: "comedia",
        rating: 8.8,
        poster: "https://via.placeholder.com/200x300?text=Inception",
        description: "O vídeo de hoje ficou INSANO!",
        videoUrl: "file:///C:/Users/aluno/Downloads/YTDown_YouTube_UM-INSCRITO-ME-DESAFIOU-E-EU-CHAMEI-ELE-_Media_03rlFUkHTZA_001_1080p.mp4",
        videoType: "mp4"
    },
   
let currentFilter = 'all';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentMovie = null;
let allMovies = [];
let allSeries = [];

// ====================
// INICIALIZAÇÃO
// ====================

document.addEventListener('DOMContentLoaded', function() {
    loadAllContent();
    renderTrendingMovies();
    renderAllMovies();
    renderFavorites();
    setupEventListeners();
});

function loadAllContent() {
    allMovies = loadMoviesFromStorage();
    allSeries = loadSeriesFromStorage();
}

// ====================
// SETUP DE EVENT LISTENERS
// ====================

function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderAllMovies();
        });
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const query = this.value.toLowerCase();
        if (query.length > 0) {
            const combined = [...allMovies, ...allSeries];
            const filtered = combined.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.genre.toLowerCase().includes(query)
            );
            renderMovies(filtered, 'moviesGrid');
        } else {
            renderAllMovies();
        }
    });

    // Modal close
    const movieModal = document.getElementById('movieModal');
    if (movieModal) {
        movieModal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('modal-close')) {
                closeModal();
            }
        });
    }

    // Player modal close
    const playerModal = document.getElementById('playerModal');
    if (playerModal) {
        playerModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closePlayer();
            }
        });
    }
}

// ====================
// RENDERIZAR TRENDING
// ====================

function renderTrendingMovies() {
    const combined = [...allMovies, ...allSeries];
    const trending = combined.slice(0, 6);
    renderMovies(trending, 'trendingMovies');
}

// ====================
// RENDERIZAR TODOS OS FILMES
// ====================

function renderAllMovies() {
    let combined = [...allMovies, ...allSeries];
    
    if (currentFilter !== 'all') {
        combined = combined.filter(item => item.genre === currentFilter);
    }
    
    renderMovies(combined, 'moviesGrid');
}

// ====================
// RENDERIZAR FAVORITOS
// ====================

function renderFavorites() {
    const combined = [...allMovies, ...allSeries];
    const favoriteMovies = combined.filter(item => favorites.includes(item.id));
    const grid = document.getElementById('favoritesGrid');
    const noFav = document.getElementById('noFavorites');

    if (favoriteMovies.length === 0) {
        grid.innerHTML = '';
        noFav.style.display = 'block';
    } else {
        renderMovies(favoriteMovies, 'favoritesGrid');
        noFav.style.display = 'none';
    }
}

// ====================
// RENDERIZAR MOVIES GENÉRICO
// ====================

function renderMovies(movies, elementId) {
    const grid = document.getElementById(elementId);
    
    if (!grid) return;
    
    grid.innerHTML = '';

    if (movies.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">Nenhum filme encontrado</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        const isFavorite = favorites.includes(movie.id);
        
        movieCard.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Poster'">
            <button class="movie-favorite-btn ${isFavorite ? 'active' : ''}" 
                    onclick="event.stopPropagation(); toggleFavoriteCard(${movie.id})" 
                    title="Adicionar aos favoritos">
                ❤️
            </button>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>${movie.year}</span>
                    <span class="movie-rating">⭐ ${movie.rating}</span>
                </div>
            </div>
        `;

        movieCard.addEventListener('click', () => openModal(movie));
        grid.appendChild(movieCard);
    });
}

// ====================
// MODAL - ABRIR
// ====================

function openModal(movie) {
    currentMovie = movie;
    
    document.getElementById('modalTitle').textContent = movie.title;
    document.getElementById('modalYear').textContent = `Ano: ${movie.year}`;
    document.getElementById('modalGenre').textContent = movie.genre.toUpperCase();
    document.getElementById('modalPoster').src = movie.poster;
    document.getElementById('modalPoster').onerror = function() {
        this.src = 'https://via.placeholder.com/200x300?text=Sem+Poster';
    };
    document.getElementById('modalDescription').textContent = movie.description;
    
    // Renderizar rating em estrelas
    const ratingStars = '⭐'.repeat(Math.round(movie.rating / 2));
    document.getElementById('modalRating').textContent = ratingStars;
    document.getElementById('modalRatingNumber').textContent = `${movie.rating}/10`;

    // Atualizar botão de favorito
    const favBtn = document.getElementById('favBtn');
    const isFavorite = favorites.includes(movie.id);
    
    if (isFavorite) {
        favBtn.classList.add('active');
        favBtn.textContent = '❤️ Nos Favoritos';
    } else {
        favBtn.classList.remove('active');
        favBtn.textContent = '🤍 Favoritar';
    }

    document.getElementById('movieModal').classList.add('active');
}

// ====================
// MODAL - FECHAR
// ====================

function closeModal() {
    document.getElementById('movieModal').classList.remove('active');
    currentMovie = null;
}

// ====================
// PLAYER - REPRODUZIR
// ====================

function playMovie() {
    if (currentMovie) {
        document.getElementById('playerTitle').textContent = currentMovie.title;
        
        const videoUrl = currentMovie.videoUrl;
        const videoType = currentMovie.videoType || 'youtube'; // Detectar tipo
        
        const playerContainer = document.querySelector('.player-container');
        playerContainer.innerHTML = ''; // Limpar conteúdo anterior
        
        if (videoType === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            // YouTube embed
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '500';
            iframe.src = videoUrl;
            iframe.frameborder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            playerContainer.appendChild(iframe);
        } else {
            // Vídeo local ou link externo
            const video = document.createElement('video');
            video.id = 'videoPlayer';
            video.controls = true;
            video.style.width = '100%';
            video.style.maxHeight = '500px';
            
            const source = document.createElement('source');
            source.src = videoUrl;
            source.type = 'video/mp4';
            
            video.appendChild(source);
            video.innerHTML += 'Seu navegador não suporta o elemento de vídeo.';
            
            playerContainer.appendChild(video);
        }
        
        document.getElementById('playerModal').classList.add('active');
        closeModal();
    }
}

// ====================
// PLAYER - FECHAR
// ====================

function closePlayer() {
    document.getElementById('playerModal').classList.remove('active');
    const playerContainer = document.querySelector('.player-container');
    playerContainer.innerHTML = '';
}

// ====================
// FAVORITOS - TOGGLE
// ====================

function toggleFavorite() {
    if (currentMovie) {
        toggleFavoriteCard(currentMovie.id);
        
        const favBtn = document.getElementById('favBtn');
        const isFavorite = favorites.includes(currentMovie.id);
        
        if (isFavorite) {
            favBtn.classList.add('active');
            favBtn.textContent = '❤️ Nos Favoritos';
        } else {
            favBtn.classList.remove('active');
            favBtn.textContent = '🤍 Favoritar';
        }
    }
}

function toggleFavoriteCard(movieId) {
    const index = favorites.indexOf(movieId);
    
    if (index > -1) {
        // Remover dos favoritos
        favorites.splice(index, 1);
    } else {
        // Adicionar aos favoritos
        favorites.push(movieId);
    }
    
    // Salvar no localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Atualizar todas as visões
    renderTrendingMovies();
    renderAllMovies();
    renderFavorites();
}

// ====================
// SCROLL
// ====================

function scrollToMovies() {
    const moviesSection = document.querySelector('.movies-section');
    if (moviesSection) {
        moviesSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ====================
// ATUALIZAR CONTEÚDO
// ====================

function refreshContent() {
    loadAllContent();
    renderTrendingMovies();
    renderAllMovies();
    renderFavorites();
}

// ====================
// DETECTAR MUDANÇAS NO STORAGE
// ====================

window.addEventListener('storage', function() {
    refreshContent();
});

// ====================
// DETECTAR MUDANÇAS A CADA 2 SEGUNDOS
// ====================

setInterval(function() {
    const currentMovies = loadMoviesFromStorage();
    const currentSeries = loadSeriesFromStorage();
    
    // Se houver mudanças, atualizar
    if (JSON.stringify(currentMovies) !== JSON.stringify(allMovies) ||
        JSON.stringify(currentSeries) !== JSON.stringify(allSeries)) {
        refreshContent();
    }
}, 2000);

// ====================
// FUNÇÕES AUXILIARES
// ====================

function getMovieById(id) {
    const combined = [...allMovies, ...allSeries];
    return combined.find(item => item.id === id);
}

function getGenreCount(genre) {
    const combined = [...allMovies, ...allSeries];
    return combined.filter(item => item.genre === genre).length;
}

function getAllGenres() {
    const combined = [...allMovies, ...allSeries];
    const genres = new Set(combined.map(item => item.genre));
    return Array.from(genres);
}

function sortByRating(movies) {
    return [...movies].sort((a, b) => b.rating - a.rating);
}

function sortByYear(movies) {
    return [...movies].sort((a, b) => b.year - a.year);
}

function sortByTitle(movies) {
    return [...movies].sort((a, b) => a.title.localeCompare(b.title));
}

function filterByGenre(genre) {
    const combined = [...allMovies, ...allSeries];
    return combined.filter(item => item.genre === genre);
}

function searchMovies(query) {
    const combined = [...allMovies, ...allSeries];
    const lowerQuery = query.toLowerCase();
    return combined.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.genre.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
}

function getMostRatedMovies(limit = 10) {
    const combined = [...allMovies, ...allSeries];
    return sortByRating(combined).slice(0, limit);
}

function getLatestMovies(limit = 10) {
    const combined = [...allMovies, ...allSeries];
    return sortByYear(combined).slice(0, limit);
}

// ====================
// VALIDAÇÃO
// ====================

function isValidMovie(movie) {
    return (
        movie.id &&
        movie.title &&
        movie.year &&
        movie.genre &&
        movie.rating >= 0 && movie.rating <= 10 &&
        movie.poster &&
        movie.description &&
        movie.videoUrl
    );
}

// ====================
// ANALYTICS (Opcional)
// ====================

function logMovieView(movieId) {
    const views = JSON.parse(localStorage.getItem('movieViews')) || {};
    views[movieId] = (views[movieId] || 0) + 1;
    localStorage.setItem('movieViews', JSON.stringify(views));
}

function getMostViewedMovies() {
    const views = JSON.parse(localStorage.getItem('movieViews')) || {};
    const combined = [...allMovies, ...allSeries];
    
    return combined
        .sort((a, b) => (views[b.id] || 0) - (views[a.id] || 0))
        .slice(0, 10);
}

// ====================
// EXPORTS (para uso externo)
// ====================

window.refreshContent = refreshContent;
window.getMovieById = getMovieById;
window.getAllGenres = getAllGenres;
window.filterByGenre = filterByGenre;
window.searchMovies = searchMovies;
window.getMostRatedMovies = getMostRatedMovies;
window.getLatestMovies = getLatestMovies;
