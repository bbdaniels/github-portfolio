/**
 * GitGlue - Display GitHub repos as beautiful cards
 * Usage: <github-repos user="username"></github-repos>
 */

class GitHubRepos extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const user = this.getAttribute('user');
    if (!user) {
      this.shadowRoot.innerHTML = '<p style="color: #f85149;">Error: Missing "user" attribute</p>';
      return;
    }
    this.render(user);
  }

  async render(user) {
    // Show loading state
    this.shadowRoot.innerHTML = this.getStyles() + '<div class="loading">Loading repositories...</div>';

    try {
      // Fetch user profile and repos in parallel
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`)
      ]);

      if (!profileRes.ok || !reposRes.ok) throw new Error('Failed to fetch');

      const profile = await profileRes.json();
      const repos = await reposRes.json();

      this.shadowRoot.innerHTML = this.getStyles() + this.buildHTML(profile, repos);
      this.setupSearch();
    } catch (err) {
      this.shadowRoot.innerHTML = this.getStyles() + `<p class="error">Failed to load GitHub data</p>`;
    }
  }

  buildHTML(profile, repos) {
    return `
      <div class="container">
        <header class="profile">
          <a href="${profile.html_url}" target="_blank" rel="noopener">
            <img src="${profile.avatar_url}" alt="${profile.login}" class="avatar">
          </a>
          <div class="profile-info">
            <a href="${profile.html_url}" target="_blank" rel="noopener" class="name">${profile.name || profile.login}</a>
            <span class="username">@${profile.login}</span>
            ${profile.bio ? `<p class="bio">${profile.bio}</p>` : ''}
            <div class="stats">
              <a href="${profile.html_url}?tab=repositories" target="_blank" rel="noopener">
                <strong>${profile.public_repos}</strong> repos
              </a>
              <a href="${profile.html_url}?tab=followers" target="_blank" rel="noopener">
                <strong>${profile.followers}</strong> followers
              </a>
              <a href="${profile.html_url}?tab=following" target="_blank" rel="noopener">
                <strong>${profile.following}</strong> following
              </a>
            </div>
          </div>
        </header>

        <div class="search-container">
          <input type="text" class="search" placeholder="Search repositories...">
        </div>

        <div class="repos">
          ${repos.map(repo => this.buildRepoCard(repo)).join('')}
        </div>
      </div>
    `;
  }

  buildRepoCard(repo) {
    const lang = repo.language ? `
      <span class="lang">
        <span class="lang-dot" style="background: ${LANG_COLORS[repo.language] || '#8b949e'}"></span>
        ${repo.language}
      </span>
    ` : '';

    const stars = repo.stargazers_count ? `
      <a href="${repo.html_url}/stargazers" target="_blank" rel="noopener" class="stat">
        <svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
        ${repo.stargazers_count}
      </a>
    ` : '';

    const forks = repo.forks_count ? `
      <a href="${repo.html_url}/forks" target="_blank" rel="noopener" class="stat">
        <svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
        ${repo.forks_count}
      </a>
    ` : '';

    return `
      <article class="repo" data-name="${repo.name.toLowerCase()}" data-desc="${(repo.description || '').toLowerCase()}">
        <div class="repo-header">
          <svg viewBox="0 0 16 16" width="16" height="16" class="repo-icon"><path fill="currentColor" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>
          <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">${repo.name}</a>
          ${repo.fork ? '<span class="fork-badge">Fork</span>' : ''}
        </div>
        ${repo.description ? `<p class="repo-desc">${repo.description}</p>` : ''}
        <div class="repo-meta">
          ${lang}
          ${stars}
          ${forks}
          <span class="updated">Updated ${this.timeAgo(new Date(repo.updated_at))}</span>
        </div>
      </article>
    `;
  }

  setupSearch() {
    const search = this.shadowRoot.querySelector('.search');
    const repos = this.shadowRoot.querySelectorAll('.repo');

    search?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      repos.forEach(repo => {
        const name = repo.dataset.name;
        const desc = repo.dataset.desc;
        const match = name.includes(query) || desc.includes(query);
        repo.style.display = match ? '' : 'none';
      });
    });
  }

  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
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

  getStyles() {
    return `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          color: #e6edf3;
          line-height: 1.5;
        }

        * { box-sizing: border-box; }

        a {
          color: #58a6ff;
          text-decoration: none;
        }
        a:hover { text-decoration: underline; }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
        }

        .loading, .error {
          text-align: center;
          padding: 48px;
          color: #8b949e;
        }
        .error { color: #f85149; }

        /* Profile Header */
        .profile {
          display: flex;
          gap: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #30363d;
          margin-bottom: 24px;
        }

        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid #30363d;
        }

        .profile-info {
          flex: 1;
        }

        .name {
          font-size: 24px;
          font-weight: 600;
          color: #e6edf3;
        }
        .name:hover { color: #58a6ff; }

        .username {
          display: block;
          color: #8b949e;
          font-size: 16px;
          margin-top: 2px;
        }

        .bio {
          margin: 12px 0;
          color: #e6edf3;
        }

        .stats {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #8b949e;
        }
        .stats a { color: #8b949e; }
        .stats a:hover { color: #58a6ff; }
        .stats strong { color: #e6edf3; }

        /* Search */
        .search-container {
          margin-bottom: 20px;
        }

        .search {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          color: #e6edf3;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
          outline: none;
        }
        .search:focus {
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
        }
        .search::placeholder { color: #6e7681; }

        /* Repos Grid */
        .repos {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }

        .repo {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 16px;
          transition: border-color 0.15s;
        }
        .repo:hover { border-color: #8b949e; }

        .repo-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .repo-icon { color: #8b949e; flex-shrink: 0; }

        .repo-name {
          font-size: 16px;
          font-weight: 600;
          color: #58a6ff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fork-badge {
          font-size: 11px;
          padding: 2px 6px;
          background: #30363d;
          border-radius: 12px;
          color: #8b949e;
        }

        .repo-desc {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #8b949e;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .repo-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #8b949e;
        }

        .lang {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .lang-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #8b949e;
        }
        .stat:hover { color: #58a6ff; text-decoration: none; }
        .stat svg { fill: currentColor; }

        .updated {
          margin-left: auto;
          color: #6e7681;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .profile {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .stats { justify-content: center; }
          .repos { grid-template-columns: 1fr; }
          .updated { display: none; }
        }
      </style>
    `;
  }
}

// Language colors
const LANG_COLORS = {
  "JavaScript": "#f1e05a", "TypeScript": "#2b7489", "Python": "#3572A5",
  "Java": "#b07219", "C": "#555555", "C++": "#f34b7d", "C#": "#178600",
  "Go": "#00ADD8", "Rust": "#dea584", "Ruby": "#701516", "PHP": "#4F5D95",
  "Swift": "#ffac45", "Kotlin": "#F18E33", "Scala": "#c22d40",
  "Shell": "#89e051", "HTML": "#e34c26", "CSS": "#563d7c", "SCSS": "#c6538c",
  "Vue": "#41b883", "Svelte": "#ff3e00", "Dart": "#00B4AB",
  "R": "#198CE7", "Julia": "#a270ba", "Lua": "#000080", "Perl": "#0298c3",
  "Haskell": "#5e5086", "Elixir": "#6e4a7e", "Clojure": "#db5855",
  "Erlang": "#B83998", "OCaml": "#3be133", "F#": "#b845fc",
  "Jupyter Notebook": "#DA5B0B", "TeX": "#3D6117", "Vim script": "#199f4b",
  "PowerShell": "#012456", "Dockerfile": "#384d54", "Makefile": "#427819",
  "Stata": "#1a5f91", "MATLAB": "#e16737", "Fortran": "#4d41b1",
  "Assembly": "#6E4C13", "Objective-C": "#438eff", "Groovy": "#e69f56"
};

customElements.define('github-repos', GitHubRepos);
