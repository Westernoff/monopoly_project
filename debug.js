window.addEventListener("load", () => {
  const ACCOUNTS_STORAGE_KEY = "monopoly-project.accounts";
  const PROFILES_STORAGE_KEY = "monopoly-project.profiles";
  const POSTS_STORAGE_KEY = "monopoly-project.editorial-posts";
  const SESSION_STORAGE_KEY = "monopoly-project.session";
  const debugAccessDenied = document.getElementById("debugAccessDenied");
  const debugContent = document.getElementById("debugContent");
  const debugUsers = document.getElementById("debugUsers");
  const debugPostForm = document.getElementById("debugPostForm");
  const debugPostTitle = document.getElementById("debugPostTitle");
  const debugPostExcerpt = document.getElementById("debugPostExcerpt");
  const debugPostBody = document.getElementById("debugPostBody");
  const debugPostFeedback = document.getElementById("debugPostFeedback");

  const getJson = (key, fallback) => {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    try {
      const parsedValue = JSON.parse(rawValue);
      return parsedValue ?? fallback;
    } catch (error) {
      console.error(`Storage ${key} is corrupted`, error);
      return fallback;
    }
  };

  const getSession = () => getJson(SESSION_STORAGE_KEY, null);
  const getAccounts = () => getJson(ACCOUNTS_STORAGE_KEY, []);
  const getProfiles = () => getJson(PROFILES_STORAGE_KEY, {});
  const getPosts = () => getJson(POSTS_STORAGE_KEY, []);

  const setPosts = (posts) => {
    window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  };

  const renderUsers = () => {
    if (!debugUsers) {
      return;
    }

    const accounts = getAccounts();
    const profiles = getProfiles();

    if (accounts.length === 0) {
      debugUsers.innerHTML =
        '<article class="debug-user-card"><p>Пользователи пока не зарегистрированы.</p></article>';
      return;
    }

    debugUsers.innerHTML = accounts
      .map((account) => {
        const profile = profiles[account.login] ?? {};
        const nickname = profile.nickname || account.login;

        return `
          <article class="debug-user-card">
            <p class="debug-user-name">${nickname}</p>
            <p class="debug-user-meta">@${account.login}</p>
            <p class="debug-user-meta">Роль: ${account.role === "admin" ? "Администратор" : "Пользователь"}</p>
          </article>
        `;
      })
      .join("");
  };

  const session = getSession();

  if (!session || session.role !== "admin") {
    debugAccessDenied?.removeAttribute("hidden");
    return;
  }

  debugContent?.removeAttribute("hidden");
  renderUsers();

  debugPostForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = debugPostTitle?.value.trim() ?? "";
    const excerpt = debugPostExcerpt?.value.trim() ?? "";
    const body = debugPostBody?.value.trim() ?? "";

    if (!title || !excerpt || !body) {
      if (debugPostFeedback) {
        debugPostFeedback.textContent = "Заполните все поля поста.";
        debugPostFeedback.className = "auth-feedback is-error";
      }
      return;
    }

    const posts = getPosts();
    posts.unshift({
      id: `post-${Date.now()}`,
      title,
      excerpt,
      body,
      author: session.login,
      createdAt: Date.now(),
    });
    setPosts(posts);

    if (debugPostFeedback) {
      debugPostFeedback.textContent = "Пост опубликован и доступен на странице Наша редакция.";
      debugPostFeedback.className = "auth-feedback is-success";
    }

    debugPostForm.reset();
  });
});
