(function () {
    'use strict';

    const CONFIG = {
        USERNAME: 'Ulricharmel001',
        REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
        CACHE_DURATION: 4 * 60 * 1000,   // 4 minutes (refresh before API limit)
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
        TIMEOUT: 10000,
        MAX_PAGES: 5,
        PER_PAGE: 100
    };

    // No token needed - using unauthenticated GitHub API (60 requests/hour)
    // For public repositories and profile data, this is sufficient
    const HEADERS = {
        'Accept': 'application/vnd.github.v3+json'
    };
f5d1b18 (doc:upadate docs)

    // Cache storage
    const cache = new Map();

    /* ---------------- UTILITIES ---------------- */

    function getCacheKey(url) {
        return `github_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    function getFromCache(url) {
        const key = getCacheKey(url);
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    function setToCache(url, data) {
        const key = getCacheKey(url);
        cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /* ---------------- SAFE FETCH WITH RETRY & RATE LIMIT HANDLING ---------------- */
    async function safeFetch(url, retryCount = 0) {
        // Check cache first
        const cached = getFromCache(url);
        if (cached) return cached;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        try {
            const response = await fetch(url, {
                headers: HEADERS,
                signal: controller.signal
            });

            // Handle rate limiting
            if (response.status === 403 || response.status === 429) {
                const resetTime = response.headers.get('X-RateLimit-Reset');
                const remaining = response.headers.get('X-RateLimit-Remaining');
                
                if (remaining === '0' && resetTime) {
                    const waitTime = (parseInt(resetTime) * 1000) - Date.now();
                    if (waitTime > 0 && waitTime < 60000) {
                        console.warn(`Rate limit hit. Waiting ${Math.ceil(waitTime / 1000)}s...`);
                        await sleep(waitTime + 1000);
                        return safeFetch(url, retryCount);
                    }
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Parse rate limit info
            const rateLimit = {
                limit: response.headers.get('X-RateLimit-Limit'),
                remaining: response.headers.get('X-RateLimit-Remaining'),
                reset: response.headers.get('X-RateLimit-Reset')
            };
            
            if (rateLimit.remaining && parseInt(rateLimit.remaining) < 10) {
                console.warn(`Low rate limit: ${rateLimit.remaining} requests remaining`);
            }

            const data = await response.json();
            
            // Cache successful responses
            setToCache(url, data);
            
            return data;

        } catch (err) {
            if (err.name === 'AbortError') {
                console.error(`Request timeout for ${url}`);
            } else {
                console.error(`Fetch failed (${retryCount + 1}/${CONFIG.MAX_RETRIES}):`, err.message);
            }

            // Retry logic with exponential backoff
            if (retryCount < CONFIG.MAX_RETRIES) {
                const delay = CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
                await sleep(delay);
                return safeFetch(url, retryCount + 1);
            }

            return null;
        } finally {
            clearTimeout(timeout);
        }
    }

    /* ---------------- DATA FETCHING ---------------- */

    async function fetchUserProfile() {
        return await safeFetch(`https://api.github.com/users/${CONFIG.USERNAME}`);
    }

    async function fetchRepositories() {
        let allRepos = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= CONFIG.MAX_PAGES) {
            const url = `https://api.github.com/users/${CONFIG.USERNAME}/repos?per_page=${CONFIG.PER_PAGE}&page=${page}&sort=updated&direction=desc`;
            const data = await safeFetch(url);

            if (!data || data.length === 0) {
                hasMore = false;
                break;
            }

            allRepos.push(...data);
            
            // Check if we got less than a full page
            if (data.length < CONFIG.PER_PAGE) {
                hasMore = false;
            }
            
            page++;
        }

        return allRepos;
    }

    async function fetchContributionStats() {
        // Note: GitHub API doesn't directly provide contribution graph data
        // This requires GraphQL API. Fallback to event counting
        const url = `https://api.github.com/users/${CONFIG.USERNAME}/events/public`;
        const events = await safeFetch(url);
        
        if (!events) return { total: 0, thisYear: 0, longestStreak: 0 };
        
        const currentYear = new Date().getFullYear();
        let thisYearCount = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let lastDate = null;
        
        events.forEach(event => {
            const date = new Date(event.created_at);
            const dateStr = date.toDateString();
            
            if (date.getFullYear() === currentYear) {
                thisYearCount++;
            }
            
            // Simple streak calculation
            if (lastDate) {
                const dayDiff = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
                if (dayDiff === 1) {
                    currentStreak++;
                } else if (dayDiff > 1) {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            
            longestStreak = Math.max(longestStreak, currentStreak);
            lastDate = date;
        });
        
        return {
            total: events.length,
            thisYear: thisYearCount,
            longestStreak: longestStreak
        };
    }

    async function fetchLanguages(repos) {
        const languageStats = {};
        let totalBytes = 0;
        
        // Sample up to 30 repos to avoid too many API calls
        const reposToAnalyze = repos.slice(0, 30);
        
        for (const repo of reposToAnalyze) {
            if (!repo.language) continue;
            
            const url = repo.languages_url;
            const languages = await safeFetch(url);
            
            if (languages) {
                for (const [lang, bytes] of Object.entries(languages)) {
                    languageStats[lang] = (languageStats[lang] || 0) + bytes;
                    totalBytes += bytes;
                }
            }
            
            // Small delay to avoid rate limiting
            await sleep(100);
        }
        
        // Convert to percentages
        const languagePercentages = {};
        for (const [lang, bytes] of Object.entries(languageStats)) {
            languagePercentages[lang] = ((bytes / totalBytes) * 100).toFixed(1);
        }
        
        // Sort by percentage and return top 5
        return Object.entries(languagePercentages)
            .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
            .slice(0, 5)
            .map(([lang, percent]) => ({ lang, percent }));
    }

    /* ---------------- HELPERS ---------------- */

    function getTotalStars(repos) {
        return repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    }

    function getTotalForks(repos) {
        return repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    }

    function getTotalWatchers(repos) {
        return repos.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);
    }

    function getTopRepos(repos, limit = 5) {
        return repos
            .filter(r => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, limit);
    }

    function getRecentlyUpdated(repos, limit = 3) {
        return repos
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, limit);
    }

    function timeAgo(dateString) {
        const date = new Date(dateString);
        const seconds = Math.floor((Date.now() - date) / 1000);
        
        if (isNaN(seconds)) return 'recently';

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    function safeSetText(selector, value, defaultValue = '-') {
        const el = document.querySelector(selector);
        if (el) el.textContent = value || defaultValue;
    }

    function safeSetHTML(selector, html) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
    }

    /* ---------------- UI RENDER ---------------- */

    function renderProfile(profile) {
        if (!profile) return;

        // Profile header
        safeSetText('.github-profile-info h3', profile.name || profile.login);
        safeSetText('.github-profile-info p', profile.bio || 'No bio available');
        
        // Avatar
        const avatarImg = document.querySelector('.github-avatar');
        if (avatarImg && profile.avatar_url) {
            avatarImg.src = profile.avatar_url;
            avatarImg.alt = `${profile.login}'s avatar`;
        }
        
        // Location
        if (profile.location) {
            const locationEl = document.querySelector('.profile-location');
            if (locationEl) {
                locationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${profile.location}`;
            }
        }
        
        // Company
        if (profile.company) {
            const companyEl = document.querySelector('.profile-company');
            if (companyEl) {
                companyEl.innerHTML = `<i class="fas fa-building"></i> ${profile.company}`;
            }
        }
        
        // Blog/Website
        if (profile.blog) {
            const blogEl = document.querySelector('.profile-blog');
            if (blogEl) {
                blogEl.innerHTML = `<i class="fas fa-link"></i> <a href="${profile.blog}" target="_blank">${profile.blog.replace(/^https?:\/\//, '')}</a>`;
            }
        }
        
        // Twitter
        if (profile.twitter_username) {
            const twitterEl = document.querySelector('.profile-twitter');
            if (twitterEl) {
                twitterEl.innerHTML = `<i class="fab fa-twitter"></i> @${profile.twitter_username}`;
            }
        }
    }

    function renderStats(profile, repos, contribStats) {
        const stats = {
            repositories: profile.public_repos || 0,
            followers: profile.followers || 0,
            following: profile.following || 0,
            stars: getTotalStars(repos),
            forks: getTotalForks(repos),
            watchers: getTotalWatchers(repos),
            contributions: contribStats?.thisYear || 0,
            streak: contribStats?.longestStreak || 0
        };

        // Update stat displays
        Object.entries(stats).forEach(([key, value]) => {
            safeSetText(`[data-stat="${key}"]`, formatNumber(value));
        });
        
        // Also update extra stats if present
        safeSetText('.extra-stat-item .contrib-value', formatNumber(stats.contributions));
        safeSetText('.extra-stat-item .streak-value', formatNumber(stats.streak));
    }

    function renderRepos(repos) {
        const container = document.getElementById('repos-list');
        if (!container) return;

        const topRepos = getTopRepos(repos, 5);
        const recentRepos = getRecentlyUpdated(repos, 3);

        if (!topRepos.length) {
            container.innerHTML = `<div class="loading-repos"><i class="fas fa-inbox"></i> No repositories found</div>`;
            return;
        }

        container.innerHTML = topRepos.map(repo => `
            <div class="repo-item" data-repo="${repo.name}">
                <div class="repo-header">
                    <a href="${repo.html_url}" target="_blank" class="repo-name" rel="noopener noreferrer">
                        <i class="fas fa-book"></i> ${repo.name}
                    </a>
                    <span class="repo-visibility">${repo.private ? '🔒 Private' : '🌐 Public'}</span>
                </div>
                
                ${repo.description ? `<div class="repo-description">${repo.description.substring(0, 120)}${repo.description.length > 120 ? '...' : ''}</div>` : ''}
                
                <div class="repo-meta">
                    ${repo.language ? `
                        <div class="repo-lang">
                            <span class="lang-dot" style="background: ${getLanguageColor(repo.language)}"></span>
                            <span>${repo.language}</span>
                        </div>
                    ` : ''}
                    <div class="repo-meta-item">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </div>
                    <div class="repo-meta-item">
                        <i class="fas fa-code-branch"></i> ${repo.forks_count}
                    </div>
                    <div class="repo-meta-item">
                        <i class="fas fa-clock"></i> ${timeAgo(repo.updated_at)}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add recent updates section if container exists
        const recentContainer = document.getElementById('recent-repos');
        if (recentContainer && recentRepos.length) {
            recentContainer.innerHTML = recentRepos.map(repo => `
                <div class="recent-repo-item">
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    <span class="update-time">${timeAgo(repo.updated_at)}</span>
                </div>
            `).join('');
        }
    }

    function renderLanguages(languages) {
        const container = document.getElementById('language-stats');
        if (!container || !languages.length) return;
        
        container.innerHTML = languages.map(({ lang, percent }) => `
            <div class="language-item">
                <div class="language-bar" style="width: ${percent}%"></div>
                <div class="language-info">
                    <span class="language-name">${lang}</span>
                    <span class="language-percent">${percent}%</span>
                </div>
            </div>
        `).join('');
    }

    function getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'Java': '#b07219',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Ruby': '#701516',
            'PHP': '#4F5D95',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Shell': '#89e051',
            'Dockerfile': '#384d54',
            'Jupyter Notebook': '#DA5B0B'
        };
        return colors[language] || '#8250df';
    }

    function showError(errorMessage = 'Unable to load GitHub data') {
        console.error('GitHub Stats Error:', errorMessage);
        
        const repoList = document.getElementById('repos-list');
        if (repoList) {
            repoList.innerHTML = `
                <div class="stats-fallback">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${errorMessage}</p>
                    <small>Check console for details. You may need to add a GitHub token for higher rate limits.</small>
                </div>
            `;
        }
        
        // Hide loading states
        document.querySelectorAll('.loading-repos').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('[data-stat]').forEach(el => {
            if (el.textContent === '' || el.textContent === '0') el.textContent = '—';
        });
    }

    /* ---------------- CONTRIBUTION GRAPH (via img) ---------------- */
    function renderContributionGraph() {
        const container = document.getElementById('contribution-graph');
        if (!container) return;
        
        // Use GitHub's official contribution graph image
        const graphUrl = `https://ghchart.rshah.org/${CONFIG.USERNAME}`;
        
        container.innerHTML = `
            <img src="${graphUrl}" alt="${CONFIG.USERNAME}'s contribution graph" 
                 class="github-contribution-chart" 
                 onerror="this.parentElement.innerHTML='<div class=no-contrib><i class=\'fas fa-chart-line\'></i><p>Contribution graph unavailable</p></div>'">
        `;
    }

    /* ---------------- README STATS CARDS ---------------- */
    function renderReadmeStats() {
        // Create or update GitHub stats images
        const statsContainer = document.getElementById('github-readme-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <img class="github-stats-img" 
                 src="https://github-readme-stats.vercel.app/api?username=${CONFIG.USERNAME}&show_icons=true&hide_border=true&theme=transparent&bg_color=00000000&title_color=38bdf8&icon_color=818cf8&text_color=94a3b8" 
                 alt="GitHub Stats"
                 loading="lazy">
            <img class="github-stats-img" 
                 src="https://github-readme-streak-stats.herokuapp.com/?user=${CONFIG.USERNAME}&hide_border=true&theme=transparent&background=00000000&stroke=334155&ring=38bdf8&fire=38bdf8&currStreakNum=f1f5f9&sideNums=94a3b8&currStreakLabel=38bdf8&sideLabels=94a3b8&dates=64748b" 
                 alt="GitHub Streak"
                 loading="lazy">
        `;
    }

    /* ---------------- MAIN LOADER ---------------- */
    async function loadGitHubStats() {
        const startTime = Date.now();
        console.log('Loading GitHub stats for user:', CONFIG.USERNAME);
        
        try {
            // Show loading state
            safeSetHTML('#repos-list', '<div class="loading-repos"><i class="fas fa-spinner fa-pulse"></i> Loading repositories...</div>');
            
            console.log('Fetching user profile...');
            const profile = await fetchUserProfile();
            if (!profile) throw new Error('Failed to load profile - check username and network');
            console.log('Profile loaded:', profile.login, 'Repos:', profile.public_repos);
            
            console.log('Fetching repositories...');
            const repos = await fetchRepositories();
            if (!repos) throw new Error('Failed to load repositories');
            console.log('Repos loaded:', repos.length);
            
            console.log('Fetching contribution stats...');
            const contribStats = await fetchContributionStats();
            console.log('Contrib stats:', contribStats);
            
            // Fetch languages (depends on repos)
            console.log('Fetching languages...');
            const languages = await fetchLanguages(repos);
            console.log('Languages loaded:', languages.length);
            
            // Render everything
            renderProfile(profile);
            renderStats(profile, repos, contribStats);
            renderRepos(repos);
            renderLanguages(languages);
            renderContributionGraph();
            renderReadmeStats();
            
            const elapsed = Date.now() - startTime;
            console.log(`GitHub stats loaded successfully in ${elapsed}ms`);
            
        } catch (err) {
            console.error('GitHub stats error:', err);
            showError(err.message || 'Failed to load GitHub data');
        }
    }

    /* ---------------- INITIALIZATION ---------------- */
    let refreshInterval = null;

    function init() {
        // Initial load
        loadGitHubStats();
        
        // Set up periodic refresh
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(loadGitHubStats, CONFIG.REFRESH_INTERVAL);
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            if (refreshInterval) clearInterval(refreshInterval);
        });
    }

    // Handle visibility change (don't refresh when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        } else if (!document.hidden && !refreshInterval) {
            refreshInterval = setInterval(loadGitHubStats, CONFIG.REFRESH_INTERVAL);
            loadGitHubStats(); // Immediate refresh on visibility
        }
    });

    /* ---------------- START ---------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();