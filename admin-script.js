// ====================
// AUTENTICAÇÃO
// ====================

let isAuthenticated = false;
const ADMIN_PASSWORD = 'admin123';
const UPLOAD_MAX_SIZE = 50 * 1024 * 1024; // 50MB

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupEventListeners();
});

function checkAuthentication() {
    isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (isAuthenticated) {
        showAdminPanel();
    }
}

function setupEventListeners() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            if (password === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminAuthenticated', 'true');
                showAdminPanel();
            } else {
                showLoginError('Senha incorreta!');
            }
        });
    }

    // Movie form
    const movieForm = document.getElementById('movieForm');
    if (movieForm) {
        movieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addMovie();
        });
    }

    // Series form
    const seriesForm = document.getElementById('seriesForm');
    if (seriesForm) {
        seriesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addSeries();
        });
    }

    // Upload zones
    setupUploadZones();
    
    // Load initial data
    loadAdminData();
}

// ====================
// LOGIN
// ====================

function showLoginError(message) {
    const error = document.getElementById('loginError');
    error.textContent = message;
    error.classList.add('show');
    setTimeout(() => {
        error.classList.remove('show');
    }, 3000);
}

function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContainer').classList.add('show');
    loadAdminData();
}

function logoutAdmin() {
    sessionStorage.removeItem('adminAuthenticated');
    isAuthenticated = false;
    document.getElementById('adminContainer').classList.remove('show');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
}

// ====================
// UPLOAD ZONES
// ====================

function setupUploadZones() {
    setupDropZone('moviePosterDropZone', 'moviePosterFile');
    setupDropZone('movieVideoDropZone', 'movieVideoFile');
    setupDropZone('seriesPosterDropZone', 'seriesPosterFile');
}

function setupDropZone(dropZoneId, inputId) {
    const dropZone = document.getElementById(dropZoneId);
    if (!dropZone) return;

    dropZone.addEventListener('click', () => {
        document.getElementById(inputId).click();
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById(inputId).files = files;
        }
    });

    document.getElementById(inputId).addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            if (file.size > UPLOAD_MAX_SIZE) {
                alert('Arquivo muito grande! Máximo: 50MB');
                this.value = '';
            }
        }
    });
}

// ====================
// TOGGLE MODES
// ====================

