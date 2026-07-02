const fetch = require('node-fetch');
const { Favorite, WatchHistory } = require('../models/Favorites');
const { getAgeRestrictions, attachCert, ageFilter, MOCK_MOVIES } = require('./moviesController');

const TMDB_BASE = 'https://api.themoviedb.org/3';

// Genre name → TMDb ID map
const GENRE_MAP = {
  'Action':28,'Adventure':12,'Animation':16,'Comedy':35,'Crime':80,
  'Documentary':99,'Drama':18,'Family':10751,'Fantasy':14,'Horror':27,
  'Mystery':9648,'Romance':10749,'Science Fiction':878,'Sci-Fi':878,
  'Thriller':53,'War':10752,'Western':37,
};

/**
 * Smart recommendation engine:
 * 1. Reads user's watch history genre tallies (weighted — recent = more weight)
 * 2. Reads user's favorites genre tallies
 * 3. Combines + ranks genres by score
 * 4. Excludes movies already in favorites or history
 * 5. Fetches from TMDb discover with top genres
 * 6. Falls back to mock if no TMDb key
 */
const getRecommendations = async (req, res) => {
  const age = parseInt(req.query.age) || req.user?.age || 18;

  try {
    let results = [];
    let personalised = false;

    if (req.user) {
      // ── Build genre score from history (recency-weighted) ─────────────────
      const history = await WatchHistory.find({ user: req.user._id })
        .sort({ watchedAt: -1 }).limit(40);

      const favorites = await Favorite.find({ user: req.user._id })
        .sort({ addedAt: -1 }).limit(30);

      const genreScore = {};

      // History: newer entries get more weight
      history.forEach((h, idx) => {
        const weight = Math.max(1, 10 - Math.floor(idx / 4)); // 10,10,10,10,9,9...1
        const genres = h.genres || [];
        genres.forEach(g => { genreScore[g] = (genreScore[g] || 0) + weight; });
        // Also count genre IDs
        (h.genreIds || []).forEach(id => { genreScore[`id_${id}`] = (genreScore[`id_${id}`] || 0) + weight; });
      });

      // Favorites: higher weight than history
      favorites.forEach(f => {
        const genres = f.genres || [];
        genres.forEach(g => { genreScore[g] = (genreScore[g] || 0) + 15; });
        (f.genreIds || []).forEach(id => { genreScore[`id_${id}`] = (genreScore[`id_${id}`] || 0) + 15; });
      });

      // Also weight by user's declared favorite genres (from profile)
      (req.user.favoriteGenres || []).forEach(g => {
        genreScore[g] = (genreScore[g] || 0) + 20;
      });

      // Build ranked genre ID list
      const genreIdScore = {};
      Object.entries(genreScore).forEach(([key, score]) => {
        if (key.startsWith('id_')) {
          const id = parseInt(key.replace('id_', ''));
          genreIdScore[id] = (genreIdScore[id] || 0) + score;
        } else {
          const id = GENRE_MAP[key];
          if (id) genreIdScore[id] = (genreIdScore[id] || 0) + score;
        }
      });

      const topGenreIds = Object.entries(genreIdScore)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => parseInt(id))
        .filter(Boolean);

      // IDs of movies already seen/saved — to exclude
      const seenIds = new Set([
        ...history.map(h => h.movieId),
        ...favorites.map(f => f.movieId),
      ]);

      if (topGenreIds.length && process.env.TMDB_API_KEY) {
        personalised = true;

        // Fetch two pages from TMDb discover and merge for variety
        const [page1, page2] = await Promise.all([
          fetch(`${TMDB_BASE}/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${topGenreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=200&page=1`).then(r=>r.json()).catch(()=>({results:[]})),
          fetch(`${TMDB_BASE}/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${topGenreIds.slice(0,2).join(',')}&sort_by=popularity.desc&vote_count.gte=100&page=2`).then(r=>r.json()).catch(()=>({results:[]})),
        ]);

        const combined = [...(page1.results||[]), ...(page2.results||[])];

        // Deduplicate + exclude already seen
        const seen = new Set();
        results = combined.filter(m => {
          if (seen.has(m.id) || seenIds.has(m.id)) return false;
          seen.add(m.id); return true;
        });

        // Score each result by how well genres match user preferences
        results = results.map(m => {
          const score = (m.genre_ids || []).reduce((acc, gid) => acc + (genreIdScore[gid] || 0), 0);
          return { ...m, _score: score };
        }).sort((a, b) => b._score - a._score || b.vote_average - a.vote_average);

      } else if (topGenreIds.length) {
        // No TMDB key — use mock, filter to matching genres
        results = MOCK_MOVIES.filter(m =>
          (m.genre_ids||[]).some(g => topGenreIds.includes(g)) && !seenIds.has(m.id)
        );
        if (results.length < 3) results = MOCK_MOVIES.filter(m => !seenIds.has(m.id));
        personalised = results.length > 0;
      }
    }

    // ── Fallback: trending ─────────────────────────────────────────────────
    if (!results.length) {
      if (process.env.TMDB_API_KEY) {
        const r = await fetch(`${TMDB_BASE}/trending/movie/week?api_key=${process.env.TMDB_API_KEY}`);
        const d = await r.json();
        results = d.results || [];
      } else {
        results = MOCK_MOVIES;
      }
    }

    // ── Age filter + attach cert ───────────────────────────────────────────
    results = ageFilter(results, age).map(attachCert);

    // Shuffle top results slightly for freshness
    const top = results.slice(0, 6).sort(() => Math.random() - 0.4);
    const rest = results.slice(6, 20);

    res.json({
      results: [...top, ...rest],
      personalised,
      total_results: results.length,
    });

  } catch (err) {
    console.error('Recommendations error:', err);
    res.json({ results: MOCK_MOVIES.map(attachCert), personalised: false, total_results: MOCK_MOVIES.length });
  }
};

module.exports = { getRecommendations };
