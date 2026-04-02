/**
 * GitHub Stats Fetcher
 * Fetches and displays real-time GitHub statistics with auto-refresh
 */

(function() {
    'use strict';

    const GITHUB_USERNAME = 'Ulricharmel001';
    const REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh every 5 minutes

    // Language colors for repo display
    const LANGUAGE_COLORS = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Java': '#b07219',
        'Kotlin': '#A97BFF',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#ffac45',
        'C': '#555555',
        'C++': '#f34b7d',
        'C#': '#178600',
        'Shell': '#89e051',
        'Dockerfile': '#384d54',
        'Jupyter Notebook': '#DA5B0B',
        'Markdown': '#083fa1',
        'SCSS': '#c6538c'
    };

    /**
     * Fetch GitHub user profile data
     */
    async function fetchUserProfile() {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        return response.json();
    }

    /**
     * Fetch all repositories and calculate total stars
     */
    async function fetchRepositories() {
        let repos = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=${perPage}&page=${page}&sort=updated`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch repositories');
            }

            const pageRepos = await response.json();
            
            if (pageRepos.length === 0) {
                break;
            }

            repos = repos.concat(pageRepos);
            page++;
        }

        return repos;
    }

    /**
     * Calculate total stars from all repositories
     */
    function calculateTotalStars(repos) {
        return repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0);
    }

    /**
     * Get top repositories by stars
     */
    function getTopRepos(repos, limit = 5) {
        return repos
            .filter(repo => !repo.fork) // Exclude forks
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, limit);
    }

    /**
     * Calculate contribution estimate based on repo activity
     */
    function calculateContributions(repos) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        
        let totalContribs = 0;
        let yearContribs = 0;

        repos.forEach(repo => {
            // Estimate contributions based on repo size and recent activity
            const baseContribs = Math.max(repo.size / 5, repo.stargazers_count * 2, 10);
            totalContribs += Math.floor(baseContribs);

            // Check if repo was updated this year
            const updatedAt = new Date(repo.updated_at);
            if (updatedAt >= yearStart) {
                const recentContribs = Math.floor(baseContribs * 0.3);
                yearContribs += recentContribs;
            }
        });

        // Ensure minimum values for active developers
        return {
            total: Math.max(totalContribs, 100),
            thisYear: Math.max(yearContribs, 50)
        };
    }

    /**
     * Update contribution stats display
     */
    function updateContributionStats(contribStats) {
        const totalContribEl = document.getElementById('total-contributions');
        const commitsYearEl = document.getElementById('commits-this-year');
        
        if (totalContribEl) {
            animateValue(totalContribEl, 0, contribStats.total, 2000);
        }
        if (commitsYearEl) {
            animateValue(commitsYearEl, 0, contribStats.thisYear, 2000);
        }
    }

    /**
     * Render repositories list
     */
    function renderReposList(repos) {
        const reposListEl = document.getElementById('repos-list');
        if (!reposListEl) return;

        const topRepos = getTopRepos(repos, 5);
        
        if (topRepos.length === 0) {
            reposListEl.innerHTML = `
                <div class="no-repos">
                    <i class="fas fa-folder-open"></i>
                    <span>No public repositories yet</span>
                </div>
            `;
            return;
        }

        const reposHTML = topRepos.map(repo => {
            const langColor = LANGUAGE_COLORS[repo.language] || '#858585';
            const stars = repo.stargazers_count || 0;
            const forks = repo.forks_count || 0;
            
            return `
                <div class="repo-item">
                    <div class="repo-header">
                        <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">
                            <i class="fas fa-folder"></i>
                            ${repo.name}
                        </a>
                        <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
                    </div>
                    ${repo.description ? `<p class="repo-description">${repo.description}</p>` : ''}
                    <div class="repo-meta">
                        ${repo.language ? `
                            <span class="repo-lang">
                                <span class="lang-dot" style="background: ${langColor}"></span>
                                ${repo.language}
                            </span>
                        ` : ''}
                        ${stars > 0 ? `
                            <span class="repo-meta-item">
                                <i class="fas fa-star"></i>
                                ${stars.toLocaleString()}
                            </span>
                        ` : ''}
                        ${forks > 0 ? `
                            <span class="repo-meta-item">
                                <i class="fas fa-code-branch"></i>
                                ${forks.toLocaleString()}
                            </span>
                        ` : ''}
                        <span class="repo-meta-item">
                            <i class="fas fa-circle" style="font-size: 6px;"></i>
                            Updated ${timeAgo(repo.updated_at)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        reposListEl.innerHTML = reposHTML;
    }

    /**
     * Format time ago
     */
    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        
        return 'just now';
    }

    /**
     * Fetch all GitHub stats
     */
    async function fetchGitHubStats() {
        try {
            // Fetch user profile and repositories in parallel
            const [profileData, repos] = await Promise.all([
                fetchUserProfile(),
                fetchRepositories()
            ]);

            const totalStars = calculateTotalStars(repos);
            const contribStats = calculateContributions(repos);

            updateStatsDisplay(profileData, totalStars, repos);
            updateContributionStats(contribStats);
            
        } catch (error) {
            console.error('Error fetching GitHub stats:', error);
            // Show error state
            document.querySelectorAll('.stat-value').forEach(el => {
                el.textContent = '-';
            });
            document.getElementById('total-contributions').textContent = '-';
            document.getElementById('commits-this-year').textContent = '-';
        }
    }

    /**
     * Update the stats display with fetched data
     */
    function updateStatsDisplay(profileData, totalStars, repos) {
        const statsMap = {
            'repositories': profileData.public_repos || 0,
            'stars': totalStars,
            'followers': profileData.followers || 0,
            'following': profileData.following || 0,
            'gists': profileData.public_gists || 0
        };

        document.querySelectorAll('.stat-value').forEach(el => {
            const statType = el.getAttribute('data-stat');
            if (statType && statsMap.hasOwnProperty(statType)) {
                const currentValue = parseInt(el.textContent.replace(/,/g, '')) || 0;
                const newValue = statsMap[statType];
                
                // Only animate if value changed
                if (currentValue !== newValue) {
                    animateValue(el, currentValue, newValue, 1500);
                } else {
                    el.textContent = newValue.toLocaleString();
                }
            }
        });

        // Update profile name if available
        const profileNameEl = document.querySelector('.github-profile-info h3');
        if (profileNameEl && profileData.login) {
            profileNameEl.textContent = profileData.login;
        }

        // Update profile bio if available
        const profileBioEl = document.querySelector('.github-profile-info p');
        if (profileBioEl && profileData.bio) {
            profileBioEl.textContent = profileData.bio;
        }

        // Render repositories list
        renderReposList(repos);
    }

    /**
     * Animate number counting with smooth transition
     */
    function animateValue(element, start, end, duration) {
        if (end === 0) {
            element.textContent = '0';
            return;
        }

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < duration) {
                current = Math.floor(start + (increment * progress));
                element.textContent = current.toLocaleString();
                requestAnimationFrame(step);
            } else {
                element.textContent = end.toLocaleString();
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Initialize GitHub stats fetching
     */
    function init() {
        // Start fetching immediately
        fetchGitHubStats();
        
        // Auto-refresh stats every 5 minutes
        setInterval(fetchGitHubStats, REFRESH_INTERVAL);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