function toggleMoviePosterMode(mode) {
    const linkGroup = document.getElementById('moviePosterLink');
    const uploadGroup = document.getElementById('moviePosterUpload');
    const buttons = document.querySelectorAll('#moviePosterLink').parentElement.querySelectorAll('.toggle-btn');
    
    if (mode === 'link') {
        linkGroup.classList.add('active');
        uploadGroup.classList.remove('active');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        linkGroup.classList.remove('active');
        uploadGroup.classList.add('active');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}

function toggleMovieVideoMode(mode) {
    const linkGroup = document.getElementById('movieVideoLink');
    const uploadGroup = document.getElementById('movieVideoUpload');
    const buttons = document.querySelectorAll('#movieVideoLink').parentElement.parentElement.querySelectorAll('.toggle-btn');
    
    if (mode === 'link') {
        linkGroup.classList.add('active');
        uploadGroup.classList.remove('active');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        linkGroup.classList.remove('active');
        uploadGroup.classList.add('active');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}

function toggleSeriesPosterMode(mode) {
    const linkGroup = document.getElementById('seriesPosterLink');
    const uploadGroup = document.getElementById('seriesPosterUpload');
    const buttons = document.querySelectorAll('#seriesPosterLink').parentElement.querySelectorAll('.toggle-btn');
    
    if (mode === 'link') {
        linkGroup.classList.add('active');
        uploadGroup.classList.remove('active');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        linkGroup.classList.remove('active');
        uploadGroup.classList.add('active');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
}

// ====================
// CONVERTER ARQUIVO PARA BASE64
// ====================

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ====================
// ADICIONAR FILME
// ====================

async function addMovie() {
    const title = document.getElementById('movieTitle').value;
    const year = document.getElementById('movieYear').value;
    const genre = document.getElementById('movieGenre').value;
    const rating = document.getElementById('movieRating').value;
    const description = document.getElementById('movieDescription').value;

    // Poster
    let poster = document.getElementById('moviePosterUrl').value;
    const posterFile = document.getElementById('moviePosterFile').files[0];
    if (posterFile) {
        poster = await fileToBase64(posterFile);
    }

    // Vídeo
    let videoUrl = document.getElementById('movieVideoUrl').value;
    let videoType = 'youtube';
    const videoFile = document.getElementById('movieVideoFile').files[0];
    if (videoFile) {
        videoUrl = await fileToBase64(videoFile);
        videoType = 'local';
    }

    if (!poster || !videoUrl) {
        showMessage('moviesMessage', 'Todos os campos são obrigatórios!', 'error');
        return;
    }

    const movies = JSON.parse(localStorage.getItem('adminMovies')) || [];
    const newMovie = {
        id: Date.now(),
        type: 'movie',
        title,
        year: parseInt(year),
        genre,
        rating: parseFloat(rating),
        poster,
        description,
        videoUrl,
        videoType
    };

    movies.push(newMovie);
    localStorage.setItem('adminMovies', JSON.stringify(movies));
    showMessage('moviesMessage', '✅ Filme adicionado com sucesso!', 'success');
    document.getElementById('movieForm').reset();
    renderMoviesList();
}

// ====================
// ADICIONAR SÉRIE
// ====================

async function addSeries() {
    const title = document.getElementById('seriesTitle').value;
    const year = document.getElementById('seriesYear').value;
    const genre = document.getElementById('seriesGenre').value;
    const rating = document.getElementById('seriesRating').value;
    const description = document.getElementById('seriesDescription').value;

    // Poster
    let poster = document.getElementById('seriesPosterUrl').value;
    const posterFile = document.getElementById('seriesPosterFile').files[0];
    if (posterFile) {
        poster = await fileToBase64(posterFile);
    }

    if (!poster) {
        showMessage('seriesMessage', 'Todos os campos são obrigatórios!', 'error');
        return;
    }

    const series = JSON.parse(localStorage.getItem('adminSeries')) || [];
    const newSeries = {
        id: Date.now(),
        type: 'series',
        title,
        year: parseInt(year),
        genre,
        rating: parseFloat(rating),
        poster,
        description,
        seasons: []
    };

    series.push(newSeries);
    localStorage.setItem('adminSeries', JSON.stringify(series));
    showMessage('seriesMessage', '✅ Série adicionada com sucesso!', 'success');
    document.getElementById('seriesForm').reset();
    renderSeriesList();
}

// ====================
// RENDERIZAR LISTAS
// ====================

function loadAdminData() {
    renderMoviesList();
    renderSeriesList();
    updateStats();
}

function renderMoviesList() {
    const movies = JSON.parse(localStorage.getItem('adminMovies')) || [];
    const list = document.getElementById('moviesList');
    
    if (movies.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhum filme adicionado ainda</p>';
        return;
    }

    list.innerHTML = movies.map(movie => `
        <div class="item-card">
            <input type="checkbox" class="item-checkbox" data-movie-id="${movie.id}">
            <img src="${movie.poster}" alt="${movie.title}" class="item-poster" onerror="this.src='https://via.placeholder.com/60x90?text=Sem+Poster'">
            <div class="item-info">
                <h4>${movie.title}</h4>
                <p>${movie.year} • ${movie.genre}</p>
                <p>⭐ ${movie.rating}/10</p>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteMovie(${movie.id})">🗑️ Deletar</button>
            </div>
        </div>
    `).join('');

    updateMoviesBulkActions();
}

function renderSeriesList() {
    const series = JSON.parse(localStorage.getItem('adminSeries')) || [];
    const list = document.getElementById('seriesList');
    
    if (series.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhuma série adicionada ainda</p>';
        return;
    }

    list.innerHTML = series.map(s => `
        <div class="series-item-card">
            <div class="series-header">
                <input type="checkbox" class="item-checkbox" data-series-id="${s.id}">
                <img src="${s.poster}" alt="${s.title}" class="item-poster" onerror="this.src='https://via.placeholder.com/60x90?text=Sem+Poster'">
                <div class="series-info">
                    <h4>${s.title}</h4>
                    <p>${s.year} • ${s.genre}</p>
                    <p>⭐ ${s.rating}/10</p>
                </div>
                <button class="btn-delete" onclick="deleteSeries(${s.id})">🗑️ Deletar</button>
            </div>
        </div>
    `).join('');

    updateSeriesBulkActions();
}

// ====================
// DELETAR ITEMS
// ====================

function deleteMovie(id) {
    if (confirm('Tem certeza que deseja deletar este filme?')) {
        const movies = JSON.parse(localStorage.getItem('adminMovies')) || [];
        const filtered = movies.filter(m => m.id !== id);
        localStorage.setItem('adminMovies', JSON.stringify(filtered));
        renderMoviesList();
    }
}

function deleteSeries(id) {
    if (confirm('Tem certeza que deseja deletar esta série?')) {
        const series = JSON.parse(localStorage.getItem('adminSeries')) || [];
        const filtered = series.filter(s => s.id !== id);
        localStorage.setItem('adminSeries', JSON.stringify(filtered));
        renderSeriesList();
    }
}

function deleteSelectedMovies() {
    const selected = Array.from(document.querySelectorAll('[data-movie-id]:checked')).map(el => parseInt(el.dataset.movieId));
    if (selected.length === 0) return;
    if (confirm(`Deletar ${selected.length} filme(s)?`)) {
        const movies = JSON.parse(localStorage.getItem('adminMovies')) || [];
        const filtered = movies.filter(m => !selected.includes(m.id));
        localStorage.setItem('adminMovies', JSON.stringify(filtered));
        renderMoviesList();
    }
}

function deleteSelectedSeries() {
    const selected = Array.from(document.querySelectorAll('[data-series-id]:checked')).map(el => parseInt(el.dataset.seriesId));
    if (selected.length === 0) return;
    if (confirm(`Deletar ${selected.length} série(s)?`)) {
        const series = JSON.parse(localStorage.getItem('adminSeries')) || [];
        const filtered = series.filter(s => !selected.includes(s.id));
        localStorage.setItem('adminSeries', JSON.stringify(filtered));
        renderSeriesList();
    }
}

// ====================
// SELEÇÃO EM MASSA
// ====================

function selectAllMovies() {
    document.querySelectorAll('[data-movie-id]').forEach(el => {
        el.checked = true;
    });
    updateMoviesBulkActions();
}

function selectAllSeries() {
    document.querySelectorAll('[data-series-id]').forEach(el => {
        el.checked = true;
    });
    updateSeriesBulkActions();
}

function updateMoviesBulkActions() {
    const selected = document.querySelectorAll('[data-movie-id]:checked').length;
    const bulkActions = document.getElementById('moviesBulkActions');
    document.getElementById('moviesSelectedCount').textContent = selected;
    if (selected > 0) {
        bulkActions.classList.add('show');
    } else {
        bulkActions.classList.remove('show');
    }
}

function updateSeriesBulkActions() {
    const selected = document.querySelectorAll('[data-series-id]:checked').length;
    const bulkActions = document.getElementById('seriesBulkActions');
    document.getElementById('seriesSelectedCount').textContent = selected;
    if (selected > 0) {
        bulkActions.classList.add('show');
    } else {
        bulkActions.classList.remove('show');
    }
}

// ====================
// ABAS
// ====================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// ====================
// MENSAGENS
// ====================

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => {
        element.className = 'message';
    }, 3000);
}

// ====================
// EXPORT/IMPORT
// ====================

function exportMoviesToJSON() {
    const movies = JSON.parse(localStorage.getItem('adminMovies')) || [];
    downloadJSON(movies, 'filmes.json');
}

function exportSeriesToJSON() {
    const series = JSON.parse(localStorage.getItem('adminSeries')) || [];
    downloadJSON(series, 'series.json');
}

function exportAllToJSON() {
    const data = {
        movies: JSON.parse(localStorage.getItem('adminMovies')) || [],
        series: JSON.parse(localStorage.getItem('adminSeries')) || []
    };
    downloadJSON(data, 'filmflix-backup.json');
}

function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function importMoviesFromJSON() {
    document.getElementById('importFile').onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const movies = JSON.parse(event.target.result);
            localStorage.setItem('adminMovies', JSON.stringify(movies));
            renderMoviesList();
            alert('Filmes importados com sucesso!');
        };
        reader.readAsText(file);
    };
    document.getElementById('importFile').click();
}

function importSeriesFromJSON() {
    document.getElementById('importFile').onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const series = JSON.parse(event.target.result);
            localStorage.setItem('adminSeries', JSON.stringify(series));
            renderSeriesList();
            alert('Séries importadas com sucesso!');
        };
        reader.readAsText(file);
    };
    document.getElementById('importFile').click();
}

// ====================
// AÇÕES PERIGOSAS
// ====================

function clearAllMovies() {
    if (confirm('⚠️ CUIDADO: Deletar TODOS os filmes?')) {
        localStorage.removeItem('adminMovies');
        renderMoviesList();
        alert('Todos os filmes foram deletados!');
    }
}

function clearAllSeries() {
    if (confirm('⚠️ CUIDADO: Deletar TODAS as séries?')) {
        localStorage.removeItem('adminSeries');
        renderSeriesList();
        alert('Todas as séries foram deletadas!');
    }
}

// ====================
// SEGURANÇA
// ====================

function changePassword() {
    const newPassword = prompt('Digite a nova senha:');
    if (newPassword && newPassword.length >= 4) {
        alert(`⚠️ A senha foi alterada para: ${newPassword}\n\nLembre-se de compartilhar com os admin!`);
        // Nota: em produção, isso deve ser salvo no backend, não no frontend!
    } else {
        alert('Senha deve ter no mínimo 4 caracteres!');
    }
}

// ====================
// ESTATÍSTICAS
// ====================

function updateStats() {
    const movies = JSON.parse(localStorage.getItem('adminMovies')) || [];
    const series = JSON.parse(localStorage.getItem('adminSeries')) || [];
    
    document.getElementById('moviesCount').textContent = movies.length;
    document.getElementById('seriesCount').textContent = series.length;
    document.getElementById('totalCount').textContent = movies.length + series.length;
}

// ====================
// TEMPORADAS (para séries)
// ====================

let seasonCount = 0;

function addNewSeason() {
    seasonCount++;
    const container = document.getElementById('seasonsContainer');
    const seasonHtml = `
        <div class="season-item" id="season-${seasonCount}">
            <div class="season-header">
                <h4>Temporada ${seasonCount}</h4>
                <button type="button" class="btn-remove-season" onclick="removeSeason(${seasonCount})">Remover</button>
            </div>
            <div class="episodes-list" id="episodes-${seasonCount}"></div>
            <div class="add-episode-form">
                <div class="add-episode-options">
                    <button type="button" onclick="addEpisodeMode('youtube', ${seasonCount})">🔗 YouTube</button>
                    <button type="button" onclick="addEpisodeMode('local', ${seasonCount})">📁 Upload</button>
                </div>
                <div id="episode-input-${seasonCount}" style="display: none;">
                    <input type="text" placeholder="Nome do episódio" id="episode-name-${seasonCount}">
                    <input type="text" placeholder="URL ou selecione arquivo" id="episode-url-${seasonCount}">
                    <button type="button" class="btn-add-episode" onclick="addEpisode(${seasonCount})">Adicionar Episódio</button>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', seasonHtml);
}

function removeSeason(seasonNumber) {
    document.getElementById(`season-${seasonNumber}`).remove();
}

function addEpisodeMode(mode, seasonNumber) {
    const inputDiv = document.getElementById(`episode-input-${seasonNumber}`);
    inputDiv.style.display = 'block';
}

function addEpisode(seasonNumber) {
    const name = document.getElementById(`episode-name-${seasonNumber}`).value;
    const url = document.getElementById(`episode-url-${seasonNumber}`).value;
    
    if (!name || !url) {
        alert('Preencha todos os campos!');
        return;
    }

    const episodeHtml = `
        <div class="episode-item">
            <div class="episode-info">
                <p class="episode-number">${name}</p>
                <p>${url.substring(0, 50)}...</p>
            </div>
            <button class="btn-remove-episode" onclick="this.parentElement.remove()">Remover</button>
        </div>
    `;
    document.getElementById(`episodes-${seasonNumber}`).insertAdjacentHTML('beforeend', episodeHtml);
    document.getElementById(`episode-name-${seasonNumber}`).value = '';
    document.getElementById(`episode-url-${seasonNumber}`).value = '';
}
